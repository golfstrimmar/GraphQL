"use client";
import React, { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation } from "@apollo/client";
import Input from "@/components/ui/Input/Input";
import { CREATE_DESIGN } from "@/apollo/mutations";
import Spinner from "@/components/icons/Spinner";

// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default function createDesign() {
  const { user, setModalMessage } = useStateContext();
  const [name, setName] = useState<string>("");
  const [figmaUrl, setFigmaUrl] = useState<string>("");
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
        setName("");
        setFigmaUrl("");
      }
    } catch (err: any) {
      setModalMessage(err.message);
    }
  };

  // ---------------

  return (
    <div className="mt-[100px]">
      <div className="container">
        <div className="w-full ">
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
        </div>
      </div>
    </div>
  );
}
