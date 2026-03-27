"use client";
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import { useStateContext } from "@/providers/StateProvider";

// import  Loading  from "@/components/ui/Loading/Loading";
// import dynamic from "next/dynamic";

// const DynamicComponent = dynamic(
//   () => import("@/components/DynamicComponent/DynamicComponent"),
//   {
//     ssr: false,
//     loading: () => <Loading />
//   }
// );




// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function SlidersConstructor() {
  const { updateHtmlJson } = useStateContext();

  return (
    <div className="">
      <p>SlidersConstructor</p>
    </div>
  );
}

