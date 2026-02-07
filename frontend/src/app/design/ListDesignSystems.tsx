"use client";
import React, { useState, useEffect } from "react";
import Spinner from "@/components/icons/Spinner";
import { useStateContext } from "@/providers/StateProvider";
import { useLazyQuery } from "@apollo/client";
import { GET_DESIGN_SYSTEM } from "@/apollo/queries";
import RemoveDesignSystem from "./RemoveDesignSystem";
import Loading from "@/components/ui/Loading/Loading";
import UpdateDesignSystem from "./UpdateDesignSystem";
import dynamic from "next/dynamic";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import DesigntTextNodes from "./DesigntTextNodes";
import DesignButtons from "./DesignButtons";
import "@/app/design/design.scss";
import type { HtmlNode } from "@/types/HtmlNode";
import type { DesignSystem } from "@/types/DesignSystem";
import { useRouter } from "next/navigation";
import ClearIcon from "@/components/icons/ClearIcon";
// -----------
const ModalCreateDesignSystem = dynamic(
  () => import("./ModalCreateDesignSystem"),
  { ssr: false, loading: () => <Loading /> },
);
const CONTENT = "The quick brown fox jumps over the lazy dog.";
const dBT = [
  "font-size: 14px;color: #64ffda;font-weight: 400;line-height: 1;font-family: 'Montserrat', sans-serif;display: inline-flex;align-items: center;justify-content: center;cursor: pointer;gap: 0.5rem;padding: 0.25rem 0.5rem;border-radius: 0.25rem;transition: all 200ms ease-in-out;box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);border: 1px solid transparent;border-color: #64ffda; &:hover {color: #000000;border-color: #64ffda;background-color: #64ffdb86;}; &:active {transform: translateY(1px);background-color: #64ffda;}",
  "font-size: 16px; color: #e6f1ff; font-weight: 500; line-height: 1; font-family:  'Montserrat', sans-serif; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; gap: 0.5rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; transition: all 200ms ease-in-out; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08); border-color: #4d6a92; background-color: #4d6a92; border: 1px solid #4d6a92; &:hover { border-color: #112240; background-color: #233554; } &:active { transform: translateY(1px); background-color: #64ffda; }",
  "font-size:16px; color:#000000; font-weight:500; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:18px; color:#000000; font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:20px; color:#000000; font-weight:500; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:22px; color:#000000; font-weight:600; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:24px; color:#000000; font-weight:700; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:26px; color:#000000; font-weight:800; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:28px; color:#000000; font-weight:800; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:30px; color:#000000; font-weight:900; line-height:1; font-family:'Montserrat', sans-serif;",
];
const dTN = [
  "font-size:12px;  color: #000000; font-weight:300; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:14px; color:#000000; font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:16px; color:#000000; font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:18px; color:#000000; font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:20px; color:#000000; font-weight:500; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:22px; color:#000000; font-weight:600; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:24px; color:#000000; font-weight:700; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:26px; color:#000000; font-weight:800; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:28px; color:#000000; font-weight:800; line-height:1; font-family:'Montserrat', sans-serif;",
  "font-size:30px; color:#000000; font-weight:900; line-height:1; font-family:'Montserrat', sans-serif;",
];
type Text = {
  tagName: string;
  className: string;
  style: string;
};
// ====🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ListDesignSystems({
  designSystems,
}: {
  designSystems: DesignSystem[];
}) {
  const router = useRouter();

  const { setModalMessage, updateHtmlJson } = useStateContext();
  const [modalCreateOpen, setModalCreateOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [texts, setTexts] = useState<(Text | null)[]>(Array(10).fill(null));
  const [buttons, setButtons] = useState<(Text | null)[]>(Array(10).fill(null));
  const [isTransformed, setIsTransformed] = useState<boolean>(false);
  // --------------
  const resetAll = () => {
    updateHtmlJson([]);
    setTexts(Array(10).fill(null));
    setButtons(Array(10).fill(null));
  };
  // --------------
  function generateTextNode(
    tagName: string,
    className: string,
    css: string,
  ): HtmlNode {
    const styleParts = [css].filter(Boolean).join(" ");
    return {
      tag: tagName,
      text: CONTENT,
      class: className,
      style: styleParts,
      children: [],
    };
  }
  // --------------
  const [loadDesignSystem, { loading: loadingDesignSystem }] = useLazyQuery(
    GET_DESIGN_SYSTEM,
    {
      fetchPolicy: "cache-and-network",
      onCompleted: (data) => {
        const system = data?.getDesignSystem;
        if (!system) return;

        const dtxt = system.designTexts ?? [];
        console.log("<===dtxt===>", dtxt);
        const clientTexts: Text[] = dtxt
          .filter((t) => t.tagText !== "button")
          .map((t, index) => {
            return {
              tagName: t.tagText,
              className: t.classText,
              style: t.styleText,
            };
          });
        const restxs = [
          ...clientTexts,
          ...Array(10 - clientTexts.length).fill(null),
        ];
        setTexts(restxs);
        const clientButtons: Text[] = dtxt
          .filter((b) => b.tagText === "button")
          .map((b, index) => {
            return {
              tagName: b.tagText,
              className: b.classText,
              style: b.styleText,
            };
          });
        const restbtns = [
          ...clientButtons,
          ...Array(10 - clientButtons.length).fill(null),
        ];
        setButtons(restbtns);
      },
      onError: (error) => {
        console.error(error);
        setModalMessage(error.message);
      },
    },
  );

  // --------------------
  const validTexts: Text[] = texts?.filter((t): t is Text => t !== null) ?? [];
  const validButtons: Text[] =
    buttons?.filter((t): t is Text => t !== null) ?? [];
  // --------------------
  const transformToHtmlJson = () => {
    // if (!validTexts.length) return;
    // if (!validButtons.length) return;

    // ✅ Map только по непустым элементам
    const nodes: HtmlNode[] = validTexts.map((t) =>
      generateTextNode(t.tagName || "p", t.className, t.style),
    );
    const nodesButtons: HtmlNode[] = validButtons.map((t) =>
      generateTextNode("button", t.className, t.style),
    );

    const result = ensureNodeKeys(nodes);
    const resultButtons = ensureNodeKeys(nodesButtons);
    updateHtmlJson((prev) => {
      return [...prev, ...result, ...resultButtons];
    });

    // ✅ Добавляем обработку состояния isTransformed
    setIsTransformed(true);
    setTimeout(() => {
      setIsTransformed(false);
      router.push("/plaza");
    }, 500);
  };

  // --------------------
  return (
    <div>
      <div className="flex flex-col gap-2  w-full  bg-navy rounded-2xl shadow-xl p-2 mt-4 mb-1 border border-slate-200 ">
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
                buttons={buttons}
                texts={texts}
              />

              <RemoveDesignSystem id={system.id} resetAll={resetAll} />
            </div>
          ))}
      </div>
      {!modalCreateOpen && (
        <button
          className="btn btn-teal  mb-4  text-[12px]"
          onClick={() => setModalCreateOpen(!modalCreateOpen)}
        >
          Create Design System
        </button>
      )}
      <ModalCreateDesignSystem
        modalCreateOpen={modalCreateOpen}
        setModalCreateOpen={setModalCreateOpen}
        texts={texts}
        buttons={buttons}
      />
      {(validTexts.length > 0 || validButtons.length > 0) && (
        <div className="flex items-center mt-[30px] mb-2 gap-2 w-full bg-navy rounded shadow-xl p-2   border border-slate-200 ">
          <button
            className="btn btn-teal    text-[14px]"
            onClick={transformToHtmlJson}
          >
            {isTransformed ? <Spinner /> : <span>Transform to htmlJson</span>}
          </button>
          <button
            className="btn btn-empty w-6 h-6 p-0.5 center !flex"
            onClick={() => {
              resetAll();
            }}
          >
            <ClearIcon width={34} height={34} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 mb-2 w-full bg-navy rounded-2xl shadow-xl p-2   border border-slate-200 ">
        <h6 className="text-sm text-gray-400  mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span> Text
          Nodes
        </h6>
        <DesigntTextNodes
          dTN={dTN}
          resetAll={resetAll}
          texts={texts}
          setTexts={setTexts}
        />
      </div>
      <div className="flex flex-col gap-2 mb-2 w-full bg-navy rounded-2xl shadow-xl p-2   border border-slate-200 ">
        <h6 className="text-sm text-gray-400  mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span> Button
          Nodes
        </h6>
        <DesignButtons
          dBT={dBT}
          resetAll={resetAll}
          buttons={buttons}
          setButtons={setButtons}
        />
      </div>
    </div>
  );
}
