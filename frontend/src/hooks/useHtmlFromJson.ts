"use client";

import { useCallback } from "react";
import jsonToHtml from "@/utils/plaza/jsonToHtml";
import { useStateContext } from "@/providers/StateProvider";

export function useHtmlFromJson() {
  const { htmlJson, setHTML } = useStateContext();

  const createHtml = useCallback(() => {
    if (!htmlJson) return;

    const { html } = jsonToHtml(htmlJson as any);
    setHTML(html);
  }, [htmlJson]);

  return { createHtml };
}
