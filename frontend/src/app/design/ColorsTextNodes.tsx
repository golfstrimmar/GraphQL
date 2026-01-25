"use client";
import React from "react";
import { Colors } from "@/app/plaza/forStyleComponent/Colors";

type ColorsTextNodesProps = {
  css: string;
  handleChangeCss: (nextCss: string) => void;
};
export default function ColorsTextNodes({
  css,
  handleChangeCss,
}: ColorsTextNodesProps) {
  const updateColorInCss = (cssString: string, newColor: string): string => {
    if (!cssString || !cssString.trim()) {
      return `color:${newColor};`;
    }

    const colorRegex = /color\s*:\s*[^;]+;?/i;

    if (colorRegex.test(cssString)) {
      return cssString.replace(colorRegex, `color:${newColor};`);
    }

    const trimmed = cssString.trim();
    const withSemicolon = trimmed.endsWith(";") ? trimmed : trimmed + ";";
    return `${withSemicolon} color:${newColor};`;
  };

  const handlePickColor = (value: string) => {
    const next = updateColorInCss(css, value);
    handleChangeCss(next);
  };

  return (
    <div className="flex flex-wrap gap-1 max-h-64 overflow-auto p-1">
      {Colors.map((item) => (
        <button
          key={item.color}
          type="button"
          className="w-6 h-6 rounded border border-slate-600"
          style={{ backgroundColor: item.value }}
          title={item.color}
          onClick={() => handlePickColor(item.value)}
        />
      ))}
    </div>
  );
}
