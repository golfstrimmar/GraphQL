"use client";
import { useEffect } from "react";
import * as OutlineIcons from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
export type HeroIconName = keyof typeof OutlineIcons;
import Image from "next/image";

export const HERO_ICON_ENTRIES = Object.entries(OutlineIcons).map(
  ([name, Component]) => ({
    id: name as HeroIconName,
    label: name.replace(/Icon$/, ""), // Human‑readable
    Component,
  }),
);

interface Props {
  value: HeroIconName | null;
  onChange: (name: HeroIconName) => void;
}

export default function HeroIconPicker({
  value,
  onChange,
  openSVGModal,
  onClose,
}: Props) {
  useEffect(() => {
    if (openSVGModal) {
      document.body.style.maxHeight = "100vh";
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.maxHeight = "none";
      document.body.style.overflow = "auto";
    }
  }, [openSVGModal]);
  return (
    <AnimatePresence>
      {openSVGModal && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
            y: -100,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -100 }}
          transition={{ duration: 0.3 }}
          className=" fixed top-0 left-0    bg-[rgba(0,0,0,0.95)] z-2130!  rounded-lg w-[100vw] h-[100vh] flex justify-center  items-center "
          onClick={(e) => {
            e.stopPropagation();
            if (!e.target.closest(".modal-inner")) {
              onClose();
            }
          }}
        >
          <button
            className="absolute block top-4 right-8 bg-white! rounded-full z-2140! p-2"
            onClick={() => onClose()}
          >
            <Image
              src="./svg/cross-com.svg"
              alt="close"
              width={20}
              height={20}
            />
          </button>
          <div className="modal-inner  py-[100px] grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] w-full gap-2   items-center max-h-[100vh] overflow-y-auto">
            {HERO_ICON_ENTRIES.map(({ id, label, Component }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onClose();
                  onChange(id);
                }}
                className={`flex flex-col items-center p-2 border rounded text-[10px] ${
                  value === id
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200"
                }`}
                title={label}
              >
                <Component className="w-5 h-5 mb-1" color="red" />
                <span className="truncate max-w-[80px]">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
