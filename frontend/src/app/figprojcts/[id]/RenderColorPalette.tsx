"use client";
import React from "react";
import Image from "next/image";
import { useStateContext } from "@/providers/StateProvider";
const RenderColorPalette = ({ colors }) => {
  const { setModalMessage } = useStateContext();
  if (colors.length === 0) return null;
  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 mb-4 border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className=" p-1 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
          <span>🎨</span>
        </div>
        <h5 className="text-2xl font-bold text-slate-800">Color Palette</h5>
      </div>
      <div className=" flex flex-wrap gap-2">
        {colors.map((value, index) => (
          <div
            key={index}
            className="group flex  items-center gap-3 px-1 p-1 bg-navy rounded  transition-all cursor-pointer border border-slate-200"
          >
            <div className="group flex  items-center gap-3 px-1 p-1 bg-navy rounded  transition-all cursor-pointer  ">
              <div
                style={{ background: value }}
                className="w-6 h-6 rounded-lg border border-white"
              />
              <p className=" ">{value}</p>
            </div>
            <button
              className="px-1 py-1 text-xs font-medium hover:text-[var(--teal)]  border border-[var(--teal)] bg-slate-700 rounded hover:teal-500  transition-colors opacity-20 group-hover:opacity-100"
              onClick={() => {
                navigator.clipboard.writeText(value);
                setModalMessage(`Color ${value} copied!`);
              }}
            >
              Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RenderColorPalette;
