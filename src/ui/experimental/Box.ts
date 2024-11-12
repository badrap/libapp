import { Responsive, Space, UiNode, element } from "../internal.js";

type BoxProps = {
  width?: Responsive<string>;
  minWidth?: Responsive<string>;
  maxWidth?: Responsive<string>;
  height?: Responsive<string>;
  minHeight?: Responsive<string>;
  maxHeight?: Responsive<string>;
  p?: Responsive<Space>;
  px?: Responsive<Space>;
  py?: Responsive<Space>;
  pt?: Responsive<Space>;
  pb?: Responsive<Space>;
  pl?: Responsive<Space>;
  pr?: Responsive<Space>;
  flexBasis?: Responsive<string>;
  flexGrow?: Responsive<string>;
  flexShrink?: Responsive<string>;
  lineClamp?: number | string;
  display?: Responsive<"none" | "block" | "inline-block">;
  children?: UiNode;
};

export function Box(props: BoxProps): UiNode {
  return element("ui-box", props);
}
