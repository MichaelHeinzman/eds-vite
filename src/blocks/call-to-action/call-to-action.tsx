// src/blocks/call-to-action/call-to-action.tsx
import { render } from "preact";
import { getLink, getRows, getText } from "@/utils/blocks";
import "@blocks/call-to-action/call-to-action.css";

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
    <section class={`cta-content ${props.backgroundColor} ${props.textColor}`}>
      <div dangerouslySetInnerHTML={{ __html: props.eyebrowHtml }} />

      {props.buttonLabel && (
        <a
          class="cta-button"
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

  const props: CTAProps = {
    eyebrowHtml: rows[0]?.[0]?.innerHTML || "",
    textColor: getText(rows[1]?.[0]),
    backgroundColor: getText(rows[2]?.[0]),
    buttonLabel: getText(buttonCells[4]),
    buttonHref: getLink(buttonCells[5]) || getText(buttonCells[5]),
    buttonAriaLabel: getText(buttonCells[8]),
  };

  block.replaceChildren();
  render(<CallToAction {...props} />, block);
}
