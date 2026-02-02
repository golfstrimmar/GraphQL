"use client";
import React, { useState, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import inlineStyleStringToObject from "@/app/design/inlineStyleStringToObject";
import ClearIcon from "@/components/icons/ClearIcon";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
import { designText } from "@/types/DesignSystem";
const ModalColor = dynamic(() => import("./ModalColor"), {
  ssr: false,
  loading: () => <Loading />,
});
const ModalFont = dynamic(() => import("./ModalFont"), {
  ssr: false,
  loading: () => <Loading />,
});

type Text = {
  tag: string;
  class: string;
  style: string;
  reactStyle: React.CSSProperties;
  content: string;
};

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

// ----🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default function DesigntTextNodes() {
  const { designTexts, setDesignTexts } = useStateContext();

  //--- стили узлов здесь отдельно
  const [codeCssList, setCodeCssList] = useState<string[]>(DEFAULTS);
  //---  сами узлы
  const [texts, setTexts] = useState<(Text | null)[]>(Array(10).fill(null));
  // --- модалка для выбора цвета текста
  const [openColorModal, setOpenColorModal] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState<number | null>(null);

  // --- модалка для выбора шрифта текста
  const [openFontModal, setOpenFontModal] = useState(false);

  // ---
  useEffect(() => {
    if (!designTexts) return;
    console.log("<===designTexts===>", designTexts);
  }, [designTexts]);
  useEffect(() => {
    if (!texts) return;
    console.log("<=🧻🧻🧻==texts===>", texts);
  }, [texts]);

  // --------- обновление текстов по изменению designTexts
  useEffect(() => {
    if (designTexts.length === 0) {
      setCodeCssList(DEFAULTS);
      setTexts([]);
      return;
    }
    // 1) Обновляем codeCssList по номеру из class (textN),
    //    а не просто по индексу
    setCodeCssList((prev) => {
      const copy = [...prev];

      designTexts.forEach((dt: designText) => {
        if (!dt) return;
        const numStr = (dt.class || "").replace(/^text(\d+)$/, "$1");
        const num = Number(numStr);
        if (!Number.isFinite(num) || num <= 0) return;

        const index = num - 1;
        if (index < copy.length) {
          const css = (dt.style || "").trim();
          copy[index] = css;
        }
      });

      return copy;
    });

    // 2) Восстанавливаем texts ТАК ЖЕ по номеру из class
    setTexts(() => {
      const arr: (Text | null)[] = Array(10).fill(null);

      designTexts.forEach((dt) => {
        if (!dt) return;

        const numStr = (dt.class || "").replace(/^text(\d+)$/, "$1");
        const num = Number(numStr);
        if (!Number.isFinite(num) || num <= 0) return;

        const index = num - 1;
        if (index >= arr.length) return;
        const tagName = dt.tag || "p";
        const className = dt.class || `text${index + 1}`;
        const styleParts = [dt.style].filter(Boolean).join(" ");
        const reactStyle = inlineStyleStringToObject(styleParts);

        arr[index] = {
          tag: tagName,
          class: className,
          style: styleParts,
          reactStyle,
          content: CONTENT,
        };
      });

      return arr;
    });
  }, [designTexts]);

  // -----главная функция формирования текстоа
  function buildText(className: string, css: string): Text {
    const styleParts = [css].filter(Boolean).join(" ");
    const styleObject = inlineStyleStringToObject(styleParts); //для react - отобраение текста здесь

    return {
      tag: "p",
      class: className,
      style: styleParts,
      reactStyle: styleObject,
      content: CONTENT,
    };
  }

  // ----- изменение текста в массиве текстов
  const handleTextClick = (tagName: string, i) => {
    // const safeNumber = (foo: string) => {
    //   const numStr = foo.replace(/^text(\d+)$/, "$1");
    //   const num = Number(numStr);
    //   return isNaN(num) ? 0 : num;
    // };

    // const index = safeNumber(className);
    const css = codeCssList[i];
    if (!css) return;

    // const newText = buildText(tagName, className, css);

    // ✅ всё внутри обработчика, не в рендере
    // setTexts((prev) => {
    //   const updated = [...prev];
    //   updated[i] = newText;

    //   // setDesignTexts(
    //   //   updated
    //   //     .filter((item): item is Text => item !== null)
    //   //     .map((item) => ({
    //   //       tag: item.tag,
    //   //       class: item.class,
    //   //       style: item.style,
    //   //     })),
    //   // );

    //   return updated;
    // });
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

      // setDesignTexts(
      //   copy
      //     .filter((item): item is Text => item !== null)
      //     .map((item) => ({
      //       tag: item.tagName,
      //       className: item.className,
      //       style: item.style,
      //     })),
      // );
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
  //---------
  return (
    <div className="space-y-2 relative">
      {/* Модалка с палитрой для текстов */}
      <ModalColor
        setOpenColorModal={setOpenColorModal}
        setCurrentTextIndex={setCurrentTextIndex}
        currentTextIndex={currentTextIndex}
        codeCssList={codeCssList}
        openColorModal={openColorModal}
        handleChangeCss={handleChangeCss}
      />
      {/* Модалка для выбора шрифта текста */}
      <ModalFont
        openFontModal={openFontModal}
        setOpenFontModal={setOpenFontModal}
        setCurrentTextIndex={setCurrentTextIndex}
        currentTextIndex={currentTextIndex}
        codeCssList={codeCssList}
        handleChangeCss={handleChangeCss}
      />

      {/*-----------------*/}
      {Array.from({ length: 10 }).map((_, index) => {
        const text = texts[index];
        // const tagName = text?.tag || "p";
        // const className = `text${index + 1}`;
        // const css = codeCssList[index];

        return (
          <div key={className} className="mt-1">
            <div className="flex items-center gap-1">
              {/*изменение  текста в массиве текстов*/}
              <button
                type="button"
                onClick={() => handleTextClick(index)}
                className="btn btn-empty px-1 max-h-8"
              >
                {className}
              </button>

              {/*<input
                className="text-gray-500 min-w-[50px] border-slate-300 border-solid border-2 rounded-md"
                value={tagName}
                onChange={(e) => {
                  setTexts((prevTexts) => {
                    const updatedTexts = [...prevTexts];
                    updatedTexts[index] = {
                      ...updatedTexts[index],
                      tag: e.target.value,
                    };
                    return updatedTexts;
                  });
                }}
              />*/}
              {/* изменение цвета для этого текста */}
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
              {/* изменение шрифта для этого текста */}
              <button
                type="button"
                className="btn btn-empty px-2 max-h-8"
                onClick={() => {
                  setCurrentTextIndex(index);
                  setOpenFontModal(true);
                }}
              >
                font
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
