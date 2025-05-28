import { type Json, type UiNode, element } from "../internal.ts";

type HiddenInputProps = {
  name: string;
  value?: Json;
  invalid?: boolean;
};

export function HiddenInput(props: HiddenInputProps): UiNode {
  return element("ui-hidden-input", props);
}
