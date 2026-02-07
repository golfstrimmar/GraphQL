"use client";
import React from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation } from "@apollo/client";
import { REMOVE_FIGMA_PROJECT } from "@/apollo/mutations";
import { useRouter } from "next/navigation";
import RemoveIcon from "@/components/icons/RemoveIcon";
import Spinner from "@/components/icons/Spinner";
// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default function RemoveFigmaProject({ id }) {
  const { setModalMessage } = useStateContext();
  const router = useRouter();
  const [removeFigmaProject, { loading, error }] = useMutation(
    REMOVE_FIGMA_PROJECT,
    {
      onCompleted: () => {
        setModalMessage("✅ Figma Project removed successfully");
        router.refresh();
      },
      onError: () => {
        setModalMessage("Error removing Figma project");
      },
    },
  );
  const handlerRemoveFigmaProject = (id: string) => {
    // --------------------------------

    removeFigmaProject({ variables: { figmaProjectId: id } });
  };
  return (
    <button
      className="btn btn-allert text-white"
      onClick={() => {
        handlerRemoveFigmaProject(id);
      }}
    >
      {loading ? <Spinner /> : <RemoveIcon width={20} height={20} />}
    </button>
  );
}
