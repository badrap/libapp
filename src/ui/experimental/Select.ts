import {
  type Json,
  type Responsive,
  type UiNode,
  element,
} from "../internal.js";

type SelectOption =
  | string
  | {
      value: string;
      label?: string;
      disabled?: boolean;
    };

type SelectProps = {
  size?: Responsive<"sm" | "md">;
  name?: string;
  value?: string;
  options: SelectOption[];
  action?: Json;
  clearable?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
};

export function Select(props: SelectProps): UiNode {
  return element("ui-select", props);
}
