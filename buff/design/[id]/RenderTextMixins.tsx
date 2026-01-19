"use client";
import React, { memo, useMemo, useCallback } from "react";
import { useStateContext } from "@/providers/StateProvider";
import BlockHeader from "./BlockHeader";
type TextNode = {
  mixin: string;
  fontFamily: string;
  fontWeight: number | string;
  fontSize: string | number;
  color: string;
};

interface RenderScssMixinsProps {
  colors?: string[];
}

/**
 * Утилита: построить стабильное отображение значения цвета -> имени переменной
 */
const buildColorVars = (colors?: string[]) => {
  if (!colors || colors.length === 0) return [];
  return colors.map((value, idx) => ({
    name: `$color-${idx + 1}`,
    value,
  }));
};

/**
 * Одна карточка миксина — мемоизирована, чтобы избегать перерендеров при стабильных пропсах.
 * Не использует контекст напрямую; действия (копирование) предоставляет родитель.
 */
const MixinItem: React.FC<{
  mixinKey: string;
  node: TextNode;
  getVarName: (colorValue: string) => string;
  onCopy: (text: string) => void;
}> = memo(({ mixinKey, node, getVarName, onCopy }) => {
  const colorVariable = getVarName(node.color);
  const scssMixin = `@mixin ${node.mixin} {
  font-family: "${node.fontFamily}", sans-serif;
  font-weight: ${node.fontWeight};
  font-size: ${node.fontSize};
  color: ${colorVariable};
}`;

  const handleCopy = useCallback(() => {
    onCopy(scssMixin);
  }, [onCopy, scssMixin]);

  return (
    <div
      key={mixinKey}
      className="group border border-slate-200 relative bg-slate-900 rounded p-1 transition-all overflow-hidden cursor-pointer"
    >
      <button
        onClick={handleCopy}
        className="px-1 py-1 text-xs font-medium hover:text-[var(--teal)] border border-[var(--teal)] bg-slate-700 rounded transition-colors opacity-20 group-hover:opacity-100 absolute top-1 right-1"
        type="button"
      >
        Copy
      </button>

      <pre className="text-sm font-mono text-slate-100 overflow-x-auto">
        <code>{scssMixin}</code>
      </pre>
    </div>
  );
});
MixinItem.displayName = "MixinItem";

/**
 * Кнопка «Копировать всё» — мемоизирована; родитель передаёт обработчик копирования и текст текущих элементов.
 */
const CopyAllButton: React.FC<{
  text: string;
  onCopyAll: (text: string) => void;
}> = memo(({ text, onCopyAll }) => {
  const handle = useCallback(() => {
    if (!text) return;
    onCopyAll(text);
  }, [onCopyAll, text]);

  return (
    <button
      onClick={handle}
      className="btn btn-teal h-[max-content]"
      type="button"
    >
      Copy All
    </button>
  );
});
CopyAllButton.displayName = "CopyAllButton";

/**
 * Главный компонент — мемоизированный экспорт. Вычисляет уникальные миксины и SCSS-строки
 * с помощью `useMemo` и мемоизирует обработчики через `useCallback`.
 */
const RenderScssMixins: React.FC<RenderScssMixinsProps> = ({ colors }) => {
  const { texts, setModalMessage } = useStateContext();

  // Если тексты недоступны или пусты — нечего рендерить
  const textNodes = (texts as unknown as TextNode[]) ?? [];

  // уникальные миксины, дедуплированные по имени миксина
  const uniqueMixins = useMemo(() => {
    const acc: Record<string, TextNode> = {};
    for (const el of textNodes) {
      const key = `${el.mixin}`;
      if (!acc[key]) acc[key] = el;
    }
    return Object.values(acc);
  }, [textNodes]);

  const colorVars = useMemo(() => buildColorVars(colors), [colors]);

  // быстрый поиск value -> varName
  const getVarName = useCallback(
    (colorValue: string) => {
      const found = colorVars.find((v) => v.value === colorValue);
      return found ? found.name : colorValue;
    },
    [colorVars],
  );

  // подготавливаем текст всех миксинов для «Копировать всё»
  const allMixinsText = useMemo(() => {
    const mixinStrings = uniqueMixins.map((el) => {
      const colorVariable = getVarName(el.color);
      return `@mixin ${el.mixin} {
  font-family: "${el.fontFamily}", sans-serif;
  font-weight: ${el.fontWeight};
  font-size: ${el.fontSize};
  color: ${colorVariable};
}`;
    });
    return mixinStrings.join("\n\n");
  }, [uniqueMixins, getVarName]);

  // обработчик копирования одного миксина
  const onCopyMixin = useCallback(
    (text: string) => {
      if (!navigator?.clipboard) {
        setModalMessage?.("Clipboard not available");
        return;
      }
      navigator.clipboard
        .writeText(text)
        .then(() => setModalMessage?.("Mixin copied!"))
        .catch(() => setModalMessage?.("Failed to copy mixin"));
    },
    [setModalMessage],
  );

  // обработчик копирования всех миксинов
  const onCopyAll = useCallback(
    (text: string) => {
      if (!navigator?.clipboard || !text) {
        setModalMessage?.("Clipboard not available");
        return;
      }
      navigator.clipboard
        .writeText(text)
        .then(() => setModalMessage?.("All mixins copied!"))
        .catch(() => setModalMessage?.("Failed to copy all mixins"));
    },
    [setModalMessage],
  );

  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 mb-4">
      <div className="flex  justify-between ">
        <BlockHeader icon={"🎨"} text="Text Mixins" />
        <CopyAllButton text={allMixinsText} onCopyAll={onCopyAll} />
      </div>

      <div className="mb-4 grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-2">
        {uniqueMixins.map((el, idx) => (
          <MixinItem
            key={idx}
            mixinKey={el.mixin}
            node={el}
            getVarName={getVarName}
            onCopy={onCopyMixin}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(RenderScssMixins);
