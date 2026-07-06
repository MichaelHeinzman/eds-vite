import { render } from "preact";
import "./footer.css";

function Footer() {
  return (
    <div class="site-footer">
      <p>Built with Adobe Experience Manager Edge Delivery Services.</p>
      <a href="https://www.aem.live/">Learn about Edge Delivery Services</a>
    </div>
  );
}

export default function decorate(block: HTMLElement) {
  render(<Footer />, block);
}
