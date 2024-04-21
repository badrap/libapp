import { Json, UiNode, element } from "../internal.js";

type UploadButtonProps = {
  name: string;
  size?: "sm" | "md";
  action: Json;
  disabled?: boolean;
  multiple?: boolean;
  children?: UiNode;
};

export function UploadButton(props: UploadButtonProps): UiNode {
  return element("ui-upload-button", props);
}
