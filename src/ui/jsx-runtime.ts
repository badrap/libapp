/* eslint-disable @typescript-eslint/no-namespace */
type Json = number | string | boolean | null | Json[] | { [K: string]: Json };
type ClassList = string | Record<string, boolean> | ClassList[];

namespace ui {
  export type UiNode =
    | null
    | boolean
    | string
    | UiNode[]
    | {
        type: string;
        props?: Record<string, unknown>;
        children?: UiNode;
      };

  // eslint-disable-next-line @typescript-eslint/ban-types
  type FC<P extends Record<string, unknown> = {}> = (props: P) => UiNode;

  export function jsx<T extends FC | keyof JSX.IntrinsicElements>(
    type: T,
    props: Record<string, unknown>
  ): UiNode {
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
    return (type as FC)(props);
  }
  export const jsxs = jsx;

  export function Fragment(props: { children: UiNode }): UiNode {
    return props.children;
  }

  export namespace JSX {
    export interface ElementAttributesProperty {
      props: unknown;
    }
    export interface ElementChildrenAttribute {
      children: unknown;
    }
    export type Element = UiNode;

    export interface IntrinsicElements {
      ["ui-box"]: {
        class?: ClassList;
        children?: UiNode;
      };
      ["ui-form"]: {
        children?: UiNode;
      };
      ["ui-button"]: {
        variant?: "default" | "primary" | "danger";
        disabled?: boolean;
        action?: Json;
        submit?: boolean;
        children?: UiNode;
      };
      ["ui-upload-button"]: {
        name: string;
        action: Json;
        disabled?: boolean;
        multiple?: boolean;
        children?: UiNode;
      };
      ["ui-copy-button"]: {
        variant?: "default" | "primary" | "danger";
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
}

export = ui;
