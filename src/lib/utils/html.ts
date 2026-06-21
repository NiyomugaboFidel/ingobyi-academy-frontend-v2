/** Strip HTML tags and return plain text. */
export function stripHtml(html: string): string {
  if (!html?.trim()) return '';
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || div.innerText || '').replace(/\u00a0/g, ' ').trim();
  }
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** True when HTML has no meaningful text content. */
export function isHtmlEmpty(html: string): boolean {
  return !stripHtml(html);
}

/** Truncate HTML to a plain-text preview. */
export function truncateHtml(html: string, maxLength = 120): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
  'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote',
  'a', 'img', 'code', 'pre', 'span', 'div', 'hr',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel', 'class']),
  img: new Set(['src', 'alt', 'title', 'width', 'height', 'class']),
  '*': new Set(['class', 'style']),
};

/** Basic whitelist sanitizer for rich content we authored in TipTap. */
export function sanitizeHtml(html: string): string {
  if (!html?.trim()) return '';
  if (typeof document === 'undefined') {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/\s+on\w+="[^"]*"/gi, '')
      .replace(/\s+on\w+='[^']*'/gi, '');
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');

  function clean(node: Node): void {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (!ALLOWED_TAGS.has(tag)) {
          while (el.firstChild) el.parentNode?.insertBefore(el.firstChild, el);
          el.remove();
          continue;
        }
        const allowed = ALLOWED_ATTRS[tag] ?? ALLOWED_ATTRS['*'];
        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase();
          if (name.startsWith('on') || (!allowed.has(name) && !ALLOWED_ATTRS['*'].has(name))) {
            el.removeAttribute(attr.name);
          }
        }
        if (tag === 'a') {
          el.setAttribute('rel', 'noopener noreferrer');
          if (el.getAttribute('target') === '_blank') {
            el.setAttribute('rel', 'noopener noreferrer');
          }
        }
        if (tag === 'img') {
          const src = el.getAttribute('src') ?? '';
          if (!src.startsWith('https://') && !src.startsWith('http://') && !src.startsWith('/')) {
            el.remove();
            continue;
          }
        }
        clean(el);
      } else if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
      }
    }
  }

  clean(doc.body);
  return doc.body.innerHTML;
}

/** Convert HTML lesson content to readable plain text paragraphs. */
export function htmlToPlainParagraphs(html: string): string[] {
  if (!html?.trim()) return [];

  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n');
    const text = (div.textContent || div.innerText || '').replace(/\u00a0/g, ' ');
    return text
      .split(/\n{2,}|\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
