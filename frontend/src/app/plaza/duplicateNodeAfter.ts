const regenerateKeysDeep = (node: any): any => {
  if (!node || typeof node === "string") return node;

  const cloned = {
    ...node,
    _key: crypto.randomUUID(),
  };

  if (Array.isArray(node.children)) {
    cloned.children = node.children.map((child: any) =>
      regenerateKeysDeep(child),
    );
  } else {
    cloned.children = node.children;
  }

  return cloned;
};

const duplicateNodeAfter = (tree: any, key: string): any => {
  const walk = (nodes: any): any => {
    if (!Array.isArray(nodes)) return nodes;

    const result: any[] = [];
    for (const node of nodes) {
      if (typeof node === "string") {
        result.push(node);
        continue;
      }

      // Рекурсивно обрабатываем детей
      const nextNode = {
        ...node,
        children: Array.isArray(node.children)
          ? walk(node.children)
          : node.children,
      };

      result.push(nextNode);

      // 🎯 Если нашли нужный узел — вставляем его клон сразу после
      if (node._key === key) {
        const clone = regenerateKeysDeep(nextNode); // новый key и для всех детей
        result.push(clone);
      }
    }

    return result;
  };

  return Array.isArray(tree) ? walk(tree) : walk([tree]);
};

export default duplicateNodeAfter;
