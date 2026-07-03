import "./carousel.css";

export default function decorate(block: HTMLElement) {
  block.closest(".section")?.remove();
}
