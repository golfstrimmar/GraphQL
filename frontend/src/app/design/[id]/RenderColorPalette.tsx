"use client";
import React, { memo, useCallback, useMemo, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import BlockHeader from "./BlockHeader";
type Props = {
  colors: string[];
};

/**
 * Отдельный элемент цвета — мемоизирован, чтобы перерисовываться только при изменении пропа `color`.
 * Потребляет контекст локально, чтобы родитель оставался стабильным.
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
 * `RenderColorPalette` — мемоизированный родительский компонент
 * - отображает `colors` как список `ColorItem`, используя `useMemo`, чтобы не пересоздавать массив при каждом рендере
 * - использует строку цвета в качестве `key`, чтобы избежать перерисовок из‑за индексных ключей
 */
const RenderColorPalette: React.FC<Props> = ({ colors }) => {
  if (!colors || colors.length === 0) return null;
  useEffect(() => {
    if (!colors) return;
    // console.log("<=🎨🎨🎨==colors===>", colors);
  }, [colors]);
  // мемоизируем отрендеренный список, чтобы он менялся только при изменении `colors`
  const items = useMemo(
    () => colors.map((value) => <ColorItem key={value} color={value} />),
    [colors],
  );

  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 mb-4 border border-slate-200">
      <BlockHeader icon={"🎨"} text="Color Palette" />
      <div className="flex flex-wrap gap-2" role="list">
        {items}
      </div>
    </div>
  );
};

export default memo(RenderColorPalette);
