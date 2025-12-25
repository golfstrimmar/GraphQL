"use client";
import React from "react";
import { useStateContext } from "@/providers/StateProvider";
import Image from "next/image";
import EditModeIcon from "@/components/icons/EditModeIcon";
import ClearIcon from "@/components/icons/ClearIcon";
import СhevronLeft from "@/components/icons/СhevronLeft";
import СhevronRight from "@/components/icons/СhevronRight";
import jsonToHtml from "@/utils/plaza/jsonToHtml";
import { useHtmlFromJson } from "@/hooks/useHtmlFromJson";
import { useScssFromJson } from "@/hooks/useScssFromJson";

const PlazaToolbar: React.FC = ({ resetAll, setEditMode, editMode }) => {
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
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨ хук ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const { createHtml } = useHtmlFromJson();
  const { createSCSS } = useScssFromJson();
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const {
    htmlJson,
    setHtmlJson,
    setModalMessage,
    undo,
    redo,
    undoStack,
    redoStack,
    setScssMixVar,
    setHTML,
    setSCSS,
  } = useStateContext();
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
    <div className="flex flex-col items-center gap-2">
      <button
        className="btn btn-allert !gap-2 w-full"
        type="button"
        onClick={() => {
          resetAll();
        }}
      >
        <ClearIcon />
        <span className="text-sm font-medium">Clear</span>
      </button>
      <button
        className="btn-teal w-full px-2  self-end ml-auto !text-[var(--teal)]"
        onClick={() => {
          createHtml();
          createSCSS();
        }}
      >
        To Sandbox ⇨
      </button>
      <button
        className={`btn-teal  w-full ${editMode ? "teal-500 " : " "}`}
        type="button"
        onClick={() => setEditMode((prev) => !prev)}
      >
        <EditModeIcon></EditModeIcon>
        <span className="text-sm font-medium">Edit Mode</span>
      </button>
      <div className="grid grid-cols-2 gap-1">
        <button
          className="btn-teal   disabled:opacity-50"
          type="button"
          onClick={undo}
          disabled={undoStack.length === 0}
        >
          <СhevronLeft width={12} height={14} />
          <span className="text-[10px]">UNDO</span>
        </button>
        <button
          className="btn-teal    disabled:opacity-50 "
          type="button"
          onClick={redo}
          disabled={redoStack.length === 0}
        >
          <span className="text-[10px]">REDO</span>{" "}
          <СhevronRight width={12} height={14} />
        </button>
      </div>
      <button
        className="btn-teal  w-full"
        type="button"
        onClick={() => cleanServiceTexts()}
      >
        {" "}
        Clear services texts{" "}
      </button>
      <div className="h-px w-full bg-slate-300"></div>
      <button
        className="btn-teal  w-full"
        type="button"
        onClick={() => createHtml()}
      >
        <Image src="/svg/html.svg" alt="copy" width={16} height={16} />

        <span className="text-sm font-medium">HTML</span>
      </button>
      <button
        className="btn-teal  w-full"
        type="button"
        onClick={() => createSCSS()}
      >
        <Image src="/svg/scss.svg" alt="copy" width={16} height={16} />
        <span className="text-sm font-medium">SCSS</span>
      </button>
      <button
        className="btn-teal  w-full"
        type="button"
        onClick={() => createPug()}
      >
        <Image src="/svg/pug.svg" alt="copy" width={16} height={16} />
        <span className="text-sm font-medium">Pug</span>
      </button>
    </div>
  );
};
export default PlazaToolbar;
