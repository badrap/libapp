import { Json, UiNode, element } from "../internal.js";

type SwitchProps = {
  name?: string;
  label?: string;
  action?: Json;
  checked?: boolean;
  disabled?: boolean;
};

export function Switch(props: SwitchProps): UiNode {
  return element("ui-switch", props);
}
