import {
  type Json,
  type UiNode,
  element,
  type Responsive,
} from "../internal.ts";

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
