import { render } from "preact";
import { useState } from "preact/hooks";
import "./header.css";

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <div class="site-header">
      <a class="site-logo" href="/" aria-label="AEM EDS Vite Boilerplate home">
        AEM EDS Vite Boilerplate
      </a>
      <button
        class="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? "Close" : "Menu"}</span>
      </button>
      <nav id="primary-navigation" class={open ? "open" : ""} aria-label="Primary navigation">
        <a href="https://www.aem.live/tutorial">Tutorial</a>
        <a href="https://www.aem.live/docs/">Documentation</a>
      </nav>
    </div>
  );
}

export default function decorate(block: HTMLElement) {
  render(<Header />, block);
}
