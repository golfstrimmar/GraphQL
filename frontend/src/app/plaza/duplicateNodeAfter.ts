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
        const clone = {
          ...nextNode,
          _key: crypto.randomUUID(), // новый ключ
        };
        result.push(clone);
      }
    }

    return result;
  };

  return Array.isArray(tree) ? walk(tree) : walk([tree]);
};

export default duplicateNodeAfter;
