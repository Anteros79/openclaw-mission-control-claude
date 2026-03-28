import { describe, expect, test } from "vitest";

import { createAppConfig } from "@/lib/app-config";
import { createGatewayUrlResolver } from "@/lib/gateway-url-resolver";

describe("createAppConfig", () => {
  test("rejects localhost gateway origins", () => {
    expect(() =>
      createAppConfig({
        gatewayOrigin: "http://localhost:3000",
        nodeId: "nexus",
        nodeRole: "host",
        storageDriver: "filesystem",
        databaseDriver: "sqlite",
        featureFlags: {
          mockTelemetry: true
        }
      })
    ).toThrow(/gateway origin/i);
  });

  test("accepts a tailscale gateway origin", () => {
    const config = createAppConfig({
      gatewayOrigin: "https://giles.tailnet.ts.net",
      nodeId: "giles",
      nodeRole: "gateway",
      storageDriver: "filesystem",
      databaseDriver: "sqlite",
      featureFlags: {
        mockTelemetry: true
      }
    });

    expect(config.gatewayOrigin).toBe("https://giles.tailnet.ts.net");
    expect(config.nodeRole).toBe("gateway");
  });
});

describe("createGatewayUrlResolver", () => {
  test("returns gateway absolute URLs for app routes", () => {
    const resolver = createGatewayUrlResolver(
      createAppConfig({
        gatewayOrigin: "https://giles.tailnet.ts.net",
        nodeId: "giles",
        nodeRole: "gateway",
        storageDriver: "filesystem",
        databaseDriver: "sqlite",
        featureFlags: {
          mockTelemetry: true
        }
      })
    );

    expect(
      resolver.resolveAppHref({
        pathname: "/agents/agent-17",
        query: {
          tab: "runtime"
        }
      })
    ).toBe("https://giles.tailnet.ts.net/agents/agent-17?tab=runtime");
  });

  test("suppresses unsafe local service targets", () => {
    const resolver = createGatewayUrlResolver(
      createAppConfig({
        gatewayOrigin: "https://giles.tailnet.ts.net",
        nodeId: "giles",
        nodeRole: "gateway",
        storageDriver: "filesystem",
        databaseDriver: "sqlite",
        featureFlags: {
          mockTelemetry: true
        }
      })
    );

    expect(
      resolver.resolveServiceHref({
        serviceId: "scheduler",
        unsafeTarget: "http://127.0.0.1:8787"
      })
    ).toEqual({
      href: null,
      isSafe: false,
      reason: "unsafe_target"
    });
  });
});
