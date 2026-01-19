"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@/components/ModalMessage/ModalMessage.scss";
import CloseIcon from "@/components/icons/CloseIcon";
import "./design.scss";
type FontSlot = {
  id: string;
  label: string;
  family: string;
  importString: string;
};

type FontOptionProps = {
  slot: FontSlot;
  currentFont: string;
  setCurrentFont: (id: string) => void;
  updateSlot: (id: string, patch: Partial<FontSlot>) => void;
  setOpen: (open: boolean) => void;
};
// ----------
const GOOGLE_FONTS = [
  { family: "Inter", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Roboto", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Open Sans", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Lato", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Montserrat", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Poppins", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Source Sans Pro", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Nunito", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Raleway", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Merriweather", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Lobster", weights: [300, 400, 500, 600, 700, 800] },
];

// ----------
function buildGoogleImport(family: string, weights: number[] = [400, 700]) {
  const familyParam = family.replace(/ /g, "+");
  const weightsParam = weights.join(";");
  return `@import url("https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weightsParam}&display=swap");`;
}
// ----------
function renderFontOption({
  slot,
  currentFont,
  setCurrentFont,
  updateSlot,
  setOpen,
}: FontOptionProps) {
  const isActive = currentFont === slot.id;
  return (
    <div className="mb-3">
      <button
        key={slot.id}
        type="button"
        className="btn p-1 mr-2 flex items-center gap-2"
        onClick={() => {
          setCurrentFont(slot.id);
          setOpen(true);
        }}
        style={isActive ? { border: "1px solid #ccc" } : {}}
      >
        <span className="w-6 h-6 inline-flex items-center justify-center rounded-full border border-slate-600 text-xs p-1">
          {slot.label.replace("font", "F")}
        </span>

        <div className="text-xs text-gray-400">
          {slot.label}: {slot.family || "Not selected"}
        </div>

        <div
          className="text-sm ml-4"
          style={slot.family ? { fontFamily: slot.family } : {}}
        >
          {slot.family && (
            <p
              className="!text-[24px]"
              style={slot.family ? { fontFamily: slot.family } : {}}
            >
              The quick brown fox jumps over the lazy dog
            </p>
          )}
        </div>
      </button>

      <textarea
        className="mt-1 w-full text-[10px] bg-slate-900 text-slate-200 rounded px-2 py-1 overflow-x-auto resize-none"
        rows={2}
        value={
          slot.importString ||
          (slot.family ? buildGoogleImport(slot.family) : "")
        }
        placeholder='@import url("https://fonts.googleapis.com/...");'
        onChange={(e) => updateSlot(slot.id, { importString: e.target.value })}
      />
    </div>
  );
}

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function DesignFonts() {
  const [CurrentFontSlot, setCurrentFontSlot] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const [slots, setSlots] = useState<FontSlot[]>([
    { id: "font1", label: "font1", family: "", importString: "" },
    { id: "font2", label: "font2", family: "", importString: "" },
    { id: "font3", label: "font3", family: "", importString: "" },
    { id: "font4", label: "font4", family: "", importString: "" },
    { id: "font5", label: "font5", family: "", importString: "" },
  ]);

  const updateSlot = (id: string, patch: Partial<FontSlot>) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 relative mt-[25px] ">
      <h5 className="text-sm text-gray-400">Select fonts</h5>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.25, 0.8, 0.5, 1] }}
            className="w-[100vw] modalmessage h-[100vh] fixed top-0 left-0 flex justify-center  bg-[rgba(0,0,0,.95)] z-1000 p-4"
          >
            <button
              className="absolute top-2 right-2 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <CloseIcon width={24} height={24} />
            </button>

            <div className="flex flex-col mt-4 w-full gap-2">
              {GOOGLE_FONTS.map((font) => (
                <button
                  key={font.family}
                  className="btn !py-1 !px-2 rounded  "
                  onClick={() => {
                    if (CurrentFontSlot) {
                      updateSlot(CurrentFontSlot, {
                        family: font.family,
                        importString: buildGoogleImport(
                          font.family,
                          font.weights,
                        ),
                      });
                      setCurrentFontSlot("");
                    }
                    setOpen(false);
                  }}
                >
                  <div className="text-xs text-gray-400">{font.family}</div>
                  <div
                    className="text-sm ml-4"
                    style={{ fontFamily: font.family }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4">
        {slots.map((slot) =>
          renderFontOption({
            slot,
            currentFont: CurrentFontSlot,
            setCurrentFont: (id) => {
              setCurrentFontSlot(id);
              setOpen(true);
            },
            updateSlot,
            setOpen,
          }),
        )}
      </div>
    </div>
  );
}
