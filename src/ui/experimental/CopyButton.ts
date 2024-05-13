import { UiNode, element, Responsive } from "../internal.js";

type CopyButtonProps = {
  variant?: "default" | "primary" | "danger";
  size?: Responsive<"sm" | "md">;
  disabled?: boolean;
  value: string;
  children?: UiNode;
};

export function CopyButton(props: CopyButtonProps): UiNode {
  return element("ui-copy-button", props);
}
