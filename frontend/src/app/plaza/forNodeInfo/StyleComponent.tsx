"use client";
import React, { useRef, useEffect, useState } from "react";
import Loading from "@/components/ui/Loading/Loading";
import type { HtmlNode } from "@/types/HtmlNode";
import Monaco from "@/app/plaza/Monaco";
import { useStateContext } from "@/providers/StateProvider";
import dynamic from "next/dynamic";

const MobileAddStyle = dynamic(
  () => import("../forStyleComponent/MobileAddStyle"),
  {
    ssr: false,
    loading: () => <Loading />,
  },
);
const ModalPseudos = dynamic(
  () => import("@/app/plaza/forStyleComponent/ModalPseudos"),
  {
    ssr: false,
    loading: () => <Loading />
  }
);

interface StyleComponentProps {
  node: HtmlNode;
  styleText: string;
  setStyleText: (styleText: string) => void;
  updateNodeByKey: (key: string, data: any) => void;
}

// ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
// ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
// ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
const StyleComponent: React.FC<StyleComponentProps> = ({
  node,
  styleText,
  setStyleText,
  updateNodeByKey
}) => {
  const [openMobile, setOpenMobile] = useState<boolean>(false);
  const [openModalPseudos, setOpenModalPseudos] = useState<boolean>(false);

  const { newtextMarker, setNewtextMarker } = useStateContext();

  // ====>====>====>====>===

  useEffect(() => { if (!openMobile) return; console.log('<===openMobile===>', openMobile); }, [openMobile]);

  useEffect(() => {
    if (!styleText) return;
    console.log('<===styleText===>', styleText);

  }, [styleText]);

  useEffect(() => {
    if (!node?._key) return;
    // setStyleText(formatStyleString(node.style || ""))
  }, [node]);



  // ====>====>====>====>====>====>====>====>====>====>
  return (
    <>


      <div className="unitStyle">
        <div className="flex  items-center gap-1 p-[5px]">
          <button className={`
          ${newtextMarker ? "admin-shimmer--red" : "bg-transparent"} 
          btn btn-empty text-[12px]  mr-1 px-1 !-h-[20px]`}
            onClick={() => {
              setNewtextMarker(false);
              updateNodeByKey(node._key, { style: styleText });
            }}>
            <h6>Style:</h6>

          </button>
          <button className="btn btn-empty text-[12px] text-[var(--black)] mr-1 px-1 !h-[20px]" onClick={() => setOpenMobile(!openMobile)}>
            Add style
          </button>
          <button
            className="btn btn-empty text-[12px] text-[var(--black)] mr-1 px-1 !h-[20px]"
            onClick={() =>
              setOpenModalPseudos((prev) => {
                return !prev;
              })
            }
          >
            Pseudos
          </button>
        </div>
        {openMobile &&
          <MobileAddStyle
            currentStyle={styleText}
            setCurrentStyle={setStyleText}
            openMobile={openMobile}
            setOpenMobile={setOpenMobile}

          />
        }
        {openModalPseudos && (
          <ModalPseudos
            styleText={styleText}
            setStyleText={setStyleText}
            openModalPseudos={openModalPseudos}
            setOpenModalPseudos={setOpenModalPseudos}

          />)}
        <Monaco
          text={styleText}
          setText={setStyleText}

        />

      </div>
    </>
  );
};

export default StyleComponent;
