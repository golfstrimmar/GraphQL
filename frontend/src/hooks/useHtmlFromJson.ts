"use client";

import { useCallback } from "react";
import jsonToHtml from "@/utils/plaza/jsonToHtml";
import { useStateContext } from "@/providers/StateProvider";

export function useHtmlFromJson() {
  const { htmlJson, setModalMessage, setHTML } = useStateContext();

  const createHtml = useCallback(async () => {
    if (!htmlJson) return;

    const { html } = jsonToHtml(htmlJson as any);
    setHTML(html);

    // try {
    //   await navigator.clipboard.writeText(html);
    // } catch {
    //   setModalMessage?.("Failed to copy");
    // }
  }, [htmlJson, setModalMessage]);

  return { createHtml };
}
