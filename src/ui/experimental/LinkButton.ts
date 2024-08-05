import { UiNode, element, Responsive } from "../internal.js";

type LinkButtonProps = {
  href: string;
  variant?: "default" | "primary" | "danger";
  size?: Responsive<"sm" | "md">;
  iconSide?: "start" | "end";
  disabled?: boolean;
  children?: UiNode;
} & (
  | {
      icon: `material-symbols:${string}`;
      iconOnly?: Responsive<boolean>;
    }
  | {
      icon?: undefined;
      iconOnly?: undefined;
    }
);

export function LinkButton(props: LinkButtonProps): UiNode {
  return element("ui-link-button", props);
}
