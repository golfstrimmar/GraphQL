"use client";
import React from "react";

const displayOptions = [
  "block",
  "inline",
  "inline-block",
  "flex",
  "inline-flex",
  "grid",
  "inline-grid",
  "flow-root",
  "contents",
  "table",
  "table-row",
  "table-cell",
  "list-item",
  "none",
] as const;

type DisplayValue = (typeof displayOptions)[number];

export default function DisplayPicker({
  toAdd,
}: {
  toAdd: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {displayOptions.map((d: DisplayValue) => (
        <button
          key={d}
          className="px-2 btn btn-empty"
          onClick={() => {
            toAdd("display:" + d + ";");
          }}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
