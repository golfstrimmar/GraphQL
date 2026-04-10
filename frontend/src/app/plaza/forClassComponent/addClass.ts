// useAddClass.ts
import { useStateContext } from "@/providers/StateProvider";
import { findNodeByKey } from "@/utils/findNodeByKey";
import { useFetchScss } from "./fetchScss";
import replaceNodeByKey from "@/app/plaza/utils/replaceNodeByKey";
export function useAddClass() {
  const { htmlJson, updateHtmlJson } = useStateContext();
  const { fetchScss } = useFetchScss();
  type StateKey = string | null;

  const addClass = async (arg: StateKey, activeClassKey: string) => {
    const root = Array.isArray(htmlJson) ? htmlJson : [htmlJson];
    const node = findNodeByKey(root, activeClassKey);
    if (!node) return;

    const classSet = new Set((node.class || "").split(/\s+/).filter(Boolean));
    for (const c of Array.from(classSet)) {
      if (c.startsWith("_")) classSet.delete(c);
    }
    if (arg) classSet.add(arg);

    const classString = Array.from(classSet).join(" ");
    const nodeUpdated = { ...node, class: classString };

    const cleanTree = root
      .filter(Boolean)
      .filter((el) => !(el.tag === "style" && el.text.includes("_")));

    if (!arg) {
      const nextTree = replaceNodeByKey(cleanTree, activeClassKey, nodeUpdated);
      updateHtmlJson(nextTree);
      return nextTree;
    }

    const scss = await fetchScss(arg);
    const baseTree = replaceNodeByKey(cleanTree, activeClassKey, nodeUpdated);
    const nextTree = scss ? [...baseTree, scss] : baseTree;

    updateHtmlJson(nextTree);
    return nextTree;
  };

  return { addClass };
}

// await runJsonToHtml(updatedHtmlJson || undefined);