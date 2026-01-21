"use client";
import React, { useState } from "react";
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
import { divide } from "lodash";
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
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
  color6: string;
  color7: string;
  color8: string;
  color9: string;
  color10: string;
};
export type FontSlot = {
  id: string; // "font1", "font2" — используется в UI
  label: string; // подпись в UI
  family: string; // имя шрифта (Inter, Roboto) — это и есть value для базы
  importString: string; // строка @import, только для фронта
};
// ====🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ListDesignSystems({ designSystems }) {
  const { setModalMessage } = useStateContext();
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
    color1: "",
    color2: "",
    color3: "",
    color4: "",
    color5: "",
    color6: "",
    color7: "",
    color8: "",
    color9: "",
    color10: "",
  };
  const DEFAULT_FONTS: FontSlot[] = [
    { id: "font1", label: "font1", family: "", importString: "" },
    { id: "font2", label: "font2", family: "", importString: "" },
    { id: "font3", label: "font3", family: "", importString: "" },
    { id: "font4", label: "font4", family: "", importString: "" },
    { id: "font5", label: "font5", family: "", importString: "" },
  ];
  const [backgrounds, setBackgrounds] =
    useState<BackgroundState>(DEFAULT_BACKGROUNDS);
  const [colors, setColors] = useState<ColorState>(DEFAULT_COLORS);
  const [fonts, setFonts] = useState<FontSlot[]>(DEFAULT_FONTS);

  const setBackground = (key: keyof BackgroundState, value: string) => {
    setBackgrounds((prev) => ({ ...prev, [key]: value }));
  };

  const setColor = (key: keyof ColorState, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };
  const updateFontSlot = (id: string, patch: Partial<FontSlot>) => {
    setFonts((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };
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

  const resetAll = () => {
    setBackgrounds(DEFAULT_BACKGROUNDS);
    setColors(DEFAULT_COLORS);
    setFonts(DEFAULT_FONTS);
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
              importString: slot.importString, // можешь сюда засунуть buildGoogleImport(found.value) если хочешь
            };
          }),
        );
      },
      onError: (error) => {
        console.error(error);
        setModalMessage(error.message);
      },
    },
  );

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
      </div>
    </div>
  );
}
