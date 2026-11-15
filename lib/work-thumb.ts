function blockedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || host === 'metadata.google.internal') return true;
  const ip = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ip) {
    const parts = ip.slice(1).map(Number);
    const [a, b] = parts;
    if (parts.some(part => part > 255)) return true;
    if (a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127)) return true;
  }
  if (host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80')) return true;
  return false;
}

export function publicHttpUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.username || url.password || blockedHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

export function directThumb(value: string) {
  const url = publicHttpUrl(value);
  if (!url) return null;
  if (/\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url.pathname)) return url.toString();
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    const id = host === 'youtu.be'
      ? url.pathname.split('/').filter(Boolean)[0]
      : url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/embed/') || url.pathname.startsWith('/live/')
        ? url.pathname.split('/').filter(Boolean)[1]
        : url.searchParams.get('v');
    if (id && /^[\w-]{6,}$/.test(id)) return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
  }
  return null;
}
