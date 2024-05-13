import { Json, UiNode, element, Responsive } from "../internal.js";

type ButtonProps = {
  variant?: "default" | "primary" | "danger";
  size?: Responsive<"sm" | "md">;
  iconSide?: "start" | "end";
  disabled?: boolean;
  action?: Json;
  submit?: boolean;
  children?: UiNode;
} & (
  | {
      icon: `mdi:${string}`;
      iconOnly?: Responsive<boolean>;
    }
  | {
      icon?: undefined;
      iconOnly?: undefined;
    }
);

export function Button(props: ButtonProps): UiNode {
  return element("ui-button", props);
}
