"use client";
import { useEffect, useState } from "react";
import * as OutlineIcons from "@heroicons/react/24/outline";
import * as Solid24 from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
export type HeroIconName = keyof typeof OutlineIcons;
import Image from "next/image";

export const HERO_ICON_ENTRIES_OUTLINE = Object.entries(OutlineIcons).map(
  ([name, Component]) => ({
    id: name as HeroIconName,
    label: name.replace(/Icon$/, ""), // Human‑readable
    Component,
  }),
);
export const HERO_ICON_ENTRIES_SOLID = Object.entries(Solid24).map(
  ([name, Component]) => ({
    id: name as HeroIconName,
    label: name.replace(/Icon$/, ""), // Human‑readable
    Component,
  }),
);

interface Props {
  value: HeroIconName | null;
  onChange: (name: HeroIconName, type: string) => void;
}
// ====>====>====>====>====>====>====>====>====>====>
// ====>====>====>====>====>====>====>====>====>====>
// ====>====>====>====>====>====>====>====>====>====>
export default function HeroIconPicker({
  value,
  onChange,
  openSVGModal,
  onClose,
  setTypeIcon,
}: Props) {
  const [outline, setOutline] = useState<boolean>(true);
  const [solid, setSolid] = useState<boolean>(false);
  // ====>====>====>====>====>====>====>====>====>====>
  useEffect(() => {
    if (openSVGModal) {
      document.body.style.maxHeight = "100vh";
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.maxHeight = "none";
      document.body.style.overflow = "auto";
      setOutline(true);
      setSolid(false);
    }
  }, [openSVGModal]);
  // ====>====>====>====>====>====>====>====>====>====>
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
          className=" fixed top-0 left-0    bg-[rgba(0,0,0,0.95)] z-2130!  rounded-lg w-[100vw] h-[100vh] "
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
          <div className="mt-4 center  gap-4">
            <button
              className={`btn btn-primary modal-inner ${
                outline
                  ? "!outline-[var(--teal)] !outline-2 !outline-solid"
                  : "outline-slate-200"
              }`}
              onClick={() => {
                setOutline(true);
                setSolid(false);
              }}
            >
              outline
            </button>
            <button
              className={`btn btn-primary modal-inner ${
                solid
                  ? "!outline-[var(--teal)] !outline-2 !outline-solid"
                  : "outline-slate-200"
              }`}
              onClick={() => {
                setOutline(false);
                setSolid(true);
              }}
            >
              solid
            </button>
          </div>
          {outline && (
            <div className="modal-inner  pt-[30px] pb-[100px] grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] w-full gap-2   items-center max-h-[100vh] overflow-y-auto">
              {HERO_ICON_ENTRIES_OUTLINE.map(({ id, label, Component }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onChange(id, "outline");
                  }}
                  className={`flex flex-col items-center p-2 border rounded text-[10px] ${
                    value === id
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200"
                  }`}
                  title={label}
                >
                  <Component className="w-5 h-5 mb-1" color="white" />
                  <span className="truncate max-w-[80px]">{label}</span>
                </button>
              ))}
            </div>
          )}

          {solid && (
            <div className="modal-inner  pt-[30px] pb-[100px] grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] w-full gap-2   items-center max-h-[100vh] overflow-y-auto">
              {HERO_ICON_ENTRIES_SOLID.map(({ id, label, Component }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onClose();
                    onChange(id, "solid");
                  }}
                  className={`flex flex-col items-center p-2 border rounded text-[10px] ${
                    value === id
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200"
                  }`}
                  title={label}
                >
                  <Component className="w-5 h-5 mb-1" color="white" />
                  <span className="truncate max-w-[80px]">{label}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
