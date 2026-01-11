type OverlayMode = "before" | "after" | "inside";

export type OverlayState = {
  visible: boolean;
  mode: OverlayMode;
  top: number;
  left: number;
  width: number;
  parentKey: string | "__ROOT__";
  siblingKey: string | null; // для inside можно хранить сам node._key
};

export type HtmlNode = {
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>;
  _key?: string;
  children: HtmlNode[] | string;
};

type Tree = HtmlNode | HtmlNode[];
