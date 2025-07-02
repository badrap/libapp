import {
  type Json,
  type UiNode,
  element,
  type Responsive,
} from "../internal.ts";

type ButtonProps = {
  name?: string;
  value?: Json;
  action?: Json;
  variant?: "default" | "primary" | "danger";
  size?: Responsive<"sm" | "md">;
  iconSide?: "start" | "end";
  disabled?: boolean;
  submit?: boolean;
  children?: UiNode;
} & (
  | {
      icon: `material-symbols:${string}`;
      iconOnly?: Responsive<boolean>;
    }
  | {
      icon?: undefined;
      iconOnly?: undefined;
    }
);

export function Button(props: ButtonProps): UiNode {
  return element("ui-button", props);
}
