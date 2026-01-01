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
import Loading from "@/components/ui/Loading/Loading";
import PageHeader from "../PageHeader";
import PProject from "@/types/PProject";

export interface ProjectNode {
  _key?: string;
  tag: string;
  text: string;
  class: string;
  style: string;
  children: (ProjectNode | string)[];
}

// 🔹🔹🔹🔹🔹🔹🔹🔹🔹
// 🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default function ProjectsList() {
  const { user } = useStateContext();
  const [projects, setProjects] = useState<PProject[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  // =====
  const variables = React.useMemo(() => ({ userId: user?.id }), [user?.id]);
  const { data, loading, error } = useQuery(GET_ALL_PROJECTS_BY_USER, {
    variables,
    skip: !user?.id,
    fetchPolicy: "cache-and-network",
  });

  // ===================================
  useEffect(() => {
    if (data?.getAllProjectsByUser) {
      setProjects(data?.getAllProjectsByUser);
    }
  }, [data]);

  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹
  return (
    <div>
      {PageHeader("projectsIcon", "Your Ulon projects")}
      {loading ? (
        <Loading />
      ) : projects?.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📁</span>
          </div>
          <p className="text-slate-600 text-lg mb-6">No projects yet</p>
        </div>
      ) : (
        <div className=" flex flex-wrap gap-2 mb-6 ">
          {projects?.map((p) => (
            <div key={p.id} className={`flex gap-2 w-full `}>
              <div
                className={`gap-2 w-full group rounded relative p-1   border   ${
                  projectId === p.id
                    ? " border-[var(--teal)] flex flex-col bg-[var(--teal-navi)] text-[var(--white)]"
                    : "hover:bg-slate-300 hover:border-[var(--teal)] hover:text-[var(--teal-light)] border-transparent bg-slate-200"
                }`}
              >
                <button
                  className={`w-full text-left  text-sm font-medium `}
                  // onClick={async () => setpId(p.id)}
                  type="button"
                  // disabled={loadingProject || projectId === p.id}
                >
                  {/*{loadingProject ? <Loading /> : p?.name}*/}
                  {p?.name}
                </button>
              </div>

              {/*======== update Remove =========*/}
              {/*{projectId && projectId !== "" && projectId === p.id && (
                <div className="flex items-center gap-3">
                  <button
                    className="btn  btn-primary font-bold text-slate-800 !py-0"
                    type="button"
                    onClick={() => updateTempProject()}
                  >
                    <div
                      className={`${loadingUpdateProject ? "spin-fast" : ""} w-4 h-4 overflow-hidden`}
                    >
                      <Update />
                    </div>
                    <span className="text-sm font-medium ml-2">
                      Update
                    </span>
                  </button>
                </div>
              )}*/}
              {/*=================*/}
              {/*<button
                className=" btn px-2 btn-allert min-w-[max-content]  gap-2"
                type="button"
                onClick={() => delProject(p.id)}
              >
                <span className="text-sm font-medium">Remove</span>
              </button>*/}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
