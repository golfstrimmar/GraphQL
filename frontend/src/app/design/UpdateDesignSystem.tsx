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
export default function UpdateDesignSystem({ id, buttons, texts }) {
  const { user, showModal } = useStateContext();
  const router = useRouter();
  const [updateDesignSystem, { loading, error }] = useMutation(
    UPDATE_DESIGN_SYSTEM,
    {
      onCompleted: () => {
        router.refresh();
        showModal("Design System updated successfully", "success");
      },
      onError: () => {
        showModal("Failed to update Design System", "error");
      },
    },
  );
  // ---------------
  // есть хотя бы один текст (не null)
  const hasAtLeastOneText = texts?.some((item) => item !== null);
  // ---------------
  return (
    <button
      className="btn btn-teal  !rounded-full w-6 h-6 !p-0.5 mr-1"
      onClick={() => {
        if (!hasAtLeastOneText) {
          showModal(
            "Please enter a name and select at least one text",
            "error",
          );
          return;
        }
        let ToBD = texts
          ?.filter((foo) => {
            return foo !== null;
          })
          .map((t) => ({
            tagText: t.tagName || "div",
            classText: t.className || "",
            styleText: t.style || "",
          }));
        const bToBD = buttons
          .filter((foo) => {
            return foo !== null;
          })
          .map((b) => ({
            tagText: "button",
            classText: b.className || "",
            styleText: b.style || "",
          }));

        updateDesignSystem({
          variables: {
            id: id,
            ownerId: user?.id,
            designTexts: [...ToBD, ...bToBD],
          },
        });
      }}
    >
      {loading ? <Spinner /> : <Update width={15} height={15} />}
    </button>
  );
}
