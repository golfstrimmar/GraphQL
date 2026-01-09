"use client";
import React, { memo, useCallback, useMemo } from "react";
import { useStateContext } from "@/providers/StateProvider";

interface RenderColorVarsProps {
  colorsTo: string[];
}
// ------------------------
const extractRgb = (colorVar: string): string | null => {
  if (!colorVar) return null;
  const match = colorVar.match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/);
  return match ? match[0] : null;
};
// ------------------------
type ColorVarItemProps = {
  value: string;
  onCopy: (value: string) => void;
};
// ------------------------
const ColorVarItem: React.FC<ColorVarItemProps> = memo(({ value, onCopy }) => {
  const bgColor = useMemo(() => extractRgb(value), [value]);

  const handleCopy = useCallback(() => {
    onCopy(value);
  }, [onCopy, value]);

  return (
    <div
      className="group flex items-center gap-3 px-1 p-1 bg-navy rounded transition-all cursor-pointer border border-slate-200"
      role="listitem"
    >
      <span
        style={bgColor ? { backgroundColor: bgColor } : undefined}
        className="w-6 h-6 rounded-lg border border-slate-300"
        aria-hidden
      />
      <span className="select-all break-words">{value}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="px-1 py-1 text-xs font-medium hover:text-[var(--teal)] border border-[var(--teal)] bg-slate-700 rounded transition-colors opacity-20 group-hover:opacity-100"
      >
        Copy
      </button>
    </div>
  );
});
ColorVarItem.displayName = "ColorVarItem";

// ------------------------
const RenderColorVars: React.FC<RenderColorVarsProps> = ({ colors }) => {
  const { setModalMessage } = useStateContext();
  // -------------------
  const colorsTo = useMemo(() => {
    if (colors.length > 0) {
      return colors.map((color, index) => `$color-${index + 1}: ${color};`);
    }
    return [];
  }, [colors]);
  // -------------------
  const onCopy = useCallback(
    (value: string) => {
      if (!navigator?.clipboard) {
        setModalMessage?.("Clipboard not available");
        return;
      }
      navigator.clipboard
        .writeText(value)
        .then(() => setModalMessage?.("Variable copied!"))
        .catch(() => setModalMessage?.("Failed to copy variable"));
    },
    [setModalMessage],
  );
  // -------------------
  const copyAll = useCallback(() => {
    if (!colorsTo || colorsTo.length === 0) return;
    if (!navigator?.clipboard) {
      setModalMessage?.("Clipboard not available");
      return;
    }
    const text = colorsTo.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => setModalMessage?.("All variables copied!"))
      .catch(() => setModalMessage?.("Failed to copy variables"));
  }, [colorsTo, setModalMessage]);
  // -------------------
  if (!colorsTo || colorsTo.length === 0) return null;
  // -------------------
  const items = useMemo(
    () =>
      colorsTo.map((foo) => (
        <ColorVarItem key={foo} value={foo} onCopy={onCopy} />
      )),

    [colorsTo, onCopy],
  );
  // -------------------
  return (
    <div className="mb-4 p-2 bg-navy rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span>🎨</span>
          </div>
          <h5 className="font-bold text-slate-800">Color Variables</h5>
        </div>
        <button
          onClick={copyAll}
          className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          type="button"
        >
          Copy All
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="list">
        {items}
      </div>
    </div>
  );
};

export default memo(RenderColorVars);
