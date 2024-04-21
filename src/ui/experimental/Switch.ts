import { Json, UiNode, createElement } from "../internal.js";

type SwitchProps = {
  name?: string;
  label?: string;
  action?: Json;
  checked?: boolean;
  disabled?: boolean;
};

export function Switch(props: SwitchProps): UiNode {
  return createElement("ui-switch", props);
}
