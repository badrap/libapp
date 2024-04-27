import { UiNode, element } from "../internal.js";

type ListProps = {
  size?: "sm" | "md";
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

type ListSectionProps = {
  title: string;
  children?: UiNode;
};

List.Section = function ListSection(props: ListSectionProps): UiNode {
  return element("ui-list-section", props);
};
