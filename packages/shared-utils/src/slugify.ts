export function slugify(text: string): string {
  // Convert Chinese characters to pinyin-like representation using base64
  // or use a simple hash for non-ASCII characters
  const normalized = text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fa5]+/g, '')  // Keep Chinese characters
    .replace(/\-\-+/g, '-');

  // If result is empty (e.g., only Chinese chars were filtered), create a timestamp-based slug
  if (!normalized || normalized === '-') {
    return `post-${Date.now()}`;
  }

  // Replace Chinese characters with their char codes
  return normalized.replace(/[\u4e00-\u9fa5]/g, (char) => {
    return '-' + char.charCodeAt(0).toString(36);
  });
}
