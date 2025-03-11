import { type UiNode, element } from "../internal.js";

type CardProps = {
  /**
   * The content to be displayed inside the card.
   * Can include text or other UI components.
   */
  children?: UiNode;
};

/**
 * A card-like container.
 *
 * Can hold various types of content. Often used to group related
 * information.
 *
 * @example
 * ```tsx
 * <Card>
 *   Hello, World!
 * </Card>
 * ```
 * */
export function Card(props: CardProps): UiNode {
  return element("ui-card", props);
}
