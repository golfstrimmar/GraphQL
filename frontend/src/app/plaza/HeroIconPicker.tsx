"use client";
import { useEffect, useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
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
  openSVGModal: boolean;
  setopenSVGModal: (value: boolean) => void;
}
// ====>====>====>====>====>====>====>====>====>====>
// ====>====>====>====>====>====>====>====>====>====>
// ====>====>====>====>====>====>====>====>====>====>
export default function HeroIconPicker({
  openSVGModal,
  setopenSVGModal,
}: Props) {
  const [outline, setOutline] = useState<boolean>(true);
  const [solid, setSolid] = useState<boolean>(false);
  const [typeIcon, setTypeIcon] = useState<string>("outline");
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [valueOnChange, setValueOnChange] = useState<string>("");
  const { updateHtmlJson } = useStateContext();
  // ====>====>====>====>====>====>====>====>====>====>
  useEffect(() => {
    if (!openSVGModal) setSelectedIcon("");
  }, [openSVGModal]);
  // ==>==>==>==>==>==>==>==>==>==>==>==>==>
  let HEROICONS_BASE = "";
  if (typeIcon === "outline") {
    HEROICONS_BASE =
      "https://cdn.jsdelivr.net/npm/heroicons@latest/24/outline/";
  } else {
    HEROICONS_BASE = "https://cdn.jsdelivr.net/npm/heroicons@latest/24/solid/";
  }
  function heroiconNameToFile(name: string) {
    console.log("<===name===>", name);
    const base = name.replace(/Icon$/, "");

    // ТВОИ две строки БЕЗ ИЗМЕНЕНИЙ
    const step1 = base.replace(/(.)([A-Z][a-z])/g, "$1-$2");
    const step2 = step1.replace(/([a-z0-9])([A-Z])/g, "$1-$2");

    // ДОБАВЛЯЕМ ТОЛЬКО ЭТО ДЛЯ battery0 → battery-0
    const step3 = step2.replace(/([a-z])(\d)/g, "$1-$2");

    return step3.toLowerCase();
  }

  function heroiconSrc(name: string) {
    return `${HEROICONS_BASE}${heroiconNameToFile(name)}.svg`;
  }
  // ====>====>====>====>====>====>====>====>====>====>
  function RenderHeroIcon() {
    if (!selectedIcon) return null;

    const content: ProjectData[] = [
      {
        tag: "img",
        text: "",
        class: "svg-wrapper",
        style: "width: 30px;height: 30px;",
        children: [],
        attributes: {
          src: heroiconSrc(selectedIcon),
        },
      },
    ];

    const resultWithKeys = ensureNodeKeys(content) as ProjectData[];
    updateHtmlJson((prev) => [...prev, ...resultWithKeys]);

    return null; // чтобы ничего не рисовать в JSX
  }

  useEffect(() => {
    if (!selectedIcon) return;
    RenderHeroIcon();
  }, [selectedIcon]);

  const onClose = () => {
    setValueOnChange("");
    setOutline(true);
    setSolid(false);
    setopenSVGModal(false);
    setSelectedIcon("");
    setTypeIcon("outline");
  };
  const onChange = (id: string, value: string) => {
    setValueOnChange("");
    setSelectedIcon(id);
    setTypeIcon(value);
    setTimeout(() => {
      onClose();
    }, 100);
  };

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
            onClick={() => {
              onClose();
            }}
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
                    onChange(id, "outline");
                    setValueOnChange(id);
                  }}
                  className={`flex flex-col items-center p-2 border rounded text-[10px] ${
                    valueOnChange === id
                      ? "border-teal-800 bg-teal-100"
                      : "border-slate-200"
                  }`}
                  title={label}
                >
                  <Component className="w-5 h-5 mb-1" color="slate-800" />
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
                    onChange(id, "solid");
                    setValueOnChange(id);
                  }}
                  className={`flex flex-col items-center p-2 border rounded text-[10px] ${
                    valueOnChange === id
                      ? "border-teal-500 bg-teal-100"
                      : "border-slate-200"
                  }`}
                  title={label}
                >
                  <Component className="w-5 h-5 mb-1" color="slate-800" />
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
