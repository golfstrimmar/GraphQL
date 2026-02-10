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
import { CONTENT, dTN, dBT } from "@/app/design/defaults";
// -----------
const ModalCreateDesignSystem = dynamic(
  () => import("./ModalCreateDesignSystem"),
  { ssr: false, loading: () => <Loading /> },
);

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

  const { showModal, updateHtmlJson } = useStateContext();
  const [modalCreateOpen, setModalCreateOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [texts, setTexts] = useState<(Text | null)[]>(Array(10).fill(null));
  const [buttons, setButtons] = useState<(Text | null)[]>(Array(10).fill(null));
  const [isTransformed, setIsTransformed] = useState<boolean>(false);
  const [images, setImages] = useState<DesignImage[]>([]);
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
        const dimg = system.images ?? [];
        console.log("<===dtxt===>", dtxt);
        console.log("<===dimg===>", dimg);
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
        setImages(dimg);
      },
      onError: (error) => {
        console.error(error);
        showModal(error.message, "error");
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
      <div className="flex flex-col gap-2 mb-2 w-full bg-navy rounded-2xl shadow-xl p-2   border border-slate-200 ">
        <h6 className="text-sm text-gray-400  mb-1">
          <span className="bg-[var(--teal)] w-2 h-2 rounded-full"></span> Image
          Nodes
        </h6>
        {images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="w-24 h-24 overflow-hidden rounded border border-slate-600"
              >
                <img
                  src={img.url}
                  alt={img.alt || img.publicId}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
