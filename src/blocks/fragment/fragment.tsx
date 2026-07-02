// src/blocks/fragment/fragment.tsx
import { render } from "preact";
import { getLink, getRows, getText } from "@/utils/blocks";
import "./fragment.css";

function FragmentBlock({ path }: { path: string }) {
  return (
    <section class="fragment-content">
      {path ? <a href={path}>{path}</a> : <p>No fragment path configured.</p>}
    </section>
  );
}

export default function decorate(block: HTMLElement) {
  const rows = getRows(block);
  const path = getLink(rows[0]?.[0]) || getText(rows[0]?.[0]);

  block.replaceChildren();
  render(<FragmentBlock path={path} />, block);
}
