import type { HtmlNode } from "@/types/HtmlNode";

export function isolateModalNodes(nodes: HtmlNode[]): HtmlNode[] {
  // Check if this component bundle contains Modal functionality
  const hasModal = nodes.some(
    (node) =>
      JSON.stringify(node).toLowerCase().includes("modal") ||
      JSON.stringify(node).toLowerCase().includes("mod-popup")
  );

  if (!hasModal) return nodes;

  const uniqId = Math.random().toString(36).substring(2, 8);
  const uniqClass = `modal-isolate-${uniqId}`;

  const processNode = (node: HtmlNode, isRootContent: boolean): HtmlNode => {
    let newClass = node.class || "";
    const newAttributes = { ...node.attributes };

    // 1. Hook HTML Root Node
    if (
      isRootContent &&
      !["link", "style", "script"].includes(node.tag || "")
    ) {
      newClass = `${newClass} ${uniqClass}`.trim();
    }

    // 1b. Isolate IDs and related attributes in HTML
    if (newAttributes.id) {
      newAttributes.id = `${newAttributes.id}-${uniqId}`;
    }
    if (newAttributes.for) {
      newAttributes.for = `${newAttributes.for}-${uniqId}`;
    }
    if (typeof newAttributes.href === 'string' && newAttributes.href.startsWith("#")) {
      newAttributes.href = `${newAttributes.href}-${uniqId}`;
    }
    if (newAttributes["data-target"]) {
      newAttributes["data-target"] = `${newAttributes["data-target"]}-${uniqId}`;
    }

    let newText = node.text;

    // 2. Isolate Javascript Logic
    if (node.tag === "script" && newText) {
      // 2a. Inject scope check into click event listener
      newText = newText.replace(
        /document\.addEventListener\(['"]click['"]\s*,\s*function\s*\(([^)]+)\)\s*\{/g,
        `document.addEventListener('click', function($1) {\n  if (!$1.target.closest('.${uniqClass}')) return; `
      );

      // 2b. Root Scope DOM queries (but ignore global ones like body/head or open-modal state)
      newText = newText.replace(
        /document\.querySelector(All)?\(\s*(['"])([^'"]+)\2\s*\)/g,
        (match, isAll, quote, selector) => {
          const sel = selector.trim();
          if (
            ['script', 'body', 'head', 'window', 'document'].includes(sel) ||
            sel.includes('._open') // Allow global lookup for currently open modals
          ) {
            return match;
          }
          return `document.querySelector${isAll || ''}(${quote}.${uniqClass}:is(${sel}), .${uniqClass} ${sel}${quote})`;
        }
      );

      // 2c. Isolate getElementById calls
      // Transforms document.getElementById('foo') into document.getElementById('foo-xyz')
      newText = newText.replace(
        /document\.getElementById\(\s*(['"])([^'"]+)\1\s*\)/g,
        `document.getElementById($1$2-${uniqId}$1)`
      );

      // 2d. Wrap in IIFE
      newText = `\n/* ISOLATED MODAL SCOPE: ${uniqId} */\n(() => {\n${newText}\n})();\n`;
    }

    // 2e. Isolate Style Tags
    if (node.tag === "style" && newText) {
       newText = `${newText}\n/* ISOLATED MODAL STYLE: ${uniqClass} */\n`;
    }

    // 3. Process Children recursively
    const children = Array.isArray(node.children)
      ? node.children.map((child) => processNode(child, false))
      : node.children;

    return { ...node, class: newClass, text: newText, attributes: newAttributes, children };
  };

  return nodes.map((node) => processNode(node, true));
}
