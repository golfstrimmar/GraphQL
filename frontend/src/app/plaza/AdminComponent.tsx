"use client";
import React, { useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import { isolateSwiperNodes } from "@/utils/isolateSwiper";
import { isolateComponentNodes } from "@/utils/isolateComponent";
import ServicesButtons from "./ServicesButtons";
import Spinner from "@/components/icons/Spinner";
import Loading from "@/components/ui/Loading/Loading";
import type { HtmlNode } from "@/types/HtmlNode";
import dynamic from "next/dynamic";

import {
  TagsNamen1,
  TagsNamen2,
  TagsNamen4,
  TagsNamen5,
  TagsNamen6,
  TagsNamen7,
} from "@/app/plaza/helpers/TagsNamen";

const HeroIconPicker = dynamic(() => import("./HeroIconPicker"), {
  ssr: false,
  loading: () => <Loading />,
});
const ModSliders = dynamic(
  () => import("./ModSliders"),
  {
    ssr: false,
  }
);
// ==>==>==>==>==>==>==>==>==>==>==>==>==>
// ==>==>==>==>==>==>==>==>==>==>==>==>==>
// ==>==>==>==>==>==>==>==>==>==>==>==>==>

const AdminComponent = () => {
  const { updateHtmlJson, SCSS } = useStateContext();
  const [openSVGModal, setopenSVGModal] = useState<boolean>(false);
  const [name, setName] = useState<string | null>(null);
  const [clicked, setClicked] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [openModSliders, setOpenModSliders] = useState<boolean>(false);
  const { refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name },
    skip: !name,
    fetchPolicy: "no-cache",
  });
  // ==>==>==>==>==>==>==>==>==>==>==>==>==>
  const TAGS = [
    "input",
    "svg",
    "number",
    "check",
    "textarea",
    "radio",
    "rating",
    "range",
    "search",
    "modal",
    "select",
  ];

  async function loadStyle(name: string): Promise<HtmlNode[]> {
    const { data: stylesData } = await refetchJson({ name });
    const contentStyles = stylesData?.jsonDocumentByName?.content;
    if (!contentStyles) return [];
    return ensureNodeKeys(contentStyles) as HtmlNode[];
  }

  async function loadScript(name: string): Promise<HtmlNode[]> {
    const { data: scriptsData } = await refetchJson({ name });
    const contentScripts = scriptsData?.jsonDocumentByName?.content;
    if (!contentScripts) return [];
    return ensureNodeKeys(contentScripts) as HtmlNode[];
  }

  async function processScriptsData(sD: string) {
    let r: HtmlNode[] = [];

    if (sD.includes("input")) {
      const re = await loadScript("script-input-field");
      r.push(...re);
    }

    if (sD.includes("svg")) {
      const re = await loadScript("script-input-svg");
      r.push(...re);
    }

    if (!sD.includes("input") && !sD.includes("svg")) {
      const re = await loadScript(`script-${sD}`);
      r.push(...re);
    }

    return r;
  }

  async function processStylesData(sD: string) {
    let r: HtmlNode[] = [];

    if (sD.includes("input")) {
      const re = await loadStyle("style-input-field");
      r.push(...re);
    }

    if (sD.includes("svg")) {
      const re = await loadStyle("style-input-svg");
      r.push(...re);
    }

    if (!sD.includes("input") && !sD.includes("svg")) {
      const re = await loadStyle(`style-${sD}`);
      r.push(...re);
    }

    return r;
  }

  const handleLoad = async (tag: string) => {
    if (!tag) return;
    let resultWithKeysStyles = [] as HtmlNode[];
    setLoading(true);

    // 1.грузим стилевые тэги и скрипты
    const stylesPart = await processStylesData(tag);
    if (stylesPart?.length) {
      resultWithKeysStyles.push(...stylesPart);
    }
    const jsPart = await processScriptsData(tag);
    if (jsPart?.length) {
      resultWithKeysStyles.push(...jsPart);
    }

    // находим все совпадения
    const matchedList = TAGS.filter((foo) => tag.includes(foo));

    // вызываем стили и скрипты для каждого совпадения
    for (const m of matchedList) {
      const sp = await processStylesData(m);
      if (sp?.length) {
        resultWithKeysStyles.push(...sp);
      }
      const jp = await processScriptsData(m);
      if (jp?.length) {
        resultWithKeysStyles.push(...jp);
      }
    }

    // 2. Грузим сам компонент
    const { data } = await refetchJson({ name: tag });
    const content = data?.jsonDocumentByName?.content;
    if (!content) {
      setLoading(false);
      return;
    }

    const resultWithKeys = ensureNodeKeys(content) as HtmlNode[];
    setLoading(false);
    setClicked("");

    // Маркируем служебные стили и скрипты как глобальные, 
    // чтобы их текст не менялся при изоляции и они могли дедуплицироваться.
    const globalizedServiceNodes = resultWithKeysStyles.map(node => ({
      ...node,
      text: `/* @component: ${tag} */\n${node.text}`,
      attributes: { ...node.attributes, "data-global": "true" }
    }));

    // Добавляем имя тега как класс к корневым элементам для отслеживания системой очистки
    const resultWithTagClass = resultWithKeys.map((node) => {
      if (node.tag !== "style" && node.tag !== "script") {
        return { ...node, class: `${node.class} ${tag}`.trim() };
      }
      return node;
    });

    // Глобальная изоляция (теперь с учетом data-global)
    const allNodes = [...resultWithTagClass, ...globalizedServiceNodes];
    const swiperIsolated = isolateSwiperNodes(allNodes);
    const isolatedNodes = isolateComponentNodes(swiperIsolated);

    updateHtmlJson((prev) => [
      ...prev,
      ...isolatedNodes,
    ]);
  };

  // ==>==>==>==>==>==>==>==>==>==>==>==>==>
  const renderTags = (tags: { tag: string; color: string }[]) => (
    <div className=" flex flex-wrap gap-1 bg-slate-200 p-1 ">
      {tags.map((el, i) => (
        <button
          key={i}
          className="btn adminButton px-1.5! border-1 border-[#aaa] text-black text-[12px]"
          style={{ background: el.color, minWidth: "20px", height: "auto" }}
          type="button"
          onClick={() => {
            if (el.tag === "svg") {
              setopenSVGModal(true);
            } else {
              setClicked(el.tag);
              handleLoad(el.tag);
            }
          }}
        >
          {loading && clicked === el.tag ? <Spinner /> : <span>{el.tag}</span>}
        </button>
      ))}
    </div>
  );
  // ==>==>==>==>==>==>==>==>==>==>==>==>==>
  return (
    <>
      <HeroIconPicker
        openSVGModal={openSVGModal}
        setopenSVGModal={setopenSVGModal}
      />
      <ModSliders
        openModSliders={openModSliders}
        setOpenModSliders={setOpenModSliders}
      />
      <div className="bg-black/60 backdrop-blur-lg py-1">
        <ServicesButtons />
        {renderTags(TagsNamen1)}
        <hr className="bordered border-slate-200 my-0.5 " />
        {renderTags(TagsNamen2)}
        <hr className="bordered border-slate-200 my-0.5 " />
        {renderTags(TagsNamen4)}
        <hr className="bordered border-slate-200 my-0.5" />
        {renderTags(TagsNamen5)}
        <hr className="bordered border-slate-200 my-0.5" />
        {renderTags(TagsNamen6)}

        <hr className="bordered border-slate-200 my-0.5" />
        <div className=" flex flex-wrap gap-1 bg-slate-200 p-1 items-center">
          <button className="btn adminButton px-1.5! border-1 border-[#aaa] text-white text-[12px]" style={{ background: "steelblue", maxHeight: "20px" }} onClick={() => setOpenModSliders(true)}>sliders</button>
          {renderTags(TagsNamen7)}
        </div>

      </div>
    </>
  );
};

export default AdminComponent;

