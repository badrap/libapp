export type Json =
  | number
  | string
  | boolean
  | null
  | Json[]
  | { [K: string]: Json | undefined };

export type UiNode =
  | null
  | undefined
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
export type FunctionalComponent<P extends Record<string, unknown> = {}> = (
  props: P,
) => UiNode;

export function Fragment(props: { children: UiNode }): UiNode {
  return props.children;
}

export function createElement(
  type: string | FunctionalComponent,
  props: Record<string, unknown>,
  ...children: UiNode[]
): UiNode {
  if (typeof type === "string") {
    let jsonProps: Record<string, unknown> | undefined;
    for (const [key, value] of Object.entries(props)) {
      if (value === undefined) {
        continue;
      }
      if (!jsonProps) {
        jsonProps = { [key]: value };
      } else {
        jsonProps[key] = value;
      }
    }

    return {
      type,
      props: jsonProps,
      children: Array.isArray(children)
        ? children
        : children === undefined || children === null
          ? undefined
          : [children],
    };
  }
  return type({ ...props, children });
}

export type Responsive<T> = T | { base?: T; xs?: T; sm?: T; md?: T; lg?: T };

export type Space = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
