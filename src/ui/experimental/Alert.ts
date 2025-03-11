import { type UiNode, element } from "../internal.js";

type AlertProps = {
  /**
   * The type of alert. Affects e.g. its visual styling.
   * Default value: "info".
   */
  type?: "info" | "success" | "warning" | "error";
  /**
   * A title or heading for the alert.
   * Optional, but recommended for providing a concise summary of the alert's content.
   */
  title?: string;
  /**
   * The main content of the alert. This can be text or more complex UI elements.
   */
  children?: UiNode;
};

/**
 * A component for displaying an alert message to the user.
 *
 * Alerts can be used to communicate errors and warnings, but also
 * general feedback like acknowledgements for successful actions
 * or neutral informational messages.
 *
 * @example
 * ```tsx
 * <Alert type="error" title="Something went wrong">
 *   An error occurred while processing your request.
 * </Alert>
 * ```
 * */
export function Alert(props: AlertProps): UiNode {
  return element("ui-alert", props);
}
