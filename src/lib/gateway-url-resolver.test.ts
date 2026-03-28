import { describe, expect, test } from "vitest";

import { createAppConfig, resolveDefaultGatewayOrigin } from "@/lib/app-config";
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

  test("accepts a gateway-safe origin", () => {
    const config = createAppConfig({
      gatewayOrigin: "https://giles",
      nodeId: "giles",
      nodeRole: "gateway",
      storageDriver: "filesystem",
      databaseDriver: "sqlite",
      featureFlags: {
        mockTelemetry: true
      }
    });

    expect(config.gatewayOrigin).toBe("https://giles");
    expect(config.nodeRole).toBe("gateway");
  });

  test("builds the default gateway origin from the tailnet domain when provided", () => {
    const previousGatewayOrigin = process.env.NEXT_PUBLIC_GATEWAY_ORIGIN;
    const previousTailnetDomain = process.env.NEXT_PUBLIC_TAILNET_DOMAIN;

    try {
      delete process.env.NEXT_PUBLIC_GATEWAY_ORIGIN;
      process.env.NEXT_PUBLIC_TAILNET_DOMAIN = "taile51c67.ts.net";

      expect(resolveDefaultGatewayOrigin()).toBe("https://giles.taile51c67.ts.net");
    } finally {
      if (previousGatewayOrigin === undefined) {
        delete process.env.NEXT_PUBLIC_GATEWAY_ORIGIN;
      } else {
        process.env.NEXT_PUBLIC_GATEWAY_ORIGIN = previousGatewayOrigin;
      }

      if (previousTailnetDomain === undefined) {
        delete process.env.NEXT_PUBLIC_TAILNET_DOMAIN;
      } else {
        process.env.NEXT_PUBLIC_TAILNET_DOMAIN = previousTailnetDomain;
      }
    }
  });
});

describe("createGatewayUrlResolver", () => {
  test("returns gateway absolute URLs for app routes", () => {
    const resolver = createGatewayUrlResolver(
      createAppConfig({
        gatewayOrigin: "https://giles",
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
    ).toBe("https://giles/agents/agent-17?tab=runtime");
  });

  test("suppresses unsafe local service targets", () => {
    const resolver = createGatewayUrlResolver(
      createAppConfig({
        gatewayOrigin: "https://giles",
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
