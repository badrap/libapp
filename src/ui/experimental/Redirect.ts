import { UiNode, createElement } from "../internal.js";

type RedirectProps = {
  to: string;
};

export function Redirect(props: RedirectProps): UiNode {
  return createElement("ui-redirect", props);
}
