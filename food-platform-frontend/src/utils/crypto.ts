export async function hashValue(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, '0'))
    .join('');
}

export function createToken(prefix: string) {
  return `${prefix}.${crypto.randomUUID().replace(/-/g, '')}`;
}
