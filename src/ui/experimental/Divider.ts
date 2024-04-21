import { Responsive, UiNode, createElement } from "../internal.js";

type DividerProps = {
  orientation?: Responsive<"horizontal" | "vertical">;
};

export function Divider(props: DividerProps): UiNode {
  return createElement("ui-divider", props);
}
