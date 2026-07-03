import type { JSX } from "preact";

type SpectrumElementProps = JSX.HTMLAttributes<HTMLElement> & {
  color?: "light" | "dark" | "darkest";
  scale?: "medium" | "large";
  variant?: string;
  treatment?: "fill" | "outline";
  size?: string;
  heading?: string;
  subheading?: string;
  headline?: string;
  href?: string;
  label?: string;
  slot?: string;
  open?: boolean;
  underlay?: boolean;
  dismissable?: boolean;
  responsive?: boolean;
  horizontal?: boolean;
  indeterminate?: boolean;
  quiet?: boolean;
  disabled?: boolean;
};

declare module "preact" {
  namespace JSX {
    interface IntrinsicElements {
      "sp-theme": SpectrumElementProps;
      "sp-button": SpectrumElementProps;
      "sp-action-button": SpectrumElementProps;
      "sp-card": SpectrumElementProps;
      "sp-dialog-wrapper": SpectrumElementProps;
      "sp-progress-circle": SpectrumElementProps;
      "sp-divider": SpectrumElementProps;
      "sp-icon-shopping-cart": SpectrumElementProps;
      "sp-icon-close": SpectrumElementProps;
      "sp-icon-home": SpectrumElementProps;
      "sp-icon-info-outline": SpectrumElementProps;
      "sp-icon-pause": SpectrumElementProps;
      "sp-icon-play": SpectrumElementProps;
    }
  }
}
