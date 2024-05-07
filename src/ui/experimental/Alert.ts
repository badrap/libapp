import { UiNode, element } from "../internal.js";

type AlertProps = {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  children?: UiNode;
};

export function Alert(props: AlertProps): UiNode {
  return element("ui-alert", props);
}
