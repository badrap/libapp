import { Responsive, UiNode, element } from "../internal.js";

type TextProps = {
  /**
   * Size of the text. Can be responsive.
   * Inherited from surrounding context if not explicitly set.
   */
  size?: Responsive<"xs" | "sm" | "md" | "lg">;
  /**
   * Horizontal text alignment. Can be responsive.
   * Inherited from surrounding context if not explicitly set.
   */
  align?: Responsive<"left" | "center" | "right">;
  /**
   * Font weight of the text. Can be responsive.
   * Inherited from surrounding context if not explicitly set.
   */
  weight?: Responsive<"regular" | "medium" | "semibold">;
  /**
   * Accent color of the text.
   * Inherited from surrounding context if not explicitly set.
   */
  color?: "base" | "gray" | "red" | "orange" | "yellow" | "green" | "blue";
  /**
   * If true, the text will be truncated with an ellipsis if it exceeds
   * the width of its container.
   * Default value: false.
   */
  truncate?: boolean;
  /**
   * The content to be displayed. Can be a string or more complex UI elements.
   */
  children?: UiNode;
};

/**
 * A component for rendering text with various styling options.
 * Provides control over e.g. size, alignment, weight, color, and truncation
 * of text.
 *
 * @example
 * ```tsx
 * <Text size="lg" weight="semibold" color="blue">
 *   This is a large, semibold, blue text.
 * </Text>
 * ```
 *
 * When not explicitly set, most properties inherit their values from the
 * surrounding context.
 *
 * @example
 * ```tsx
 * <Text color="semibold">
 *   <Text weight="red">
 *     This is a semibold, red text.
 *   </Text>
 * <Text>
 * ```
 * */
export function Text(props: TextProps): UiNode {
  return element("ui-text", props);
}
