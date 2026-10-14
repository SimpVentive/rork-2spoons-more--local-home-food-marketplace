/**
 * Base64 encode/decode utilities for React Native.
 * btoa() and atob() are Web APIs not available in Hermes/React Native,
 * so we use a pure-JS implementation that works everywhere.
 */

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Encode a string to base64 (URL-safe variant: replaces +/ with -_ and strips =) */
export function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;

    const triplet = (b1 << 16) | (b2 << 8) | b3;
    result += CHARS.charAt((triplet >> 18) & 0x3f);
    result += CHARS.charAt((triplet >> 12) & 0x3f);
    result += i + 1 < bytes.length ? CHARS.charAt((triplet >> 6) & 0x3f) : "=";
    result += i + 2 < bytes.length ? CHARS.charAt(triplet & 0x3f) : "=";
  }
  // Convert to URL-safe
  return result.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Encode a Uint8Array to base64 (URL-safe variant) */
export function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;

    const triplet = (b1 << 16) | (b2 << 8) | b3;
    result += CHARS.charAt((triplet >> 18) & 0x3f);
    result += CHARS.charAt((triplet >> 12) & 0x3f);
    result += i + 1 < bytes.length ? CHARS.charAt((triplet >> 6) & 0x3f) : "=";
    result += i + 2 < bytes.length ? CHARS.charAt(triplet & 0x3f) : "=";
  }
  return result.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode a URL-safe base64 string back to a regular string */
export function base64UrlDecode(str: string): string {
  // Convert URL-safe to standard base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  const bytes: number[] = [];
  for (let i = 0; i < base64.length; i += 4) {
    const c1 = CHARS.indexOf(base64.charAt(i));
    const c2 = CHARS.indexOf(base64.charAt(i + 1));
    const c3 = i + 2 < base64.length && base64.charAt(i + 2) !== "=" ? CHARS.indexOf(base64.charAt(i + 2)) : 0;
    const c4 = i + 3 < base64.length && base64.charAt(i + 3) !== "=" ? CHARS.indexOf(base64.charAt(i + 3)) : 0;

    if (c1 === -1 || c2 === -1 || c3 === -1 || c4 === -1) continue;

    const triplet = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;
    bytes.push((triplet >> 16) & 0xff);
    if (base64.charAt(i + 2) !== "=") bytes.push((triplet >> 8) & 0xff);
    if (base64.charAt(i + 3) !== "=") bytes.push(triplet & 0xff);
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}
