export const buildImageProxyUrl = (url?: string) => {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("/api/image-proxy?url=")) {
    return url;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }

  return url;
};
