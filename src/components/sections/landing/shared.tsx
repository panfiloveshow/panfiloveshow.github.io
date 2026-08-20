import type { ResponsiveAsset } from './data';

export function PictureSources({ asset, media }: { asset: ResponsiveAsset; media?: string }) {
  return (
    <>
      <source media={media} type="image/avif" srcSet={asset.avif} sizes={asset.sizes} />
      <source media={media} type="image/webp" srcSet={asset.webp} sizes={asset.sizes} />
    </>
  );
}
