type ParsedInlineStyles = {
  base: React.CSSProperties;
  hover?: React.CSSProperties;
  active?: React.CSSProperties;
};

function inlineStyleStringToObject(style: string): ParsedInlineStyles {
  const result: ParsedInlineStyles = { base: {} };
  if (!style) return result;

  // Грубое разбиение на base / &:hover / &:active
  const hoverMatch = style.match(/&:hover\s*\{([^}]*)\}/);
  const activeMatch = style.match(/&:active\s*\{([^}]*)\}/);

  const basePart = style
    .replace(/&:hover\s*\{[^}]*\}/, "")
    .replace(/&:active\s*\{[^}]*\}/, "")
    .trim();

  const parseBlock = (block: string): React.CSSProperties => {
    if (!block) return {};
    return block
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .reduce((acc, decl) => {
        const [prop, value] = decl.split(":");
        if (!prop || value === undefined) return acc;

        const jsProp = prop
          .trim()
          .replace(/-([a-z])/g, (_, c) => c.toUpperCase());

        (acc as any)[jsProp] = value.trim();
        return acc;
      }, {} as React.CSSProperties);
  };

  result.base = parseBlock(basePart);

  if (hoverMatch && hoverMatch[1]) {
    result.hover = parseBlock(hoverMatch[1]);
  }

  if (activeMatch && activeMatch[1]) {
    result.active = parseBlock(activeMatch[1]);
  }

  return result;
}

export default inlineStyleStringToObject;
