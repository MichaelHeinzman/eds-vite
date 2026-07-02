import { render } from "preact";
import { getLink, getRows, getText } from "@/utils/blocks";
import "./carousel.css";

function Carousel({ fragmentPath }: { fragmentPath: string }) {
  return (
    <section class="carousel-content">
      <p>Carousel fragment:</p>
      {fragmentPath ? (
        <a href={fragmentPath}>{fragmentPath}</a>
      ) : (
        <p>No carousel fragment configured.</p>
      )}
    </section>
  );
}

export default function decorate(block: HTMLElement) {
  const rows = getRows(block);
  const fragmentPath = getLink(rows[5]?.[0]) || getText(rows[5]?.[0]);

  block.replaceChildren();
  render(<Carousel fragmentPath={fragmentPath} />, block);
}
