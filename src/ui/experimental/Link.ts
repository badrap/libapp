import { UiNode, createElement } from "../internal.js";

type LinkProps = {
  href: string;
  children?: UiNode;
};

export function Link(props: LinkProps): UiNode {
  const { children, ...rest } = props;
  return createElement("ui-link", rest, children);
}
