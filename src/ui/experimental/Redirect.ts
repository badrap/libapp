import { type UiNode, element } from "../internal.ts";

type RedirectProps = {
  to: string;
};

export function Redirect(props: RedirectProps): UiNode {
  return element("ui-redirect", props);
}
