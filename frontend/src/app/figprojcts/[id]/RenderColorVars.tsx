"use client";
import React from "react";
import { useStateContext } from "@/providers/StateProvider";
interface RenderColorVarsProps {
  colorsTo: string[];
}

const RenderColorVars: React.FC<RenderColorVarsProps> = ({ colorsTo }) => {
  const { setModalMessage } = useStateContext();

  // ============
  const exponentColors = (colorvar) => {
    const match = colorvar.match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/);
    const rgb = match ? match[0] : null;
    return rgb;
  };
  return (
    <div className=" mb-4 p-2  bg-navy  rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="  p-1 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span>🎨</span>
          </div>
          <h5 className="font-bold text-slate-800">Color Variables</h5>
        </div>
        <button
          onClick={() => {
            if (colorsTo.length === 0) return;
            navigator.clipboard.writeText(colorsTo);
            setModalMessage("All variables copied!");
          }}
          className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600! transition-colors shadow-sm"
        >
          Copy All
        </button>
      </div>
      <div className=" flex flex-wrap gap-2">
        {colorsTo.length > 0 &&
          colorsTo.map((foo, inx) => {
            const bgColor = exponentColors(foo);
            return (
              <div
                key={inx}
                className="group flex  items-center gap-3 px-1 p-1 bg-navy rounded  transition-all cursor-pointer border border-slate-200"
              >
                <span
                  style={bgColor ? { backgroundColor: bgColor } : undefined}
                  className="w-6 h-6 rounded-lg border border-slate-300"
                ></span>
                {foo}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(foo);
                    setModalMessage("Variable copied!");
                  }}
                  className="px-1 py-1 text-xs font-medium hover:text-[var(--teal)]  border border-[var(--teal)] bg-slate-700 rounded hover:teal-500  transition-colors opacity-20 group-hover:opacity-100"
                >
                  Copy
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default RenderColorVars;
