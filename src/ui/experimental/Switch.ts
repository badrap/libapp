import { type Json, type UiNode, element } from "../internal.js";

type SwitchProps = {
  /**
   * An optional name for the switch input element.
   *
   * Used as the name for the switch value when client state is submitted
   * to the UI endpoint. The value is send as a boolean (on as `true`,
   * off as `false`).
   *
   * When not defined, the switch value is not sent as a part of client state.
   */
  name?: string;
  /**
   * The text label associated with the switch.
   */
  label?: string;
  /**
   * The text description associated with the switch.
   */
  description?: string;
  /**
   * If defined (i.e. not `undefined`), toggling the switch submits the `action`
   * value with client input state to the UI endpoint.
   */
  action?: Json;
  /**
   * Determines whether the switch is in the on (true) or off (false) state.
   * Default value: false.
   */
  checked?: boolean;
  /**
   * If true, the switch will be uninteractable and visually indicate
   * its disabled state.
   * Default value: false.
   */
  disabled?: boolean;
};

/**
 * A component that renders a toggle switch control.
 * Switches are used for binary choices, typically to turn a specific
 * feature or option on or off.
 *
 * @example
 * ```tsx
 * <Switch
 *   name="notifications"
 *   label="Enable notifications"
 *   checked={true}
 * />
 * ```
 *
 * @example
 * When the `action` property is defined, its value is immediately
 * submitted to the UI endpoint when the switch is toggled. The surrounding
 * client input data is sent along with the action.
 *
 * ```tsx
 * <Switch
 *   label="Enable notifications"
 *   checked={true}
 *   action={{ notifications: true }}
 * />
 * ```
 * */
export function Switch(props: SwitchProps): UiNode {
  return element("ui-switch", props);
}
