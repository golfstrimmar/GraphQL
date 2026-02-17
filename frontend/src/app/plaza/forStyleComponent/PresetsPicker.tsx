"use client";
import React from "react";

const presetsProps = [
  " display: flex; flex-direction: row; align-items: center;  gap: 10px;",
  " display: flex; flex-direction: column; align-items: center;  gap: 10px;",
  " display: grid; grid-template-columns: repeat(auto-fill, minmax(250px,1fr)); align-items: center;  gap: 10px;",
  " display: grid; grid-template-columns: repeat(3, 1fr); align-items: center;  gap: 10px;",
] as const;

type presetsPropValue = (typeof presetsProps)[number];

export default function PresetsPicker({
  toAdd,
}: {
  toAdd: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {presetsProps.map((prop: presetsPropValue, idx) => (
        <button
          key={idx}
          className="px-2 py-1 btn btn-empty text-[12px] text-[var(--slate-800)]"
          onClick={() => toAdd(prop)}
          title={prop}
        >
          {prop}
        </button>
      ))}
    </div>
  );
}
