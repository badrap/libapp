import { UiNode, createElement } from "../internal.js";

type CopyButtonProps = {
  variant?: "default" | "primary" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  value: string;
  children?: UiNode;
};

export function CopyButton(props: CopyButtonProps): UiNode {
  const { children, ...rest } = props;
  return createElement("ui-copy-button", rest, children);
}
