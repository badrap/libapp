import { Json, UiNode, element } from "../internal.js";

type ButtonProps = {
  variant?: "default" | "primary" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  action?: Json;
  submit?: boolean;
  children?: UiNode;
};

export function Button(props: ButtonProps): UiNode {
  return element("ui-button", props);
}
