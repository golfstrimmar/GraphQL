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
import { UPDATE_DESIGN_SYSTEM } from "@/apollo/mutations";
import Spinner from "@/components/icons/Spinner";
import Update from "@/components/icons/Update";

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function UpdateDesignSystem({ id }) {
  const { user, setModalMessage, designTexts } = useStateContext();
  const router = useRouter();

  const [updateDesignSystem, { loading, error }] = useMutation(
    UPDATE_DESIGN_SYSTEM,
    {
      onCompleted: () => {
        router.refresh();
        setModalMessage("Design System updated successfully");
      },
      onError: () => {
        setModalMessage("Error updating Design System");
      },
    },
  );

  return (
    <button
      className="btn btn-teal  !rounded-full w-6 h-6 !p-0.5 mr-1"
      onClick={() => {
        updateDesignSystem({
          variables: {
            id: id,
            ownerId: user?.id,
            designTexts: designTexts.map((t) => ({
              classText: t.class,
              styleText: t.style,
            })),
          },
        });
      }}
    >
      {loading ? <Spinner /> : <Update width={15} height={15} />}
    </button>
  );
}
