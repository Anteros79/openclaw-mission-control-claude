/**
 * Server-side WebSocket client for the OpenClaw gateway (Giles).
 *
 * Protocol:
 *  - Server sends:  { type: "event", event: "connect.challenge", payload: { nonce } }
 *  - Client sends:  { type: "req", id, method: "connect", params: { nonce, role: "operator", scopes: [...] } }
 *  - Server sends:  { type: "res", id, result: { ... } }        (success)
 *                   { type: "err", id, error: { ... } }         (failure)
 *  - Subsequent requests: { type: "req", id, method, params }
 */

import { randomUUID } from "crypto";
import WebSocket from "ws";

type Pending = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
};

export class GatewayWsClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, Pending>();
  private connected = false;
  private connectPromise: Promise<void> | null = null;

  constructor(
    private url: string,
    private token?: string
  ) {}

  async connect(): Promise<void> {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) return;
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = new Promise<void>((resolve, reject) => {
      const wsUrl = this.url.replace(/^http/, "ws");
      const timeout = setTimeout(() => {
        this.ws?.close();
        reject(new Error("Gateway WS connect timeout"));
      }, 8000);

      this.ws = new WebSocket(wsUrl);

      this.ws.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      this.ws.on("close", () => {
        this.connected = false;
        this.connectPromise = null;
        for (const p of this.pending.values()) p.reject(new Error("ws closed"));
        this.pending.clear();
      });

      this.ws.on("message", (data) => {
        let msg: Record<string, unknown>;
        try {
          msg = JSON.parse(String(data));
        } catch {
          return;
        }

        // Handle connect challenge
        if (
          msg.type === "event" &&
          (msg as { event?: string }).event === "connect.challenge"
        ) {
          const payload = msg.payload as { nonce?: string } | undefined;
          const nonce = payload?.nonce;
          if (nonce) {
            this.sendRaw("connect", {
              nonce,
              role: "operator",
              scopes: ["operator.read", "operator.write"],
              ...(this.token ? { authToken: this.token } : {})
            })
              .then(() => {
                this.connected = true;
                clearTimeout(timeout);
                resolve();
              })
              .catch((err) => {
                clearTimeout(timeout);
                reject(err);
              });
          }
          return;
        }

        // Handle response
        const id = msg.id as string | undefined;
        if (!id) return;

        const pending = this.pending.get(id);
        if (!pending) return;
        this.pending.delete(id);

        if (msg.type === "res") {
          pending.resolve(msg.result ?? msg);
        } else if (msg.type === "err") {
          pending.reject(new Error(JSON.stringify(msg.error ?? "gateway error")));
        }
      });
    });

    return this.connectPromise;
  }

  private sendRaw(method: string, params: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error("ws not open"));
      }
      const id = randomUUID();
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ type: "req", id, method, params }));

      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`request ${method} timed out`));
        }
      }, 6000);
    });
  }

  async request<T = unknown>(method: string, params: unknown = {}): Promise<T> {
    await this.connect();
    return this.sendRaw(method, params) as Promise<T>;
  }

  close() {
    this.ws?.close();
    this.ws = null;
    this.connected = false;
    this.connectPromise = null;
  }
}

let _client: GatewayWsClient | null = null;

export function getGatewayClient(): GatewayWsClient | null {
  const url = process.env.GILES_GATEWAY_URL;
  if (!url) return null;

  if (!_client) {
    _client = new GatewayWsClient(url, process.env.GILES_GATEWAY_TOKEN);
  }
  return _client;
}
