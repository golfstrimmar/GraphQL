"use client";
import React from "react";

const textProps = [
  // Font
  "font-size: 14px;",
  "font-weight: 700;",
  "line-height: 1;",
  "font-family: 'Nunito', sans-serif;",
  "font-style: italic;", // italian → italic

  // Color/Text
  "color: #000000;",
  "letter-spacing: .010rem;",
  "text-shadow: 0 0 5px red;",
  "text-transform: uppercase;",
  "text-align: center;",
  "white-space: nowrap;",
  "white-space: wrap;",

  // SVG
  "fill: white;",
  "stroke: white;",
] as const;

type TextPropValue = (typeof textProps)[number];

export default function TextPropsPicker({
  toAdd,
}: {
  toAdd: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {textProps.map((prop: TextPropValue) => (
        <button
          key={prop}
          className="px-2 py-1 btn btn-empty text-[12px] max-w-[140px] truncate"
          onClick={() => toAdd(prop)}
          title={prop}
        >
          {prop.split(";")[0].trim()}
        </button>
      ))}
    </div>
  );
}
