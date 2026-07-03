import "./commerce-teaser.css";

function getDynamicMediaImage(image: HTMLElement): HTMLImageElement {
  const link = image.querySelector<HTMLAnchorElement>("a[href]");
  const img = document.createElement("img");

  if (!link) return img;

  img.src = link.href;
  img.alt = link.textContent?.trim() || "";
  img.loading = "lazy";

  return img;
}

function decorateButton(button: HTMLElement | undefined, index: number) {
  if (!button) return;

  button.classList.add("button-container", `button-${index + 1}`);

  const anchor = button.querySelector<HTMLAnchorElement>("a[href]");

  if (!anchor) {
    button.replaceChildren();
    return;
  }

  const values = [...button.querySelectorAll("p")]
    .map((child) => child.textContent?.trim() || "")
    .filter(Boolean);

  const href = anchor.href;
  const buttonText = values[1] || anchor.textContent?.trim() || "";
  const buttonType = values[2] || "cta";
  const buttonColor = values[3] || "";
  const buttonOptions = values.slice(4);

  const openInNewTab = buttonOptions.includes("openInNewTab");
  const noArrow = buttonOptions.includes("noarrow");
  const smallSize = buttonOptions.includes("smallsize");
  const isTextLinkCTA = buttonType === "cta";

  anchor.href = href;
  anchor.className = "";
  const buttonVariant = buttonType === "cta" ? "accent" : "secondary";
  anchor.classList.add("button", buttonVariant);

  if (buttonColor && isTextLinkCTA) {
    anchor.dataset.textColor = buttonColor;
  }

  if (!isTextLinkCTA && smallSize) anchor.classList.add("small");
  if (!isTextLinkCTA && noArrow) anchor.classList.add("noarrow");

  anchor.target = openInNewTab ? "_blank" : "_self";
  anchor.textContent = buttonText;

  button.replaceChildren(anchor);
}

function decorateButtons(buttons: Array<HTMLElement | undefined>) {
  buttons.forEach((button, index) => decorateButton(button, index));
}

function decorateTitles({
  titles,
  titleStyle,
  openInNewTab,
  titleLink,
}: {
  titles: HTMLElement;
  titleStyle?: string;
  openInNewTab: boolean;
  titleLink?: HTMLAnchorElement | null;
}) {
  const title = titles.querySelector<HTMLElement>("h1,h2,h3,h4,h5,h6");
  const pretitle = titles.querySelector<HTMLElement>("p");

  const fragment = document.createDocumentFragment();

  if (pretitle) {
    const pretitleContainer = document.createElement("div");
    pretitleContainer.dataset.propName = "pretitle";
    pretitleContainer.append(pretitle);
    fragment.append(pretitleContainer);
  }

  if (title) {
    title.dataset.propName = "title";

    if (titleLink) {
      const titleText = title.textContent?.trim() || "Title";
      titleLink.textContent = titleText;
      titleLink.title = titleText;
      titleLink.target = openInNewTab ? "_blank" : "_self";
      title.replaceChildren(titleLink);
      title.classList.add("linked-title");
    }

    if (titleStyle) title.classList.add(titleStyle);
    fragment.append(title);
  }

  titles.replaceChildren(fragment);
  titles.classList.add("titles");
}

function decorateDescription(
  description: HTMLElement,
  descriptionStyle?: string,
) {
  const fragment = document.createDocumentFragment();
  const inner = description.querySelector("div");

  if (inner) {
    [...inner.children].forEach((child) => fragment.append(child));
  }

  description.dataset.propName = "description";
  description.classList.add("description");

  if (descriptionStyle) {
    description.classList.add(descriptionStyle);
  }

  description.replaceChildren(fragment);
}

function decorateTextContent({
  titles,
  description,
  buttons,
  block,
  titleLink,
  enableCTA,
  openInNewTab,
}: {
  titles: HTMLElement;
  description: HTMLElement;
  buttons: Array<HTMLElement | undefined>;
  block: HTMLElement;
  titleLink?: HTMLAnchorElement | null;
  enableCTA: boolean;
  openInNewTab: boolean;
}) {
  const contentContainer = document.createElement("div");
  contentContainer.className =
    `content-container ${block.dataset.paddingStyle || ""}`.trim();

  if (block.dataset.bgColor) {
    contentContainer.dataset.backgroundColor = block.dataset.bgColor;
  }

  if (titleLink && !enableCTA && block.closest(".card-variation")) {
    contentContainer.classList.add("no-cta-text", "button");
  }

  decorateTitles({
    titles,
    titleStyle: block.dataset.titleStyle,
    openInNewTab,
    titleLink,
  });

  decorateDescription(description, block.dataset.descriptionStyle);

  contentContainer.append(titles, description);

  if (enableCTA) {
    decorateButtons(buttons);
    buttons.forEach((button) => {
      if (button) contentContainer.append(button);
    });
  }

  return contentContainer;
}

function decorateVideo(videoContainer: HTMLElement) {
  const [video, controlsConfig, lazyloadConfig] = [
    ...videoContainer.children,
  ] as HTMLElement[];

  const videoAnchor = video?.querySelector<HTMLAnchorElement>("a[href]");
  const videoURL = videoAnchor?.href;

  if (!videoURL || !videoURL.includes(".mp4")) return;

  const videoElement = document.createElement("video");
  videoElement.muted = true;
  videoElement.loop = true;
  videoElement.playsInline = true;
  videoElement.preload = "auto";

  const showControls = controlsConfig?.textContent?.trim() === "true";
  const lazyload = lazyloadConfig?.textContent?.trim() === "true";

  if (showControls) videoElement.controls = true;
  if (lazyload) videoElement.setAttribute("loading", "lazy");

  const source = document.createElement("source");
  source.src = videoURL;
  source.type = "video/mp4";

  videoElement.append(source);

  let buttonWrapper: HTMLDivElement | undefined;

  if (!showControls) {
    buttonWrapper = document.createElement("div");
    buttonWrapper.className = "commerce-video-placeholder-play-pause";

    const playPauseButton = document.createElement("sp-action-button");
    playPauseButton.ariaLabel = "Toggle Play/Pause";
    playPauseButton.innerHTML = '<sp-icon-play slot="icon"></sp-icon-play>';
    playPauseButton.classList.add("paused");

    playPauseButton.addEventListener("click", () => {
      if (videoElement.paused) {
        videoElement
          .play()
          .then(() => {
            playPauseButton.classList.remove("paused");
            playPauseButton.innerHTML = '<sp-icon-pause slot="icon"></sp-icon-pause>';
          });
      } else {
        videoElement.pause();
        playPauseButton.classList.add("paused");
        playPauseButton.innerHTML = '<sp-icon-play slot="icon"></sp-icon-play>';
      }
    });

    videoElement.addEventListener("play", () =>
      playPauseButton.classList.remove("paused"),
    );
    videoElement.addEventListener("pause", () =>
      playPauseButton.classList.add("paused"),
    );

    buttonWrapper.append(playPauseButton);
  }

  videoElement.play().catch(() => {
    // Autoplay can be blocked.
  });

  videoContainer.classList.add("video-container", "commerce-teaser-wrapper");
  videoContainer.replaceChildren(videoElement);

  if (buttonWrapper) {
    videoContainer.append(buttonWrapper);
  }
}

function decorateImage(image: HTMLElement) {
  image.classList.add("image-container");

  const dynamicMedia = image.querySelector<HTMLAnchorElement>("a[href]");
  if (!dynamicMedia) return;

  const img = getDynamicMediaImage(image);

  image.replaceChildren(img);
  image.classList.add("scene7-image");
}

function applyStylesToBlock(
  styles: HTMLElement | undefined,
  block: HTMLElement,
  wrapper: HTMLElement | null,
) {
  if (!styles || !wrapper) return;

  const [
    titleStyle,
    descriptionStyle,
    backgroundColor,
    featuredPosition,
    hoverEffect,
    textAlignment,
    paddingStyle,
  ] = [...styles.querySelectorAll("p")].map(
    (style) => style.textContent?.trim() || "",
  );

  block.dataset.bgColor = backgroundColor;
  block.dataset.titleStyle = titleStyle;
  block.dataset.descriptionStyle = descriptionStyle;
  block.dataset.paddingStyle = paddingStyle;

  if (textAlignment) wrapper.classList.add(textAlignment);
  if (hoverEffect) wrapper.classList.add(hoverEffect);

  if (featuredPosition && featuredPosition !== "default") {
    wrapper.classList.add(featuredPosition);
  } else {
    wrapper.classList.add("card-variation");
  }
}

export default function decorate(block: HTMLElement) {
  const [
    titles,
    description,
    image,
    video,
    actions,
    button1,
    button2,
    button3,
    styles,
  ] = [...block.children] as HTMLElement[];

  if (!titles || !description) return;

  const buttons = [button1, button2, button3];
  const wrapper = block.closest<HTMLElement>(".commerce-teaser-wrapper");

  const openInNewTab = actions?.textContent?.includes("openInNewTab") || false;
  const enableCTA = actions?.textContent?.includes("enableCTA") || false;
  const titleLink = !enableCTA
    ? actions?.querySelector<HTMLAnchorElement>("a[href]")
    : null;

  applyStylesToBlock(styles, block, wrapper);

  const contentContainer = decorateTextContent({
    titles,
    description,
    buttons,
    block,
    titleLink,
    enableCTA,
    openInNewTab,
  });

  const isVideo = !!video?.textContent?.trim();
  const mediaContainer = isVideo ? video : image;

  if (isVideo && video) {
    decorateVideo(video);
  } else if (image) {
    decorateImage(image);

    if (
      titleLink &&
      !enableCTA &&
      wrapper?.classList.contains("card-variation")
    ) {
      const imageLink = document.createElement("a");
      imageLink.href = titleLink.href;
      imageLink.tabIndex = -1;
      imageLink.ariaHidden = "true";
      imageLink.append(...image.childNodes);
      image.append(imageLink);
    }
  }

  const fragment = document.createDocumentFragment();

  if (wrapper?.classList.contains("featured-left")) {
    fragment.append(contentContainer);
    if (mediaContainer) fragment.append(mediaContainer);
  } else {
    if (mediaContainer) fragment.append(mediaContainer);
    fragment.append(contentContainer);
  }

  if (
    block.parentElement?.classList.contains("card-variation") &&
    block.querySelector(".linked-title")
  ) {
    block.classList.add("no-cta-text", "button");
  }

  block.replaceChildren(fragment);
}
