"use client";
import React, { useState, useEffect } from "react";
import ColorPicker from "./ColorPicker";
const commonProps1 = ["color: ", "background:"] as const;
const commonProps2 = [
  "width: 100%;",
  "height: 100%;",
  "width: 30px;",
  "height: 30px;",
  "min-width: px;",
  "max-width: px;",
  "max-width: calc(100vw - 20px);",
  "max-height: 100vh;",
  "min-height: 100vh;",
  "calc(100vw - 20px);",
] as const;
const commonProps3 = [
  // Margin
  "margin: 20px 0;",
  "padding: 20px 10px;",
  "margin: 0 auto;",
  "!important",
] as const;
const commonProps4 = [
  // Hover states
  "&:hover{ transform: scale(1.05); transition: 0.2s; }",
  "&:hover{ background-color: #f0f0f0; }",
  "&:hover{ box-shadow: 0 4px 12px rgba(0,0,0,0.15); }",
  "&:hover{ border-color: #4164ff; }",
] as const;
const commonProps5 = [
  // 🔥 Transitions
  "transition: all 0.2s ease-in-out;",
  "transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);",
  "transition: background-color 0.25s ease-in-out;",
  "transition: box-shadow 0.2s ease-out;",
  "transition: border-color 0.15s linear;",
] as const;
const commonProps6 = [
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
const commonProps7 = [
  // Box-shadow
  "box-shadow: inset 0 0 5px red;",
  "box-shadow: 0 0px 10px 0 rgba(40, 40, 40, 0.2);",
  "text-shadow: 0 0px 10px 0 rgba(40, 40, 40, 0.2);",
] as const;
// ====>====>====>====>====>====>====>====>====>====>
// ====>====>====>====>====>====>====>====>====>====>
// ====>====>====>====>====>====>====>====>====>====>
export default function CommonPropsPicker({
  toAdd,
}: {
  toAdd: (v: string) => void;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [currentProp, setCurrentProp] = useState<string>("");
  const [actuelColor, setActuelColor] = useState<string>("");

  useEffect(() => {
    if (!actuelColor) return;
    toAdd(currentProp + actuelColor);
  }, [actuelColor]);

  return (
    <div className="flex flex-col gap-2 ">
      <ColorPicker
        toAdd={toAdd}
        open={open}
        setOpen={setOpen}
        setActuelColor={setActuelColor}
      />
      <div className="flex flex-wrap gap-2">
        {commonProps1.map((prop: string) => (
          <button
            key={prop}
            className="px-2 btn btn-empty text-[12px] text-[var(--slate-800)]"
            // onClick={() => toAdd(prop)}
            onClick={() => {
              setCurrentProp(prop);
              setOpen(true);
            }}
            title={prop}
          >
            {prop.split(";")[0].trim()}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {commonProps2.map((prop: string) => (
          <button
            key={prop}
            className="px-2 btn btn-empty text-[12px] text-[var(--slate-800)]"
            onClick={() => toAdd(prop)}
            title={prop}
          >
            {prop.split(";")[0].trim()}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {commonProps3.map((prop: string) => (
          <button
            key={prop}
            className="px-2 btn btn-empty text-[12px] text-[var(--slate-800)]"
            onClick={() => toAdd(prop)}
            title={prop}
          >
            {prop.split(";")[0].trim()}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {commonProps4.map((prop: string) => (
          <button
            key={prop}
            className="px-2 btn btn-empty text-[12px] text-[var(--slate-800)]"
            onClick={() => toAdd(prop)}
            title={prop}
          >
            {prop.split(";")[0].trim()}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {commonProps5.map((prop: string) => (
          <button
            key={prop}
            className="px-2 btn btn-empty text-[12px] text-[var(--slate-800)]"
            onClick={() => toAdd(prop)}
            title={prop}
          >
            {prop.split(";")[0].trim()}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {commonProps6.map((prop: string) => (
          <button
            key={prop}
            className="px-2 btn btn-empty text-[12px] text-[var(--slate-800)]"
            onClick={() => toAdd(prop)}
            title={prop}
          >
            {prop.split(";")[0].trim()}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-[var(--slate-800)]">
        {commonProps7.map((prop: string) => (
          <button
            key={prop}
            className="px-2 btn btn-empty text-[12px]"
            onClick={() => toAdd(prop)}
            title={prop}
          >
            {prop.split(";")[0].trim()}
          </button>
        ))}
      </div>
    </div>
  );
}
