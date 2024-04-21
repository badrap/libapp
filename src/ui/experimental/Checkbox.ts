import { Json, UiNode, createElement } from "../internal.js";

type CheckboxProps = {
  name?: string;
  label?: string;
  action?: Json;
  checked?: boolean;
  disabled?: boolean;
};

export function Checkbox(props: CheckboxProps): UiNode {
  return createElement("ui-checkbox", props);
}
