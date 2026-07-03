import { render } from "preact";

function Footer() {
  return (
    <div class="site-footer">
      <div>
        <strong>EDS Vite</strong>
        <p>Modern Edge Delivery, powered by Preact and Adobe Spectrum.</p>
      </div>
      <nav aria-label="Footer navigation">
        <a href="/docs">Documentation</a>
        <a href="/blocks">Blocks</a>
        <a href="https://github.com">GitHub</a>
      </nav>
    </div>
  );
}

export default function decorate(block: HTMLElement) {
  render(<Footer />, block);
}
