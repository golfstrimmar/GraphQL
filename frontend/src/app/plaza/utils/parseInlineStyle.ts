const parseInlineStyle = (styleString: string): React.CSSProperties => {
  if (!styleString) return {};
  const finalStyle = styleString + ";cursor: pointer;";
  return finalStyle.split(";").reduce((acc, rule) => {
    const [prop, value] = rule.split(":").map((s) => s.trim());
    if (prop && value) {
      const jsProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      (acc as any)[jsProp] = value;
    }
    return acc;
  }, {} as React.CSSProperties);
};
export default parseInlineStyle;
