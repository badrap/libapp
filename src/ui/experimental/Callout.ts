import { UiNode, createElement } from "../internal.js";

type CalloutProps = {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  children?: UiNode;
};

export function Callout(props: CalloutProps): UiNode {
  const { children, ...rest } = props;
  return createElement("ui-alert", rest, children);
}
