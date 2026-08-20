export type ResponsiveAsset = {
  avif: string;
  webp: string;
  fallback: string;
  sizes: string;
  width: number;
  height: number;
};

const RESPONSIVE_ASSET_ROOT = '/assets/landing-v2/responsive';
const AI_PARTICLE_VECTOR_ROOT = '/assets/landing-v2/vector';

export const AI_PARTICLE_LAYERS = {
  back: `${AI_PARTICLE_VECTOR_ROOT}/ai-particle-field-back.svg`,
  mid: `${AI_PARTICLE_VECTOR_ROOT}/ai-particle-field-mid.svg`,
  front: `${AI_PARTICLE_VECTOR_ROOT}/ai-particle-field-front.svg`,
} as const;

export const ASSETS: Record<'funnel' | 'wb' | 'ozon', ResponsiveAsset> = {
  funnel: {
    avif: `${RESPONSIVE_ASSET_ROOT}/growth-funnel-768.avif 768w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-1280.avif 1280w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-1920.avif 1920w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-2560.avif 2560w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-3840.avif 3840w`,
    webp: `${RESPONSIVE_ASSET_ROOT}/growth-funnel-768.webp 768w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-1280.webp 1280w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-1920.webp 1920w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-2560.webp 2560w, ${RESPONSIVE_ASSET_ROOT}/growth-funnel-3840.webp 3840w`,
    fallback: `${RESPONSIVE_ASSET_ROOT}/growth-funnel-1920.webp`,
    sizes: '(min-width: 1664px) 1600px, (min-width: 1024px) calc(100vw - 8rem), calc(100vw - 2.5rem)',
    width: 3840,
    height: 1920,
  },
  wb: {
    avif: `${RESPONSIVE_ASSET_ROOT}/purple-bag-320.avif 320w, ${RESPONSIVE_ASSET_ROOT}/purple-bag-480.avif 480w, ${RESPONSIVE_ASSET_ROOT}/purple-bag-640.avif 640w, ${RESPONSIVE_ASSET_ROOT}/purple-bag-950.avif 950w`,
    webp: `${RESPONSIVE_ASSET_ROOT}/purple-bag-320.webp 320w, ${RESPONSIVE_ASSET_ROOT}/purple-bag-480.webp 480w, ${RESPONSIVE_ASSET_ROOT}/purple-bag-640.webp 640w, ${RESPONSIVE_ASSET_ROOT}/purple-bag-950.webp 950w`,
    fallback: `${RESPONSIVE_ASSET_ROOT}/purple-bag-640.webp`,
    sizes: '(min-width: 640px) 324px, 188px',
    width: 950,
    height: 1261,
  },
  ozon: {
    avif: `${RESPONSIVE_ASSET_ROOT}/blue-parcel-320.avif 320w, ${RESPONSIVE_ASSET_ROOT}/blue-parcel-480.avif 480w, ${RESPONSIVE_ASSET_ROOT}/blue-parcel-768.avif 768w, ${RESPONSIVE_ASSET_ROOT}/blue-parcel-1160.avif 1160w`,
    webp: `${RESPONSIVE_ASSET_ROOT}/blue-parcel-320.webp 320w, ${RESPONSIVE_ASSET_ROOT}/blue-parcel-480.webp 480w, ${RESPONSIVE_ASSET_ROOT}/blue-parcel-768.webp 768w, ${RESPONSIVE_ASSET_ROOT}/blue-parcel-1160.webp 1160w`,
    fallback: `${RESPONSIVE_ASSET_ROOT}/blue-parcel-768.webp`,
    sizes: '(min-width: 640px) 446px, 260px',
    width: 1160,
    height: 1117,
  },
} as const;

export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
} as const;
