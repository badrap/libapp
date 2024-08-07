import { Json, UiNode, element } from "../internal.js";

type HiddenInputProps = {
  name: string;
  value?: Json;
  invalid?: boolean;
};

export function HiddenInput(props: HiddenInputProps): UiNode {
  return element("ui-hidden-input", props);
}
