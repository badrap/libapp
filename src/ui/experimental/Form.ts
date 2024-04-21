import { UiNode, element } from "../internal.js";

type FormProps = {
  children?: UiNode;
};

export function Form(props: FormProps): UiNode {
  return element("ui-form", props);
}
