import {directThumb, publicHttpUrl} from '@/lib/work-thumb';

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get('url') || '';
  const page = publicHttpUrl(target);
  if (!page) return Response.json({image: null});
  const direct = directThumb(page.toString());
  const image = direct || await remoteThumb(page);
  return Response.json({image}, {headers: {'Cache-Control': 'public, max-age=86400'}});
}

async function remoteThumb(page: URL) {
  if (/(^|\.)vimeo\.com$/i.test(page.hostname)) {
    const thumb = await vimeoThumb(page);
    if (thumb) return thumb;
  }
  const html = await readHtml(page, 0);
  if (!html) return null;
  const found = metaImage(html.body);
  if (!found) return null;
  const absolute = publicHttpUrl(new URL(found, html.finalUrl).toString());
  return absolute ? absolute.toString() : null;
}

async function vimeoThumb(page: URL) {
  try {
    const response = await fetch('https://vimeo.com/api/oembed.json?url=' + encodeURIComponent(page.toString()), {signal: AbortSignal.timeout(4000), redirect: 'follow'});
    if (!response.ok) return null;
    const data = await response.json() as {thumbnail_url?: string};
    const thumb = data.thumbnail_url ? publicHttpUrl(data.thumbnail_url) : null;
    return thumb ? thumb.toString() : null;
  } catch {
    return null;
  }
}

async function readHtml(page: URL, hops: number): Promise<{body: string; finalUrl: string} | null> {
  if (hops > 3 || !publicHttpUrl(page.toString())) return null;
  try {
    const response = await fetch(page, {
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
      headers: {Accept: 'text/html,application/xhtml+xml', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'},
    });
    if (response.status >= 300 && response.status < 400) {
      const next = response.headers.get('location');
      if (!next) return null;
      return readHtml(new URL(next, page), hops + 1);
    }
    if (!response.ok) return null;
    const type = response.headers.get('content-type') || '';
    if (type.startsWith('image/')) return {body: '<meta property="og:image" content="' + page.toString() + '">', finalUrl: page.toString()};
    if (!type.includes('html') && !type.includes('xml')) return null;
    const reader = response.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < 1000000) {
      const {done, value} = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      size += value.byteLength;
    }
    await reader.cancel().catch(() => undefined);
    const merged = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
    return {body: new TextDecoder().decode(merged), finalUrl: page.toString()};
  } catch {
    return null;
  }
}

function metaImage(html: string) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const key = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
    const content = /content\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (content && (key === 'og:image' || key === 'og:image:url' || key === 'twitter:image' || key === 'twitter:image:src')) return decode(content);
  }
  return null;
}

function decode(value: string) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
}
