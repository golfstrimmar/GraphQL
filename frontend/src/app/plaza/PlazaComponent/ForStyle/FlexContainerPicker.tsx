"use client";
import React from "react";

const flexDirectionOptions = [
  "row",
  "row-reverse",
  "column",
  "column-reverse",
] as const;

const flexWrapOptions = ["nowrap", "wrap", "wrap-reverse"] as const;

const justifyContentOptions = [
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around",
  "space-evenly",
] as const;

const alignItemsOptions = [
  "stretch",
  "flex-start",
  "center",
  "flex-end",
  "baseline",
] as const;

const alignContentOptions = [
  "stretch",
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around",
] as const;

const gapOptions = ["0", "4px", "8px", "12px", "16px", "24px"] as const;

type PickerProps = {
  toAdd: (v: string) => void;
};

export default function FlexContainerPicker({ toAdd }: PickerProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* flex-direction */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-70">flex-direction</span>
        {flexDirectionOptions.map((v) => (
          <button
            key={v}
            className="px-2 btn btn-empty"
            onClick={() => toAdd(`flex-direction:${v};`)}
          >
            {v}
          </button>
        ))}
      </div>

      {/* flex-wrap */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs opacity-70">flex-wrap</span>
        {flexWrapOptions.map((v) => (
          <button
            key={v}
            className="px-2 btn btn-empty"
            onClick={() => toAdd(`flex-wrap:${v};`)}
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
