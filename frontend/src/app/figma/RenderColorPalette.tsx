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
        <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
          <span>🎨</span>
        </div>
        <h5 className="text-2xl font-bold text-slate-800">Color Palette</h5>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))] gap-2">
        {colors.map((value, index) => (
          <div
            key={index}
            className="group relative bg-slate-50 rounded-xl p-2 border border-slate-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(value);
              setModalMessage(`Color ${value} copied!`);
            }}
          >
            <div
              style={{ background: value }}
              className="w-full h-14 rounded-lg shadow-md mb-3 border-2 border-white"
            />
            <div className="text-center">
              <p className="text-xs font-mono text-slate-600 font-medium">
                {value}
              </p>
              <p className="text-xs text-slate-400 mt-1">Click to copy</p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 transition-all duration-200 group-hover:opacity-100 ">
              <div className="bg-white rounded-full p-1.5 shadow-md">
                <Image src="/svg/copy.svg" alt="copy" width={12} height={12} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RenderColorPalette;
