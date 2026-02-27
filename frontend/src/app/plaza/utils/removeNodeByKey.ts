import type { HtmlNode } from "@/types/HtmlNode";

type Tree = HtmlNode[];

export type RemovedMeta = {
  removed: HtmlNode | null;
  removedClass: string | null;
  marks: {
    hasCheck: boolean;
    hasRadio: boolean;
    hasNumber: boolean;
    hasSvg: boolean;
    hasTextarea: boolean;
    hasInputF: boolean;
  };
};

function removeNodeByKey(
  tree: Tree,
  key: string,
): { tree: Tree; meta: RemovedMeta } {
  const removeFromArray = (
    arr: HtmlNode[],
  ): { arr: HtmlNode[]; meta: RemovedMeta } => {
    let removed: HtmlNode | null = null;

    const newArr = arr.flatMap((node) => {
      if (node._key === key) {
        removed = node;
        return [];
      }

      if (Array.isArray(node.children) && node.children.length > 0) {
        const { arr: newChildren, meta: childMeta } = removeFromArray(
          node.children,
        );
        if (childMeta.removed && !removed) {
          removed = childMeta.removed;
        }
        return [{ ...node, children: newChildren }];
      }

      return [node];
    });

    const cls = removed?.class ?? null;
    const classStr = cls ?? "";

    return {
      arr: newArr,
      meta: {
        removed,
        removedClass: cls,
        marks: {
          hasCheck: classStr.includes("check"),
          hasRadio: classStr.includes("radio"),
          hasNumber: classStr.includes("number"),
          hasSvg: classStr.includes("svg"),
          hasTextarea: classStr.includes("field-t"),
          hasInputF: classStr.includes("input-f"),
        },
      },
    };
  };

  const baseArray = Array.isArray(tree) ? tree : [tree];
  const { arr, meta } = removeFromArray(baseArray);
  return { tree: arr, meta };
}

export default removeNodeByKey;
