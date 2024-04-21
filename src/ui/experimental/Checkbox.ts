import { Json, UiNode, element } from "../internal.js";

type CheckboxProps = {
  name?: string;
  label?: string;
  action?: Json;
  checked?: boolean;
  disabled?: boolean;
};

export function Checkbox(props: CheckboxProps): UiNode {
  return element("ui-checkbox", props);
}
