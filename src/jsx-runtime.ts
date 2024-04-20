type Json =
  | number
  | string
  | boolean
  | null
  | Json[]
  | { [K: string]: Json | undefined };

type ClassList = string | Record<string, boolean> | ClassList[];

export type UiNode =
  | null
  | boolean
  | string
  | number
  | UiNode[]
  | {
      type: string;
      props?: Record<string, unknown>;
      children?: UiNode;
    };

// eslint-disable-next-line @typescript-eslint/ban-types
type FunctionalComponent<P extends Record<string, unknown> = {}> = (
  props: P,
) => UiNode;

export function jsx<
  T extends FunctionalComponent | keyof JSX.IntrinsicElements,
>(type: T, props: Record<string, unknown>): UiNode {
  if (typeof type === "string") {
    const { children, ...rest } = props;
    return {
      type: type as string,
      props: Object.keys(rest).length === 0 ? undefined : rest,
      children: Array.isArray(children)
        ? children
        : children == null
          ? undefined
          : [children],
    };
  }
  return (type as FunctionalComponent)(props);
}

export const jsxs = jsx;

export function Fragment(props: { children: UiNode }): UiNode {
  return props.children;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
  export interface ElementAttributesProperty {
    props: unknown;
  }
  export interface ElementChildrenAttribute {
    children: unknown;
  }
  export type Element = UiNode;

  type Responsive<T> = T | { base?: T; xs?: T; sm?: T; md?: T; lg?: T };
  type Space = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

  export interface IntrinsicElements {
    ["ui-text"]: {
      size?: Responsive<"1" | "2" | "3">;
      align?: Responsive<"left" | "center" | "right">;
      weight?: Responsive<"regular" | "medium" | "bold">;
      color?: "gray" | "orange";
      truncate?: boolean;
      children?: UiNode;
    };
    ["ui-box"]: {
      class?: ClassList;

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

      display?: Responsive<"none" | "inline" | "block" | "inline-block">;

      children?: UiNode;
    };
    ["ui-flex"]: {
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

      display?: Responsive<"none" | "flex" | "inline-flex">;
      gap?: Responsive<Space>;
      gapX?: Responsive<Space>;
      gapY?: Responsive<Space>;
      direction?: Responsive<
        "row" | "column" | "row-reverse" | "column-reverse"
      >;
      align?: Responsive<"start" | "end" | "center" | "baseline" | "stretch">;
      justify?: Responsive<"start" | "end" | "center" | "space-between">;
      wrap?: Responsive<"wrap" | "nowrap" | "wrap-reverse">;
      children?: UiNode;
    };
    ["ui-form"]: {
      children?: UiNode;
    };
    ["ui-button"]: {
      variant?: "default" | "primary" | "danger";
      size?: "sm" | "md";
      disabled?: boolean;
      action?: Json;
      submit?: boolean;
      children?: UiNode;
    };
    ["ui-upload-button"]: {
      name: string;
      size?: "sm" | "md";
      action: Json;
      disabled?: boolean;
      multiple?: boolean;
      children?: UiNode;
    };
    ["ui-download-button"]: {
      variant?: "default" | "primary" | "danger";
      size?: "sm" | "md";
      disabled?: boolean;
      filename?: string;
      context?: Json;
      children?: UiNode;
    };
    ["ui-copy-button"]: {
      variant?: "default" | "primary" | "danger";
      size?: "sm" | "md";
      disabled?: boolean;
      value: string;
      children?: UiNode;
    };
    ["ui-text-field"]: {
      name: string;
      type?: "text" | "email" | "number" | "password" | "multiline";
      disabled?: boolean;
      value?: string;
      label?: string;
      required?: boolean;
      placeholder?: string;
    };
    ["ui-hidden-input"]: {
      name: string;
      value?: Json;
      valid: boolean;
    };
    ["ui-checkbox"]: {
      name?: string;
      label?: string;
      action?: Json;
      checked?: boolean;
      disabled?: boolean;
    };
    ["ui-switch"]: {
      name?: string;
      label?: string;
      action?: Json;
      checked?: boolean;
      disabled?: boolean;
    };
    ["ui-link"]: {
      href: string;
      children?: UiNode;
    };
    ["ui-redirect"]: {
      to: string;
    };
    ["ui-alert"]: {
      type?: "info" | "success" | "warning" | "error";
      title?: string;
      children?: UiNode;
    };
  }
}
