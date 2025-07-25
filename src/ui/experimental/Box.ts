import {
  type Responsive,
  type Space,
  type UiNode,
  element,
} from "../internal.ts";

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
  flexGrow?: Responsive<"0" | "1">;
  flexShrink?: Responsive<"0" | "1">;
  display?: Responsive<"none" | "block" | "inline-block">;
  children?: UiNode;
};

export function Box(props: BoxProps): UiNode {
  return element("ui-box", props);
}
