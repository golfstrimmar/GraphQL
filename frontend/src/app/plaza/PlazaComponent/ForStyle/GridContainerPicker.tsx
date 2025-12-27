"use client";
import React from "react";

type PickerProps = {
  toAdd: (v: string) => void;
};

const gridTemplateColumnsPresets = [
  "100px 1fr",
  "minmax(100px, 1fr)",
  "fit-content(40%)",
  "repeat(3, 200px)",
  "repeat(auto-fill, minmax(min(250px, 100%), 1fr))",
  "repeat(auto-fitt, minmax(min(250px, 100%), 1fr));",
] as const;

const gridTemplateColumnsSimple = [
  "repeat(2, 1fr)",
  "repeat(3, 1fr)",
  "repeat(4, 1fr)",
  "1fr 2fr",
  "2fr 1fr",
] as const;

const gridTemplateRowsOptions = [
  "repeat(2, 1fr)",
  "repeat(3, 1fr)",
  "auto 1fr auto",
] as const;

const gridAutoFlowOptions = [
  "row",
  "column", // авто создаёт колонки по контенту
  "row dense",
  "column dense",
] as const;

const gridAutoRowsOptions = [
  "auto",
  "max-content", // «прижимает» по высоте к контенту
  "min-content",
] as const;

const gridTemplateAreasOptions = [
  `"a b c e"
   "a d c e"`,
] as const;

const justifyContentOptions = [
  "start",
  "center",
  "end",
  "space-between",
  "space-around",
  "space-evenly",
] as const;

const alignContentOptions = [
  "start",
  "center",
  "end",
  "space-between",
  "space-around",
  "space-evenly",
  "stretch",
] as const;

const justifyItemsOptions = ["start", "center", "end", "stretch"] as const;
const alignItemsOptions = ["start", "center", "end", "stretch"] as const;
const gapOptions = ["0", "4px", "8px", "12px", "16px", "24px"] as const;

export default function GridContainerPicker({ toAdd }: PickerProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* grid-template-columns simple */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-70">grid-template-columns</span>
        {gridTemplateColumnsSimple.map((v) => (
          <button
            key={v}
            className="px-2 btn btn-empty"
            onClick={() => toAdd(`grid-template-columns:${v};`)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* grid-template-columns presets */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-70">
          grid-template-columns (presets)
        </span>
        {gridTemplateColumnsPresets.map((v) => (
          <button
            key={v}
            className="px-2 btn btn-empty text-xs"
            onClick={() => toAdd(`grid-template-columns:${v};`)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* grid-template-rows */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-70">grid-template-rows</span>
        {gridTemplateRowsOptions.map((v) => (
          <button
            key={v}
            className="px-2 btn btn-empty"
            onClick={() => toAdd(`grid-template-rows:${v};`)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* grid-auto-flow */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-70">grid-auto-flow</span>
        {gridAutoFlowOptions.map((v) => (
          <button
            key={v}
            className="px-2 btn btn-empty"
            onClick={() => toAdd(`grid-auto-flow:${v};`)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* grid-auto-rows */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-70">grid-auto-rows</span>
        {gridAutoRowsOptions.map((v) => (
          <button
            key={v}
            className="px-2 btn btn-empty"
            onClick={() => toAdd(`grid-auto-rows:${v};`)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* grid-template-areas */}
      <div className="flex flex-col gap-1">
        <span className="text-xs opacity-70">grid-template-areas</span>
        {gridTemplateAreasOptions.map((v, idx) => (
          <button
            key={idx}
            className="px-2 btn btn-empty text-xs text-left whitespace-pre leading-snug"
            onClick={() => toAdd(`grid-template-areas:${v};`)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* justify-content */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-70">justify-content</span>
        {justifyContentOptions.map((v) => (
          <button
            key={v}
            className="px-2 btn btn-empty"
            onClick={() => toAdd(`justify-content:${v};`)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* align-content */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-70">align-content</span>
        {alignContentOptions.map((v) => (
          <button
            key={v}
            className="px-2 btn btn-empty"
            onClick={() => toAdd(`align-content:${v};`)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* justify-items */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-70">justify-items</span>
        {justifyItemsOptions.map((v) => (
          <button
            key={v}
            className="px-2 btn btn-empty"
            onClick={() => toAdd(`justify-items:${v};`)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* align-items */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-70">align-items</span>
        {alignItemsOptions.map((v) => (
          <button
            key={v}
            className="px-2 btn btn-empty"
            onClick={() => toAdd(`align-items:${v};`)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* gap */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-70">gap</span>
        {gapOptions.map((v) => (
          <button
            key={v}
            className="px-2 btn btn-empty"
            onClick={() => toAdd(`gap:${v};`)}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
