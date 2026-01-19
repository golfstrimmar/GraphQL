"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter, usePathname } from "next/navigation";
import { Colors } from "@/app/plaza/forStyleComponent/Colors";
import { motion, AnimatePresence } from "framer-motion";
import "@/components/ModalMessage/ModalMessage.scss";
import CloseIcon from "@/components/icons/CloseIcon";
// import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
// import { UPDATE_PROJECT, REMOVE_PROJECT } from "@/apollo/mutations";
// import { GET_ALL_PROJECTS_BY_USER, FIND_PROJECT } from "@/apollo/queries";
// import  Loading  from "@/components/ui/Loading/Loading";
// import dynamic from "next/dynamic";

// const DynamicComponent = dynamic(
// 	() => import("@/components/DynamicComponent/DynamicComponent"),
// 	{
// 		ssr: false,
// 		loading: () => <Loading />
// 	}
// );
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
};

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function DesignColors() {
  const {} = useStateContext();
  const [CurrentBG, setCurrentBG] = useState<string>("");
  const [background1, setbackground1] = useState<string>("");
  const [background2, setbackground2] = useState<string>("");
  const [background3, setbackground3] = useState<string>("");
  const [background4, setbackground4] = useState<string>("");
  const [background5, setbackground5] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const colorGroups = [
    {
      name: "neutral",
      colors: Colors.filter((color) => color.group == "neutral"),
    },
    {
      name: "red",
      colors: Colors.filter((color) => color.group == "red"),
    },
    {
      name: "orange",
      colors: Colors.filter((color) => color.group == "orange"),
    },
    {
      name: "yellow",
      colors: Colors.filter((color) => color.group == "yellow"),
    },
    {
      name: "green",
      colors: Colors.filter((color) => color.group == "green"),
    },
    {
      name: "blue",
      colors: Colors.filter((color) => color.group == "blue"),
    },
    {
      name: "purple",
      colors: Colors.filter((color) => color.group == "purple"),
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

  function renderBgOption({
    id,
    label,
    value,
    currentBG,
    setCurrentBG,
    onChange,
  }: BgOptionProps) {
    const isActive = currentBG === id;

    return (
      <button
        key={id}
        type="button"
        className="btn p-1 mr-2  flex items-center gap-2"
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
          onClick={(e) => {
            e.stopPropagation();
            setCurrentBG("");
            setOpen(false);
          }}
          className="h-6 w-10 cursor-pointer"
        />
      </button>
    );
  }

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
              className="absolute  top-2 right-2 cursor-pointer"
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
                      className={`btn font-bold !py-0.5 !px-1 rounded  !justify-start`}
                      style={{ color: color.value }}
                      onClick={() => {
                        if (CurrentBG === "background1") {
                          setbackground1(color.value);
                        } else if (CurrentBG === "background2") {
                          setbackground2(color.value);
                        } else if (CurrentBG === "background3") {
                          setbackground3(color.value);
                        } else if (CurrentBG === "background4") {
                          setbackground4(color.value);
                        } else if (CurrentBG === "background5") {
                          setbackground5(color.value);
                        }
                        setCurrentBG("");
                        setOpen(false);
                      }}
                    >
                      <span
                        style={{ backgroundColor: color.value }}
                        className="w-6 h-6 mr-2 inline-block rounded-full"
                      ></span>
                      {color.color}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <br className="my-4" />
      {bgOptions.map((opt) =>
        renderBgOption({
          id: opt.id,
          label: opt.label,
          value: opt.value,
          currentBG: CurrentBG,
          setCurrentBG,
          onChange: opt.setter,
        }),
      )}
    </div>
  );
}
