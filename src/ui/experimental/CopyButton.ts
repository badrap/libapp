import { type UiNode, element, type Responsive } from "../internal.js";

type CopyButtonProps = {
  variant?: "default" | "primary" | "danger";
  size?: Responsive<"sm" | "md">;
  iconOnly?: Responsive<boolean>;
  disabled?: boolean;
  value: string;
  children?: UiNode;
};

export function CopyButton(props: CopyButtonProps): UiNode {
  return element("ui-copy-button", props);
}
