import { Responsive, UiNode, element } from "../internal.js";

type DividerProps = {
  orientation?: Responsive<"horizontal" | "vertical">;
};

export function Divider(props: DividerProps): UiNode {
  return element("ui-divider", props);
}
