"use client";
import React, { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import inlineStyleStringToObject from "@/app/design/inlineStyleStringToObject";
import ClearIcon from "@/components/icons/ClearIcon";
import { Colors } from "@/app/plaza/forStyleComponent/Colors";
import { motion, AnimatePresence } from "framer-motion";

type HtmlNode = {
  tag: string;
  text?: string;
  class?: string;
  style?: string;
  attributes?: Record<string, string>;
  children?: HtmlNode[] | string;
  _key?: string;
};

type Text = {
  class: string;
  style: string; // строка для HTML/экспорта
  reactStyle: React.CSSProperties; // объект для JSX
  content: string;
};

const BASE_STYLE = "padding: 2px 4px; border: 1px solid #adadad;";
const CONTENT = "The quick brown fox jumps over the lazy dog.";

const DEFAULTS = [
  "font-size:12px;  color:var(--grey-100); font-weight:300; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:14px; color:var(--grey-100); font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:16px; color:var(--grey-100); font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:18px; color:var(--grey-100); font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:20px; color:var(--grey-100); font-weight:500; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:22px; color:var(--grey-100); font-weight:600; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:24px; color:var(--grey-100); font-weight:700; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:26px; color:var(--grey-100); font-weight:800; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:28px; color:var(--grey-100); font-weight:800; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:30px; color:var(--grey-100); font-weight:900; line-height:1; font-family:'Montserrat', sans-serif;",
];

export default function DesigntTextNodes() {
  const { updateHtmlJson } = useStateContext();

  const [codeCssList, setCodeCssList] = useState<string[]>(DEFAULTS);
  const [texts, setTexts] = useState<(Text | null)[]>(Array(10).fill(null));

  // модалка для выбора цвета текста
  const [openColorModal, setOpenColorModal] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState<number | null>(null);

  function buildText(className: string, css: string): Text {
    const styleParts = [BASE_STYLE, css].filter(Boolean).join(" ");
    const styleObject = inlineStyleStringToObject(styleParts);

    return {
      class: className,
      style: styleParts,
      reactStyle: styleObject,
      content: CONTENT,
    };
  }

  function generateTextNode(className: string, css: string): HtmlNode {
    const styleParts = [BASE_STYLE, css].filter(Boolean).join(" ");

    return {
      tag: "p",
      text: CONTENT,
      class: className,
      style: styleParts,
      children: [],
    };
  }

  const handleTextClick = (index: number) => {
    const css = codeCssList[index];
    if (!css) return;

    const className = `text${index + 1}`;

    const newText = buildText(className, css);
    setTexts((prev) => {
      const copy = [...prev];
      copy[index] = newText;
      return copy;
    });

    const node = generateTextNode(className, css);
    const result = ensureNodeKeys([node]);
    updateHtmlJson(result);
  };

  const handleChangeCss = (index: number, value: string) => {
    setCodeCssList((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });

    setTexts((prev) => {
      const existing = prev[index];
      if (!existing) return prev; // текст ещё не создан кнопкой

      const className = `text${index + 1}`;
      const updated = buildText(className, value);

      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  };

  const handleClear = (index: number) => {
    setCodeCssList((prev) => {
      const copy = [...prev];
      copy[index] = "";
      return copy;
    });
    setTexts((prev) => {
      const copy = [...prev];
      copy[index] = null;
      return copy;
    });
  };

  const updateColorInCss = (cssString: string, newColor: string): string => {
    if (!cssString || !cssString.trim()) {
      return `color:${newColor};`;
    }

    const colorRegex = /color\s*:\s*[^;]+;?/i;

    if (colorRegex.test(cssString)) {
      return cssString.replace(colorRegex, `color:${newColor};`);
    }

    const trimmed = cssString.trim();
    const withSemicolon = trimmed.endsWith(";") ? trimmed : trimmed + ";";
    return `${withSemicolon} color:${newColor};`;
  };

  const handlePickColorFromModal = (value: string) => {
    if (currentTextIndex === null) return;

    const currentCss = codeCssList[currentTextIndex];
    const nextCss = updateColorInCss(currentCss, value);

    // только меняем css
    handleChangeCss(currentTextIndex, nextCss);

    // НЕ вызываем handleTextClick здесь
    // handleTextClick(currentTextIndex);

    setOpenColorModal(false);
    setCurrentTextIndex(null);
  };

  return (
    <div className="space-y-2 relative">
      {/* Модалка с палитрой для текстов */}
      <AnimatePresence>
        {openColorModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.25, 0.8, 0.5, 1] }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.9)] p-4"
          >
            <button
              className="absolute top-2 right-2 cursor-pointer"
              onClick={() => {
                setOpenColorModal(false);
                setCurrentTextIndex(null);
              }}
            >
              <ClearIcon width={24} height={24} />
            </button>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] mt-4 w-full gap-2">
              {[
                "neutral",
                "red",
                "orange",
                "yellow",
                "green",
                "cyan",
                "blue",
                "purple",
                "brown",
              ].map((groupName) => (
                <div key={groupName} className="flex flex-col gap-0">
                  {Colors.filter((c) => c.group === groupName).map((color) => (
                    <button
                      key={color.color}
                      className="btn font-bold !py-0.5 !px-1 rounded !justify-start"
                      style={{ color: color.value }}
                      onClick={() => handlePickColorFromModal(color.value)}
                    >
                      <span
                        style={{ backgroundColor: color.value }}
                        className="w-6 h-6 mr-2 inline-block rounded-full"
                      />
                      {color.color}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {Array.from({ length: 10 }).map((_, index) => {
        const text = texts[index];
        const className = `text${index + 1}`;
        const css = codeCssList[index];

        return (
          <div key={className} className="mt-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleTextClick(index)}
                className="btn btn-empty px-1 max-h-8"
              >
                {className}
              </button>

              {/* Кнопка открытия модалки выбора цвета для этого текста */}
              <button
                type="button"
                className="btn btn-empty px-2 max-h-8"
                onClick={() => {
                  setCurrentTextIndex(index);
                  setOpenColorModal(true);
                }}
              >
                color
              </button>

              <textarea
                className="w-full text-[12px] bg-slate-900 text-slate-200 rounded px-2 py-1 overflow-x-auto resize-none"
                rows={1}
                value={css}
                onChange={(e) => handleChangeCss(index, e.target.value)}
              />
              <button
                className="btn btn-empty w-6 h-6 p-1"
                onClick={() => handleClear(index)}
              >
                <ClearIcon width={16} height={16} />
              </button>
            </div>

            {text && (
              <p className="bg-[var(--grey-20)] mt-1" style={text.reactStyle}>
                {text.content}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
