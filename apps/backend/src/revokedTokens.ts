const revoked = new Set<string>();

export function revokeToken(token: string) {
  revoked.add(token);
}

export function isTokenRevoked(token: string) {
  return revoked.has(token);
}
