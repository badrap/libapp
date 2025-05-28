import { type UiNode, element } from "../internal.ts";

type FormProps = {
  children?: UiNode;
};

export function Form(props: FormProps): UiNode {
  return element("ui-form", props);
}
