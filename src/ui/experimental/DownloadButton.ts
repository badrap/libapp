import { Json, UiNode, element, Responsive } from "../internal.js";

type DownloadButtonProps = {
  variant?: "default" | "primary" | "danger";
  size?: Responsive<"sm" | "md">;
  iconOnly?: Responsive<boolean>;
  disabled?: boolean;
  filename?: string;
  context?: Json;
  children?: UiNode;
};

export function DownloadButton(props: DownloadButtonProps): UiNode {
  return element("ui-download-button", props);
}
