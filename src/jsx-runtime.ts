import {
  Json,
  UiNode,
  FunctionalComponent,
  Fragment,
  element,
} from "./ui/internal.js";

export { UiNode, FunctionalComponent, Fragment };

type ClassList = string | Record<string, boolean> | ClassList[];

type JSXFunc = <T extends FunctionalComponent | keyof JSX.IntrinsicElements>(
  type: T,
  props: Record<string, unknown>,
) => UiNode;

export const jsx: JSXFunc = (type, props) => element(type, props);

export const jsxs: JSXFunc = jsx;

export declare namespace JSX {
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
