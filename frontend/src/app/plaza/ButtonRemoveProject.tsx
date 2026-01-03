"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { REMOVE_PROJECT } from "@/apollo/mutations";
import { GET_ALL_PROJECTS_BY_USER } from "@/apollo/queries";
export default function ButtonRemoveProject({ id }) {
  const { setModalMessage, setFlagReset } = useStateContext();
  const router = useRouter();

  const [removeProject] = useMutation(REMOVE_PROJECT, {
    refetchQueries: [GET_ALL_PROJECTS_BY_USER],
    awaitRefetchQueries: true,
  });
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹
  const delProject = async (id: string) => {
    if (!id) return;
    const { data } = await removeProject({ variables: { projectId: id } });
    if (data) {
      console.log("<===data removeProject===>", data);
      setModalMessage("Project removed");
      setFlagReset(true);
      router.refresh();
    }
  };
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹
  return (
    <button
      className=" btn px-2 btn-allert min-w-[max-content]  gap-2"
      type="button"
      onClick={() => delProject(id)}
    >
      <span className="text-sm font-medium">Remove</span>
    </button>
  );
}
