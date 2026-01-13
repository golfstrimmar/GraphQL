"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import Loading from "@/components/ui/Loading/Loading";
import { AnimatePresence, motion } from "framer-motion";
import SERVICE_TEXTS from "@/utils/plaza/SERVICE_TEXTS";
import Image from "next/image";

interface ModalTextsProps {
  node?: any;
  setTextValue?: (v: any) => void;
  modalTextsOpen: boolean;
  setModalTextsOpen: (v: boolean) => void;
  updateNodeByKey?: (key: string, payload: any) => void;
  textValue: string;
  handleTextChange: (v: string) => void;
}
type TextNodeWithStyle = {
  color: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  mixin: string;
  text: string;
  __typename: "TextNodeWithStyle";
};

export default function ModalTexts({
  node,
  textValue,
  setTextValue,
  modalTextsOpen,
  setModalTextsOpen,
  // handleTextChange,
  updateNodeByKey,
}: ModalTextsProps) {
  const { texts } = useStateContext();

  const serviceSet = new Set(SERVICE_TEXTS.map((t) => t.trim().toLowerCase()));
  useEffect(() => {
    if (!node) return;
    console.log("<===node===>", node);
  }, [node]);

  useEffect(() => {
    if (!texts) return;
    console.log("<==modal=texts===>", texts);
  }, [texts]);

  const handleClick = useCallback(
    (text: TextNodeWithStyle) => {
      if (!node || !updateNodeByKey || !setTextValue) return;

      let nextText = textValue;
      const normalizedText = textValue.trim().toLowerCase();

      if (serviceSet.has(normalizedText)) {
        nextText = text.text;
      } else {
        nextText = textValue + text.text;
      }

      // базовая строка для миксина
      const mixinLine = `@include ${text.mixin};`;

      // существующий стиль в ноде — строка, как в StyleComponent
      const prevStyle = node.style ?? "";

      // если такого миксина ещё нет — добавляем
      const hasMixinAlready = prevStyle
        .split("\n")
        .some((line: string) => line.trim() === mixinLine);

      const nextStyle = hasMixinAlready
        ? prevStyle
        : (prevStyle ? `${prevStyle.trim()}\n` : "") + mixinLine;

      updateNodeByKey(node._key, {
        text: nextText,
        style: nextStyle,
      });

      setTextValue(nextText);
      setModalTextsOpen(false);
    },
    [
      textValue,
      serviceSet,
      node,
      updateNodeByKey,
      setTextValue,
      setModalTextsOpen,
    ],
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
          <button
            className="absolute block top-1 right-1 rounded-full z-[7140] p-2 cursor-pointer"
            onClick={() => setModalTextsOpen(false)}
          >
            <Image src="./svg/cross.svg" alt="close" width={20} height={20} />
          </button>
          <div className="min-h-[100vh] w-full  ">
            {texts.map((text, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleClick(text)}
                className="mb-1 w-full break-words  btn btn-empty bg-[var(--white)] hover:bg-[var(--lightest-slate)] !transition-all !duration-300 text-[14px] "
                style={{ lineHeight: "1.2" }}
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
