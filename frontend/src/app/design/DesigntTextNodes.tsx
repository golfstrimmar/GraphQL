"use client";
import React, { useState, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import inlineStyleStringToObject from "@/app/design/inlineStyleStringToObject";
import ClearIcon from "@/components/icons/ClearIcon";
import { Colors } from "@/app/plaza/forStyleComponent/Colors";
import { motion, AnimatePresence } from "framer-motion";

type Text = {
  class: string;
  style: string; // строка для HTML/экспорта
  reactStyle: React.CSSProperties; // объект для JSX здесь
  content: string;
};
type designText = {
  class: string;
  style: string;
};
const BASE_STYLE = "padding: 2px 4px; border: 1px solid #adadad;";
const CONTENT = "The quick brown fox jumps over the lazy dog.";

const DEFAULTS = [
  "font-size:12px;  color: #000000; font-weight:300; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:14px; color:#000000; font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:16px; color:#000000; font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:18px; color:#000000; font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:20px; color:#000000; font-weight:500; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:22px; color:#000000; font-weight:600; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:24px; color:#000000; font-weight:700; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:26px; color:#000000; font-weight:800; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:28px; color:#000000; font-weight:800; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:30px; color:#000000; font-weight:900; line-height:1; font-family:'Montserrat', sans-serif;",
];

export default function DesigntTextNodes() {
  const { designTexts, setDesignTexts } = useStateContext();

  //--- стили узлов здесь отдельно
  const [codeCssList, setCodeCssList] = useState<string[]>(DEFAULTS);

  //---  сами узлы
  const [texts, setTexts] = useState<(Text | null)[]>(Array(10).fill(null));

  // --- модалка для выбора цвета текста
  const [openColorModal, setOpenColorModal] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState<number | null>(null);

  // ---
  useEffect(() => {
    if (!texts) return;
    console.log("<=🧻🧻🧻==texts===>", texts);
  }, [texts]);

  useEffect(() => {
    if (designTexts.length === 0) {
      setCodeCssList(DEFAULTS);
      setTexts([]);
    }

    const nonEmpty = designTexts.filter(
      (dt) => dt && dt.style && dt.style.trim() !== "",
    );

    setCodeCssList((prev) => {
      const copy = [...prev];
      nonEmpty.forEach((dt, index) => {
        if (index < copy.length) {
          const css = dt.style.replace(BASE_STYLE, "").trim();
          copy[index] = css;
        }
      });
      return copy;
    });

    setTexts(() => {
      const arr: (Text | null)[] = Array(10).fill(null);
      nonEmpty.forEach((dt, index) => {
        if (index < arr.length) {
          const className = dt.class || `text${index + 1}`;
          const styleParts = [BASE_STYLE, dt.style].filter(Boolean).join(" ");
          const reactStyle = inlineStyleStringToObject(styleParts);

          arr[index] = {
            class: className,
            style: styleParts,
            reactStyle,
            content: CONTENT,
          };
        }
      });
      return arr;
    });
  }, [designTexts]);

  // -----главная функция формирования текстоа
  function buildText(className: string, css: string): Text {
    const styleParts = [BASE_STYLE, css].filter(Boolean).join(" ");
    const styleObject = inlineStyleStringToObject(styleParts); //для react - отобраение текста здесь

    return {
      class: className,
      style: styleParts,
      reactStyle: styleObject,
      content: CONTENT,
    };
  }

  // ----- изменение текста в массиве текстов
  const handleTextClick = (index: number) => {
    const css = codeCssList[index];
    if (!css) return;

    const className = `text${index + 1}`;
    const newText = buildText(className, css);

    // Обновляем локальные тексты
    setTexts((prev) => {
      const copy = [...prev];
      copy[index] = newText;
      return copy;
    });

    // Обновляем designTexts на основе актуального массива
    setDesignTexts((prev) => {
      const base = [...texts];
      base[index] = newText;

      const exit = base
        .filter((item): item is Text => item !== null)
        .map((item) => ({
          class: item.class,
          style: item.style,
        }));

      return exit;
    });
  };

  // -----редактирование стилей текстовой ноды
  const handleChangeCss = (index: number, value: string) => {
    setCodeCssList((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });

    setTexts((prev) => {
      const existing = prev[index];
      if (!existing) return prev;

      const className = `text${index + 1}`;
      const updated = buildText(className, value);

      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  };
  // -----очищение строки стилей и удаление текста
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
  //--------- находим цвет в строке css/если есть - меняем. если нет - добавляем
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

    handleChangeCss(currentTextIndex, nextCss);

    setOpenColorModal(false);
    setCurrentTextIndex(null);
  };
  //---------
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
              {/*изменение текста в массиве текстов*/}
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

              {/*определение стилей текста вручную*/}
              <textarea
                className="w-full text-[12px] bg-slate-900 text-slate-200 rounded px-2 py-1 overflow-x-auto resize-none"
                rows={1}
                value={css}
                onChange={(e) => handleChangeCss(index, e.target.value)}
              />

              {/*очищение строки стилей и удаление текста*/}
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
