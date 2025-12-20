"use client";
import React from "react";
import { useStateContext } from "@/providers/StateProvider";

const RenderScssMixins = ({ texts, colors }) => {
  const { setModalMessage } = useStateContext();
  if (texts.length === 0) return null;
  const uniqueMixins = Object.values(
    texts.reduce<Record<string, TextNode>>((acc, el) => {
      const key = `${el.mixin}`;
      if (!acc[key]) {
        acc[key] = el;
      }
      return acc;
    }, {}),
  );
  const colorVars = colors.map((value, idx) => ({
    name: `$color-${idx + 1}`,
    value,
  }));
  const getColorVarByValue = (colorValue: string): string => {
    const found = colorVars.find((v) => v.value === colorValue);
    return found ? found.name : colorValue;
  };

  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2  border border-slate-200  mb-4">
      <div className="flex items-center gap-3 mb-6 ">
        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <span>{"{ }"}</span>
        </div>
        <h5 className=" font-bold text-slate-800">SCSS Mixins</h5>
      </div>
      <div className="mb-4  grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-2">
        {uniqueMixins.map((el) => {
          const colorVariable = getColorVarByValue(el.color);
          const scssMixin = `@mixin ${el.mixin} {
          font-family: "${el.fontFamily}", sans-serif;
          font-weight: ${el.fontWeight};
          font-size: ${el.fontSize};
          color: ${colorVariable};
          }`;

          return (
            <div
              key={el.mixin}
              className="group relative bg-slate-900 rounded-xl p-2 border border-slate-700 hover:border-purple-500 transition-all overflow-hidden"
            >
              <button
                onClick={() => {
                  navigator.clipboard.writeText(scssMixin);
                  setModalMessage("Mixin copied!");
                }}
                className="absolute top-3 right-3 px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 transition-colors opacity-20  group-hover:opacity-100 z-10"
              >
                Copy
              </button>
              <pre className="text-sm font-mono text-slate-100 overflow-x-auto">
                <code>{scssMixin}</code>
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default RenderScssMixins;
