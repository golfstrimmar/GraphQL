"use client";
import React, { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import Input from "@/components/ui/Input/Input";
import { CREATE_DESIGN_SYSTEM, UPLOAD_ULON_IMAGE } from "@/apollo/mutations";
import Spinner from "@/components/icons/Spinner";
import { useRouter } from "next/navigation";
import { getImageById, type StoredImage } from "./utils/imageStore";
// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹

export default function ModalCreateDesignSystem({
  modalCreateOpen,
  setModalCreateOpen,
  texts,
  buttons,
  images,
}) {
  const { user, showModal } = useStateContext();
  const router = useRouter();
  const [name, setName] = useState<string>("");
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
  //   // -----------------------
  const [createDesignSystem, { data, loading }] = useMutation(
    CREATE_DESIGN_SYSTEM,
    {
      onCompleted: (data) => {
        const system = data?.createDesignSystem;
        if (system) {
          console.log("DesignSystem", system);
          router.refresh();
          showModal("Design system created successfully!", "success");
          setModalCreateOpen(false);
          setName("");
        }
      },
      onError: (error) => {
        showModal(error.message);
        console.error(error);
      },
    },
  );
  // ---------------
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
  const hasAtLeastOneText = texts.some((item) => item !== null);
  // ---------------
  return (
    <AnimatePresence>
      {modalCreateOpen && (
        <div onClick={() => setModalCreateOpen(false)}>
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full mb-4"
            onClick={(e) => {
              e.stopPropagation();
              if (
                !e.target.closest(".modal-content") &&
                !e.target.classList.contains("modal-content")
              ) {
                setModalCreateOpen(false);
              }
            }}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!name || !user || !hasAtLeastOneText) {
                  showModal(
                    "Please enter a name and select at least one text",
                    "error",
                  );
                  return;
                }

                const ToBD = texts
                  ?.filter((foo) => foo !== null)
                  .map((t) => ({
                    tagText: t.tagName || "div",
                    classText: t.className || "",
                    styleText: t.style || "",
                  }));

                const bToBD = buttons
                  .filter((foo) => foo !== null)
                  .map((b) => ({
                    tagText: "button",
                    classText: b.className || "",
                    styleText: b.style || "",
                  }));

                try {
                  // 1) грузим все картинки из IndexedDB -> Cloudinary
                  const uploadedImages =
                    await uploadAllImagesToCloudinary(images);

                  // 2) вызываем createDesignSystem с нормальным массивом images
                  await createDesignSystem({
                    variables: {
                      ownerId: user?.id,
                      name,
                      designTexts: [...ToBD, ...bToBD],
                      images: uploadedImages, // [{ publicId, url, alt }]
                    },
                  });
                } catch (error) {
                  console.error("Error saving images:", error);
                  showModal("Failed to save images", "error");
                }
              }}
              className="modal-content flex flex-col  bg-slate-400 p-1 rounded-lg w-full gap-4"
            >
              <Input
                typeInput="text"
                id="name"
                data="Design System Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                classInput="modalInput"
              />
              <div className="flex gap-2">
                <button
                  className="btn btn-primary "
                  type="submit"
                  disabled={loading}
                >
                  {loading || uploadLoading ? <Spinner /> : "Save"}
                </button>
                <button
                  className="btn btn-allert"
                  type="button"
                  onClick={() => {
                    setName("");
                    setModalCreateOpen(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
