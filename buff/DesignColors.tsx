"use client";
import React, { useState, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { Colors } from "@/app/plaza/forStyleComponent/Colors";
import { motion, AnimatePresence } from "framer-motion";
import "@/components/ModalMessage/ModalMessage.scss";
import CloseIcon from "@/components/icons/CloseIcon";

type ColorGroup =
  | "neutral"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple";

type ColorItem = {
  color: string;
  value: string;
  group: ColorGroup;
};

type BgOptionProps = {
  id: string;
  label: string;
  value: string;
  currentBG: string;
  setCurrentBG: (id: string) => void;
  onChange: (val: string) => void;
  setOpen: (open: boolean) => void;
};

type ColorOptionProps = {
  id: string;
  label: string;
  value: string;
  currentColor: string;
  setCurrentColor: (id: string) => void;
  onChange: (val: string) => void;
  setOpen: (open: boolean) => void;
};

type BackgroundState = {
  background1: string;
  background2: string;
  background3: string;
  background4: string;
  background5: string;
};

type ColorState = {
  headers1color: string;
  headers2color: string;
  headers3color: string;
  headers4color: string;
  headers5color: string;
  headers6color: string;
  color7: string;
  color8: string;
  color9: string;
  color10: string;
};

type DesignColorsProps = {
  backgrounds: BackgroundState;
  colors: ColorState;
  setBackground: (key: keyof BackgroundState, value: string) => void;
  setColor: (key: keyof ColorState, value: string) => void;
};

function renderBgOption({
  id,
  label,
  value,
  currentBG,
  setCurrentBG,
  onChange,
  setOpen,
}: BgOptionProps) {
  const isActive = currentBG === id;

  return (
    <button
      key={id}
      type="button"
      className="btn p-1 mr-2 flex items-center gap-2 text-xs"
      onClick={() => {
        setCurrentBG(id);
        setOpen(true);
      }}
      style={isActive ? { border: "1px solid #ccc" } : {}}
    >
      <span
        className="w-6 h-6  inline-block rounded-full"
        style={value ? { background: value } : {}}
      />
      <span>
        {label}: {value}
      </span>

      <input
        type="color"
        value={value || "#ffffff"}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="h-6 w-10 cursor-pointer"
      />
    </button>
  );
}

function renderColorOption({
  id,
  label,
  value,
  currentColor,
  setCurrentColor,
  onChange,
  setOpen,
}: ColorOptionProps) {
  const isActive = currentColor === id;

  return (
    <button
      key={id}
      type="button"
      className="btn p-1 mr-2 flex items-center gap-2 "
      onClick={() => {
        setCurrentColor(id);
        setOpen(true);
      }}
      style={isActive ? { border: "1px solid #ccc" } : {}}
    >
      <span
        className="w-6 h-6 inline-flex items-center justify-center rounded-full border border-slate-600 "
        style={{ color: value || "#ffffff" }}
      >
        A
      </span>
      <span className="text-xs">
        {label}: {value}
      </span>

      <input
        type="color"
        value={value || "#ffffff"}
        onChange={(e) => {
          onChange(e.target.value);
          setCurrentColor("");
          setOpen(false);
        }}
        onClick={(e) => e.stopPropagation()}
        className="h-6 w-10 cursor-pointer"
      />
    </button>
  );
}

// ----🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢----
export default function DesignColors({
  setColor,
  setBackground,
}: DesignColorsProps) {
  const { backgrounds, colors } = useStateContext();
  const [CurrentBG, setCurrentBG] = useState("");
  const [CurrentColor, setCurrentColor] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"bg" | "color">("bg");

  const colorGroups = [
    {
      name: "neutral",
      colors: Colors.filter((color) => color.group === "neutral"),
    },
    {
      name: "red",
      colors: Colors.filter((color) => color.group === "red"),
    },
    {
      name: "orange",
      colors: Colors.filter((color) => color.group === "orange"),
    },
    {
      name: "yellow",
      colors: Colors.filter((color) => color.group === "yellow"),
    },
    {
      name: "green",
      colors: Colors.filter((color) => color.group === "green"),
    },
    {
      name: "blue",
      colors: Colors.filter((color) => color.group === "blue"),
    },
    {
      name: "purple",
      colors: Colors.filter((color) => color.group === "purple"),
    },
  ];

  const bgOptions = [
    { id: "background1", label: "background1" },
    { id: "background2", label: "background2" },
    { id: "background3", label: "background3" },
    { id: "background4", label: "background4" },
    { id: "background5", label: "background5" },
  ] as const;

  const colorOptions = [
    { id: "headers1color", label: "headers1color" },
    { id: "headers2color", label: "headers2color" },
    { id: "headers3color", label: "headers3color" },
    { id: "headers4color", label: "headers4color" },
    { id: "headers5color", label: "headers5color" },
    { id: "headers6color", label: "headers6color" },
    { id: "color7", label: "color7" },
    { id: "color8", label: "color8" },
    { id: "color9", label: "color9" },
    { id: "color10", label: "color10" },
  ] as const;

  return (
    <div className="bg-[var(--lightest-navy)] rounded-2xl shadow-xl p-2 border border-slate-200 relative grid grid-cols-2 ">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.25, 0.8, 0.5, 1] }}
            className="w-[100vw] modalmessage h-[100vh] fixed top-0 left-0 flex justify-center items-center bg-[rgba(0,0,0,.95)] z-1000 p-4"
          >
            <button
              className="absolute top-2 right-2 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <CloseIcon width={24} height={24} />
            </button>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] mt-4 w-full">
              {colorGroups.map((group) => (
                <div key={group.name} className="flex flex-col gap-0">
                  {group.colors.map((color) => (
                    <button
                      key={color.color}
                      className="btn font-bold !py-0.5 !px-1 rounded !justify-start"
                      style={{ color: color.value }}
                      onClick={() => {
                        if (mode === "bg" && CurrentBG) {
                          setBackground(
                            CurrentBG as keyof BackgroundState,
                            color.value,
                          );
                          setCurrentBG("");
                        }
                        if (mode === "color" && CurrentColor) {
                          setColor(
                            CurrentColor as keyof ColorState,
                            color.value,
                          );
                          setCurrentColor("");
                        }
                        setOpen(false);
                      }}
                    >
                      <span
                        style={{ backgroundColor: color.value }}
                        className="w-6 h-6 mr-2 inline-block rounded-full"
                      />
                      {color.color}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background colors */}
      <div className="mt-1">
        {bgOptions.map((opt) =>
          renderBgOption({
            id: opt.id,
            label: opt.label,
            value: backgrounds[opt.id],
            currentBG: CurrentBG,
            setCurrentBG: (id) => {
              setMode("bg");
              setCurrentBG(id);
              setOpen(true);
            },
            onChange: (val) => setBackground(opt.id, val),
            setOpen,
          }),
        )}
      </div>

      {/* Colors */}
      <div className="mt-1">
        {colorOptions.map((opt) =>
          renderColorOption({
            id: opt.id,
            label: opt.label,
            value: colors[opt.id],
            currentColor: CurrentColor,
            setCurrentColor: (id) => {
              setMode("color");
              setCurrentColor(id);
              setOpen(true);
            },
            onChange: (val) => setColor(opt.id, val),
            setOpen,
          }),
        )}
      </div>
    </div>
  );
}
