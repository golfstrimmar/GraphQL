"use client";
import React from "react";

const positionProps = [
  // Position
  "position: relative;",
  "position: fixed;",
  "position: absolute;",

  // Edges
  "top: 0;",
  "left: 0;",
  "right: 0;",
  "bottom: 0;",

  // Center calc
  "left: calc((100vw - 1240px)/2);",
  // overflow
  "overflow: hidden;",
  "overflow: visible;",
  "overflow: scroll;",
  "overflow: auto;",
  "overflow-x: hidden;",
  "overflow-y: hidden;",

  "transform: translate(50%, 50%);",
  "transform: rotate(180deg) translateY(50%);",
  "transform: scale(1.1);",
  "transform: scaleX(1);",
  "transform: scaleY(1);",
  "transform: rotate3d(x,y,z,angle);",
  "transform-origin: top;",
  "transform: rotate3d(x,y,z,angle);",
  // Z-index
  "z-index: 5;",
] as const;

type PositionPropValue = (typeof positionProps)[number];

export default function PositionPropsPicker({
  toAdd,
}: {
  toAdd: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {positionProps.map((prop: PositionPropValue, idx) => (
        <button
          key={idx}
          className="px-2 py-1 btn btn-empty text-[12px] "
          onClick={() => toAdd(prop)}
          title={prop}
        >
          {prop.split(";")[0].trim()}
        </button>
      ))}
    </div>
  );
}
