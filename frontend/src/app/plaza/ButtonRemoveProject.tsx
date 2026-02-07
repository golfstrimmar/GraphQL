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
import Spinner from "@/components/icons/Spinner";
import RemoveIcon from "@/components/icons/RemoveIcon";

export default function ButtonRemoveProject({ id }) {
  const { showModal } = useStateContext();
  const router = useRouter();

  const [removeProject, { loading }] = useMutation(REMOVE_PROJECT, {
    refetchQueries: [GET_ALL_PROJECTS_BY_USER],
    awaitRefetchQueries: true,
  });

  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹
  const delProject = async (id: string) => {
    if (!id) return;
    const { data } = await removeProject({ variables: { projectId: id } });
    if (data) {
      console.log("<===data removeProject===>", data);
      showModal("Project removed");
      router.refresh();
    }
  };
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹
  return (
    <button
      className=" btn px-2 btn-allert  min-h-[28px] min-w-[36px] "
      type="button"
      onClick={() => delProject(id)}
    >
      {loading ? <Spinner /> : <RemoveIcon width={24} height={24} />}
    </button>
  );
}
