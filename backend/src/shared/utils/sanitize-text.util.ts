export function sanitizeText(value: string | undefined | null, maxLength = 500): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const cleaned = value
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();

  if (!cleaned) {
    return undefined;
  }

  return cleaned.slice(0, maxLength);
}
