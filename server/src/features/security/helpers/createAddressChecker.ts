import { BlockList, isIP } from "node:net";

// Builds a function that answers "is this address on the allowed list?".
// Entries are single addresses ("198.51.100.7") or ranges ("203.0.113.0/24").
// An invalid entry throws, so a typo stops the server at startup instead of silently allowing nothing.
export function createAddressChecker(
  allowedNetworks: string[]
): (address: string) => boolean {
  const allowed = new BlockList();

  for (const entry of allowedNetworks) {
    const [address = "", prefixLength] = entry.split("/");
    const family = isIP(address) === 6 ? "ipv6" : "ipv4";
    if (prefixLength === undefined) allowed.addAddress(address, family);
    else allowed.addSubnet(address, Number(prefixLength), family);
  }

  return (address) => {
    const plainAddress = address.replace(/^::ffff:/, ""); // an IPv4 address written in IPv6 form
    const version = isIP(plainAddress);
    if (version === 0) return false; // not an address at all
    return allowed.check(plainAddress, version === 6 ? "ipv6" : "ipv4");
  };
}
