import { render } from "preact";

import "./header.css";

export const Header = () => {
  return (
    <div class="header">
      <div class="header-content">
        <a class="header-logo" href="/">
          EDS Vite
        </a>

        <nav aria-label="Primary Navigation">
          <ul>
            <li>
              <a href="/">Home</a>
            </li>

            <li>
              <a href="/docs">Docs</a>
            </li>

            <li>
              <a href="/blocks">Blocks</a>
            </li>

            <li>
              <a href="https://github.com">GitHub</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default function decorate(block: HTMLElement) {
  render(<Header />, block);
}
