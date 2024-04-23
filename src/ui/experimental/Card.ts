import { UiNode, element } from "../internal.js";

type CardProps = {
  children?: UiNode;
};

export function Card(props: CardProps): UiNode {
  return element("ui-card", props);
}
