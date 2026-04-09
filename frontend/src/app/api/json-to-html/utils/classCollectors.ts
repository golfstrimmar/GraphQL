import type { HtmlNode } from "@/types/HtmlNode";

export function collectAllClasses(nodes: HtmlNode[]): Set<string> {
  const set = new Set<string>();

  const walk = (list: HtmlNode[]) => {
    list.forEach((node) => {
      if (node.class) {
        node.class
          .split(/\s+/)
          .map((c) => c.trim())
          .filter(Boolean)
          .forEach((c) => set.add(c));
      }
      if (node.children && node.children.length) {
        walk(node.children);
      }
    });
  };

  walk(nodes);
  return set;
}

export function collectExistingModifierClasses(nodes: HtmlNode[]): Set<string> {
  const all = collectAllClasses(nodes);
  const mods = new Set<string>();
  all.forEach((c) => {
    if (c.startsWith("_")) mods.add(c);
  });
  return mods;
}

const REV_MARKER = "_rev_on_scroll";

const REV_CLASS_BASES = new Set([
  "rev--on-scroll",
  "rev--up",
  "rev--down",
  "rev--left",
  "rev--right",
  "rev--zoom",
]);

export function addRevMarkerIfUsed(
  nodes: HtmlNode[],
  whiteList: Set<string>
): void {
  const allClasses = collectAllClasses(nodes);

  const hasRev = Array.from(allClasses).some((cls) =>
    REV_CLASS_BASES.has(cls)
  );

  if (hasRev) {
    whiteList.add(REV_MARKER);
  }
}