// Teléfono: lada de país + 10 dígitos nacionales (México y EE. UU./Canadá).

export const PHONE_COUNTRIES = [
  { code: "52", label: "México", short: "MX" },
  { code: "1", label: "EE. UU. / Canadá", short: "US" },
] as const;

export const NATIONAL_DIGITS = 10;

/**
 * Deja solo los dígitos nacionales, sin la lada, recortados a 10.
 * Si alguien pega «+52 1 644 123 4567» o «52 644…», quita la lada (y el 1 viejo de celulares MX).
 */
export function cleanNational(raw: string, countryCode: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.length > NATIONAL_DIGITS) {
    const prefixes = countryCode === "52" ? ["521", "52"] : [countryCode];
    for (const p of prefixes) {
      if (d.startsWith(p) && d.length - p.length >= NATIONAL_DIGITS) {
        d = d.slice(p.length);
        break;
      }
    }
  }
  return d.slice(0, NATIONAL_DIGITS);
}

/** «6441234567» → «644 123 4567», también a medio escribir. */
export function formatNational(digits: string): string {
  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 10);
  return [a, b, c].filter(Boolean).join(" ");
}

export function isCompleteNational(digits: string): boolean {
  return digits.length === NATIONAL_DIGITS;
}
