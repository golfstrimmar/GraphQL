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

import ServicesButtons from "./ServicesButtons";
import AdminComponent from "./AdminComponent";



// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ScrollButtons() {
  const { } = useStateContext();
  const pathname = usePathname();
  const router = useRouter();

  const isPlaza = () => pathname === "/plaza";
  const containerClass = isPlaza() ? "container" : "";

  return (
    <div className=" fixed  flex flex-col gap-2 fixed bottom-[45%] left-[2px] w-4  bg-black/60 backdrop-blur-lg admin-shimmer rounded-r-sm py-1  z-[5000]">
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
        ⇧
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
        ⇩
      </button>

      <JsonToHtmlButton cN="!py-4" />
      <ServicesButtons />
      <AdminComponent />
    </div>
  );
}

