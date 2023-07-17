export default function createImageCDNUtils({
  host = 'https://openstax.org',
  prefetchResolutions = false,
}: {
  host?: string;
  prefetchResolutions?: boolean;
} = {}) {
  const getOptimizedImageUrl = (url: string) => {
    const src = url.replace(
      '/apps/archive',
      '/apps/image-cdn/v1/f=webp/apps/archive'
    );

    if (prefetchResolutions) {
      fetch(`${host}${src}`, { method: 'HEAD' }).catch();
    }
    return src;
  };

  return {
    getOptimizedImageUrl,
  };
}
