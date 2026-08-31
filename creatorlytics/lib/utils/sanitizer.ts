import DOMPurify from 'isomorphic-dompurify';

/**
 * Canonical HTML Sanitization configuration.
 * Allows standard rich-text formatting tags (bold, italic, lists, paragraphs, line breaks)
 * while strictly stripping scripts, object tags, iframes, and executable attribute handlers.
 */
export const SANITIZER_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'u', 'ul', 'ol', 'li', 'p', 'br', 'span', 'strong', 'em'],
  ALLOWED_ATTR: [] as string[],
  KEEP_CONTENT: true,
};

/**
 * Sanitizes an HTML string using the canonical security configuration.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';
  return DOMPurify.sanitize(dirtyHtml, SANITIZER_CONFIG);
}
