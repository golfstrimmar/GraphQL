"use client";
import React, { useEffect } from "react";

type FontSizeState = {
  fontSizeHeader1: string;
  fontSizeHeader2: string;
  fontSizeHeader3: string;
  fontSizeHeader4: string;
  fontSizeHeader5: string;
  fontSizeHeader6: string;
};

type Props = {
  fontSizes: FontSizeState;
  setFontSize: (key: keyof FontSizeState, value: string) => void;
};

const labels: { key: keyof FontSizeState; label: string }[] = [
  { key: "fontSizeHeader1", label: "H1 font-size" },
  { key: "fontSizeHeader2", label: "H2 font-size" },
  { key: "fontSizeHeader3", label: "H3 font-size" },
  { key: "fontSizeHeader4", label: "H4 font-size" },
  { key: "fontSizeHeader5", label: "H5 font-size" },
  { key: "fontSizeHeader6", label: "H6 font-size" },
];

export default function DesignFontSizes({ fontSizes, setFontSize }: Props) {
  useEffect(() => {
    if (!fontSizes) return;
    console.log("<===fontSizes===>", fontSizes);
  }, [fontSizes]);

  return (
    <div className="grid grid-cols-2 gap-2">
      {labels.map(({ key, label }) => (
        <label
          key={key}
          className="flex flex-col gap-1 text-[11px] text-slate-300"
        >
          <span>{label}</span>
          <input
            type="text"
            placeholder="e.g. 46px / 2.875rem"
            className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-[12px] text-slate-100"
            value={fontSizes[key] || ""}
            onChange={(e) => setFontSize(key, e.target.value)}
          />
        </label>
      ))}
    </div>
  );
}
