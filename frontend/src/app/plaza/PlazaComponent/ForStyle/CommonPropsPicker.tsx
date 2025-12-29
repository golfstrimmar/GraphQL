"use client";
import React from "react";

const commonProps = [
  // Width/Height
  "width: 100%;",
  "min-width: px;",
  "max-width: px;",
  "max-width: calc(100vw - 20px);",
  "calc(100vw - 20px);",
  "height: 100%;",
  "max-height: 100vh;",
  "min-height: 100vh;",

  // Margin
  "margin: 0 auto;",
  "margin: 20px 0 0 0;",
  "padding: 20px 0 0 0;",
  // Hover states
  "&:hover{ transform: scale(1.05); transition: 0.2s; }",
  "&:hover{ background-color: #f0f0f0; }",
  "&:hover{ box-shadow: 0 4px 12px rgba(0,0,0,0.15); }",
  "&:hover{ border-color: #4164ff; }",

  // 🔥 Transitions
  "transition: all 0.2s ease-in-out;",
  "transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);",
  "transition: background-color 0.25s ease-in-out;",
  "transition: box-shadow 0.2s ease-out;",
  "transition: border-color 0.15s linear;",
  // Box-shadow
  "box-shadow: inset 0 0 5px red;",
  "box-shadow: 0 0px 10px 0 rgba(40, 40, 40, 0.2);",

  // Border
  "border: 1px solid #7AB764;",

  // Outline
  "outline: 1px solid #4164ff;",

  // Border-radius
  "border-radius: 10px;",
  "border-top-left-radius: 10px;",
  "border-top-right-radius: 10px;",
  "border-bottom-left-radius: 10px;",
  "border-bottom-right-radius: 10px;",

  // Cursor
  "cursor: pointer;",
] as const;

type CommonPropValue = (typeof commonProps)[number];

export default function CommonPropsPicker({
  toAdd,
}: {
  toAdd: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {commonProps.map((prop: CommonPropValue) => (
        <button
          key={prop}
          className="px-2 py-1 btn btn-empty text-[11px] "
          onClick={() => toAdd(prop)}
          title={prop}
        >
          {prop.split(";")[0].trim()}
        </button>
      ))}
    </div>
  );
}
