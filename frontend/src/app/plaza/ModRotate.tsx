"use client";
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Loading from "@/components/ui/Loading/Loading";
import dynamic from "next/dynamic";

import Spinner from "@/components/icons/Spinner";
const HeroIconPicker = dynamic(() => import("./HeroIconPicker"), {
  ssr: false,
  loading: () => <Loading />,
});


// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ModRotate({ tags, setTempTag, loading, clicked, setClicked, openModRotate, setOpenModRotate }: { tags: { tag: string[]; color: string }[]; setTempTag: (tag: string) => void, loading: boolean, clicked: string, setClicked: (clicked: string) => void, openModRotate: boolean, setOpenModRotate: (openModRotate: boolean) => void }) {


  const refbtn = useRef<HTMLButtonElement | null>(null);

  return createPortal(
    <section
      onMouseLeave={() => setOpenModRotate(false)}
      className={`rotate-tags  ${openModRotate ? "open-mod-rotate" : ""}`}
      style={{

        // zIndex: openModRotate ? 1000 : 1,
      }}
    >
      <div className="flex  flex-wrap gap-1 ">
        {tags && tags.map((el, i) => (
          <button
            ref={refbtn}
            key={i}
            className="btn adminButton px-1.5! border-1 border-[#aaa] text-black text-[12px]"
            style={{
              background: el.color, width: 60,
            }}
            type="button"
            onClick={() => { setClicked(el.tag); setTempTag(el.tag); }}
          >
            {loading && clicked === el.tag ? (
              <Spinner />
            ) : (
              <span>{el.tag}</span>
            )}
          </button>
        ))}
      </div>

    </section >, document.body
  );
}

