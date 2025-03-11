import { type UiNode, element } from "../internal.js";

type RedirectProps = {
  to: string;
};

export function Redirect(props: RedirectProps): UiNode {
  return element("ui-redirect", props);
}
