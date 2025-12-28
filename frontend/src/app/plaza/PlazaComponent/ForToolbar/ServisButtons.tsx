"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { useStateContext } from "@/providers/StateProvider";
import jsonToHtml from "@/utils/plaza/jsonToHtml";
import Image from "next/image";
import EditModeIcon from "@/components/icons/EditModeIcon";
import ClearIcon from "@/components/icons/ClearIcon";
import СhevronLeft from "@/components/icons/СhevronLeft";
import СhevronRight from "@/components/icons/СhevronRight";
import SundboxIcon from "@/components/icons/SundboxIcon";
import { useHtmlFromJson } from "@/hooks/useHtmlFromJson";
import { useScssFromJson } from "@/hooks/useScssFromJson";
export default function ServisButtons({ resetAll, setEditMode, editMode }) {
  const {
    htmlJson,
    setModalMessage,
    undo,
    redo,
    undoStack,
    redoStack,
    HTML,
    SCSS,
    setHtmlJson,
  } = useStateContext();
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨ хук ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const { createHtml } = useHtmlFromJson();
  const { createSCSS } = useScssFromJson();
  // ----------
  const SERVICE_TEXTS = [
    "section",
    "container",
    "flex row",
    "flex col",
    "link",
    "span",
    "div",
    "div__wrap",
    "a",
    "button",
    "ul",
    "flex",
    "ul flex row",
    "ul flex col",

    "li",
    "nav",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "legend",
    "article",
    "aside",
    "fieldset",
    "form",
    "header",
    "ol",
    "option",
    "optgroup",
    "select",
    "imgs",
    "img",
    "img-container",
    "img container",
    "hero__wrap",
    "hero__title",
    "hero__content",
    "hero img",
    "hero__img",
    "hero__info",
    "hero__items",
    "slotes",
    "slotes__wrap",
    "slotes__title",
    "slotes__title title",
    "slotes__cards",
    "slotes__cards cards",
    "cards__card",
    "cards__card card",
    "card__title",
    "card__button",
  ];
  // ----------
  function cleanServiceTexts() {
    const serviceSet = new Set(
      SERVICE_TEXTS.map((t) => t.trim().toLowerCase()),
    );

    function walk(node) {
      if (!node || typeof node !== "object") return node;

      let nextText = node.text;

      if (typeof node.text === "string") {
        const normalizedText = node.text.trim().toLowerCase();
        if (serviceSet.has(normalizedText)) {
          nextText = "";
        }
      }

      let nextChildren = node.children;
      if (Array.isArray(node.children)) {
        nextChildren = node.children.map(walk);
      }

      return {
        ...node,
        text: nextText,
        children: nextChildren,
      };
    }

    if (Array.isArray(htmlJson)) {
      setHtmlJson(htmlJson.map(walk));
    } else {
      setHtmlJson(walk(htmlJson));
    }
  }
  const createPug = async () => {
    if (htmlJson) {
      const { pug } = jsonToHtml(htmlJson);
      console.log("<==== pug ====>", pug);
      try {
        await navigator.clipboard.writeText(pug);
        setModalMessage("Pug copied!");
      } catch {
        setModalMessage("Failed to copy");
      }
    }
  };
  return (
    <nav className="flex  items-center  gap-2">
      <button
        className={`btn-teal center  ${editMode ? "teal-500 " : " "}`}
        type="button"
        onClick={() => setEditMode((prev) => !prev)}
      >
        <EditModeIcon></EditModeIcon>
      </button>
      <button
        className="btn-teal   disabled:opacity-50"
        type="button"
        onClick={undo}
        disabled={undoStack.length === 0}
      >
        <СhevronLeft width={12} height={14} />
      </button>
      <button
        className="btn-teal    disabled:opacity-50 "
        type="button"
        onClick={redo}
        disabled={redoStack.length === 0}
      >
        <СhevronRight width={12} height={14} />
      </button>
      <button
        className="btn-teal  flex items-center  !gap-2 "
        type="button"
        onClick={() => cleanServiceTexts()}
      >
        <ClearIcon />
        <p className="!text-[12px] !lh-0">servises texts</p>
      </button>
      <button
        className="btn-teal center text-[12px] px-2 "
        onClick={() => {
          createHtml();
          createSCSS();
        }}
      >
        ⏩ <SundboxIcon /> {/*To Sandbox ⇨*/}
      </button>

      <button
        className="btn btn-allert !py-1"
        type="button"
        onClick={() => {
          resetAll();
        }}
      >
        <ClearIcon />
      </button>
      <div className="w-[1px] h-[25px] bg-slate-300"> </div>
      <button
        className="btn-teal center "
        type="button"
        onClick={async () => {
          createHtml();
          try {
            await navigator.clipboard.writeText(HTML);
            setModalMessage("HTML copied!");
          } catch {
            setModalMessage("Failed to copy");
          }
        }}
      >
        <Image src="/svg/html.svg" alt="copy" width={16} height={16} />
      </button>
      <button
        className="btn-teal center "
        type="button"
        onClick={async () => {
          createSCSS();
          try {
            await navigator.clipboard.writeText(SCSS);
            setModalMessage("SCSS copied!");
          } catch {
            setModalMessage("Failed to copy");
          }
        }}
      >
        <Image src="/svg/scss.svg" alt="copy" width={16} height={16} />
      </button>
      <button
        className="btn-teal center"
        type="button"
        onClick={() => createPug()}
      >
        <Image src="/svg/pug.svg" alt="copy" width={16} height={16} />
      </button>
    </nav>
  );
}
