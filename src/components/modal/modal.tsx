import type { ComponentChildren } from "preact";
import { useEffect, useRef } from "preact/hooks";

type ModalProps = {
  isOpen: boolean;
  title?: string;
  position?: "right" | "center";
  onClose: () => void;
  children: ComponentChildren;
};

export function Modal({ isOpen, title, position = "center", onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.classList.add("modal-open");
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (position === "right") {
    return (
      <div class="drawer" role="presentation">
        <button class="drawer-underlay" type="button" aria-label="Close cart" onClick={onClose} />
        <aside
          ref={panelRef}
          class="drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-label={title || "Dialog"}
          tabIndex={-1}
        >
          <header class="drawer-header">
            <div>
              <span class="drawer-eyebrow">Your selections</span>
              <h2>{title || "Dialog"}</h2>
            </div>
            <sp-action-button quiet label="Close cart" onClick={onClose}>
              <sp-icon-close slot="icon" />
            </sp-action-button>
          </header>
          <sp-divider size="s" />
          <div class="drawer-body">{children}</div>
        </aside>
      </div>
    );
  }

  return (
    <sp-dialog-wrapper headline={title || "Dialog"} open underlay dismissable responsive size="l">
      {children}
    </sp-dialog-wrapper>
  );
}
