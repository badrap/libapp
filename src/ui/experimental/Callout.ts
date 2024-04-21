import { UiNode, element } from "../internal.js";

type CalloutProps = {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  children?: UiNode;
};

export function Callout(props: CalloutProps): UiNode {
  return element("ui-alert", props);
}
