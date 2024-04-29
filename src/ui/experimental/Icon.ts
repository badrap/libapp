import { Responsive, UiNode, element } from "../internal.js";

type IconProps = {
  name: string;
  filled?: boolean;
  size?: Responsive<"xs" | "sm" | "md">;
  color?: "base" | "gray" | "red" | "orange" | "yellow" | "green" | "blue";
};

export function Icon(props: IconProps): UiNode {
  return element("ui-icon", props);
}
