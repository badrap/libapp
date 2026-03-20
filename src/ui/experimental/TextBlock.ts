import { type Responsive, type UiNode, element } from "../internal.ts";

type TextBlockProps = {
  /**
   * Horizontal text alignment. Can be responsive.
   * Inherited from surrounding context if not explicitly set.
   */
  align?: Responsive<"left" | "center" | "right">;
  /**
   * Maximum number of lines to display before truncating. Can be responsive.
   */
  maxLines?: Responsive<number>;
  /**
   * When true, reduces the text emphasis by applying a lower-intensity color variant.
   */
  muted?: boolean;
  /**
   * The content to be displayed. Can be a string or more complex UI elements.
   */
  children?: UiNode;
};

/**
 * A component for rendering block-level text content.
 * Color is inherited from the surrounding context.
 */
export function TextBlock(props: TextBlockProps): UiNode {
  return element("ui-text-block", props);
}
