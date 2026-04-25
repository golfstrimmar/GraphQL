"use client";

import React, {
  useState,
  useEffect
} from "react";
import { createPortal } from "react-dom";
import { useStateContext } from "@/providers/StateProvider";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import NormalizeSCSS from "./NormalizeSCSS";
import ColorPicker from "./ColorPicker";
import DisplayPicker from "./DisplayPicker";
import FlexContainerPicker from "./FlexContainerPicker";
import GridContainerPicker from "./GridContainerPicker";
import CommonPropsPicker from "./CommonPropsPicker";
import TextPropsPicker from "./TextPropsPicker";
import PositionPropsPicker from "./PositionPropsPicker";
import PresetsPicker from "./PresetsPicker";
import СhevronDown from "@/components/icons/ChevronDown";
import CloseIcon from "@/components/icons/CloseIcon";
import formatStyleString from "../forStyleComponent/formatStyleString";
import PropsNamen from "../helpers/PropsNamen";
import PropsButton from "./PropsButton";

interface PropsMobileAddStyle {
  currentStyle: string;
  setCurrentStyle: (text: string) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
}

// ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
const MobileAddStyle: React.FC<PropsMobileAddStyle> = ({
  currentStyle,
  setCurrentStyle,
  openMobile,
  setOpenMobile,

}) => {
  const { newtextMarker, setNewtextMarker } = useStateContext();
  const [addingScss, setAddingScss] = useState<string>("");
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  useEffect(() => {
    const plazacontainer = document.querySelector(".plaza-container")
    if (openMobile) {
      plazacontainer.classList.add("hidden");
      document.body.classList.add("hide-scrollbar");
      document.body.style.overflow = "hidden";
    } else {
      // const timeout = setTimeout(() => {
      document.body.classList.remove("hide-scrollbar");
      document.body.style.overflow = "auto";
      plazacontainer.classList.remove("hidden");
      // }, 200);
      // return () => clearTimeout(timeout);
    }
  }, [openMobile]);

  const handleUndo = () => {
    if (!canUndo) return;
    setHistoryIndex((i) => {
      const ni = i - 1;
      const val = history[ni];
      setAddingScss(val);
      return ni;
    });
  };

  const handleRedo = () => {
    if (!canRedo) return;
    setHistoryIndex((i) => {
      const ni = i + 1;
      const val = history[ni];
      setAddingScss(val);
      return ni;
    });
  };

  const applyValue = (next: string) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, next];
    });
    setHistoryIndex((i) => i + 1);
    setAddingScss(next);
  };

  const toAdd = (foo: string) => {
    const newItem = foo.trim();
    let base = addingScss.trim();
    setNewtextMarker(true);
    if (base === "") {
      applyValue(newItem);
      return;
    }

    if (base.includes(newItem) && !newItem.includes("!important")) {
      return;
    }

    const propMatch = newItem.match(/^([^:]+):/);
    const propName = propMatch ? propMatch[1].trim() : null;

    let resultBase = base;

    if (propName) {
      const singleInstanceProps = ["display", "color", "background", "position", "z-index", "justify-content", "align-items"];

      if (singleInstanceProps.some(p => propName === p || propName.includes(p))) {
        const regex = new RegExp(`(^|\\n|;)\\s*${propName}:[^;]+;?`, 'gi');
        resultBase = resultBase.replace(regex, "").trim();
      }
    }

    if (newItem.includes("!important") && resultBase.includes("!important")) {
      resultBase = resultBase.replace(/;(?=[^;]*$)/, " !important;");
    }

    const cleanBase = resultBase === "" ? "" : resultBase.endsWith(";") ? resultBase : resultBase + ";";
    const newBase = cleanBase === "" ? newItem : `${cleanBase}\n${newItem}`;
    console.log("<=🔹🟢==newBase=🟢🔹==>", newBase);
    applyValue(newBase);

  };

  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
  const ToRender = [
    [
      "Presets",
      [PropsNamen.presetsProps]
    ],
    [
      "Common",
      [
        PropsNamen.commonProps1,
        PropsNamen.commonProps2,
        PropsNamen.commonProps3,
        PropsNamen.commonProps6,
        PropsNamen.commonProps7
      ]
    ],
  ];
  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
  return createPortal(
    <section className="bg-white p-[30px_5px_5px_5px] fixed top-0  left-0 w-[100vw] h-[100vh]   relative z-10000 ">
      <button
        className="w-[15px] h-[15px] flex items-center justify-center text-black absolute top-1 right-1 z-100000 hover:text-gray-400 cursor-pointer transition-colors "
        onClick={() => {
          document.body.classList.remove("hide-scrollbar"); document.body.style.overflow = "auto"; document.querySelector(".plaza-container")?.classList.remove("hidden");
          setTimeout(() => {
            setOpenMobile(false)
          }, 200);
        }}
      >
        <CloseIcon />
      </button>
      <textarea
        ref={(el) => {
          if (!el) return;
          adjustHeight(el);
        }}
        value={addingScss}
        onChange={(e) => {
          const target = e.target.value;
          applyValue(target);
          adjustHeight(e.target);
        }}
        onInput={(e) => adjustHeight(e.target as HTMLTextAreaElement)}
        className="textarea-styles text-[var(--slate-800)]"
      />

      <div className="flex items-center">
        <button
          className="btn  mr-2 px-1 btn btn-empty"
          onClick={handleUndo}
          disabled={!canUndo}
        >
          ⇦
        </button>
        <button
          className="btn  mr-2 px-1 btn btn-empty"
          onClick={handleRedo}
          disabled={!canRedo}
        >
          ⇨
        </button>
        <button
          className="btn btn-allert h-6 mr-2"
          onClick={() => applyValue("")}
        >
          <Image
            src="/svg/clear.svg"
            alt="clear"
            width={16}
            height={16}
          />
        </button>
        <button
          onClick={() => {
            setAddingScss("");
            setCurrentStyle(`${currentStyle}${addingScss} `);
            setNewtextMarker(true);
            document.body.classList.remove("hide-scrollbar"); document.body.style.overflow = "auto"; document.querySelector(".plaza-container")?.classList.remove("hidden");
            setTimeout(() => {
              setOpenMobile(false)
            }, 200);
          }}
          className="btn btn-primary  "
        >
          Add
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {ToRender.map(([title, groups], index) => (
          <div key={index}>
            <h6>{title}</h6>
            {groups.map((subGroup, subIndex) => (
              <div key={subIndex}>
                {subGroup.map((el, i) => (
                  <PropsButton key={i} el={el} toAdd={toAdd} />
                ))}
              </div>
            ))}
          </div>
        ))}
        {/* <PropsButtonBlock title='Presets' PropsArray={PropsNamen.presetsProps} toAdd={toAdd} /> */}


        {/* <div className={ItemClass}>
          <h6 className={titleClass}>
            Presets
          </h6>
          {PropsNamen.presetsProps.map((item) => (
            <PropsButton key={item} item={item} toAdd={toAdd} />
          ))}
        </div> */}

        {/* <div className={ItemClass}>
          <h6 className={titleClass}>
            Common
          </h6>
          {PropsNamen.commonProps1.map((item) => (
            <PropsButton key={item} item={item} toAdd={toAdd} />
          ))}
          <hr className="opacity-0" />
          {PropsNamen.commonProps2.map((item) => (
            <PropsButton key={item} item={item} toAdd={toAdd} />
          ))}
          <hr className="opacity-0" />
          {PropsNamen.commonProps3.map((item) => (
            <PropsButton key={item} item={item} toAdd={toAdd} />
          ))}

          <hr className="opacity-0" />
          {PropsNamen.commonProps6.map((item) => (
            <PropsButton key={item} item={item} toAdd={toAdd} />
          ))}
          <hr className="opacity-0" />
          {PropsNamen.commonProps7.map((item) => (
            <PropsButton key={item} item={item} toAdd={toAdd} />
          ))}
        </div> */}

        {/* <div className={ItemClass}>
          <h6 className={titleClass}>
            Text
          </h6>
          <TextPropsPicker toAdd={toAdd} />
        </div>

        <div className={ItemClass}>
          <h6 className={titleClass}>
            Position
          </h6>
          <PositionPropsPicker toAdd={toAdd} />
        </div>

        <div className={ItemClass}>
          <h6 className={titleClass}>
            Display
          </h6>
          <DisplayPicker toAdd={toAdd} />
        </div>

        <div className={ItemClass}>
          <h6 className={titleClass}>
            Flex
          </h6>
          <FlexContainerPicker toAdd={toAdd} />
        </div>

        <div className={ItemClass}>
          <h6 className={titleClass}>
            Grid
          </h6>
          <GridContainerPicker toAdd={toAdd} />
        </div>*/}
      </div>
    </section >, document.body
  );
}

export default MobileAddStyle;