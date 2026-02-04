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
import "@/app/design/design.scss";
import type { HtmlNode } from "@/types/HtmlNode";
import type { DesignSystem } from "@/types/DesignSystem";
import { useRouter } from "next/navigation";

const ModalCreateDesignSystem = dynamic(
  () => import("./ModalCreateDesignSystem"),
  { ssr: false, loading: () => <Loading /> },
);
const CONTENT = "The quick brown fox jumps over the lazy dog.";
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

  const { setModalMessage, updateHtmlJson, setDesignTexts } = useStateContext();
  const [modalCreateOpen, setModalCreateOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [texts, setTexts] = useState<(Text | null)[]>(Array(10).fill(null));
  const [isTransformed, setIsTransformed] = useState<boolean>(false);
  // --------------
  const resetAll = () => {
    updateHtmlJson([]);
    setTexts([]);
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

        const clientTexts: Text[] = dtxt.map((t, index) => {
          return {
            tagName: t.tagText,
            className: t.classText,
            style: t.styleText,
          };
        });
        setTexts(clientTexts);
      },
      onError: (error) => {
        console.error(error);
        setModalMessage(error.message);
      },
    },
  );

  // --------------------
  const validTexts: Text[] = texts?.filter((t): t is Text => t !== null) ?? [];
  const transformToHtmlJson = () => {
    if (!validTexts.length) return;

    // ✅ Map только по непустым элементам
    const nodes: HtmlNode[] = validTexts.map((t) =>
      generateTextNode(t.tagName || "p", t.className, t.style),
    );

    const result = ensureNodeKeys(nodes);
    updateHtmlJson((prev) => {
      return [...prev, ...result];
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
      <button
        className="btn btn-teal mt-4 mb-1 w-full text-[12px]"
        onClick={() => setModalCreateOpen(!modalCreateOpen)}
      >
        Create Design System
      </button>
      <ModalCreateDesignSystem
        modalCreateOpen={modalCreateOpen}
        setModalCreateOpen={setModalCreateOpen}
        texts={texts}
      />
      <div className="flex flex-col gap-2  w-full  bg-navy rounded-2xl shadow-xl p-2   border border-slate-200 mb-4">
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

              <UpdateDesignSystem id={system.id} texts={texts} />

              <RemoveDesignSystem id={system.id} resetAll={resetAll} />
            </div>
          ))}
      </div>
      {validTexts.length > 0 && (
        <button
          className="btn btn-teal  mt-[30px] mb-1 text-[14px]"
          onClick={transformToHtmlJson}
        >
          {isTransformed ? <Spinner /> : <span>Transform to htmlJson</span>}
        </button>
      )}

      <div className="flex flex-col gap-2 mb-2 w-full bg-navy rounded-2xl shadow-xl p-2   border border-slate-200 ">
        <h6 className="text-sm text-gray-400  mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span> Text
          Nodes
        </h6>
        <DesigntTextNodes
          resetAll={resetAll}
          texts={texts}
          setTexts={setTexts}
        />
      </div>
    </div>
  );
}
