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
}: ModalTextsProps) {
  const { texts } = useStateContext();

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
      const res = textValue + text;
      handleTextChange(res);
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
          <div className="min-h-[100vh] w-full gap-2 grid items-center">
            {texts.map((text, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleClick(text.text)}
                className=" w-full break-words p-2 btn btn-empty bg-[var(--white)] hover:bg-[var(--lightest-slate)] !transition-all !duration-300 "
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
