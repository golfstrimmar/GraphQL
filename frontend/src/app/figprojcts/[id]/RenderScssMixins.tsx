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
  const colorVars = colors?.map((value, idx) => ({
    name: `$color-${idx + 1}`,
    value,
  }));
  const getColorVarByValue = (colorValue: string): string => {
    const found = colorVars.find((v) => v.value === colorValue);
    return found ? found.name : colorValue;
  };
  const mixinStrings = uniqueMixins.map((el) => {
    const colorVariable = getColorVarByValue(el.color);
    return `@mixin ${el.mixin} {
    font-family: "${el.fontFamily}", sans-serif;
    font-weight: ${el.fontWeight};
    font-size: ${el.fontSize};
    color: ${colorVariable};
  }`;
  });
  const allMixinsText = mixinStrings.join("\n\n");
  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2  border border-slate-200  mb-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 ">
          <div className=" p-1 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span>{"{ }"}</span>
          </div>
          <h5 className=" font-bold text-slate-800">Text Mixins</h5>
        </div>
        <button
          onClick={() => {
            if (mixinStrings.length === 0) return;
            navigator.clipboard.writeText(allMixinsText);
            setModalMessage("All mixins copied!");
          }}
          className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600! transition-colors shadow-sm"
        >
          Copy All
        </button>
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
              className="group border border-slate-200 relative bg-slate-900 rounded p-1  transition-all overflow-hidden cursor-pointer "
            >
              <button
                onClick={() => {
                  navigator.clipboard.writeText(scssMixin);
                  setModalMessage("Mixin copied!");
                }}
                className="px-1 py-1 text-xs font-medium hover:text-[var(--teal)]  border border-[var(--teal)] bg-slate-700 rounded hover:teal-500  transition-colors opacity-20 group-hover:opacity-100 absolute top-1 right-1"
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
