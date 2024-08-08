import { Json, Responsive, UiNode, element } from "../internal.js";

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
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
};

export function Select(props: SelectProps): UiNode {
  return element("ui-select", props);
}
