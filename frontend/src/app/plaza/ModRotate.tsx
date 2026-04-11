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
export default function ModRotate({ offset, tags, setTempTag, title, loading, clicked, setClicked }: { offset: number, tags: { tag: string[]; color: string }[]; setTempTag: (tag: string) => void, title: string, loading: boolean, clicked: string, setClicked: (clicked: string) => void }) {

  const [openModRotate, setOpenModRotate] = useState<boolean>(false);

  return createPortal(
    <section
      onMouseLeave={() => setOpenModRotate(false)}
      className={`rotate-tags border-[2px] !border-[var(--teal)] ${openModRotate ? "open-mod-rotate" : ""}`}
      style={{

        zIndex: openModRotate ? 1000 : 1,
      }}
    >


      <button className="btn btn-teal   !bg-[var(--navy)] admin-shimmer rounded-r-sm  !py-3 border-1 border-[#aaa] text-white text-[12px] absolute rotate-90 "
        style={{
          background: "steelblue",
          height: 20,
          width: 20,
          bottom: -40,
          right: `${offset}px`,
        }} onMouseLeave={(e: any) => e.stopPropagation()} onClick={() => { setOpenModRotate(true) }} >
        <div className=" p-2">
          {title}
        </div>
      </button>

      <div className="flex flex-wrap gap-1 ">
        {tags && tags.map((el, i) => (
          <button
            key={i}
            className="btn adminButton px-1.5! border-1 border-[#aaa] text-black text-[12px]"
            style={{ background: el.color }}
            type="button"
            onClick={() => { setClicked(el.tag); setTempTag(el.tag); }}
          >
            {loading && clicked === el.tag ? <Spinner /> : <span>{el.tag}</span>}
          </button>
        ))}
      </div>

    </section >, document.body
  );
}

