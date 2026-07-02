export function applyParamsToUrl(
  url: string,
  params: Record<string, string | number | boolean | null | undefined>,
) {
  const newUrl = new URL(url, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      newUrl.searchParams.set(key, String(value));
    }
  });

  return newUrl.toString();
}

export function getDynamicMediaSrc(
  src: string,
  {
    width = window.innerWidth,
    height = null,
    quality = 85,
    srcsetWidths = [320, 480, 768, 1024, 1440, 1920],
    ...otherParams
  }: {
    width?: number | string;
    height?: number | string | null;
    quality?: number;
    srcsetWidths?: number[];
    [key: string]: unknown;
  } = {},
) {
  if (!src) return { src: "", srcset: "" };

  const imageUrl = src
    .replace("/original/", "/")
    .replace(/\.(png|jpg|jpeg)$/i, ".webp");

  const baseParams = {
    width,
    height,
    quality,
    ...otherParams,
  };

  const filteredParams = Object.fromEntries(
    Object.entries(baseParams).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  ) as Record<string, string | number | boolean>;

  const finalSrc = applyParamsToUrl(imageUrl, filteredParams);

  const srcset = srcsetWidths
    .map(
      (w) =>
        applyParamsToUrl(imageUrl, { ...filteredParams, width: w }) + ` ${w}w`,
    )
    .join(", ");

  return { src: finalSrc, srcset };
}

export function getDynamicMediaImage(
  container: HTMLElement,
  {
    width,
    height = null,
    quality = 85,
    sizes = "100vw",
    srcsetWidths = [320, 480, 768, 1024, 1440, 1920],
  }: {
    width?: number | string;
    height?: number | string | null;
    quality?: number;
    sizes?: string;
    srcsetWidths?: number[];
  } = {},
) {
  const [imageAnchorContainer, altContainer] = [
    ...container.children,
  ] as HTMLElement[];
  const imageAnchor =
    imageAnchorContainer?.querySelector<HTMLAnchorElement>("a[href]");

  if (!imageAnchor) return null;

  const baseSrc = imageAnchor.href;
  const title = imageAnchor.title;
  const alt =
    altContainer?.textContent?.trim() || (title !== baseSrc ? title : "");

  const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(baseSrc.split("?")[0]);
  const image = hasFileExtension
    ? getDynamicMediaSrc(baseSrc, { width, height, quality, srcsetWidths })
    : { src: baseSrc, srcset: "" };

  const img = document.createElement("img");
  img.src = image.src;
  img.alt = alt;
  img.loading = "lazy";
  img.decoding = "async";
  img.sizes = sizes;

  if (width) img.width = Number(width);
  if (height) img.height = Number(height);
  if (image.srcset) img.srcset = image.srcset;

  return img;
}

export function createOptimizedPicture(
  src: string,
  alt = "",
  eager = false,
  breakpoints = [
    { media: "(min-width: 600px)", width: "2000" },
    { width: "750" },
  ],
) {
  const url = new URL(src, window.location.href);
  const picture = document.createElement("picture");
  const ext = url.pathname.substring(url.pathname.lastIndexOf(".") + 1);

  breakpoints.forEach((breakpoint) => {
    const source = document.createElement("source");

    if (breakpoint.media) source.media = breakpoint.media;

    source.type = "image/webp";
    source.srcset = `${url.pathname}?width=${breakpoint.width}&format=webply&optimize=medium`;

    picture.append(source);
  });

  breakpoints.forEach((breakpoint, index) => {
    if (index < breakpoints.length - 1) {
      const source = document.createElement("source");

      if (breakpoint.media) source.media = breakpoint.media;

      source.srcset = `${url.pathname}?width=${breakpoint.width}&format=${ext}&optimize=medium`;

      picture.append(source);
    } else {
      const img = document.createElement("img");

      img.loading = eager ? "eager" : "lazy";
      img.alt = alt;
      img.src = `${url.pathname}?width=${breakpoint.width}&format=${ext}&optimize=medium`;
      img.width = Number(breakpoint.width);
      img.fetchPriority = eager ? "high" : "auto";

      picture.append(img);
    }
  });

  return picture;
}

export function preloadHeroImage(picture: HTMLPictureElement) {
  const source = [...picture.querySelectorAll("source")]
    .filter((item) => item.type === "image/webp")
    .find((item) => {
      const media = item.media;
      return !media || window.matchMedia(media).matches;
    });

  const href = source?.srcset;
  if (!href) return;

  if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.fetchPriority = "high";
  link.as = "image";
  link.href = href;
  link.type = source?.type || "image/webp";

  document.head.append(link);
}
