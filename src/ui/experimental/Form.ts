import { UiNode, createElement } from "../internal.js";

type FormProps = {
  children?: UiNode;
};

export function Form(props: FormProps): UiNode {
  const { children, ...rest } = props;
  return createElement("ui-form", rest, children);
}
