"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { useStateContext } from "@/providers/StateProvider";
// import DesignColors from "./DesignColors";
// import DesignFonts from "./DesignFonts";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { CREATE_DESIGN_SYSTEM } from "@/apollo/mutations";
import Spinner from "@/components/icons/Spinner";
import { GET_DESIGN_SYSTEMS_BY_USER } from "@/apollo/queries";

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function AdinDesinSystem() {
  const { user, setModalMessage } = useStateContext();
  const [designSystems, setDesignSystems] = useState([]);
  // ----------------
  const [createDesignSystem, { data, loading, error, called, client }] =
    useMutation(CREATE_DESIGN_SYSTEM, {
      variables: {
        ownerId: user?.id,
        name: "My System",
        backgrounds: [
          { background: "background1", value: "#000000" },
          { background: "background2", value: "#ffffff" },
        ],
        colors: [{ color: "color1", value: "#00ffcc" }],
        fonts: [{ font: "font1", value: "Inter" }],
      },
      onCompleted: (data) => {
        if (data.createDesignSystem) {
          console.log(data.createDesignSystem);
        }
      },
      onError: (error) => {
        setModalMessage(error.message);
        console.error(error);
      },
    });

  const {
    data: dataDesignSystems,
    loading: loadingDesignSystems,
    error: errorDesignSystems,
  } = useQuery(GET_DESIGN_SYSTEMS_BY_USER, {
    variables: {
      userId: user?.id,
    },
    skip: !user?.id,
    onCompleted: (data) => {
      if (!data?.getDesignSystemsByUser) return;
      setDesignSystems((prev) => [...prev, ...data.getDesignSystemsByUser]);
    },
  });
  // const {
  //   data: dataDesignSystem,
  //   loading: loadingDesignSystem,
  //   error: errorDesignSystem,
  // } = useQuery(GET_DESIGN_SYSTEM, {
  //   // === ОСНОВНЫЕ ===
  //   variables: { id: "1" }, // Аргументы GraphQL-запроса
  //   // skip: !id,
  //   fetchPolicy: "cache-and-network", // Источник данных: cache-first / network-only / no-cache ...
  //   onCompleted: (data) => {
  //     if (data.getDesignSystem) {
  //       console.log(data.getDesignSystem);
  //     }
  //     setDesignSystems((prev) => {
  //       return [...prev, data.getDesignSystem];
  //     });
  //   },
  //   onError: (error) => {
  //     setModalMessage(error.message);
  //     console.error(error);
  //   },
  // });

  // ----------------

  return (
    <div className="">
      <button className="btn btn-teal" onClick={() => createDesignSystem()}>
        {loading ? <Spinner /> : "Create Design System"}
      </button>
      {designSystems.length &&
        designSystems.map((system) => <div key={system.id}>{system.name}</div>)}
      {/*<DesignColors />*/}
      {/*<DesignFonts />*/}
    </div>
  );
}
