"use client";

import { useCallback } from "react";
import jsonToHtml from "@/app/plaza/utils/jsonToHtml";
import { useStateContext } from "@/providers/StateProvider";

export function useHtmlFromJson() {
  const { htmlJson, setHTML, setSCSS } = useStateContext();

  const createHtml = useCallback(() => {
    if (!htmlJson) return;

    const { html, scss, pug } = jsonToHtml(htmlJson as any);
    setHTML(html);
    setSCSS(scss);
  }, [htmlJson, setHTML, setSCSS]);

  return { createHtml };
}
