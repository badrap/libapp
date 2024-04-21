import { Json, UiNode, createElement } from "../internal.js";

type UploadButtonProps = {
  name: string;
  size?: "sm" | "md";
  action: Json;
  disabled?: boolean;
  multiple?: boolean;
  children?: UiNode;
};

export function UploadButton(props: UploadButtonProps): UiNode {
  const { children, ...rest } = props;
  return createElement("ui-upload-button", rest, children);
}
