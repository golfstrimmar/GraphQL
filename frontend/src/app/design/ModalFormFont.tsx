"use client";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/icons/CloseIcon";
import GOOGLE_FONTS from "./halpers/googleFonts";


// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ModalFormFont({ openFontModal, setOpenFontModal, setCurrentInput, handleFontClick }: { openFontModal: boolean, setOpenFontModal: (value: boolean) => void, setCurrentInput: (value: any) => void, handleFontClick: (value: string) => void }) {



  return (
    <AnimatePresence>
      {openFontModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: [0.25, 0.8, 0.5, 1] }}
          className="fixed top-0 lef-0 flex flex-col items-center justify-center overflow-auto max-h-90vh inset-0 z-[1000]  bg-[rgba(0,0,0,0.95)] py-[40px]"
        >
          {/*кнопка закрытия модалки*/}
          <button
            className="absolute top-2 right-2 cursor-pointer"
            onClick={() => {
              setOpenFontModal(false);
              setCurrentInput(null);
            }}
          >
            <CloseIcon width={24} height={24} />
          </button>
          <div className="flex flex-col gap-1">
            {GOOGLE_FONTS.map((font, idx: number) => {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleFontClick(font.family)}
                  className="btn btn-teal text-[14px] "
                >
                  {font.family}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

