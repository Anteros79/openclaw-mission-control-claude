import { z } from "zod";

import { isSafeAbsoluteUrl } from "@/lib/network-safety";

const featureFlagsSchema = z.object({
  mockTelemetry: z.boolean()
});

const appConfigSchema = z.object({
  gatewayOrigin: z.string().url(),
  nodeId: z.string().min(1),
  nodeRole: z.enum(["gateway", "host"]),
  storageDriver: z.enum(["filesystem", "memory", "s3"]),
  databaseDriver: z.enum(["sqlite", "postgres", "memory"]),
  featureFlags: featureFlagsSchema
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export const createAppConfig = (input: AppConfig) => {
  const parsedConfig = appConfigSchema.parse(input);

  if (!isSafeAbsoluteUrl(parsedConfig.gatewayOrigin)) {
    throw new Error(
      "Gateway origin must be a gateway-safe absolute URL and cannot use localhost or a private address."
    );
  }

  return parsedConfig;
};

export const appConfig = createAppConfig({
  gatewayOrigin:
    process.env.NEXT_PUBLIC_GATEWAY_ORIGIN ?? "https://giles.tailnet.ts.net",
  nodeId: process.env.NEXT_PUBLIC_NODE_ID ?? "giles",
  nodeRole: process.env.NEXT_PUBLIC_NODE_ROLE === "host" ? "host" : "gateway",
  storageDriver: "filesystem",
  databaseDriver: "sqlite",
  featureFlags: {
    mockTelemetry: process.env.NEXT_PUBLIC_MOCK_TELEMETRY !== "false"
  }
});
