"use client";
import React, { useState, useEffect } from "react";
import DesignColors from "./DesignColors";
import Spinner from "@/components/icons/Spinner";
import { useStateContext } from "@/providers/StateProvider";
import { useLazyQuery } from "@apollo/client";
import { GET_DESIGN_SYSTEM } from "@/apollo/queries";
import RemoveDesignSystem from "./RemoveDesignSystem";
import Loading from "@/components/ui/Loading/Loading";
import UpdateDesignSystem from "./UpdateDesignSystem";
import DesignFonts from "./DesignFonts";
import dynamic from "next/dynamic";
import ClearIcon from "@/components/icons/ClearIcon";
import DesignTypography from "./DesignTypography";
import DesignFontSizes from "./DesignFontSizes";
import { generateHeaderNodesFromDS } from "./generateHeaderNodesFromDS";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import DesigntTextNodes from "./DesigntTextNodes";

const ModalCreateDesignSystem = dynamic(
  () => import("./ModalCreateDesignSystem"),
  { ssr: false, loading: () => <Loading /> },
);

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
export type FontSlot = {
  id: string; // "headersfont", "font2" — используется в UI
  label: string; // подпись в UI
  family: string; // имя шрифта (Inter, Roboto) — это и есть value для базы
  importString: string; // строка @import, только для фронта
};

type FontSizeState = {
  fontSizeHeader1: string;
  fontSizeHeader2: string;
  fontSizeHeader3: string;
  fontSizeHeader4: string;
  fontSizeHeader5: string;
  fontSizeHeader6: string;
};

// ====🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ListDesignSystems({ designSystems }) {
  const {
    setModalMessage,
    updateHtmlJson,
    backgrounds,
    setBackgrounds,
    colors,
    setColors,
    fonts,
    setFonts,
    fontSizes,
    setFontSizes,
  } = useStateContext();
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const DEFAULT_BACKGROUNDS: BackgroundState = {
    background1: "",
    background2: "",
    background3: "",
    background4: "",
    background5: "",
  };
  const DEFAULT_COLORS: ColorState = {
    headers1color: "",
    headers2color: "",
    headers3color: "",
    headers4color: "",
    headers5color: "",
    headers6color: "",
    color7: "",
    color8: "",
    color9: "",
    color10: "",
  };
  const DEFAULT_FONTS: FontSlot[] = [
    { id: "headers1font", label: "headers1font", family: "", importString: "" },
    { id: "headers2font", label: "headers2font", family: "", importString: "" },
    { id: "headers3font", label: "headers3font", family: "", importString: "" },
    { id: "headers4font", label: "headers4font", family: "", importString: "" },
    { id: "headers5font", label: "headers5font", family: "", importString: "" },
    { id: "headers6font", label: "headers6font", family: "", importString: "" },
  ];
  const DEFAULT_FONT_SIZES: FontSizeState = {
    fontSizeHeader1: "",
    fontSizeHeader2: "",
    fontSizeHeader3: "",
    fontSizeHeader4: "",
    fontSizeHeader5: "",
    fontSizeHeader6: "",
  };

  const setFontSize = (key: keyof FontSizeState, value: string) => {
    setFontSizes((prev) => ({ ...prev, [key]: value }));
  };

  const setBackground = (key: keyof BackgroundState, value: string) => {
    setBackgrounds((prev) => ({ ...prev, [key]: value }));
  };

  const setColor = (key: keyof ColorState, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };
  const updateFontSlot = (id: string, patch: Partial<FontSlot>) => {
    setFonts((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  // ---------------
  useEffect(() => {
    if (!colors) return;
    console.log("<===colors===>", colors);
  }, [colors]);
  useEffect(() => {
    if (!fonts) return;
    console.log("<===fonts===>", fonts);
  }, [fonts]);
  useEffect(() => {
    if (!fontSizes) return;
    console.log("<===fontSizes===>", fontSizes);
  }, [fontSizes]);

  // ---------------
  function buildBackgrounds() {
    return Object.entries(backgrounds)
      .filter(([, value]) => value)
      .map(([background, value]) => ({
        background,
        value: value as string,
      }));
  }

  function buildColors() {
    return Object.entries(colors)
      .filter(([, value]) => value)
      .map(([color, value]) => ({
        color,
        value: value as string,
      }));
  }
  function buildFonts() {
    return fonts
      .filter((f) => !!f.family)
      .map((f) => ({
        font: f.id,
        value: f.family,
      }));
  }
  function buildFontSizes() {
    return Object.entries(fontSizes)
      .filter(([, value]) => value)
      .map(([fontSize, value]) => ({
        fontSize,
        value: value as string,
      }));
  }

  const resetAll = () => {
    setBackgrounds(DEFAULT_BACKGROUNDS);
    setColors(DEFAULT_COLORS);
    setFonts(DEFAULT_FONTS);
    setFontSizes(DEFAULT_FONT_SIZES);
    // updateHtmlJson([]);
  };

  const [loadDesignSystem, { loading: loadingDesignSystem }] = useLazyQuery(
    GET_DESIGN_SYSTEM,
    {
      fetchPolicy: "cache-and-network",
      onCompleted: (data) => {
        const system = data?.getDesignSystem;
        if (!system) return;

        const bgs = system.backgrounds ?? [];
        const cls = system.colors ?? [];
        const fts = system.fonts ?? [];
        const fss = system.fontSizes ?? [];
        setBackgrounds((prev) => {
          const next = { ...prev };
          bgs.forEach((bg: any) => {
            if (bg.background in next) {
              (next as any)[bg.background] = bg.value;
            }
          });
          return next;
        });

        setColors((prev) => {
          const next = { ...prev };
          cls.forEach((c: any) => {
            if (c.color in next) {
              (next as any)[c.color] = c.value;
            }
          });
          return next;
        });
        setFonts((prev) =>
          prev.map((slot) => {
            const found = fts.find((f: any) => f.font === slot.id);
            if (!found) return slot;
            return {
              ...slot,
              family: found.value,
              importString: slot.importString,
            };
          }),
        );
        setFontSizes((prev) => {
          const next = { ...prev };
          fss.forEach((fs: any) => {
            if (fs.fontSize in next) {
              (next as any)[fs.fontSize] = fs.value;
            }
          });
          return next;
        });
      },
      onError: (error) => {
        console.error(error);
        setModalMessage(error.message);
      },
    },
  );

  // -- 🧪-- 🧪-- 🧪-- 🧪 если htmlJson пустой → генерим h1–h6 из текущей DS
  useEffect(() => {
    if (!selectedId || !colors) return;
    updateHtmlJson((prev: any) => {
      if (prev && Array.isArray(prev) && prev.length > 0) return prev;
      const content = generateHeaderNodesFromDS(colors, fonts, fontSizes);
      const resultWithKeys = ensureNodeKeys(content) as ProjectData[];
      return resultWithKeys;
    });
  }, [selectedId, colors]);

  // --------------------
  return (
    <div>
      <button
        className="btn btn-teal mt-4 mb-1 w-full text-[12px]"
        onClick={() => setModalCreateOpen(!modalCreateOpen)}
      >
        Create Design System
      </button>
      <ModalCreateDesignSystem
        modalCreateOpen={modalCreateOpen}
        setModalCreateOpen={setModalCreateOpen}
        buildBackgrounds={buildBackgrounds}
        buildColors={buildColors}
        buildFonts={buildFonts}
        buildFontSizes={buildFontSizes}
      />
      <div className="flex flex-col gap-2  w-full mt-[30px] bg-navy rounded-2xl shadow-xl p-2   border border-slate-200 ">
        {designSystems.length === 0 && (
          <div className="flex flex-col items-center justify-center">
            <p className="text-[var(--teal)]">No design systems found</p>
          </div>
        )}

        {designSystems.length > 0 &&
          designSystems.map((system: any) => (
            <div className="flex items-center " key={system.id}>
              <button
                onClick={() => {
                  loadDesignSystem({ variables: { id: system.id } });
                  setSelectedId(system.id);
                }}
                className="btn px-2  mr-2 border-slate-400 border min-h-[20px]"
              >
                {loadingDesignSystem && selectedId === system.id ? (
                  <Spinner />
                ) : (
                  system.name
                )}
              </button>

              <UpdateDesignSystem
                id={system.id}
                buildBackgrounds={buildBackgrounds}
                buildColors={buildColors}
                buildFonts={buildFonts}
                buildFontSizes={buildFontSizes}
              />

              <RemoveDesignSystem id={system.id} resetAll={resetAll} />
            </div>
          ))}
      </div>
      <div className="flex flex-col gap-2 mb-2 w-full mt-[30px] bg-navy rounded-2xl shadow-xl p-2   border border-slate-200 ">
        <button
          className="btn btn-empty w-6 h-6 p-1 "
          onClick={() => {
            resetAll();
          }}
        >
          <ClearIcon width={16} height={16} />
        </button>
        <h6 className="text-sm text-gray-400 mt-6 mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span> Colors
        </h6>
        <DesignColors
          backgrounds={backgrounds}
          colors={colors}
          setBackground={setBackground}
          setColor={setColor}
        />
        <h6 className="text-sm text-gray-400 mt-6 mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span> Fonts
        </h6>
        <DesignFonts slots={fonts} updateSlot={updateFontSlot} />
        <h6 className="text-sm text-gray-400 mt-6 mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span> Font
          Sizes
        </h6>
        <DesignFontSizes fontSizes={fontSizes} setFontSize={setFontSize} />

        <h6 className="text-sm text-gray-400 mt-6 mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span>{" "}
          Typography
        </h6>
        <DesignTypography colors={colors} fonts={fonts} fontSizes={fontSizes} />
        <h6 className="text-sm text-gray-400 mt-6 mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span> Text
          Nodes
        </h6>
        <DesigntTextNodes />
      </div>
    </div>
  );
}
