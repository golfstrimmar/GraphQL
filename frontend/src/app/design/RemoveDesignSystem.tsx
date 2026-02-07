"use client";
import React from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation } from "@apollo/client";
import { REMOVE_DESIGN_SYSTEM } from "@/apollo/mutations";
import RemoveIcon from "@/components/icons/RemoveIcon";
import Spinner from "@/components/icons/Spinner";
import { useRouter } from "next/navigation";
// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default function RemoveDesignSystem({ id, resetAll }) {
  const { setModalMessage } = useStateContext();
  const router = useRouter();
  const [removeDesignSystem, { loading, error }] = useMutation(
    REMOVE_DESIGN_SYSTEM,
    {
      onCompleted: () => {
        resetAll();
        router.refresh();
        setModalMessage("✅ Design System removed successfully");
      },
      onError: () => {
        setModalMessage("Error removing Design System");
      },
    },
  );

  return (
    <button
      className="btn btn-allert text-white  !rounded-full w-6 h-6 !p-0.5"
      onClick={() => {
        removeDesignSystem({ variables: { id: id } });
      }}
    >
      {loading ? <Spinner /> : <RemoveIcon width={25} height={25} />}
    </button>
  );
}
