import type { HtmlNode } from "@/types/HtmlNode";
import type { RemovedMeta } from "./removeNodeByKey";

const cleanupStylesAfterRemove = (
  meta: RemovedMeta,
  nextHtml: HtmlNode[],
  isDragging = false,
): HtmlNode[] => {
  if (isDragging) return nextHtml;
  const { removed, removedClass, marks } = meta;
  if (!removed) return nextHtml;

  const cls = removedClass ?? "";
  let res = nextHtml;

  const hasNodesWithMark = (mark: string): boolean => {
    const arr = Array.isArray(res) ? res : [res];

    const visit = (node: HtmlNode): boolean => {
      if (
        node.tag !== "style" &&
        typeof node.class === "string" &&
        node.class.includes(mark)
      ) {
        return true;
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          if (typeof child === "string") continue;
          if (visit(child)) return true;
        }
      }

      return false;
    };

    for (const n of arr) {
      if (visit(n)) return true;
    }
    return false;
  };

  const filterStylesDeep = (
    nodes: HtmlNode[],
    cssMark: string,
  ): HtmlNode[] => {
    const visit = (node: HtmlNode): HtmlNode | null => {
      if (
        node.tag === "style" &&
        typeof node.text === "string" &&
        node.text.includes(cssMark)
      ) {
        return null;
      }

      if (Array.isArray(node.children)) {
        const newChildren: (HtmlNode | string)[] = [];
        for (const ch of node.children) {
          if (typeof ch === "string") {
            newChildren.push(ch);
          } else {
            const v = visit(ch);
            if (v) newChildren.push(v);
          }
        }
        return { ...node, children: newChildren as HtmlNode["children"] };
      }

      return node;
    };

    const result: HtmlNode[] = [];
    for (const n of nodes) {
      const v = visit(n);
      if (v) result.push(v);
    }
    return result;
  };

  const maybeRemoveStyle = (cssMark: string, classMark: string) => {
    const stillHasNodes = hasNodesWithMark(classMark);
    if (!stillHasNodes) {
      res = filterStylesDeep(res, cssMark);
    }
  };

  if (marks.hasCheck)    maybeRemoveStyle("input-check", "check");
  if (marks.hasRadio)    maybeRemoveStyle("field-radio", "radio");
  if (marks.hasNumber)   maybeRemoveStyle("f-number",    "number");
  if (marks.hasSvg)      maybeRemoveStyle("input-svg",   "svg");
  if (marks.hasTextarea) maybeRemoveStyle("field-t",     "field-t");
  if (marks.hasInputF)   maybeRemoveStyle("input-f",     "input-f");

  if (
    !marks.hasCheck &&
    !marks.hasRadio &&
    !marks.hasNumber &&
    !marks.hasSvg &&
    !marks.hasTextarea &&
    !marks.hasInputF &&
    cls
  ) {
    const stillHasSameClass = hasNodesWithMark(cls);
    if (!stillHasSameClass) {
      res = filterStylesDeep(res, cls);
    }
  }

  return res;
};

export default cleanupStylesAfterRemove;