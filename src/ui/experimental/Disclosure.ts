import { type UiNode, element, type Responsive } from "../internal.js";

interface DisclosureProps {
  /**
   * Controls component size, including the text size of the label and content.
   * Default value: "md".
   * */
  size?: Responsive<"xs" | "sm" | "md" | "lg">;
  /**
   * The disclosure label. Gives a summary, caption, or legend for the details.
   * Usually just text, but can contain arbitrary formatting content.
   * */
  label: UiNode;
  /**
   * The content to be displayed as details when the disclosure component
   * has been expanded.
   * */
  children: UiNode;
}

/**
 * A component with a summary label and additional detailed content.
 * The details can be collapsed (hidden) or expanded (shown again)
 * by interacting with the label.
 *
 * @example
 * ```tsx
 * <Disclosure label="Show lorem ipsum">
 *   Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
 *   eiusmod tempor incididunt ut labore et dolore magna aliqua.
 * </Disclosure>
 * ```
 * */
export function Disclosure(props: DisclosureProps): UiNode {
  const { children, ...rest } = props;
  return element("ui-disclosure", { content: children, ...rest });
}
