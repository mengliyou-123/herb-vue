import DOMPurify from 'dompurify'

const options = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'ol', 'ul', 'li',
    'blockquote', 'pre', 'code', 'h1', 'h2', 'h3', 'a', 'img', 'span', 'div'
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
  FORBID_TAGS: ['svg', 'math', 'script', 'iframe', 'object', 'embed', 'form']
}

export function sanitizeRichHtml(value) {
  return DOMPurify.sanitize(String(value ?? ''), options)
}
