import { Responsive, UiNode, element } from "../internal.js";

type IconProps = {
  icon: string;
  style?: "outline" | "filled";
  size?: Responsive<"xs" | "sm" | "md">;
  color?: "base" | "gray" | "red" | "orange" | "yellow" | "green" | "blue";
};

export function MaterialIcon(props: IconProps): UiNode {
  return element("ui-material-icon", props);
}
