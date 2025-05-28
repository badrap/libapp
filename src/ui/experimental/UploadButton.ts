import {
  type Json,
  type UiNode,
  element,
  type Responsive,
} from "../internal.ts";

type UploadButtonProps = {
  name: string;
  size?: Responsive<"sm" | "md">;
  iconOnly?: Responsive<boolean>;
  action: Json;
  disabled?: boolean;
  multiple?: boolean;
  children?: UiNode;
};

export function UploadButton(props: UploadButtonProps): UiNode {
  return element("ui-upload-button", props);
}
