"use client";
import React, { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import Input from "@/components/ui/Input/Input";
import { CREATE_DESIGN_SYSTEM } from "@/apollo/mutations";
import Spinner from "@/components/icons/Spinner";
import { useRouter } from "next/navigation";

// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default function ModalCreateDesignSystem({
  modalCreateOpen,
  setModalCreateOpen,

  // buildBackgrounds,
  // buildColors,
  // buildFonts,
  // buildFontSizes,
}) {
  const { user, setModalMessage, designTexts } = useStateContext();
  const router = useRouter();
  const [name, setName] = useState<string>("");
  //   // -----------------------
  const [createDesignSystem, { data, loading }] = useMutation(
    CREATE_DESIGN_SYSTEM,
    {
      onCompleted: (data) => {
        const system = data?.createDesignSystem;
        if (system) {
          console.log("DesignSystem", system);
          router.refresh();
          setModalMessage("Design system created successfully!");
          setModalCreateOpen(false);
          setName("");
        }
      },
      onError: (error) => {
        setModalMessage(error.message);
        console.error(error);
      },
    },
  );

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
            className="w-full "
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
              onSubmit={(e) => {
                e.preventDefault();
                if (!name || !user) {
                  setModalMessage("Please enter a name");
                  return;
                }
                createDesignSystem({
                  variables: {
                    ownerId: user?.id,
                    name: name,

                    designTexts: designTexts.map((t) => ({
                      tagText: t.tag,
                      classText: t.class,
                      styleText: t.style,
                    })),
                    // texts: buildTexts(),
                    // backgrounds: buildBackgrounds(),
                    // colors: buildColors(),
                    // fonts: buildFonts(),
                    // fontSizes: buildFontSizes(),
                  },
                });
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
                  {loading ? <Spinner /> : "Save"}
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
