export type HeroPromoBanner = {
  id: number;
  format: 'hero';
  image: string;
  image_mobile: string | null;
  link: string | null;
  alt: string;
};

// Only rooted paths and web URLs can reach an image or link attribute.
export function bannerUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const url = value.trim();
  if (url.includes('\\') || [...url].some(char => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127)) return null;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) && !parsed.username && !parsed.password ? url : null;
  } catch {
    return null;
  }
}

export function parseHeroBanners(payload: unknown): HeroPromoBanner[] {
  const list = Array.isArray(payload) ? payload : payload && typeof payload === 'object' && 'data' in payload ? payload.data : null;
  if (!Array.isArray(list)) return [];
  const seen = new Set<number>();
  return list.flatMap((value: unknown) => {
    if (!value || typeof value !== 'object' || !('format' in value) || value.format !== 'hero') return [];
    const item = value as Record<string, unknown>;
    const image = bannerUrl(item.image);
    if (!image || typeof item.id !== 'number' || !Number.isSafeInteger(item.id) || seen.has(item.id)) return [];
    seen.add(item.id);
    return [{ id: item.id, format: 'hero' as const, image, image_mobile: bannerUrl(item.image_mobile), link: bannerUrl(item.link), alt: typeof item.alt === 'string' && item.alt.trim() ? item.alt.trim() : 'Промо-баннер Sellico' }];
  });
}
