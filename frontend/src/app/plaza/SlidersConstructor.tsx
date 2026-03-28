"use client";
import React, { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";

import { useQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import { HtmlNode } from "@/types/HtmlNode";
import Spinner from "@/components/icons/Spinner";

interface SlidersConstructorProps {
  setOpenModSliders: (open: boolean) => void;
}

export default function SlidersConstructor({
  setOpenModSliders,
}: SlidersConstructorProps) {
  const { updateHtmlJson } = useStateContext();
  const [slideCount, setSlideCount] = useState(6);
  const [slideHeight, setSlideHeight] = useState(400);

  // Стейты для респонсива (Slides Per View / Space Between)
  const [spvMobile, setSpvMobile] = useState(1);
  const [spaceMobile, setSpaceMobile] = useState(10);

  const [spvTablet, setSpvTablet] = useState(2);
  const [spaceTablet, setSpaceTablet] = useState(15);

  const [spvDesktop, setSpvDesktop] = useState(3);
  const [spaceDesktop, setSpaceDesktop] = useState(20);

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

      // 3. Главная фича: Уникальный ID для изоляции слайдера
      const uniqId = Math.random().toString(36).substring(2, 8); // например: 4f8x9a
      const uniqClass = `swiper-isolate-${uniqId}`;

      // 4. Модифицируем структуру слайдов и вешаем уникальный класс на корневой элемент
      let modifiedSlider = findAndReplaceSlides(
        Array.isArray(sliderContent) ? sliderContent : [sliderContent],
        slideCount,
      );

      modifiedSlider = modifiedSlider.map((node: HtmlNode) => {
        // Пропускаем теги-метаданные
        if (['link', 'style', 'script'].includes(node.tag || '')) return node;
        return { ...node, class: `${node.class || ""} ${uniqClass}`.trim() };
      });

      // 5. Модифицируем стили (фон и ВЫСОТА) с изоляцией
      const styleNodes = Array.isArray(styleContentRaw)
        ? styleContentRaw
        : styleContentRaw
          ? [styleContentRaw]
          : [];

      const overrideCss = `
.${uniqClass} .swiper-slide { background: #2563eb !important; }
.${uniqClass} .mySwiper { height: ${slideHeight}px !important; }
`;

      const styleContent = styleNodes.map((node: HtmlNode) => {
        if (node.tag === "style") {
          return {
            ...node,
            class: `${node.class || ""} ${uniqClass}`.trim(),
            text: node.text + "\n" + overrideCss + `\n/* @isolate: ${uniqClass} */\n`,
          };
        }
        return node;
      });

      if (!styleContent.some((n) => n.tag === "style")) {
        styleContent.push({
          tag: "style",
          class: `style-swiper-override ${uniqClass}`,
          text: overrideCss + `\n/* @isolate: ${uniqClass} */\n`,
          style: "",
          children: [],
        });
      }

      // 6. Модифицируем скрипт (брейкпоинты И ИЗОЛЯЦИЯ)
      const scriptNodesRaw = Array.isArray(scriptContent) ? scriptContent : scriptContent ? [scriptContent] : [];
      const scriptNodes = scriptNodesRaw.map((node: HtmlNode) => {
        if (node.tag === "script" && node.text) {
          const bpReplacement = `slidesPerView: ${spvMobile}, spaceBetween: ${spaceMobile}, breakpoints: { 768: { slidesPerView: ${spvTablet}, spaceBetween: ${spaceTablet} }, 1200: { slidesPerView: ${spvDesktop}, spaceBetween: ${spaceDesktop} } }`;

          let newText = node.text;

          // ИЗОЛЯЦИЯ: перепривязываем инициализацию Swiper и элементы управления
          newText = newText.replace(/(new\s+Swiper\s*\(\s*['"])([^'"]+)(['"])/g, `$1.${uniqClass} $2$3`);
          newText = newText.replace(/nextEl:\s*['"]([^'"]+)['"]/g, `nextEl: '.${uniqClass} $1'`);
          newText = newText.replace(/prevEl:\s*['"]([^'"]+)['"]/g, `prevEl: '.${uniqClass} $1'`);
          newText = newText.replace(/el:\s*['"]([^'"]*pagination[^'"]*)['"]/g, `el: '.${uniqClass} $1'`);

          // ИЗОЛЯЦИЯ функций: чтобы два скрипта на странице не переопределяли одну функцию
          newText = newText.replace(/initSwiper/g, `initSwiper_${uniqId}`);

          if (newText.includes("new Swiper")) {
            // Удаляем старые блоки breakpoints, если они были (заточены под типичные шаблоны)
            newText = newText.replace(/breakpoints:\s*\{[\s\S]*?(?:768|1024|1200)[^}]*\}\s*\},?/g, "");

            // Удаляем старые корневые настройки
            newText = newText.replace(/slidesPerView:\s*[\d\.]+\s*,?/g, "");
            newText = newText.replace(/spaceBetween:\s*[\d\.]+\s*,?/g, "");

            // Вставляем наш блок настроек в самом начале конфигурационного объекта Swiper
            newText = newText.replace(/(new\s+Swiper\s*\([^,]+,\s*\{)/, `$1\n    ${bpReplacement},`);
          }

          return {
            ...node,
            text: `\n/* @isolate: ${uniqClass} */\n${newText}`,
            class: `${node.class || ""} ${uniqClass}`.trim()
          };
        }
        return node;
      });

      // 7. Собираем всё вместе
      const allNodes = [
        ...modifiedSlider,
        ...styleContent,
        ...scriptNodes,
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
    <>
      <div className="sliderConstructor flex flex-col gap-4 p-8 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] min-w-[380px] border border-slate-100">
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
              Number of slides
            </label>
            <div className="sc-f-number">
              <button
                type="button"
                className="btn-num btn-num--dec"
                onClick={() => setSlideCount((c) => Math.max(1, c - 1))}
              >−</button>
              <input
                type="number"
                min="1"
                max="20"
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value) || 1)}
              />
              <button
                type="button"
                className="btn-num btn-num--inc"
                onClick={() => setSlideCount((c) => Math.min(20, c + 1))}
              >+</button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Height of slider (px)
            </label>
            <div className="sc-f-number">
              <button
                type="button"
                className="btn-num btn-num--dec"
                onClick={() => setSlideHeight((h) => Math.max(50, h - 10))}
              >−</button>
              <input
                type="number"
                min="50"
                max="1000"
                step="10"
                value={slideHeight}
                onChange={(e) => setSlideHeight(parseInt(e.target.value) || 400)}
              />
              <button
                type="button"
                className="btn-num btn-num--inc"
                onClick={() => setSlideHeight((h) => Math.min(1000, h + 10))}
              >+</button>
            </div>
          </div>

          {/* Адаптивные настройки */}
          <div className="flex flex-col gap-3 pt-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Adaptive</span>
              <span className="text-[9px] font-normal lowercase bg-slate-100 px-2 py-1 rounded text-slate-500">Slides / Gap</span>
            </label>
            <div className="space-y-2">
              {[
                { label: "📱 Mobile (<768px)", spv: spvMobile, setSpv: setSpvMobile, space: spaceMobile, setSpace: setSpaceMobile },
                { label: "💻 Tablet (≥768px)", spv: spvTablet, setSpv: setSpvTablet, space: spaceTablet, setSpace: setSpaceTablet },
                { label: "🖥️ Desktop (≥1200px)", spv: spvDesktop, setSpv: setSpvDesktop, space: spaceDesktop, setSpace: setSpaceDesktop },
              ].map((bp, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                  <div className="text-[11px] font-bold text-slate-600 w-1/3 leading-tight">{bp.label}</div>

                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1 items-center">
                      <div className="sc-f-number" style={{ gap: '4px' }}>
                        <button type="button" className="btn-num btn-num--dec !w-6 !h-6 !text-sm" onClick={() => bp.setSpv(c => Math.max(1, c - 1))}>−</button>
                        <input type="number" value={bp.spv} onChange={(e) => bp.setSpv(parseInt(e.target.value) || 1)} style={{ width: '30px', maxWidth: '30px', height: '24px', fontSize: '12px' }} />
                        <button type="button" className="btn-num btn-num--inc !w-6 !h-6 !text-sm" onClick={() => bp.setSpv(c => Math.min(10, c + 1))}>+</button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                      <div className="sc-f-number" style={{ gap: '4px' }}>
                        <button type="button" className="btn-num btn-num--dec !w-6 !h-6 !text-sm" onClick={() => bp.setSpace(c => Math.max(0, c - 5))}>−</button>
                        <input type="number" step="5" value={bp.space} onChange={(e) => bp.setSpace(parseInt(e.target.value) || 0)} style={{ width: '35px', maxWidth: '35px', height: '24px', fontSize: '12px' }} />
                        <button type="button" className="btn-num btn-num--inc !w-6 !h-6 !text-sm" onClick={() => bp.setSpace(c => Math.min(100, c + 5))}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className={`btn btn-primary w-full`}
          >
            {loading ? (
              <Spinner />
            ) : (
              <>
                <span>Create Slider</span>
                <svg
                  width="15"
                  height="15"
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


      </div>
    </>
  );
}

