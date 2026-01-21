"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { useStateContext } from "@/providers/StateProvider";
import DesignColors from "./DesignColors";
// import DesignFonts from "./DesignFonts";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { CREATE_DESIGN_SYSTEM } from "@/apollo/mutations";
import Spinner from "@/components/icons/Spinner";
import {
  GET_DESIGN_SYSTEMS_BY_USER,
  GET_DESIGN_SYSTEM,
} from "@/apollo/queries";
import { Span } from "next/dist/trace";
import { divide } from "lodash";

type BackgroundItem = {
  background: string;
  value: string;
};

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function AdinDesinSystem() {
  const { user, setModalMessage } = useStateContext();

  const [designSystems, setDesignSystems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  // background tokens подняты сюда
  const [background1, setBackground1] = useState("");
  const [background2, setBackground2] = useState("");
  const [background3, setBackground3] = useState("");
  const [background4, setBackground4] = useState("");
  const [background5, setBackground5] = useState("");

  function buildBackgrounds(): BackgroundItem[] {
    const items: BackgroundItem[] = [];
    if (background1)
      items.push({ background: "background1", value: background1 });
    if (background2)
      items.push({ background: "background2", value: background2 });
    if (background3)
      items.push({ background: "background3", value: background3 });
    if (background4)
      items.push({ background: "background4", value: background4 });
    if (background5)
      items.push({ background: "background5", value: background5 });
    return items;
  }

  const [createDesignSystem, { data, loading }] = useMutation(
    CREATE_DESIGN_SYSTEM,
    {
      onCompleted: (data) => {
        if (data.createDesignSystem) {
          console.log(data.createDesignSystem);
          setDesignSystems((prev) => [...prev, data.createDesignSystem]);
        }
      },
      onError: (error) => {
        setModalMessage(error.message);
        console.error(error);
      },
    },
  );

  const { loading: loadingDesignSystems } = useQuery(
    GET_DESIGN_SYSTEMS_BY_USER,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
      onCompleted: (data) => {
        if (!data?.getDesignSystemsByUser) return;
        setDesignSystems(data.getDesignSystemsByUser);
      },
    },
  );

  const [loadDesignSystem, { loading: loadingDesignSystem }] = useLazyQuery(
    GET_DESIGN_SYSTEM,
    {
      fetchPolicy: "cache-and-network",
      onCompleted: (data) => {
        const system = data?.getDesignSystem;
        if (!system) return;

        setSelected(system);

        const bgs = system.backgrounds ?? [];

        bgs.forEach((bg) => {
          switch (bg.background) {
            case "background1":
              setBackground1(bg.value);
              break;
            case "background2":
              setBackground2(bg.value);
              break;
            case "background3":
              setBackground3(bg.value);
              break;
            case "background4":
              setBackground4(bg.value);
              break;
            case "background5":
              setBackground5(bg.value);
              break;
            default:
              break;
          }
        });
      },
      onError: (error) => {
        setModalMessage(error.message);
        console.error(error);
      },
    },
  );

  return (
    <div>
      <div className="flex flex-col gap-2 mb-2 w-full mt-[30px] bg-navy rounded-2xl shadow-xl p-2   border border-slate-200 ">
        {designSystems.length > 0 &&
          designSystems.map((system) => (
            <button
              key={system.id}
              onClick={() => loadDesignSystem({ variables: { id: system.id } })}
              className="btn px-2 py-1 mb-4 border-slate-400 border min-h-[36px]"
            >
              {loadingDesignSystem ? (
                <div className="m-auto">
                  <Spinner />
                </div>
              ) : (
                "id" + system.id + ": " + system.name
              )}
            </button>
          ))}
        <button
          className="btn btn-teal"
          onClick={() =>
            createDesignSystem({
              variables: {
                ownerId: user?.id,
                name: "My System",
                backgrounds: buildBackgrounds(),
                colors: [{ color: "color1", value: "#00ffcc" }],
                fonts: [{ font: "font1", value: "Inter" }],
              },
            })
          }
        >
          {loading ? <Spinner /> : "Create Design System"}
        </button>
      </div>
      <DesignColors
        background1={background1}
        background2={background2}
        background3={background3}
        background4={background4}
        background5={background5}
        setBackground1={setBackground1}
        setBackground2={setBackground2}
        setBackground3={setBackground3}
        setBackground4={setBackground4}
        setBackground5={setBackground5}
      />
    </div>
  );
}
