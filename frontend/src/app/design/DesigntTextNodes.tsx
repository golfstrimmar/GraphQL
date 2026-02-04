"use client";
import React, { useState, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import inlineStyleStringToObject from "@/app/design/inlineStyleStringToObject";
import ClearIcon from "@/components/icons/ClearIcon";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
import CreateIcon from "@/components/icons/CreateIcon";
import CloseIcon from "@/components/icons/CloseIcon";
import { designText } from "@/types/DesignSystem";
import { divide } from "lodash";
const ModalColor = dynamic(() => import("./ModalColor"), {
  ssr: false,
  loading: () => <Loading />,
});
const ModalFont = dynamic(() => import("./ModalFont"), {
  ssr: false,
  loading: () => <Loading />,
});
const ModalTag = dynamic(() => import("./ModalTag"), {
  ssr: false,
  loading: () => <Loading />,
});

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

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function DesigntTextNodes({ resetAll, texts, setTexts }) {
  //--- стили узлов здесь отдельно
  const [codeCssList, setCodeCssList] = useState<string[]>(DEFAULTS);
  //---  сами узлы

  const [openTagModal, setOpenTagModal] = useState<boolean>(false);
  // --- модалка для выбора цвета текста
  const [openColorModal, setOpenColorModal] = useState<boolean>(false);
  const [currentTextIndex, setCurrentTextIndex] = useState<number | null>(null);

  // --- модалка для выбора шрифта текста
  const [openFontModal, setOpenFontModal] = useState<boolean>(false);

  useEffect(() => {
    if (!texts) return;
    console.log("<=🧻🧻🧻==texts===>", texts);
  }, [texts]);
  // ----- изменение текста в массиве текстов
  const handleTextClick = (idx: number) => {
    const newText = {
      tagName: texts[idx]?.tagName || "",
      className: `text${idx + 1}`,
      style: DEFAULTS[idx],
    };
    setTexts((prev) => {
      let copy = [...prev];
      copy = copy.map((item, i) => {
        if (i === idx) {
          return newText;
        }
        return item;
      });
      return copy;
    });
    setCurrentTextIndex(idx);
  };
  // -----редактирование стилей текстовой ноды
  const handleChangeCss = (idx: number, value: string) => {
    const newText = {
      tagName: texts[idx].tagName || "",
      className: texts[idx].className || "",
      style: value,
    };
    setTexts((prev) => {
      let updated = [...prev];
      updated = updated.map((item, i) => {
        if (i === idx) {
          return newText;
        }
        return item;
      });
      return updated;
    });
  };
  // -----очищение строки стилей и удаление текста
  const handleClear = (idx: number) => {
    setTexts((prev) => {
      let copy = [...prev];
      copy = copy.map((item, i) => {
        if (i === idx) {
          return null;
        }
        return item;
      });
      return copy;
    });
  };
  //---------

  // --------------
  return (
    <div className="space-y-2 relative">
      <button
        className="btn btn-empty w-6 h-6 p-1 "
        onClick={() => {
          resetAll();
          setTexts(Array(10).fill(null));
        }}
      >
        <ClearIcon width={16} height={16} />
      </button>
      {/* Модалка с тегами */}
      <ModalTag
        openTagModal={openTagModal}
        setOpenTagModal={setOpenTagModal}
        setCurrentTextIndex={setCurrentTextIndex}
        currentTextIndex={currentTextIndex}
        setTexts={setTexts}
      />
      {/* Модалка с палитрой для текстов */}
      <ModalColor
        setOpenColorModal={setOpenColorModal}
        setCurrentTextIndex={setCurrentTextIndex}
        currentTextIndex={currentTextIndex}
        texts={texts}
        openColorModal={openColorModal}
        handleChangeCss={handleChangeCss}
      />
      {/* Модалка для выбора шрифта текста */}
      <ModalFont
        openFontModal={openFontModal}
        setOpenFontModal={setOpenFontModal}
        setCurrentTextIndex={setCurrentTextIndex}
        currentTextIndex={currentTextIndex}
        texts={texts}
        handleChangeCss={handleChangeCss}
      />

      {/*-----------------*/}
      {texts.map((text, index) => {
        const tagName = text?.tagName || "";
        const className = text?.className || "";
        const css = text?.style || DEFAULTS[index];
        const styleParts = [text?.style].filter(Boolean).join(" ");
        const reactStyle = inlineStyleStringToObject(styleParts);
        return (
          <div
            key={index}
            className="mt-2  p-1 border border-[var(--teal)] rounded"
          >
            <div className="flex items-center gap-1">
              {/*изменение  текста в массиве текстов*/}
              <button
                type="button"
                onClick={() => handleTextClick(index)}
                className="btn btn-teal  px-1.5 text-[12px]   text-white  "
                style={{ width: "max-content" }}
                disabled={className !== ""}
              >
                {className ? (
                  className
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="rotate-[45deg]">
                      <CloseIcon width={8} height={8} />
                    </span>{" "}
                    class
                  </div>
                )}
              </button>
              {/* изменение тэга  */}
              <button
                type="button"
                className={`${texts[index] === null ? "opacity-70" : "opacity-100 "}
                 ${tagName ? "text-white" : ""} btn btn-empty px-0.5  min-w-[max-content] w-[max-content] text-sm`}
                onClick={() => {
                  setCurrentTextIndex(index);
                  setOpenTagModal(true);
                }}
                disabled={texts[index] === null}
              >
                {tagName ? texts[index].tagName : "tag"}
              </button>
              <hr className="bg-amber-50 w-[1px] h-[22px] mx-2" />
              {/* изменение цвета  */}
              <button
                type="button"
                className={`${texts[index] === null ? "opacity-70" : "opacity-100"} btn btn-empty px-0.5  text-sm  min-w-[max-content] w-[max-content]`}
                onClick={() => {
                  setCurrentTextIndex(index);
                  setOpenColorModal(true);
                }}
                disabled={texts[index] === null}
              >
                color
              </button>
              {/* изменение шрифта */}
              <button
                type="button"
                className={`${texts[index] === null ? "opacity-70" : "opacity-100"} btn  text-sm btn-empty px-2 max-h-8`}
                onClick={() => {
                  setCurrentTextIndex(index);
                  setOpenFontModal(true);
                }}
                disabled={texts[index] === null}
              >
                font
              </button>
              {/*определение стилей текста вручную*/}
              <textarea
                className={`${texts[index] === null ? "opacity-40" : "opacity-100"} w-full text-[12px] bg-slate-900 text-slate-200 rounded px-2 py-1 overflow-x-auto resize-none`}
                rows={1}
                value={css}
                onChange={(e) => handleChangeCss(index, e.target.value)}
                disabled={texts[index] === null}
              />

              {/*очищение строки стилей и удаление текста*/}
              <button
                className={`${texts[index] === null ? "opacity-40" : "opacity-100"} btn btn-empty w-6 h-6 p-1`}
                onClick={() => handleClear(index)}
                disabled={texts[index] === null}
              >
                <ClearIcon width={16} height={16} />
              </button>
            </div>
            {text && (
              <p className="bg-[var(--grey-20)] mt-2" style={reactStyle}>
                {CONTENT}
              </p>
            )}
          </div>
        );
      })}
      {/*-----------------*/}
      <button
        onClick={() => {
          const newText = {
            tagName: "p",
            className: `text${texts.length + 1}`,
            style:
              "font-size:20px; color:#000000; font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;",
          };
          setTexts([...texts, newText]);
        }}
        className="btn btn-teal"
      >
        <span className="rotate-[45deg]">
          <CloseIcon width={8} height={8} />
        </span>
      </button>
    </div>
  );
}
