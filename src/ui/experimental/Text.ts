import { Responsive, UiNode, element } from "../internal.js";

type TextProps = {
  size?: Responsive<"1" | "2" | "3">;
  align?: Responsive<"left" | "center" | "right">;
  weight?: Responsive<"regular" | "medium" | "bold">;
  color?: "gray" | "orange" | "red" | "green" | "blue";
  truncate?: boolean;
  children?: UiNode;
};

export function Text(props: TextProps): UiNode {
  return element("ui-text", props);
}
