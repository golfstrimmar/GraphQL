function inlineStyleStringToObject(style: string): React.CSSProperties {
  if (!style) return {};
  return style
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, decl) => {
      const [prop, value] = decl.split(":");
      if (!prop || value === undefined) return acc;

      const jsProp = prop
        .trim()
        .replace(/-([a-z])/g, (_, c) => c.toUpperCase()); // font-size → fontSize

      acc[jsProp as keyof React.CSSProperties] = value.trim() as any;
      return acc;
    }, {} as React.CSSProperties);
}

export default inlineStyleStringToObject;
