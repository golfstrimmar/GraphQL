"use client";
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import { useStateContext } from "@/providers/StateProvider";

// import  Loading  from "@/components/ui/Loading/Loading";
// import dynamic from "next/dynamic";

import { useQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import { HtmlNode } from "@/types/HtmlNode";

interface SlidersConstructorProps {
  setOpenModSliders: (open: boolean) => void;
}

export default function SlidersConstructor({
  setOpenModSliders,
}: SlidersConstructorProps) {
  const { updateHtmlJson } = useStateContext();
  const [slideCount, setSlideCount] = useState(6);
  const [slideHeight, setSlideHeight] = useState(400); // Новое состояние для высоты
  const [loading, setLoading] = useState(false);

  const { refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, {
    skip: true,
    fetchPolicy: "no-cache",
  });

  const findAndReplaceSlides = (nodes: HtmlNode[], count: number): HtmlNode[] => {
    return nodes.map((node) => {
      if (node.class?.includes("swiper-wrapper")) {
        const newSlides: HtmlNode[] = Array.from({ length: count }, (_, i) => ({
          tag: "div",
          class: "swiper-slide",
          text: `Slide ${i + 1}`,
          style: "",
          children: [],
        }));
        return { ...node, children: newSlides };
      }
      if (Array.isArray(node.children)) {
        return { ...node, children: findAndReplaceSlides(node.children, count) };
      }
      return node;
    });
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      // 1. Грузим сам слайдер
      const { data: sliderData } = await refetchJson({ name: "slider" });
      const sliderContent = sliderData?.jsonDocumentByName?.content;
      if (!sliderContent) throw new Error("Slider not found in DB");

      // 2. Грузим стили и скрипты
      const { data: styleData } = await refetchJson({ name: "style-slider" });
      const styleContentRaw = styleData?.jsonDocumentByName?.content;

      const { data: scriptData } = await refetchJson({ name: "script-slider" });
      const scriptContent = scriptData?.jsonDocumentByName?.content;

      // 3. Модифицируем структуру слайдов
      const modifiedSlider = findAndReplaceSlides(
        Array.isArray(sliderContent) ? sliderContent : [sliderContent],
        slideCount,
      );

      // 4. Модифицируем стили (фон и ВЫСОТА)
      const styleNodes = Array.isArray(styleContentRaw)
        ? styleContentRaw
        : styleContentRaw
          ? [styleContentRaw]
          : [];

      const overrideCss = `
.swiper-slide { background: #2563eb !important; }
.mySwiper { height: ${slideHeight}px !important; }
`;

      const styleContent = styleNodes.map((node: HtmlNode) => {
        if (node.tag === "style") {
          return {
            ...node,
            text: node.text + "\n" + overrideCss,
          };
        }
        return node;
      });

      if (!styleContent.some((n) => n.tag === "style")) {
        styleContent.push({
          tag: "style",
          class: "style-swiper-override",
          text: overrideCss,
          style: "",
          children: [],
        });
      }

      // 5. Собираем всё вместе
      const allNodes = [
        ...modifiedSlider,
        ...styleContent,
        ...(Array.isArray(scriptContent) ? scriptContent : scriptContent ? [scriptContent] : []),
      ];

      updateHtmlJson((prev: HtmlNode[]) => [
        ...prev,
        ...(ensureNodeKeys(allNodes) as HtmlNode[]),
      ]);

      setOpenModSliders(false);
    } catch (error) {
      console.error("Error creating slider:", error);
      alert("Ошибка при загрузке слайдера из базы");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-8 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] min-w-[380px] border border-slate-100">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          SLIDER <span className="text-blue-600">PRO</span>
        </h2>
        <div className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-widest">
          Constructor
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Количество слайдов
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min="1"
              max="20"
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-slate-700 font-bold transition-all"
            />
            <div className="absolute right-4 text-slate-300 font-medium">PCS</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Высота (px)
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min="100"
              max="1000"
              step="50"
              value={slideHeight}
              onChange={(e) => setSlideHeight(parseInt(e.target.value) || 400)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-slate-700 font-bold transition-all"
            />
            <div className="absolute right-4 text-slate-300 font-medium">PX</div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${loading
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200"
            }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>ЗАГРУЗКА...</span>
            </>
          ) : (
            <>
              <span>СОЗДАТЬ СЛАЙДЕР</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </>
          )}
        </button>
      </div>

      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
        Слайдер будет автоматически добавлен в конец списка элементов. <br />
        Все стили и скрипты Swiper подгрузятся из базы.
      </p>
    </div>
  );
}

