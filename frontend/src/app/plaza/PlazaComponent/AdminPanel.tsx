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
export default function AdminPanel({
  openAdmin,
  setOpenAdmin,
  resetAll,
  editMode,
  setEditMode,
}) {
  const {} = useStateContext();
  return (
    <div
      className={`${openAdmin ? "translate-x-0" : "translate-x-[calc(-100%+20px)]"} left-0 fixed bottom-0  z-5000 grid-cols-[140px_1fr] w-full h-[max-content] pt-1 grid  gap-2 bg-slate-200 rounded transition-all duration-100 ease-in-out`}
    >
      <button
        onClick={() => {
          setOpenAdmin((prev) => {
            return !prev;
          });
        }}
        className={` absolute top-0.5 translateY-[-50%] right-0 bg-[var(--light-navy)] px-1 font-bold border h-full    border-[var(--white)] transition-all duration-300 ease-in-out  hover:bg-[var(--teal)] hover:text-white hover:border-[var(--teal)] `}
      >
        <div className={`${openAdmin ? "rotate-180" : "rotate-0"}   w-3`}>
          <СhevronRight />
        </div>
      </button>
      <div className="bg-navy rounded shadow-xl p-1  border border-slate-200 max-h-[max-content]">
        <PlazaToolbar
          resetAll={resetAll}
          setEditMode={setEditMode}
          editMode={editMode}
        />
      </div>
      <AdminComponent />
    </div>
  );
}
