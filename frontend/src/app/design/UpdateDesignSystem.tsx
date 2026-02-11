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
import { UPDATE_DESIGN_SYSTEM, UPLOAD_ULON_IMAGE } from "@/apollo/mutations";
import Spinner from "@/components/icons/Spinner";
import Update from "@/components/icons/Update";
import { getImageById, type StoredImage } from "./utils/imageStore";
// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function UpdateDesignSystem({ id, buttons, texts, images }) {
  const { user, showModal } = useStateContext();
  const router = useRouter();
  // --------------
  const [uploadImage, { loading: uploadLoading }] = useMutation(
    UPLOAD_ULON_IMAGE,
    {
      onCompleted: (data) => {
        if (data?.uploadImage) {
          console.log("<===data.url===>", data.uploadImage.url);
          console.log("<===data.filename===>", data.uploadImage.filename);
        }
      },
      onError: (error) => {
        console.log("error", error);
      },
    },
  );
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
  async function uploadAllImagesToCloudinary(images: { id: string }[]) {
    const uploaded: { publicId: string; url: string; alt?: string | null }[] =
      [];

    for (const img of images) {
      const stored = await getImageById(img.id);
      if (!stored) {
        console.warn("Image not found in IndexedDB", img.id);
        continue;
      }

      const file = new File([stored.blob], stored.name, {
        type: stored.blob.type || "image/*",
      });

      const { data } = await uploadImage({ variables: { file } });
      if (data?.uploadImage) {
        uploaded.push({
          publicId: data.uploadImage.filename,
          url: data.uploadImage.url,
          alt: null,
        });
      }
    }

    return uploaded;
  }

  // ---------------
  // есть хотя бы один текст (не null)
  const hasAtLeastOneText = texts?.some((item) => item !== null);
  // ---------------
  return (
    <button
      className="btn btn-teal  !rounded-full w-6 h-6 !p-0.5 mr-1"
      onClick={async () => {
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
        try {
          const resIndexedDB = images.filter((foo) => {
            return foo.__typename === undefined;
          });
          const resDB = images.filter((foo) => {
            return foo.__typename !== undefined;
          });

          // 1) грузим все картинки из IndexedDB -> Cloudinary
          const uploadedImages =
            await uploadAllImagesToCloudinary(resIndexedDB);
          const designImagesInput = resDB.map((img) => ({
            publicId: img.publicId,
            url: img.url,
            alt: img.alt ?? null,
          }));
          console.log("<===!!!!===>", [
            ...designImagesInput,
            ...uploadedImages,
          ]);
          await updateDesignSystem({
            variables: {
              id: id,
              ownerId: user?.id,
              designTexts: [...ToBD, ...bToBD],
              images: [...designImagesInput, ...uploadedImages],
            },
          });
        } catch (error) {
          console.error("Error saving images:", error);
          showModal("Failed to save images", "error");
        }
      }}
    >
      {loading || uploadLoading ? (
        <Spinner />
      ) : (
        <Update width={15} height={15} />
      )}
    </button>
  );
}
