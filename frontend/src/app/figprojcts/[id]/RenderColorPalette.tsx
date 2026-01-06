"use client";
import React, { memo, useCallback, useMemo } from "react";
import { useStateContext } from "@/providers/StateProvider";

type Props = {
  colors: string[];
};

/**
 * Individual color item - memoized so it only re-renders when its `color` prop changes
 * It consumes the context locally so the parent can remain stable.
 */
const ColorItem: React.FC<{ color: string }> = memo(({ color }) => {
  const { setModalMessage } = useStateContext();

  const handleCopy = useCallback(() => {
    if (!navigator?.clipboard) {
      setModalMessage?.(`Clipboard not available`);
      return;
    }
    navigator.clipboard
      .writeText(color)
      .then(() => setModalMessage?.(`Color ${color} copied!`))
      .catch(() => setModalMessage?.(`Failed to copy ${color}`));
  }, [color, setModalMessage]);

  return (
    <div
      className="group flex items-center gap-3 px-1 p-1 bg-navy rounded transition-all cursor-pointer border border-slate-200"
      role="listitem"
    >
      <div className="flex items-center gap-3">
        <div
          style={{ background: color }}
          className="w-6 h-6 rounded-lg border border-white"
          aria-hidden
        />
        <p className="select-all">{color}</p>
      </div>
      <button
        type="button"
        className="px-1 py-1 text-xs font-medium hover:text-[var(--teal)] border border-[var(--teal)] bg-slate-700 rounded transition-colors opacity-20 group-hover:opacity-100"
        onClick={handleCopy}
      >
        Copy
      </button>
    </div>
  );
});
ColorItem.displayName = "ColorItem";

/**
 * RenderColorPalette - memoized parent component
 * - maps colors -> ColorItem using useMemo to avoid recreating the array on every render
 * - uses color string as key to avoid index-based re-renders
 */
const RenderColorPalette: React.FC<Props> = ({ colors }) => {
  if (!colors || colors.length === 0) return null;

  // memoize the rendered list so it only changes when `colors` changes
  const items = useMemo(
    () => colors.map((value) => <ColorItem key={value} color={value} />),
    [colors],
  );

  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 mb-4 border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-1 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
          <span>🎨</span>
        </div>
        <h5 className="text-2xl font-bold text-slate-800">Color Palette</h5>
      </div>
      <div className="flex flex-wrap gap-2" role="list">
        {items}
      </div>
    </div>
  );
};

export default memo(RenderColorPalette);
