/**
 * Sanitizes raw phone number strings from CMS / API configuration.
 * Removes non-numeric and non-plus characters to ensure valid `tel:` protocol links.
 */
export const sanitizePhoneNumber = (rawPhone?: string | null): { raw: string; telHref: string } => {
  const fallback = '+852 2345 6789';
  const display = (rawPhone && rawPhone.trim()) ? rawPhone.trim() : fallback;
  const sanitized = display.replace(/[^+\d]/g, '');
  return {
    raw: display,
    telHref: `tel:${sanitized}`
  };
};
