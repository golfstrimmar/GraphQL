"use client";
import React, { useState, useEffect } from "react";
import ColorPicker from "./ColorPicker";


// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function PropsButton({ el, toAdd }: { el: string, toAdd: (text: string) => void }) {
  const [open, setOpen] = useState<boolean>(false);

  if (el.split(":")[0].trim() === "color" || el.split(":")[0].trim() === "background") {
    return (
      <>
        <ColorPicker
          el={el}
          toAdd={toAdd}
          open={open}
          setOpen={setOpen}
        />

        <button
          onClick={() => { setOpen(true); }}
          className="px-1  btn btn-empty text-[12px] text-[var(--slate-800)] mr-1"
        >
          {el}
        </button>
      </>
    )
  } else {
    return (

      <button
        onClick={() => toAdd(el)}
        className="px-1  btn btn-empty text-[12px] text-[var(--slate-800)] mr-1"
      >
        {el}
      </button>
    )
  }
}
