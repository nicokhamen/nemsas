export const enforceDigits = (value: string, maxLength: number) => {
  // remove non-digits + limit length
  return value.replace(/\D/g, "").slice(0, maxLength);
};