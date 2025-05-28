import { type UiNode, element } from "../internal.ts";

type TagProps = {
  /**
   * The overall tone of the tag. Mainly affects the color.
   * Default value: "neutral".
   */
  tone?: "neutral" | "info" | "success" | "caution" | "critical";
  /**
   * An optional icon displayed before the content value.
   */
  icon?: `material-symbols:${string}`;
  /**
   * An optional label displayed before the icon and content.
   *
   * Gives the context for the content value. Avoid providing
   * this when the label is obvious from the surrounding context.
   */
  label?: string;
  /**
   * An optional description shown in a tooltip on hover.
   *
   * Gives a short explanation what the value means. Avoid providing
   * this if the meaning is obvious from the surrounding context (or label).
   */
  description?: string;
  /**
   * The main content - the "value" - of the tag.
   */
  children?: UiNode;
};

/**
 * A tag component that describes e.g. the value of a variable.
 *
 * A label and description can be provided to give more context
 * (for example the name and meaning of the variable, respectively).
 *
 * @example
 * ```tsx
 * <Tag
 *  tone="success"
 *  icon="material-symbols:check"
 *  label="Status"
 *  description="The doodad has been installed and is humming along."
 * >
 *   Installed
 * </Alert>
 * ```
 *
 */
export function Tag(props: TagProps): UiNode {
  return element("ui-tag", props);
}
