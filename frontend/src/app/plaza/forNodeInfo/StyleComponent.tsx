"use client";
import React, { useRef, useEffect, useState } from "react";
import Loading from "@/components/ui/Loading/Loading";
import type { HtmlNode } from "@/types/HtmlNode";
import Monaco from "@/app/plaza/Monaco";
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
}

// ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
// ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
// ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
const StyleComponent: React.FC<StyleComponentProps> = ({
  node,
  styleText,
  setStyleText,
}) => {
  const [openMobile, setOpenMobile] = useState(false);
  const [openModalPseudos, setOpenModalPseudos] = useState(false);

  // ====>====>====>====>==== Monaco Theme Logic (matching PreviewComponent)





  useEffect(() => {
    if (!node?._key) return;
    // setStyleText(formatStyleString(node.style || ""))
  }, [node]);



  // ====>====>====>====>====>====>====>====>====>====>
  return (
    <>
      <ModalPseudos openModalPseudos={openModalPseudos} setOpenModalPseudos={setOpenModalPseudos} />

      {/*{openMobile && <MobileAddStyle
        setCurrentStyle={setCurrentStyle}
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
      // nodeStyle={JSON.stringify(node?.style)}
      /> } */}
      <div className="unitStyle">
        <div className="flex  items-center gap-1 p-[5px]">
          <h6 className="my-1">Style:</h6>
          <button
            className="btn btn-empty text-[12px] text-[var(--black)] mr-1 px-1 !max-h-[20px"
            onClick={() =>
              setOpenModalPseudos((prev) => {
                return !prev;
              })
            }
          >
            Pseudos
          </button>
          {/* <button
            className="btn btn-empty text-[12px] text-[var(--black)]  px-1 !max-h-[20px]"
            onClick={() => setOpenMobile(!openMobile)}
          >
            Add
          </button> */}
        </div>
        <Monaco text={styleText} setText={setStyleText} />

      </div>
    </>
  );
};

export default StyleComponent;
