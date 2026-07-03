import { setAuthorDataProps } from "@utils/author";
import { readBlockKeyValue } from "@utils/blocks";
import {
  createOptimizedPicture,
  getDynamicMediaImage,
  getDynamicMediaSrc,
  preloadHeroImage,
} from "@utils/media";

import "./hero.css";

type ButtonConfig = {
  label: string;
  type: string;
  url: string;
};

function getConfigText(
  config: Record<string, HTMLElement | HTMLElement[]>,
  key: string,
) {
  const value = config[key];

  if (!value || Array.isArray(value)) return "";

  return value.textContent?.trim() || "";
}

function getColorTextBasedOnColorCode(colorCode = "") {
  switch (colorCode) {
    case "#FFFFFF":
      return "white";
    case "#3D4E3C":
      return "sage";
    case "#516372":
      return "blue";
    case "#B2B2B2":
      return "gray";
    case "#667A66":
      return "green";
    case "#252A2F":
      return "dark-blue";
    default:
      return "black";
  }
}

function waitForUserGesture(video: HTMLVideoElement) {
  const playOnUserInteraction = () => {
    video.play().catch((error) => {
      console.error("Still cannot play video after user interaction:", error);
    });

    document.removeEventListener("click", playOnUserInteraction);
    document.removeEventListener("touchstart", playOnUserInteraction);
  };

  document.addEventListener("click", playOnUserInteraction);
  document.addEventListener("touchstart", playOnUserInteraction);
}

function getDMVideoThumbnailFromSrc(src: string) {
  if (!src) return null;

  const [baseSrc] = src.split("?");
  const match = baseSrc.match(/(.*urn:aaid:aem:[^/]+\/)/);

  if (!match) return null;

  const baseUrl = `${match[1]}as/thumbnail.jpeg`;

  const { src: dmSrc } = getDynamicMediaSrc(baseUrl, {
    preferwebp: true,
    "accept-experimental": true,
  });

  return dmSrc;
}

function getBlockFields(block: HTMLElement) {
  const config = readBlockKeyValue(block);

  return {
    text: {
      contentEl: config.content as HTMLElement,
      featuredProductTextEl: config.featuredProductText as HTMLElement,
    },
    assets: {
      desktopVideoEl: config.desktopVideo as HTMLElement,
      mobileVideoEl: config.mobileVideo as HTMLElement,
      backgroundImageEl: config.backgroundImage as HTMLElement,
      backgroundMobileImageEl: config.backgroundMobileImage as HTMLElement,
      overlayImageEl: config.overlayImage as HTMLElement,
      overlayImageLinkEl: config.overlayImageLink as HTMLElement,
    },
    actions: {
      button1: {
        label: getConfigText(config, "firstButtonLabel"),
        type: getConfigText(config, "firstButtonType"),
        url: getConfigText(config, "firstButtonUrl"),
      },
      button2: {
        label: getConfigText(config, "secondButtonLabel"),
        type: getConfigText(config, "secondButtonType"),
        url: getConfigText(config, "secondButtonUrl"),
      },
    },
    styles: {
      heroVariation: getConfigText(config, "heroVariation"),
      heroContentPosition: getConfigText(config, "heroContentPosition"),
      contentTextColor: getConfigText(config, "contentTextColor"),
      contentHeadingColor: getConfigText(config, "contentHeadingColor"),
      contentDescriptionStyle:
        getConfigText(config, "contentDescriptionStyle") || "para",
      contentBackgroundColor: getConfigText(config, "contentBackgroundColor"),
      contentMaskOpacity: getConfigText(config, "contentMaskOpacity"),
      featuredProductTextColor: getConfigText(
        config,
        "featuredProductTextColor",
      ),
      featuredProductTextStyle: getConfigText(
        config,
        "featuredProductTextStyle",
      ),
      gradientVariation: getConfigText(config, "gradientVariation"),
      gradientOpacity: getConfigText(config, "gradientOpacity"),
      isFrosted: getConfigText(config, "isFrosted"),
      enableConfig:
        getConfigText(config, "enableConfig") ||
        "enableButton, enablePosition, enableColor",
    },
  };
}

export default async function decorate(block: HTMLElement) {
  const { text, assets, actions, styles } = getBlockFields(block);

  const heroContainer = document.createElement("div");
  heroContainer.className = "hero-main-container";

  const heroImageContainer = document.createElement("div");
  heroImageContainer.className = "hero-image-container";

  const heroVideoContainer = document.createElement("div");
  heroVideoContainer.className = "hero-video-wrapper";

  const heroTextContent = document.createElement("div");
  heroTextContent.className = "hero-text-content";

  const contentEl = text.contentEl;
  const featuredProductTextEl = text.featuredProductTextEl;

  const enableConfig = styles.enableConfig;
  const heroVariation = styles.heroVariation;

  const buttonData: ButtonConfig[] = [];

  if (enableConfig.includes("enableButton")) {
    if (actions.button1.type && actions.button1.url)
      buttonData.push(actions.button1);
    if (actions.button2.type && actions.button2.url)
      buttonData.push(actions.button2);
  }

  function modifiedHeroContentHtml(
    heroContentData: HTMLElement,
    buttons: ButtonConfig[],
  ) {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.className = "hero-button-wrapper";

    const buttonContainers =
      heroContentData.querySelectorAll(".button-container");
    const hasAnchorsInHeroContent =
      heroContentData.querySelector("a[href]") !== null;
    const variantSupportsConfiguredButtons = [
      "heroFrostedGlass",
      "heroGradient",
    ].includes(heroVariation);

    buttonContainers.forEach((buttonContainer) =>
      wrapperDiv.append(buttonContainer),
    );

    if (
      enableConfig.includes("enableButton") &&
      variantSupportsConfiguredButtons &&
      !hasAnchorsInHeroContent &&
      buttons.length > 0
    ) {
      buttons.forEach((data) => {
        const customButton = document.createElement("a");
        const p = document.createElement("p");

        customButton.href = data.url || "#";
        customButton.title = data.label;
        customButton.textContent = data.label;
        const variant = data.type.includes("secondary") ? "secondary" : "accent";
        customButton.classList.add("button", variant);

        p.className = "button-container";
        p.append(customButton);
        wrapperDiv.append(p);
      });
    }

    heroContentData.classList.add(
      ...styles.contentDescriptionStyle.split(/\s+/),
    );

    if (wrapperDiv.children.length > 0) {
      heroContentData.append(wrapperDiv);
    }

    return heroContentData;
  }

  function maskStyleApply(
    element: HTMLElement,
    colorName: string,
    opacity: string,
  ) {
    element.style.setProperty(
      "--hero-content-mask-color",
      `var(--${colorName})`,
    );
    element.style.setProperty(
      "--hero-content-opacity",
      `${parseFloat(String(Number(opacity) / 100)) || 0.5}`,
    );
  }

  function setHeroGradientOpacity(element: HTMLElement, opacity: string) {
    element.style.setProperty(
      "--hero-gradient-opacity",
      `${parseFloat(String(Number(opacity) / 100)) || 0.3}`,
    );
  }

  function viewProductFeatureText() {
    const container = document.createElement("div");
    container.classList.add("feature-product-text");

    if (styles.heroContentPosition) {
      container.classList.add(styles.heroContentPosition);
    }

    setAuthorDataProps(
      container,
      "Featured Product Text",
      "featuredProductText",
      "richtext",
      "hero",
      "text",
    );

    const anchor = featuredProductTextEl?.querySelector<HTMLAnchorElement>(
      ".button-container a",
    );
    const color = styles.featuredProductTextColor || "#fff";

    if (anchor) {
      anchor.classList.remove("button");
      anchor.style.color = color;
    } else {
      container.style.color = color;
    }

    container.innerHTML = featuredProductTextEl?.innerHTML.trim() || "";
    container.classList.add(
      `hero-text-${getColorTextBasedOnColorCode(color)}`,
      styles.featuredProductTextStyle || "para",
    );

    heroContainer.classList.add("hero-feature-text-enabled");

    return container;
  }

  function generateHeroVideo(isMobile: boolean) {
    const desktopUrl = assets.desktopVideoEl
      ?.querySelector<HTMLAnchorElement>("a[href]")
      ?.href?.trim();
    const mobileUrl =
      assets.mobileVideoEl
        ?.querySelector<HTMLAnchorElement>("a[href]")
        ?.href?.trim() || assets.mobileVideoEl?.textContent?.trim();

    const videoUrl = isMobile ? mobileUrl : desktopUrl;

    if (!videoUrl || !videoUrl.includes(".mp4")) return;

    const video = document.createElement("video");
    video.src = videoUrl;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = "auto";
    video.className = "hero-video";

    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("loop", "");

    const thumbnailSrc = getDMVideoThumbnailFromSrc(videoUrl);
    if (thumbnailSrc) video.poster = thumbnailSrc;

    video.addEventListener("loadeddata", () => {
      video.play().catch(() => waitForUserGesture(video));
    });

    const btn = document.createElement("sp-action-button");
    btn.title = "Play/Pause";
    btn.setAttribute("label", "Play or pause background video");
    btn.innerHTML = '<sp-icon-pause slot="icon"></sp-icon-pause>';
    btn.classList.add("playing");

    btn.addEventListener("click", () => {
      if (video.paused) video.play();
      else video.pause();
    });

    video.addEventListener("play", () => {
      btn.classList.add("playing");
      btn.classList.remove("paused");
      btn.innerHTML = '<sp-icon-pause slot="icon"></sp-icon-pause>';
    });

    video.addEventListener("pause", () => {
      btn.classList.add("paused");
      btn.classList.remove("playing");
      btn.innerHTML = '<sp-icon-play slot="icon"></sp-icon-play>';
    });

    const wrapper = document.createElement("div");
    wrapper.className = "hero-video-placeholder-play-pause";
    wrapper.append(btn);

    heroVideoContainer.replaceChildren(video, wrapper);
    heroContainer.prepend(heroVideoContainer);

    video.load();
    video.play().catch(() => waitForUserGesture(video));
  }

  function setHeroBackground(isMobile: boolean) {
    const sourceImage = isMobile
      ? assets.backgroundMobileImageEl
      : assets.backgroundImageEl;
    if (!sourceImage) return;

    const picture = sourceImage.querySelector("picture");

    let src = "";
    let alt = "";
    let useOptimized = true;

    if (picture) {
      const img = picture.querySelector("img");
      src = img?.currentSrc || img?.src || "";
      alt = img?.alt || "";
    } else {
      const dynamicImage = getDynamicMediaImage(sourceImage, {
        width: isMobile ? 750 : 1440,
      });

      if (dynamicImage) {
        src = dynamicImage.src;
        alt = dynamicImage.alt;
        useOptimized = false;
      }
    }

    if (!src) return;

    const renderKey = `${isMobile ? "m" : "d"}|${src}|${useOptimized ? "opt" : "raw"}`;
    if (heroImageContainer.dataset.renderKey === renderKey) return;

    heroImageContainer.replaceChildren();

    let pictureNode: HTMLPictureElement;

    if (useOptimized) {
      const breakpoints = isMobile
        ? [{ media: "(max-width: 750px)", width: "750" }]
        : [{ media: "(max-width: 540px)", width: "1130" }, { width: "1440" }];

      pictureNode = createOptimizedPicture(src, alt, true, breakpoints);
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.alt = alt;
      img.loading = "eager";
      img.fetchPriority = "high";

      pictureNode = document.createElement("picture");
      pictureNode.append(img);
    }

    heroImageContainer.append(pictureNode);
    preloadHeroImage(pictureNode);
    heroContainer.append(heroImageContainer);
    heroImageContainer.dataset.renderKey = renderKey;
  }

  const featuredProductTextVal =
    featuredProductTextEl?.textContent?.trim() || "";

  if (heroVariation === "overlayImageTextBottom") {
    const innerImageContainer = document.createElement("div");
    innerImageContainer.className = "hero-inner-image-container";

    const overlayImageEl = assets.overlayImageEl;

    if (
      overlayImageEl &&
      !overlayImageEl.querySelector("picture") &&
      overlayImageEl.querySelector("a[href]")
    ) {
      const img = getDynamicMediaImage(overlayImageEl);
      if (img)
        overlayImageEl.innerHTML = `<div><picture>${img.outerHTML}</picture></div>`;
    }

    const innerPicture = overlayImageEl?.querySelector("picture");
    const innerImg = innerPicture?.querySelector("img");

    innerImg?.setAttribute("loading", "eager");
    innerImg?.setAttribute("fetchpriority", "high");

    const anchor = document.createElement("a");

    if (innerPicture) {
      setAuthorDataProps(
        innerImg,
        "Overlay Image",
        "overlayImage",
        "image",
        "hero",
        "image",
      );
      anchor.href =
        assets.overlayImageLinkEl?.querySelector<HTMLAnchorElement>("a[href]")
          ?.href || "#";
      anchor.append(innerPicture);
      preloadHeroImage(innerPicture);
    }

    innerImageContainer.append(anchor);
    heroContainer.append(innerImageContainer);

    heroTextContent.classList.add("hero-first-variation");

    if (featuredProductTextVal) heroContainer.append(viewProductFeatureText());

    heroContainer.append(heroTextContent);

    if (styles.heroContentPosition && enableConfig.includes("enablePosition")) {
      heroContainer.classList.add(
        "overlay-image-variation",
        styles.heroContentPosition,
      );
      anchor.classList.add("hero-first-variation-anchor-img");
    }
  } else if (heroVariation === "overlayText") {
    heroTextContent.classList.add(
      "overlay-text-content",
      "overlay-text-variation",
    );

    setAuthorDataProps(
      heroTextContent,
      "Hero Content",
      "content",
      "richtext",
      "hero",
      "text",
    );

    if (featuredProductTextVal) heroContainer.append(viewProductFeatureText());

    if (styles.heroContentPosition && enableConfig.includes("enablePosition")) {
      heroTextContent.classList.add(
        "overlay-text-variation-position",
        styles.heroContentPosition,
      );
    }

    if (styles.contentTextColor && enableConfig.includes("enableColor")) {
      heroTextContent.classList.add(
        `hero-text-${getColorTextBasedOnColorCode(styles.contentTextColor)}`,
        `hero-heading-${getColorTextBasedOnColorCode(styles.contentHeadingColor)}`,
      );
    }

    if (contentEl) {
      heroTextContent.append(modifiedHeroContentHtml(contentEl, buttonData));
    }

    heroContainer.append(heroTextContent);
  } else if (heroVariation === "heroFrostedGlass") {
    const frosted = document.createElement("div");
    frosted.dataset.backgroundColor =
      styles.contentBackgroundColor || "transparent";
    frosted.classList.add("hero-frosted-glass-layout", "hero-text-content");

    setAuthorDataProps(
      frosted,
      "Hero Content",
      "content",
      "richtext",
      "hero",
      "text",
    );

    if (styles.isFrosted === "true") {
      frosted.classList.add("hero-frosted-applied");
      maskStyleApply(
        frosted,
        styles.contentBackgroundColor,
        styles.contentMaskOpacity,
      );
    }

    if (styles.heroContentPosition && enableConfig.includes("enablePosition")) {
      frosted.classList.add(styles.heroContentPosition);
    }

    if (styles.contentTextColor && enableConfig.includes("enableColor")) {
      frosted.classList.add(
        `hero-text-${getColorTextBasedOnColorCode(styles.contentTextColor)}`,
        `hero-heading-${getColorTextBasedOnColorCode(styles.contentHeadingColor)}`,
      );
    }

    if (contentEl)
      frosted.append(modifiedHeroContentHtml(contentEl, buttonData));
    if (featuredProductTextVal) heroContainer.append(viewProductFeatureText());

    heroContainer.classList.add("hero-frosted-glass-container");
    heroContainer.append(frosted);
  } else if (heroVariation === "heroGradient") {
    const gradient = document.createElement("div");
    const gradientEffect = document.createElement("div");

    if (styles.gradientVariation) {
      gradientEffect.classList.add(
        "hero-gradient-effect",
        styles.gradientVariation,
      );
      setHeroGradientOpacity(gradientEffect, styles.gradientOpacity);
    }

    gradient.dataset.backgroundColor =
      styles.contentBackgroundColor || "transparent";
    gradient.classList.add("hero-hero-gradient-layout", "hero-text-content");

    setAuthorDataProps(
      gradient,
      "Hero Content",
      "content",
      "richtext",
      "hero",
      "text",
    );

    if (styles.heroContentPosition && enableConfig.includes("enablePosition")) {
      gradient.classList.add(styles.heroContentPosition);
    }

    if (styles.contentTextColor && enableConfig.includes("enableColor")) {
      gradient.classList.add(
        `hero-text-${getColorTextBasedOnColorCode(styles.contentTextColor)}`,
        `hero-heading-${getColorTextBasedOnColorCode(styles.contentHeadingColor)}`,
      );
    }

    if (contentEl)
      gradient.append(modifiedHeroContentHtml(contentEl, buttonData));

    heroContainer.append(gradientEffect);

    if (featuredProductTextVal) heroContainer.append(viewProductFeatureText());

    heroContainer.append(gradient);
  }

  const mobileMediaQuery = window.matchMedia("(max-width: 767px)");

  setHeroBackground(mobileMediaQuery.matches);

  if (assets.desktopVideoEl?.textContent?.trim()) {
    generateHeroVideo(mobileMediaQuery.matches);

    let currentIsMobile = mobileMediaQuery.matches;

    mobileMediaQuery.addEventListener("change", (event) => {
      if (event.matches !== currentIsMobile) {
        currentIsMobile = event.matches;
        generateHeroVideo(currentIsMobile);
      }
    });
  }

  mobileMediaQuery.addEventListener("change", (event) => {
    setHeroBackground(event.matches);
  });

  block.replaceChildren(heroContainer);
}
