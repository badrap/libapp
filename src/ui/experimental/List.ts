import { type UiNode, element, type Responsive } from "../internal.ts";

type ListProps = {
  header?: string;
  size?: Responsive<"sm" | "md">;
  children?: UiNode;
};

type ListItemProps = {
  children?: UiNode;
};

export function List(props: ListProps): UiNode {
  return element("ui-list", props);
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace List {
  export const Item = function ListItem(props: ListItemProps): UiNode {
    return element("ui-list-item", props);
  };
}
