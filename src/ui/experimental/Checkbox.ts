import { type Json, type UiNode, element } from "../internal.ts";

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
