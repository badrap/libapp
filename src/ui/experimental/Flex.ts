import {
  type Responsive,
  type Space,
  type UiNode,
  element,
} from "../internal.ts";

type FlexProps = {
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

  display?: Responsive<"none" | "flex" | "inline-flex">;
  gap?: Responsive<Space>;
  gapX?: Responsive<Space>;
  gapY?: Responsive<Space>;
  direction?: Responsive<"row" | "column" | "row-reverse" | "column-reverse">;
  align?: Responsive<"start" | "end" | "center" | "baseline" | "stretch">;
  justify?: Responsive<"start" | "end" | "center" | "space-between">;
  wrap?: Responsive<"wrap" | "nowrap" | "wrap-reverse">;
  children?: UiNode;
};

export function Flex(props: FlexProps): UiNode {
  return element("ui-flex", props);
}
