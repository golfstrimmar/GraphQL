"use client";

import { RgbaColor, RgbaColorPicker } from "react-colorful";

type Props = {
  value: string;                  // например "rgba(35,53,84,0.8)"
  onChange: (val: string) => void;
};

const parseRgba = (str: string): RgbaColor => {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!m) return { r: 35, g: 53, b: 84, a: 1 };
  return { r: +m[1], g: +m[2], b: +m[3], a: +m[4] };
};

const toRgbaString = (c: RgbaColor) =>
  `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a.toFixed(2)})`;

export function ColorPickerField({
  value,
  onChange,
}: Props) {
  const color = parseRgba(value || "rgba(35,53,84,1)");

  return (
    <div className="flex flex-col gap-2">
      <RgbaColorPicker
        color={color}
        onChange={(c) => onChange(toRgbaString(c))}
      />
      <span className="text-[11px] text-slate-300">{value}</span>
    </div>
  );
}