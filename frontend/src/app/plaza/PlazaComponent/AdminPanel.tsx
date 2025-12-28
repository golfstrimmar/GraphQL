"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { UPDATE_PROJECT, REMOVE_PROJECT } from "@/apollo/mutations";
import { GET_ALL_PROJECTS_BY_USER, FIND_PROJECT } from "@/apollo/queries";
import { Loading } from "@/components/Loading/Loading";
import СhevronRight from "@/components/icons/СhevronRight";
import PlazaToolbar from "./PlazaToolbar";
import AdminComponent from "./AdminComponent";
import ServisButtons from "./ForToolbar/ServisButtons";
export default function AdminPanel({
  openAdmin,
  setOpenAdmin,
  resetAll,
  editMode,
  setEditMode,
  previewRef,
  canvasRef,
  projectsRef,
}) {
  const {} = useStateContext();
  return (
    <div
      className={`${openAdmin ? "translate-x-0" : "translate-x-[calc(-100%+20px)]"} left-0 fixed bottom-0  z-5000  w-full  pt-1  bg-slate-200 rounded transition-all duration-100 ease-in-out`}
    >
      <button
        onClick={() => {
          setOpenAdmin((prev) => {
            return !prev;
          });
        }}
        className={` absolute top-0 text-[#000] right-0 bg-slate-200  hover:bg-slate-300  h-full font-bold transition-all duration-300 ease-in-out btn-teal !p-0.5`}
      >
        <div
          className={`!px-0.5 center  border-2 border-[var(--teal)] bg-[var(--teal-light)] rounded  h-full w-4`}
        >
          <СhevronRight width={16} height={16} />
        </div>
      </button>
      <div
        className="bg-navy rounded shadow-xl p-1  border border-slate-200   grid   grid-cols-[max-content_1fr] grid-rows-[max-content_1fr]  gap-2"
        style={{ gridTemplateAreas: `'a b' 'a c'` }}
      >
        <div className="[grid-area:a] h-full border-r-2  border-slate-300 pr-1">
          <PlazaToolbar
            previewRef={previewRef}
            canvasRef={canvasRef}
            projectsRef={projectsRef}
            resetAll={resetAll}
            setEditMode={setEditMode}
            editMode={editMode}
          />
        </div>
        <div className="[grid-area:b]">
          <ServisButtons
            resetAll={resetAll}
            setEditMode={setEditMode}
            editMode={editMode}
          />
        </div>
        <div className="[grid-area:c]">
          <AdminComponent />
        </div>
      </div>
    </div>
  );
}
