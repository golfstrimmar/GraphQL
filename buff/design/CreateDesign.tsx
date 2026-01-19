"use client";
import React, { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation } from "@apollo/client";
import Input from "@/components/ui/Input/Input";
import { CREATE_DESIGN } from "@/apollo/mutations";
import Spinner from "@/components/icons/Spinner";
import { AnimatePresence, motion } from "framer-motion";
import CreateIcon from "@/components/icons/CreateIcon";
import { useRouter } from "next/navigation";
// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default function CreateDesign() {
  const router = useRouter();
  const { user, setModalMessage } = useStateContext();
  const [name, setName] = useState<string>("");
  const [figmaUrl, setFigmaUrl] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  //-----------------------
  const [createDesigne, { loading }] = useMutation(CREATE_DESIGN, {
    onCompleted: () => {
      setModalMessage("Figma Project created successfully");
    },
  });
  // ---------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user === null || name === "" || figmaUrl === "") {
      setModalMessage("All fields are required.");
      return;
    }

    try {
      const { data } = await createDesigne({
        variables: {
          ownerId: String(user?.id),
          name: name,
          figmaUrl: figmaUrl,
        },
      });

      if (data.createDesign) {
        console.log(
          `🔹🔹🔹 Figma Project ${data.createDesign.name} created successfully🔹🔹🔹`,
        );
        router.refresh();
        setName("");
        setFigmaUrl("");
        setModalOpen(false);
      }
    } catch (err: any) {
      setModalMessage(err.message);
    }
  };

  // ---------------

  return (
    <div className="flex flex-col gap-2 mb-2 w-full mt-[30px] bg-navy rounded-2xl shadow-xl p-2   border border-slate-200 ">
      <button
        className=" h-6 flex items-center gap-2 btn  btn-primary font-bold text-slate-800"
        onClick={() => setModalOpen(!modalOpen)}
      >
        {!modalOpen ? (
          <span className="text-white mr-2">
            <CreateIcon width={16} height={16} />
          </span>
        ) : null}

        {!modalOpen ? "Create Figma Project ⇨" : "⇦"}
      </button>

      <AnimatePresence>
        {modalOpen && (
          <div onClick={() => setModalOpen(false)}>
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
                  setModalOpen(false);
                }
              }}
            >
              <form
                onSubmit={handleSubmit}
                className="modal-content flex flex-col  bg-slate-400 p-6 rounded-lg w-full gap-4"
              >
                <Input
                  typeInput="text"
                  id="name"
                  data="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  classInput="modalInput"
                />
                <Input
                  typeInput="text"
                  id="name"
                  data="FigmaUrl"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
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
                      setFigmaUrl("");
                      setName("");
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
    </div>
  );
}
