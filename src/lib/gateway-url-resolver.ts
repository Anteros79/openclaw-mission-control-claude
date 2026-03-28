import type { AppConfig } from "@/lib/app-config";
import { isSafeAbsoluteUrl } from "@/lib/network-safety";

type RouteQuery = Record<string, string | number | undefined>;

type AppHrefInput = {
  pathname: string;
  query?: RouteQuery;
};

type ServiceHrefInput = {
  serviceId: string;
  unsafeTarget?: string;
};

const buildQueryString = (query?: RouteQuery) => {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    params.set(key, String(value));
  });

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};

export const createGatewayUrlResolver = (config: AppConfig) => {
  const resolveAppHref = ({ pathname, query }: AppHrefInput) => {
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
    const url = new URL(`${normalizedPath}${buildQueryString(query)}`, config.gatewayOrigin);
    return url.toString();
  };

  const resolveServiceHref = ({ serviceId, unsafeTarget }: ServiceHrefInput) => {
    if (unsafeTarget && !isSafeAbsoluteUrl(unsafeTarget)) {
      return {
        href: null,
        isSafe: false as const,
        reason: "unsafe_target" as const
      };
    }

    return {
      href: resolveAppHref({
        pathname: `/systems`,
        query: {
          service: serviceId
        }
      }),
      isSafe: true as const,
      reason: null
    };
  };

  return {
    resolveAppHref,
    resolveServiceHref
  };
};
