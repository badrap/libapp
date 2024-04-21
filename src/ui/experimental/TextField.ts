import { UiNode, createElement } from "../internal.js";

type TextFieldProps = {
  name: string;
  type?: "text" | "email" | "number" | "password" | "multiline";
  disabled?: boolean;
  value?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
};

export function TextField(props: TextFieldProps): UiNode {
  return createElement("ui-text-field", props);
}
