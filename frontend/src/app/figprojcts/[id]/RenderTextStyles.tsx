"use client";
import React, { useEffect, memo, useCallback, useMemo } from "react";
import { useStateContext } from "@/providers/StateProvider";
import BlockHeader from "./BlockHeader";

type TextNode = {
  text: string;
  fontFamily: string;
  fontWeight: number | string;
  fontSize: number | string;
  color: string;
  mixin: string;
};

const toFontFamily = (fam: string) => `"${fam}", sans-serif`;

/**
 * Одна строка с текстовым стилем. Мемоизирована, чтобы избежать повторных рендеров при неизменных props.
 * Получает обработчики копирования от родителя, чтобы не обращаться к контексту каждый раз.
 */

const TextStyleItem: React.FC<{
  node: TextNode;
  onCopyText: (text: string) => void;
  onCopyMixin: (mixin: string) => void;
}> = memo(({ node, onCopyText, onCopyMixin }) => {
  const style = useMemo(
    () => ({
      fontFamily: toFontFamily(node.fontFamily),
      fontWeight: node.fontWeight,
      fontSize: node.fontSize,
      color: node.color,
    }),
    [node.fontFamily, node.fontWeight, node.fontSize, node.color],
  );

  const handleCopyText = useCallback(
    () => onCopyText(node.text),
    [onCopyText, node.text],
  );
  const handleCopyMixin = useCallback(
    () => onCopyMixin(node.mixin),
    [onCopyMixin, node.mixin],
  );

  return (
    <div
      className="group bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-2 border border-slate-200 hover:shadow-lg hover:border-green-300 transition-all"
      role="listitem"
    >
      <div className="flex items-start gap-2">
        <button
          onClick={handleCopyText}
          className="flex-1 text-left p-2 bg-slate-300 rounded-lg border border-slate-200 hover:border-[var(--teal)] transition-colors relative overflow-hidden group"
          type="button"
        >
          <div className="absolute top-[50%] translate-y-[-50%] right-2 opacity-40 group-hover:opacity-100 transition-opacity ">
            <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              Copy Text
            </div>
          </div>
          <p style={style} className="whitespace-nowrap">
            {node.text}
          </p>
        </button>

        <button
          onClick={handleCopyMixin}
          className="px-4 py-2 rounded-lg border hover:border-[var(--teal)] hover:text-[var(--teal)] transition-colors font-mono text-sm whitespace-nowrap z-50"
          type="button"
        >
          @include {node.mixin};
        </button>
      </div>
    </div>
  );
});
TextStyleItem.displayName = "TextStyleItem";

/**
 * `RenderTextStyles` — мемоизированный родитель.
 * - Помещает тексты в контекст при изменении пропа `textNodes`.
 * - Стабилизирует обработчики копирования с помощью `useCallback` и передаёт их мемоизированным дочерним компонентам.
 * - Избегает индексных ключей, формируя составной стабильный ключ на основе содержимого узла.
 */

const RenderTextStyles: React.FC<{ textNodes?: TextNode[] }> = ({
  textNodes,
}) => {
  const { texts, setModalMessage, setTexts } = useStateContext();

  // Sync incoming prop into provider state (only when prop changes).
  useEffect(() => {
    if (!textNodes) return;
    setTexts(textNodes);
  }, [textNodes, setTexts]);

  useEffect(() => {
    if (!texts) return;
    console.log("<=🟢🟢🟢==texts===>", texts);
  }, [texts]);

  const nodes = texts ?? [];

  const onCopyText = useCallback(
    (text: string) => {
      if (!navigator?.clipboard) {
        setModalMessage?.("Clipboard not available");
        return;
      }
      navigator.clipboard
        .writeText(text)
        .then(() => setModalMessage?.("Text copied!"))
        .catch(() => setModalMessage?.("Failed to copy text"));
    },
    [setModalMessage],
  );

  const onCopyMixin = useCallback(
    (mixin: string) => {
      if (!navigator?.clipboard) {
        setModalMessage?.("Clipboard not available");
        return;
      }
      const text = `@include ${mixin};`;
      navigator.clipboard
        .writeText(text)
        .then(() => setModalMessage?.("Mixin copied!"))
        .catch(() => setModalMessage?.("Failed to copy mixin"));
    },
    [setModalMessage],
  );

  // Memoize rendered items so they only change when nodes or handlers change.
  const items = useMemo(
    () =>
      nodes.map((el, idx) => {
        // Include index to ensure uniqueness for duplicate text/mixin pairs
        const key = `${el.text.slice(0, 40)}::${el.mixin}::${idx}`;
        return (
          <TextStyleItem
            key={key}
            node={el}
            onCopyText={onCopyText}
            onCopyMixin={onCopyMixin}
          />
        );
      }),
    [nodes, onCopyText, onCopyMixin],
  );

  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 mb-4">
      <BlockHeader icon={"🧻"} text="Text Styles" />
      <div className="space-y-3" role="list">
        {items}
      </div>
    </div>
  );
};

export default memo(RenderTextStyles);
