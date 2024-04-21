import { Json, UiNode, createElement } from "../internal.js";

type HiddenInputProps = {
  name: string;
  value?: Json;
  valid: boolean;
};

export function HiddenInput(props: HiddenInputProps): UiNode {
  return createElement("ui-hidden-input", props);
}
