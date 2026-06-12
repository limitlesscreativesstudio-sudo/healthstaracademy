export interface PasswordChecks {
  length: boolean;     // ≥ 8
  upper: boolean;      // has uppercase
  lower: boolean;      // has lowercase
  digit: boolean;      // has digit
  symbol: boolean;     // has non-alphanumeric
}

export const evaluatePassword = (pw: string): PasswordChecks => ({
  length: pw.length >= 8,
  upper:  /[A-Z]/.test(pw),
  lower:  /[a-z]/.test(pw),
  digit:  /\d/.test(pw),
  symbol: /[^A-Za-z0-9]/.test(pw),
});

export const passwordScore = (c: PasswordChecks): number =>
  Number(c.length) + Number(c.upper) + Number(c.lower) + Number(c.digit) + Number(c.symbol);

/** Minimum bar: length AND at least 3 of the other 4 categories. */
export const isPasswordStrong = (pw: string): boolean => {
  const c = evaluatePassword(pw);
  if (!c.length) return false;
  const variety = Number(c.upper) + Number(c.lower) + Number(c.digit) + Number(c.symbol);
  return variety >= 3;
};

export const strengthLabel = (score: number): { label: string; color: string } => {
  if (score <= 1) return { label: "Very weak", color: "#C0392B" };
  if (score === 2) return { label: "Weak",     color: "#E67E22" };
  if (score === 3) return { label: "Fair",     color: "#F1C40F" };
  if (score === 4) return { label: "Strong",   color: "#27AE60" };
  return                  { label: "Excellent",color: "#127A1B" };
};
