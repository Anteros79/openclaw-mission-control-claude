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

const normalizeTailnetDomain = (value: string) =>
  value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/^\.+|\.+$/g, "");

export const resolveDefaultGatewayOrigin = () => {
  const explicitGatewayOrigin = process.env.NEXT_PUBLIC_GATEWAY_ORIGIN;

  if (explicitGatewayOrigin) {
    return explicitGatewayOrigin;
  }

  const tailnetDomain = process.env.NEXT_PUBLIC_TAILNET_DOMAIN;

  if (tailnetDomain) {
    return `https://giles.${normalizeTailnetDomain(tailnetDomain)}`;
  }

  return "https://giles";
};

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
  gatewayOrigin: resolveDefaultGatewayOrigin(),
  nodeId: process.env.NEXT_PUBLIC_NODE_ID ?? "giles",
  nodeRole: process.env.NEXT_PUBLIC_NODE_ROLE === "host" ? "host" : "gateway",
  storageDriver: "filesystem",
  databaseDriver: "sqlite",
  featureFlags: {
    mockTelemetry: process.env.NEXT_PUBLIC_MOCK_TELEMETRY !== "false"
  }
});
