import { UiNode, element, Breakpoint } from "../internal.js";

type HiddenProps = {
  after?: Breakpoint;
  before?: Breakpoint;
  children?: UiNode;
};

export function Hidden(props: HiddenProps): UiNode {
  return element("ui-hidden", props);
}
