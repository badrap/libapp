import { Responsive, UiNode, createElement } from "../internal.js";

type TextProps = {
  size?: Responsive<"1" | "2" | "3">;
  align?: Responsive<"left" | "center" | "right">;
  weight?: Responsive<"regular" | "medium" | "bold">;
  color?: "gray" | "orange";
  truncate?: boolean;
  children?: UiNode;
};

export function Text(props: TextProps): UiNode {
  const { children, ...rest } = props;
  return createElement("ui-text", rest, children);
}
