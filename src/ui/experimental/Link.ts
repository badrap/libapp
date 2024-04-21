import { UiNode, element } from "../internal.js";

type LinkProps = {
  href: string;
  children?: UiNode;
};

export function Link(props: LinkProps): UiNode {
  return element("ui-link", props);
}
