"use client";

import { useCallback } from "react";
import jsonToHtml from "@/utils/plaza/jsonToHtml";
import { useStateContext } from "@/providers/StateProvider";

export function useScssFromJson() {
  const { htmlJson, setModalMessage, setSCSS, ScssMixVar, setScssMixVar } =
    useStateContext();

  const createSCSS = useCallback(() => {
    if (!htmlJson) return;

    const { scss } = jsonToHtml(htmlJson as any);
    const res = [ScssMixVar ?? "", scss ?? ""]
      .filter((part) => part)
      .join("\n");
    setSCSS(res);
  }, [htmlJson, ScssMixVar, setModalMessage, setSCSS]);

  return { createSCSS };
}
