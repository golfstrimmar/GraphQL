"use client";
import React, { useEffect } from "react";
import type { FontSlot } from "./ListDesignSystems";

type ColorState = {
  headers1color: string;
  headers2color: string;
  headers3color: string;
  headers4color: string;
  headers5color: string;
  headers6color: string;
  color7: string;
  color8: string;
  color9: string;
  color10: string;
};

type FontSizeState = {
  fontSizeHeader1: string;
  fontSizeHeader2: string;
  fontSizeHeader3: string;
  fontSizeHeader4: string;
  fontSizeHeader5: string;
  fontSizeHeader6: string;
};

type Props = {
  colors: ColorState;
  fonts: FontSlot[];
  fontSizes: FontSizeState;
};

// ----🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢----

export default function DesignTypography({ colors, fonts, fontSizes }: Props) {
  const SLOT_TYPOGRAPHY = [
    {
      tag: "h1",
      color: colors.headers1color,
      fontSize: `${fontSizes.fontSizeHeader1}px ` || "46px",
      fontWeight: "bold",
      fontFamily:
        fonts.find((font) => font.id === "headers1font")?.family ||
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    {
      tag: "h2",
      color: colors.headers2color,
      fontSize: `${fontSizes.fontSizeHeader2}px ` || "32px",
      fontWeight: "bold",
      fontFamily:
        fonts.find((font) => font.id === "headers2font")?.family ||
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    {
      tag: "h3",
      color: colors.headers3color,
      fontSize: `${fontSizes.fontSizeHeader3}px ` || "26px",
      fontWeight: "bold",
      fontFamily:
        fonts.find((font) => font.id === "headers3font")?.family ||
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    {
      tag: "h4",
      color: colors.headers4color,
      fontSize: `${fontSizes.fontSizeHeader4}px ` || "20px",
      fontWeight: "bold",
      fontFamily:
        fonts.find((font) => font.id === "headers4font")?.family ||
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    {
      tag: "h5",
      color: colors.headers5color,
      fontSize: `${fontSizes.fontSizeHeader5}px ` || "18px",
      fontWeight: "bold",
      fontFamily:
        fonts.find((font) => font.id === "headers5font")?.family ||
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    {
      tag: "h6",
      color: colors.headers6color,
      fontSize: `${fontSizes.fontSizeHeader6}px ` || "14px",
      fontWeight: "bold",
      fontFamily:
        fonts.find((font) => font.id === "headers6font")?.family ||
        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    },
  ];

  return (
    <div className="bg-[var(--lightest-slate)] p-2 flex flex-col gap-2 overflow-hidden">
      {SLOT_TYPOGRAPHY.map((typography, idx) => {
        // Рендерим только если цвет задан (headersNcolor не пустой)
        if (!typography.color) return null;

        const Tag = typography.tag as keyof JSX.IntrinsicElements;

        return (
          <Tag
            key={idx}
            style={{
              color: typography.color,
              fontSize: typography.fontSize,
              fontWeight: typography.fontWeight,
              fontFamily: typography.fontFamily,
            }}
          >
            {typography.tag}: Lorem ipsum dolor sit amet.
          </Tag>
        );
      })}
    </div>
  );
}
