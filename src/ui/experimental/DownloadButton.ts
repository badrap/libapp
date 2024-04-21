import { Json, UiNode, element } from "../internal.js";

type DownloadButtonProps = {
  variant?: "default" | "primary" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
  filename?: string;
  context?: Json;
  children?: UiNode;
};

export function DownloadButton(props: DownloadButtonProps): UiNode {
  return element("ui-download-button", props);
}
