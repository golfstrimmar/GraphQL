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
import inlineStyleStringToObject from "@/app/design/inlineStyleStringToObject";
import "@/app/design/design.scss";
const ModalCreateDesignSystem = dynamic(
  () => import("./ModalCreateDesignSystem"),
  { ssr: false, loading: () => <Loading /> },
);
const BASE_STYLE = "padding: 2px 4px; border: 1px solid #adadad;";
const CONTENT = "The quick brown fox jumps over the lazy dog.";
// ====🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ListDesignSystems({ designSystems }) {
  const { setModalMessage, designTexts, setDesignTexts, updateHtmlJson } =
    useStateContext();
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  // --------------
  const resetAll = () => {
    updateHtmlJson([]);
    setDesignTexts([]);
  };
  // --------------
  function generateTextNode(className: string, css: string): HtmlNode {
    const styleParts = [BASE_STYLE, css].filter(Boolean).join(" ");

    return {
      tag: "p",
      text: CONTENT,
      class: className,
      style: styleParts,
      children: [],
    };
  }
  const [loadDesignSystem, { loading: loadingDesignSystem }] = useLazyQuery(
    GET_DESIGN_SYSTEM,
    {
      fetchPolicy: "cache-and-network",
      onCompleted: (data) => {
        const system = data?.getDesignSystem;
        if (!system) return;

        const dtxt = system.designTexts ?? [];

        // 1) для контекста designTexts (клиентский формат)
        const clientTexts: Text[] = dtxt.map((t, index) => {
          const className = t.classText || `text${index + 1}`;
          return {
            class: className,
            style: t.styleText,
            // эти поля можно достроить, если нужно
            reactStyle: inlineStyleStringToObject(
              [BASE_STYLE, t.styleText].filter(Boolean).join(" "),
            ),
            content: CONTENT,
          };
        });

        setDesignTexts(
          clientTexts.map((t) => ({
            class: t.class,
            style: t.style,
          })),
        );

        // 2) генерим HtmlNode[] и кидаем в updateHtmlJson
        const nodes: HtmlNode[] = clientTexts.map((t) =>
          generateTextNode(t.class, t.style),
        );

        const result = ensureNodeKeys(nodes);
        updateHtmlJson(result);
      },
      onError: (error) => {
        console.error(error);
        setModalMessage(error.message);
      },
    },
  );

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

              <UpdateDesignSystem id={system.id} />

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
        {/*<h6 className="text-sm text-gray-400 mt-6 mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span> Colors
        </h6>*/}
        {/*<DesignColors
          backgrounds={backgrounds}
          // colors={colors}
          setBackground={setBackground}
          // setColor={setColor}
        />*/}
        {/*<h6 className="text-sm text-gray-400 mt-6 mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span> Fonts
        </h6>*/}
        {/*<DesignFonts slots={fonts} updateSlot={updateFontSlot} />*/}
        {/*<h6 className="text-sm text-gray-400 mt-6 mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span> Font
          Sizes
        </h6>*/}
        {/*<DesignFontSizes fontSizes={fontSizes} setFontSize={setFontSize} />*/}

        {/*<h6 className="text-sm text-gray-400 mt-6 mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span>{" "}
          Typography
        </h6>*/}
        {/*<DesignTypography colors={colors} fonts={fonts} fontSizes={fontSizes} />*/}
        <h6 className="text-sm text-gray-400 mt-6 mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span> Text
          Nodes
        </h6>
        <DesigntTextNodes />
      </div>
    </div>
  );
}
