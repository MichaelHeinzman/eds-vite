// src/blocks/call-to-action/call-to-action.tsx
import { render } from "preact";
import { getLink, getRows, getText } from "@/utils/blocks";

type CTAProps = {
  eyebrowHtml: string;
  textColor: string;
  backgroundColor: string;
  buttonLabel: string;
  buttonHref: string;
  buttonAriaLabel: string;
};

function CallToAction(props: CTAProps) {
  return (
    <section class="cta-content spectrum-surface">
      <div class="cta-copy" dangerouslySetInnerHTML={{ __html: props.eyebrowHtml }} />

      {props.buttonLabel && (
        <a
          class="spectrum-Button spectrum-Button--accent"
          href={props.buttonHref}
          aria-label={props.buttonAriaLabel || props.buttonLabel}
        >
          {props.buttonLabel}
        </a>
      )}
    </section>
  );
}

export default function decorate(block: HTMLElement) {
  const rows = getRows(block);
  const buttonCells = rows[3] || [];

  const authoredHref = getLink(buttonCells[5]) || getText(buttonCells[5]);
  const buttonHref = authoredHref && !authoredHref.startsWith("/") && !authoredHref.includes(":")
    ? `/${authoredHref}`
    : authoredHref;

  const props: CTAProps = {
    eyebrowHtml: rows[0]?.[0]?.innerHTML || "",
    textColor: getText(rows[1]?.[0]),
    backgroundColor: getText(rows[2]?.[0]),
    buttonLabel: getText(buttonCells[4]),
    buttonHref,
    buttonAriaLabel: getText(buttonCells[8]),
  };

  block.replaceChildren();
  render(<CallToAction {...props} />, block);
}
