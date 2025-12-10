"use client";
import React from "react";
import { useStateContext } from "@/providers/StateProvider";
interface RenderColorVarsProps {
  colorsTo: string[];
}

const RenderColorVars: React.FC<RenderColorVarsProps> = ({ colorsTo }) => {
  const { setModalMessage } = useStateContext();

  // ============

  // ============

  return (
    <div className=" mb-4 p-2  bg-navy  rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-xl">🎨</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">SCSS Variables</h3>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(allVars);
            setModalMessage("All variables copied!");
          }}
          className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
        >
          Copy All
        </button>
      </div>
      <div className=" flex flex-wrap gap-2">
        {colorsTo.length > 0 &&
          colorsTo.map((foo, inx) => {
            return (
              <div
                key={inx}
                className="group flex  items-center gap-3 px-3 p-1 bg-navy rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                {foo}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(foo);
                    setModalMessage("Variable copied!");
                  }}
                  className="px-3 py-1.5 text-xs font-medium hover:text-[var(--teal)]  border border-[var(--teal)] bg-slate-700 rounded hover:teal-500  transition-colors opacity-20 group-hover:opacity-100"
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
