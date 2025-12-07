import { type UiNode, element, type Responsive } from "../internal.ts";

type ListProps = {
  header?: string;
  size?: Responsive<"sm" | "md">;
  children?: UiNode;
};

type ListItemProps = {
  children?: UiNode;
};

export interface List {
  (props: ListProps): UiNode;
  Item: (props: ListItemProps) => UiNode;
}

export const List: List = function List(props: ListProps): UiNode {
  return element("ui-list", props);
};

List.Item = function ListItem(props: ListItemProps): UiNode {
  return element("ui-list-item", props);
};
