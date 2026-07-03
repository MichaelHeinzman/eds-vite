import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/theme/theme-light.js";
import "@spectrum-web-components/theme/scale-medium.js";
import "@spectrum-web-components/button/sp-button.js";
import "@spectrum-web-components/action-button/sp-action-button.js";
import "@spectrum-web-components/card/sp-card.js";
import "@spectrum-web-components/dialog/sp-dialog-wrapper.js";
import "@spectrum-web-components/progress-circle/sp-progress-circle.js";
import "@spectrum-web-components/divider/sp-divider.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-shopping-cart.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-close.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-home.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-info-outline.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-pause.js";
import "@spectrum-web-components/icons-workflow/icons/sp-icon-play.js";

export function applySpectrumTheme() {
  if (document.querySelector("body > sp-theme")) return;

  const theme = document.createElement("sp-theme");
  theme.setAttribute("color", "light");
  theme.setAttribute("scale", "medium");
  theme.className = "app-theme";
  theme.append(...document.body.children);
  document.body.append(theme);
}
