import { type UiNode, element } from "../internal.ts";

type TextFieldProps = {
  name: string;
  type?: "text" | "email" | "number" | "password" | "multiline";
  size?: "sm" | "md";
  readOnly?: boolean;
  disabled?: boolean;
  value?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
};

export function TextField(props: TextFieldProps): UiNode {
  return element("ui-text-field", props);
}
