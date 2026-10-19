function readList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export const securityConfig = {
  // Addresses or ranges allowed to reach the app, e.g. "203.0.113.0/24, 198.51.100.7".
  // Empty means no restriction, which is what you want on your own machine.
  allowedNetworks: readList(process.env.ALLOWED_NETWORKS),

  // How many load balancers or proxies sit in front of the server (0 when run directly).
  trustedProxyHops: Number(process.env.TRUSTED_PROXY_HOPS ?? 0),

  requestsPerMinute: 1000, // per address, across the whole API
};
