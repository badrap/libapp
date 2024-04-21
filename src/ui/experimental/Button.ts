import { Json, UiNode, createElement } from "../internal.js";

type ButtonProps = {
  variant?: "default" | "primary" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  action?: Json;
  submit?: boolean;
  children?: UiNode;
};

export function Button(props: ButtonProps): UiNode {
  const { children, ...rest } = props;
  return createElement("ui-button", rest, children);
}
