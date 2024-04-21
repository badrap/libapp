import { Json, UiNode, createElement } from "../internal.js";

type DownloadButtonProps = {
  variant?: "default" | "primary" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  filename?: string;
  context?: Json;
  children?: UiNode;
};

export function DownloadButton(props: DownloadButtonProps): UiNode {
  const { children, ...rest } = props;
  return createElement("ui-download-button", rest, children);
}
