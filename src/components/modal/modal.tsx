import type { ComponentChildren } from "preact";
import { createPortal } from "preact/compat";
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

  const portalTarget = document.querySelector("body > sp-theme") || document.body;

  if (position === "right") {
    return createPortal(
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
      </div>,
      portalTarget,
    );
  }

  return createPortal(
    <div class="modal-shell" role="presentation">
      <button class="modal-underlay" type="button" aria-label="Close dialog" onClick={onClose} />
      <section ref={panelRef} class="modal-panel" role="dialog" aria-modal="true" aria-label={title || "Dialog"} tabIndex={-1}>
        <header class="modal-panel-header"><div><span class="drawer-eyebrow">Storefront settings</span><h2>{title || "Dialog"}</h2></div><sp-action-button quiet label="Close dialog" onClick={onClose}><sp-icon-close slot="icon" /></sp-action-button></header>
        <sp-divider size="s" />
        <div class="modal-panel-body">{children}</div>
      </section>
    </div>,
    portalTarget,
  );
}
