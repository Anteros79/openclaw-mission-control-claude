const privateIpv4Pattern =
  /^(127\.\d{1,3}\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/;

const loopbackHostnames = new Set(["localhost", "0.0.0.0", "::1"]);

export const isPrivateOrLoopbackHost = (hostname: string) => {
  const normalizedHost = hostname.trim().toLowerCase();

  if (loopbackHostnames.has(normalizedHost)) {
    return true;
  }

  return privateIpv4Pattern.test(normalizedHost);
};

export const isSafeAbsoluteUrl = (value: string) => {
  try {
    const parsedUrl = new URL(value);
    return !isPrivateOrLoopbackHost(parsedUrl.hostname);
  } catch {
    return false;
  }
};
