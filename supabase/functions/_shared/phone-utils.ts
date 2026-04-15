/**
 * Normalize any phone number format to +91XXXXXXXXXX
 * Handles: "9989820222", "+919989820222", "+91 99898 20222", "919989820222"
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  return `+91${last10}`;
}

/**
 * Format phone for Meta WhatsApp API: digits only with country code, no + sign.
 * Meta expects: "919989820222"
 */
export function metaPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  return digits.startsWith('91') ? digits : `91${digits.slice(-10)}`;
}

/**
 * Mask a phone number for display: +919989820222 → ****820222
 */
export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  return '****' + normalized.slice(-6);
}
