"use client";
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { UPDATE_PROJECT, REMOVE_PROJECT } from "@/apollo/mutations";
import { GET_ALL_PROJECTS_BY_USER, FIND_PROJECT } from "@/apollo/queries";
import Loading from "@/components/ui/Loading/Loading";
import PreviewIcon from "@/components/icons/PreviewIcon";
import WorkerIcon from "@/components/icons/WorkerIcon";
import JsonToHtmlButton from "./JsonToHtmlButton";
import HiddenButton from "./HiddenButton";




// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ScrollButtons() {
  const { } = useStateContext();
  const pathname = usePathname();
  const router = useRouter();

  const isPlaza = () => pathname === "/plaza";
  const containerClass = isPlaza() ? "container" : "";

  return (
    <div className=" fixed  flex flex-col gap-4 fixed top-[400px]  left-[2px] w-4  bg-[var(--lightest-slate)] admin-shimmer rounded-r-sm py-1 pb-[110px] z-[5000]">
      <button
        className="btn-teal !bg-[var(--navy)] w-full !p-0.25 flex-[40px] center"
        type="button"
        onMouseEnter={() => {
          const el = document.getElementById("preview-section");
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }}
      >
        <PreviewIcon width={14} height={14} />
      </button>
      <button
        className="btn-teal !bg-[var(--navy)] w-full !p-0.25  flex-[40px] center"
        type="button"
        onMouseEnter={() => {
          const el = document.getElementById("canvas-section");
          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }}
      >
        <WorkerIcon width={14} height={14} />

      </button>
      <HiddenButton />
      <JsonToHtmlButton cN="!py-4" />
      <button
        className="btn-teal !bg-[var(--navy)] w-[300px] h-[100px] text-right !p-0.25 absolute bottom-[5px] right-[2px] flex-[100px] flex items-center justify-end"
        type="button"
        onMouseEnter={() => {
          const el = document.getElementById("admin-siction");
          el.classList.toggle("!translate-y-[0%]");
        }}
      >
        A

      </button>



    </div>
  );
}

