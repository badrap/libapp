import { UiNode, element } from "../internal.js";

type CopyButtonProps = {
  variant?: "default" | "primary" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  value: string;
  children?: UiNode;
};

export function CopyButton(props: CopyButtonProps): UiNode {
  return element("ui-copy-button", props);
}
