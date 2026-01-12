"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import Loading from "@/components/ui/Loading/Loading";
import { AnimatePresence, motion } from "framer-motion";

interface ModalTextsProps {
  node?: any;
  setTextValue?: (v: any) => void;
  modalTextsOpen: boolean;
  setModalTextsOpen: (v: boolean) => void;
  updateNodeByKey?: (key: string, payload: any) => void;
  textValue: string;
  handleTextChange: (v: string) => void;
}

export default function ModalTexts({
  node,
  setTextValue,
  modalTextsOpen,
  setModalTextsOpen,
  handleTextChange,
  textValue,
  updateNodeByKey,
}: ModalTextsProps) {
  const { texts } = useStateContext();

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

  const serviceSet = new Set(SERVICE_TEXTS.map((t) => t.trim().toLowerCase()));
  useEffect(() => {
    if (!node) return;
    console.log("<===node===>", node);
  }, [node]);

  useEffect(() => {
    if (!texts) return;
    console.log("<===texts===>", texts);
  }, [texts]);

  const handleClick = useCallback(
    (text: string) => {
      let nextText = textValue;
      const normalizedText = textValue.trim().toLowerCase();
      if (serviceSet.has(normalizedText)) {
        nextText = text;
      } else {
        nextText = textValue + text;
      }
      handleTextChange(nextText);
      setModalTextsOpen(false);
    },
    [texts],
  );

  return (
    <AnimatePresence>
      {modalTextsOpen && (
        <motion.div
          key="modal-texts"
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.1, transition: { duration: 0.2 } }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0   p-8  inset-0 z-[7000]   bg-black/60 backdrop-blur-sm w-[100vw] h-[100vh] overflow-y-scroll"
        >
          <div className="min-h-[100vh] w-full  ">
            {texts.map((text, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleClick(text.text)}
                className="mb-1 w-full break-words p-2 btn btn-empty bg-[var(--white)] hover:bg-[var(--lightest-slate)] !transition-all !duration-300 "
              >
                {text.text}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
