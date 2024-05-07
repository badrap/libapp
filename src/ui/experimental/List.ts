import { UiNode, element, Responsive } from "../internal.js";

type ListProps = {
  header?: string;
  size?: Responsive<"sm" | "md">;
  children?: UiNode;
};

export function List(props: ListProps): UiNode {
  return element("ui-list", props);
}

type ListItemProps = {
  children?: UiNode;
};

List.Item = function ListItem(props: ListItemProps): UiNode {
  return element("ui-list-item", props);
};
