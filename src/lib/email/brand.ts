export const EMAIL_BRAND = {
  navy: '#18243D',
  navySoft: '#263653',
  terracotta: '#C96A3D',
  terracottaSoft: '#F8EDE6',
  cream: '#F7F3EE',
  paper: '#FFFCF9',
  ink: '#20283A',
  muted: '#697386',
  line: '#E9E2D9',
} as const;

export function escapeHtml(value: string | number | undefined | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function emailPreheader(text: string): string {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">${escapeHtml(text)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>`;
}
