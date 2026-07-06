import "./hero.css";

export default function decorate(block: HTMLElement) {
  const picture = block.querySelector("picture");
  const content = picture?.closest("p")?.parentElement;
  if (!picture || !content) return;

  const image = picture.querySelector("img");
  if (image) {
    image.loading = "eager";
    image.fetchPriority = "high";
  }

  const preloadSource = picture.querySelector<HTMLSourceElement>("source[media]")?.srcset
    || image?.currentSrc
    || image?.src;
  if (preloadSource && !document.head.querySelector(`link[rel="preload"][href="${preloadSource}"]`)) {
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.as = "image";
    preload.href = preloadSource;
    preload.fetchPriority = "high";
    document.head.append(preload);
  }

  block.classList.add("hero-boilerplate");
  content.classList.add("hero-boilerplate-content");
  picture.closest("p")?.classList.add("hero-boilerplate-picture");
}
