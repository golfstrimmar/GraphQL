"use client";
import React from "react";
import { useStateContext } from "@/providers/StateProvider";

const RenderTextStyles = () => {
  const { texts, setModalMessage } = useStateContext();
  if (texts.length === 0) return null;
  const toFontFamily = (fam: string): string => `"${fam}", sans-serif`;
  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2  border border-slate-200  mb-4">
      <div className="flex items-center gap-3 mb-6">
        <div className=" p-1 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
          <span>🧻</span>
        </div>
        <h5 className="text-2xl font-bold text-slate-800">Text Styles</h5>
      </div>
      <div className="space-y-3">
        {texts.map((el, idx) => (
          <div
            key={idx}
            className="group bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-2 border border-slate-200 hover:shadow-lg hover:border-green-300 transition-all"
          >
            <div className="flex items-start gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${el.text}`);
                  setModalMessage("Text copied!");
                }}
                className="flex-1 text-left p-2 bg-slate-300 rounded-lg border border-slate-200 hover:border-[var(--teal)] transition-colors relative overflow-hidden group"
              >
                <div className="absolute top-[50%] translate-y-[-50%] right-2 opacity-40 group-hover:opacity-100 transition-opacity ">
                  <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                    Copy Text
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: toFontFamily(el.fontFamily),
                    fontWeight: el.fontWeight,
                    fontSize: el.fontSize,
                    color: el.color,
                  }}
                  className="whitespace-nowrap "
                >
                  {el.text}
                </p>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`@include ${el.mixin};`);
                  setModalMessage("Mixin copied!");
                }}
                className="px-4 py-2  rounded-lg border hover:border-[var(--teal)] hover:text-[var(--teal)] transition-colors font-mono text-sm whitespace-nowrap z-50"
              >
                @include {el.mixin};
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RenderTextStyles;
