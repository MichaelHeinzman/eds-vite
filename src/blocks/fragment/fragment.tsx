// src/blocks/fragment/fragment.tsx
import { render } from "preact";
import { getLink, getRows, getText } from "@/utils/blocks";

function FragmentBlock({ path }: { path: string }) {
  return (
    <sp-card
      class="reference-card"
      heading="Content fragment"
      subheading="Reusable EDS content"
      href={path || undefined}
    >
      <sp-icon-info-outline slot="preview" size="xxl" />
      <div slot="description">
        {path || "No fragment path configured."}
      </div>
    </sp-card>
  );
}

export default function decorate(block: HTMLElement) {
  const rows = getRows(block);
  const path = getLink(rows[0]?.[0]) || getText(rows[0]?.[0]);

  block.replaceChildren();
  render(<FragmentBlock path={path} />, block);
}
