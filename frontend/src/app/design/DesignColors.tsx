"use client";
import React, { useState, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { Colors } from "@/app/plaza/forStyleComponent/Colors";
import { motion, AnimatePresence } from "framer-motion";
import "@/components/ModalMessage/ModalMessage.scss";
import CloseIcon from "@/components/icons/CloseIcon";

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
      className="btn p-1 mr-2 flex items-center gap-2"
      onClick={() => {
        setCurrentBG(id);
        setOpen(true);
      }}
      style={isActive ? { border: "1px solid #ccc" } : {}}
    >
      <span
        className="w-6 h-6 inline-block rounded-full"
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
      className="btn p-1 mr-2 flex items-center gap-2"
      onClick={() => {
        setCurrentColor(id);
        setOpen(true);
      }}
      style={isActive ? { border: "1px solid #ccc" } : {}}
    >
      <span
        className="w-6 h-6 inline-flex items-center justify-center rounded-full border border-slate-600"
        style={{ color: value || "#ffffff" }}
      >
        A
      </span>
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

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function DesignColors() {
  const {} = useStateContext();
  const [backgrounds, setBackgrounds] = useState<string[]>([]);

  // background tokens
  const [CurrentBG, setCurrentBG] = useState<string>("");
  const [background1, setbackground1] = useState<string>("");
  const [background2, setbackground2] = useState<string>("");
  const [background3, setbackground3] = useState<string>("");
  const [background4, setbackground4] = useState<string>("");
  const [background5, setbackground5] = useState<string>("");

  // text color tokens
  const [CurrentColor, setCurrentColor] = useState<string>("");
  const [color1, setColor1] = useState<string>("");
  const [color2, setColor2] = useState<string>("");
  const [color3, setColor3] = useState<string>("");
  const [color4, setColor4] = useState<string>("");
  const [color5, setColor5] = useState<string>("");
  const [color6, setColor6] = useState<string>("");
  const [color7, setColor7] = useState<string>("");
  const [color8, setColor8] = useState<string>("");
  const [color9, setColor9] = useState<string>("");
  const [color10, setColor10] = useState<string>("");

  // общий модал
  const [open, setOpen] = useState<boolean>(false);
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
    {
      id: "background1",
      label: "background1",
      value: background1,
      setter: setbackground1,
    },
    {
      id: "background2",
      label: "background2",
      value: background2,
      setter: setbackground2,
    },
    {
      id: "background3",
      label: "background3",
      value: background3,
      setter: setbackground3,
    },
    {
      id: "background4",
      label: "background4",
      value: background4,
      setter: setbackground4,
    },
    {
      id: "background5",
      label: "background5",
      value: background5,
      setter: setbackground5,
    },
  ];

  const colorOptions = [
    { id: "color1", label: "color1", value: color1, setter: setColor1 },
    { id: "color2", label: "color2", value: color2, setter: setColor2 },
    { id: "color3", label: "color3", value: color3, setter: setColor3 },
    { id: "color4", label: "color4", value: color4, setter: setColor4 },
    { id: "color5", label: "color5", value: color5, setter: setColor5 },
    { id: "color6", label: "color6", value: color6, setter: setColor6 },
    { id: "color7", label: "color7", value: color7, setter: setColor7 },
    { id: "color8", label: "color8", value: color8, setter: setColor8 },
    { id: "color9", label: "color9", value: color9, setter: setColor9 },
    { id: "color10", label: "color10", value: color10, setter: setColor10 },
  ];

  const bgSetters: Record<string, (v: string) => void> = {
    background1: setbackground1,
    background2: setbackground2,
    background3: setbackground3,
    background4: setbackground4,
    background5: setbackground5,
  };

  const textSetters: Record<string, (v: string) => void> = {
    color1: setColor1,
    color2: setColor2,
    color3: setColor3,
    color4: setColor4,
    color5: setColor5,
    color6: setColor6,
    color7: setColor7,
    color8: setColor8,
    color9: setColor9,
    color10: setColor10,
  };
  // -----------
  useEffect(() => {
    console.log("<===background1===>", background1);
    console.log("<===background2===>", background2);
    console.log("<===background3===>", background3);
    console.log("<===background4===>", background4);
    console.log("<===background5===>", background5);

    setBackgrounds((prev) => {
      return {
        background1 !== "" ? background1 : prev,
        background2 !== "" ? background2 : prev,
        background3 !== "" ? background3 : prev,
        background4 !== "" ? background4 : prev,
        background5 !== "" ? background5 : prev,
      };
    });
  }, [background1]);
  // -----------
  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 relative mt-[25px] ">
      <h5 className="text-sm text-gray-400">Select color scheme</h5>

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
                  {group.colors.map((color: ColorItem) => (
                    <button
                      key={color.color}
                      className="btn font-bold !py-0.5 !px-1 rounded !justify-start"
                      style={{ color: color.value }}
                      onClick={() => {
                        if (mode === "bg" && CurrentBG) {
                          bgSetters[CurrentBG]?.(color.value);
                          setCurrentBG("");
                        }
                        if (mode === "color" && CurrentColor) {
                          textSetters[CurrentColor]?.(color.value);
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

      {/*------Background colors--------*/}
      <div className="mt-4">
        <h6 className="text-xs text-gray-400 mb-2">Background colors</h6>
        {bgOptions.map((opt) =>
          renderBgOption({
            id: opt.id,
            label: opt.label,
            value: opt.value,
            currentBG: CurrentBG,
            setCurrentBG: (id) => {
              setMode("bg");
              setCurrentBG(id);
              setOpen(true);
            },
            onChange: opt.setter,
            setOpen,
          }),
        )}
      </div>

      {/*------Сolors--------*/}
      <div className="mt-6">
        <h6 className="text-xs text-gray-400 mb-2">Сolors</h6>
        {colorOptions.map((opt) =>
          renderColorOption({
            id: opt.id,
            label: opt.label,
            value: opt.value,
            currentColor: CurrentColor,
            setCurrentColor: (id) => {
              setMode("color");
              setCurrentColor(id);
              setOpen(true);
            },
            onChange: opt.setter,
            setOpen,
          }),
        )}
      </div>
    </div>
  );
}
