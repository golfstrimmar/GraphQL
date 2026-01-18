"use client";
import React from "react";
import Colors from "./Colors";

type ColorGroup = (typeof Colors)[number]["group"];
type ColorItem = (typeof Colors)[number];

interface ColorPickerProps {
  toAdd: (css: string) => void;
}

export default function ColorPicker({
  toAdd,
}: ColorPickerProps): React.ReactElement {
  const groupsOrder: ColorGroup[] = [
    "neutral",
    "red",
    "orange",
    "yellow",
    "green",
    "cyan",
    "blue",
    "purple",
    "brown",
  ];

  return (
    <div className="flex flex-col gap-4">
      {groupsOrder.map((group) => {
        const items = Colors.filter((c) => c.group === group) as ColorItem[];
        if (!items.length) return null;

        return (
          <div key={group}>
            <div className="flex flex-wrap gap-2">
              {items.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  aria-label={`Set background color to ${c.color}`}
                  className="w-6 h-6 rounded-full border border-black/10"
                  style={{ backgroundColor: c.value }}
                  title={c.color}
                  onClick={() => {
                    toAdd(`background-color:${c.color};`);
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
