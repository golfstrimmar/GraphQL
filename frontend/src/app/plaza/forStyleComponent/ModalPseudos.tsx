"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import CloseIcon from "@/components/icons/CloseIcon";
import Monaco from "@/app/plaza/Monaco";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
interface PropsModalPseudos {
  openModalPseudos: boolean;
  setOpenModalPseudos: (openModalPseudos: boolean) => void;
}
const MobileAddStyle = dynamic(
  () => import("../forStyleComponent/MobileAddStyle"),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);
export const PSEUDO_CLASSES = [
  // Состояния (User action)
  "hover", "active", "focus", "focus-visible", "focus-within",

  // Ссылки
  "link", "visited", "any-link", "local-link", "target", "target-within", "scope",

  // Состояния форм и инпутов
  "checked", "indeterminate", "default", "valid", "invalid", "in-range", "out-of-range",
  "required", "optional", "blank", "autofill", "enabled", "disabled", "read-only",
  "read-write", "placeholder-shown", "user-invalid", "user-valid",

  // Структурные (дерево элементов)
  "root", "empty", "first-child", "last-child", "only-child", "first-of-type",
  "last-of-type", "only-of-type", "nth-child", "nth-last-child", "nth-of-type", "nth-last-of-type",

  // Логические (функциональные)
  "not", "is", "where", "has", "defined",

  // Другие
  "lang", "dir", "fullscreen", "picture-in-picture", "modal"
];

export const PSEUDO_ELEMENTS = [
  "before", "after", "first-letter", "first-line", "marker",
  "selection", "placeholder", "backdrop", "cue", "part", "slotted"
];

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ModalPseudos({ openModalPseudos, setOpenModalPseudos }: PropsModalPseudos) {
  const [mounted, setMounted] = useState(false);
  const [textValue, setTextValue] = useState<string>('');
  const [openMobile, setOpenMobile] = useState(false);
  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const plazacontainer = document.querySelector(".plaza-container")
    if (openModalPseudos) {
      plazacontainer.classList.add("hidden");
      document.body.classList.add("hide-scrollbar");
      document.body.style.overflow = "hidden";
    } else {
      const timeout = setTimeout(() => {
        document.body.classList.remove("hide-scrollbar");
        document.body.style.overflow = "auto";
        plazacontainer.classList.remove("hidden");
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [openModalPseudos]);

  if (!mounted) return null;

  useEffect(() => { if (!textValue) return; console.log('<===textValue===>', textValue); }, [textValue]);


  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
  const splitStyles = (fullStyle: string) => {
    if (!fullStyle) return { base: "", pseudosArray: [] };

    // 1. Регулярка ищет &: или &:: и захватывает название до ближайшего спецсимвола ({ , ; или пробела)
    // [a-zA-Z0-9-_]+ — это буквы, цифры, тире и подчеркивания
    const nameRegex = /&:{1,2}([a-zA-Z0-9-_]+)/g;

    // 2. Собираем все названия
    const matches = [...fullStyle.matchAll(nameRegex)];
    const names = matches.map(match => match[1]);

    // 3. Убираем дубликаты
    const uniquePseudos = Array.from(new Set(names));

    // 4. Чтобы получить чистый "base" (стили без блоков псевдоклассов), 
    // всё же нужно вырезать блоки целиком, иначе останутся пустые скобки {}
    const fullBlockRegex = /(&:{1,2}[^{]+\{[^}]+\})/g;
    const base = fullStyle.replace(fullBlockRegex, "").trim();

    const baseFormatted = base
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .join(";\n");

    return {
      base: baseFormatted ? baseFormatted + ";" : "",
      pseudosArray: uniquePseudos, // Вернет ["hover", "before", "active"] и т.д.
    };
  };



  const toggleDisabledButton = (pseudo: string) => {
    const res = splitStyles(textValue);
    return res.pseudosArray.includes(pseudo);
  };


  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
  return createPortal(




    <AnimatePresence mode="wait">
      {openModalPseudos && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }} // Плавно скрываем фон
          transition={{ duration: 0.2 }}
          className="bg-black/60 backdrop-blur-lg fixed inset-0 w-full h-full  py-[10px] px-[20px] z-[6050]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenModalPseudos(false);
          }}
        >
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="modal-inner relative "
          >
            <button
              className="w-3 h-3 flex items-center justify-center text-white absolute -top-2 -right-4 z-10000 hover:text-gray-400 cursor-pointer transition-colors"
              onClick={() => setOpenModalPseudos(false)}
            >
              <CloseIcon />
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setOpenMobile(true)}
            >
              Open Style Builder
            </button>

            {openMobile && (
              <MobileAddStyle
                setCurrentStyle={setTextValue} // Теперь MobileAddStyle пишет сразу в textValue
                openMobile={openMobile}
                setOpenMobile={setOpenMobile}
              />
            )}
            <section id="pseudos" className="p-10">
              <div className="pseudos-admin">
                <nav className="pseudos-admin-nav flex flex-wrap gap-2">
                  {PSEUDO_CLASSES.map((pseudo, index) => (
                    <button className="btn btn-empty text-[12px] text-white border border-white/20 px-2 py-1" key={index} onClick={() => {
                      const newText = `&:${pseudo}{ 
    
}`;
                      setTextValue((prev) => prev + "\n" + newText)
                    }}
                      disabled={toggleDisabledButton(pseudo)}
                      style={{ zIndex: toggleDisabledButton(pseudo) ? -1000 : 1 }}
                    >
                      &:{pseudo}
                    </button>
                  ))}
                  <hr className="w-full h-[1px] border-white/20 my-4" />
                  {PSEUDO_ELEMENTS.map((pseudo, index) => (
                    <button className="btn btn-empty text-[12px] text-white border border-white/20 px-2 py-1" key={index} onClick={() => {
                      const newText = `&::${pseudo}{ 
${pseudo === 'before' || pseudo === 'after' ? `content:"";` : ''} 
}`;
                      setTextValue((prev) => prev + "\n" + newText)
                    }}
                      disabled={toggleDisabledButton(pseudo)}
                      style={{ zIndex: toggleDisabledButton(pseudo) ? -1000 : 1 }}

                    >
                      &::{pseudo}
                    </button>
                  ))}
                </nav>
                <div className="h-full">
                  <Monaco text={textValue} setText={setTextValue} />
                </div>
                {/* // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====> */}
                <div className="h-full">
                  {/* <button
                    value="background: red;"
                    onClick={(e) => {
                      const val = e.currentTarget.value;
                      setTextValue(prev => prev.trim() ? `${prev}\n${val}` : val);
                    }}
                  >
                    background: red;
                  </button> */}

                </div>
                {/* // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====> */}
              </div>

            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body

  );
}
