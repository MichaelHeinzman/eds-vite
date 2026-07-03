import { render } from "preact";
import "./footer.css";

function Footer() {
  return (
    <div class="site-footer">
      <div>
        <a class="footer-brand" href="/" aria-label="EDS Market home">
          <img src="/eds-market-mark-192.png" alt="" width="46" height="46" />
          <strong>EDS Market</strong>
        </a>
        <p>Thoughtful pieces for the way you live.</p>
      </div>
      <nav aria-label="Footer navigation">
        <a href="/products">Shop</a>
        <a href="/wishlist">Wishlist</a>
        <a href="/account">Account</a>
      </nav>
    </div>
  );
}

export default function decorate(block: HTMLElement) {
  render(<Footer />, block);
}
