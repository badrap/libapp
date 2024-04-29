import { Responsive, UiNode, element } from "../internal.js";

type TextProps = {
  size?: Responsive<"xs" | "sm" | "md">;
  align?: Responsive<"left" | "center" | "right">;
  weight?: Responsive<"regular" | "medium" | "semibold">;
  color?: "base" | "gray" | "red" | "orange" | "yellow" | "green" | "blue";
  truncate?: boolean;
  children?: UiNode;
};

export function Text(props: TextProps): UiNode {
  return element("ui-text", props);
}
