const formatStyleString = (style: string) => {
  if (style === "") return "";
  const newStyle = style.split(';').map((s) => s.trim()).join(';\n');
  return newStyle
};

export default formatStyleString;