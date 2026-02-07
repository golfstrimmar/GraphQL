"use client";
import React, { useState } from "react";
import inlineStyleStringToObject from "@/app/design/inlineStyleStringToObject";
import ClearIcon from "@/components/icons/ClearIcon";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
import AddIcon from "@/components/icons/AddIcon";
const ModalColor = dynamic(() => import("./ModalColor"), {
  ssr: false,
  loading: () => <Loading />,
});
const ModalFont = dynamic(() => import("./ModalFont"), {
  ssr: false,
  loading: () => <Loading />,
});

const CONTENT = "The quick brown fox jumps over the lazy dog.";

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function DesignButtons({ dBT, resetAll, setButtons, buttons }) {
  const [currentTextIndex, setCurrentTextIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [openColorModal, setOpenColorModal] = useState<boolean>(false);
  const [openFontModal, setOpenFontModal] = useState<boolean>(false);
  const handleTextClick = (idx) => {
    console.log("<===idx===>", idx);
    const newButton = {
      tagName: buttons[idx]?.tagName || "",
      className: `button${idx + 1}`,
      style: dBT[idx],
    };
    setButtons((prev) => {
      let copy = [...prev];
      copy = copy.map((item, i) => {
        if (i === idx) {
          return newButton;
        }
        return item;
      });
      return copy;
    });
    setCurrentTextIndex(idx);
  };
  // -----редактирование стилей текстовой ноды
  const handleChangeCss = (idx: number, value: string) => {
    const newButton = {
      tagName: buttons[idx].tagName || "",
      className: buttons[idx].className || "",
      style: value,
    };
    setButtons((prev) => {
      let updated = [...prev];
      updated = updated.map((item, i) => {
        if (i === idx) {
          return newButton;
        }
        return item;
      });
      return updated;
    });
  };
  // -----очищение строки стилей и удаление текста
  const handleClear = (idx: number) => {
    setButtons((prev) => {
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
      {/*-----------------*/}
      {/* Модалка с палитрой для текстов */}
      <ModalColor
        setOpenColorModal={setOpenColorModal}
        setCurrentTextIndex={setCurrentTextIndex}
        currentTextIndex={currentTextIndex}
        texts={null}
        buttons={buttons}
        openColorModal={openColorModal}
        handleChangeCss={handleChangeCss}
      />
      {/* Модалка для выбора шрифта текста */}
      <ModalFont
        openFontModal={openFontModal}
        setOpenFontModal={setOpenFontModal}
        setCurrentTextIndex={setCurrentTextIndex}
        currentTextIndex={currentTextIndex}
        texts={null}
        buttons={buttons}
        handleChangeCss={handleChangeCss}
      />
      {buttons.map((button, index) => {
        const className = button?.className || "";
        const buttonScss = button?.style || dBT[index];
        const styleParts = [button?.style].filter(Boolean).join(" ");
        const reactStyle = inlineStyleStringToObject(styleParts);

        const isHovered = hoverIndex === index;
        const isActive = activeIndex === index;
        const style = {
          ...reactStyle.base,
          ...(isHovered ? reactStyle.hover : {}),
          ...(isActive ? reactStyle.active : {}),
        };
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
                    {/*<span className="rotate-[45deg]">*/}
                    <AddIcon width={18} height={18} />
                    {/*</span>{" "}*/}
                    class
                  </div>
                )}
              </button>
              <hr className="bg-amber-50 w-[1px] h-[22px] mx-2" />
              {/* изменение цвета  */}
              <button
                type="button"
                className={`${buttons[index] === null ? "opacity-70" : "opacity-100"} btn btn-empty px-0.5  text-sm  min-w-[max-content] w-[max-content]`}
                onClick={() => {
                  setCurrentTextIndex(index);
                  setOpenColorModal(true);
                }}
                disabled={buttons[index] === null}
              >
                color
              </button>
              {/* изменение шрифта */}
              <button
                type="button"
                className={`${buttons[index] === null ? "opacity-70" : "opacity-100"} btn  text-sm btn-empty px-2 max-h-8`}
                onClick={() => {
                  setCurrentTextIndex(index);
                  setOpenFontModal(true);
                }}
                disabled={buttons[index] === null}
              >
                font
              </button>
              {/*определение стилей текста вручную*/}
              <textarea
                className={`${buttons[index] === null ? "opacity-40" : "opacity-100"} w-full text-[12px] bg-slate-900 text-slate-200 rounded px-2 py-1 overflow-x-auto resize-none`}
                rows={1}
                value={buttonScss}
                onChange={(e) => handleChangeCss(index, e.target.value)}
                disabled={buttons[index] === null}
              />

              {/*очищение строки стилей и удаление текста*/}
              <button
                className={`${buttons[index] === null ? "opacity-40" : "opacity-100"} btn btn-empty w-6 h-6 p-1`}
                onClick={() => handleClear(index)}
                disabled={buttons[index] === null}
              >
                <ClearIcon width={16} height={16} />
              </button>
            </div>
            {button && (
              <button
                className="mt-2"
                style={style}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => {
                  setHoverIndex(null);
                  setActiveIndex(null);
                }}
                onMouseDown={() => setActiveIndex(index)}
                onMouseUp={() => setActiveIndex(null)}
              >
                {CONTENT}
              </button>
            )}
          </div>
        );
      })}
      {/*-----------------*/}
      <button
        onClick={() => {
          const newButton = {
            tagName: "button",
            className: `button${buttons.length + 1}`,
            style:
              "font-size:20px; color:#000000; font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;",
          };
          setButtons([...buttons, newButton]);
        }}
        className="btn btn-teal"
      >
        <AddIcon width={18} height={18} />
      </button>
    </div>
  );
}
