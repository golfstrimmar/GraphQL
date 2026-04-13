"use client";
import React, { useState, useRef, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import { isolateSwiperNodes } from "@/utils/isolateSwiper";
import { isolateComponentNodes } from "@/utils/isolateComponent";


import Loading from "@/components/ui/Loading/Loading";
import type { HtmlNode } from "@/types/HtmlNode";
import dynamic from "next/dynamic";
import ModRotate from "./ModRotate";

import {
  TagsNamen1,
  TagsNamen2,
  TagsNamen4,
  TagsNamen5,
  TagsNamen6,
  TagsNamen7,
  TagsCategory,
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
const ModSocial = dynamic(
  () => import("./ModSocial"),
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
  const [openModSocial, setOpenModSocial] = useState<boolean>(false);
  const [tempTag, setTempTag] = useState<string>("");
  const [tempMod, setTempMod] = useState<string>('');
  const [hasMod, setHasMod] = useState<boolean>(false);
  const [openModRotate, setOpenModRotate] = useState<boolean>(false);
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
    if (sD.includes("textarea-field") || sD.includes("input-field") || sD.includes("search-f")) {
      const re = await loadScript("script-all-inputs");
      r.push(...re);
    }
    if (sD.includes("f-number")) {
      const re = await loadScript("script-f-number");
      r.push(...re);
    }
    if (sD.includes("fildset-rating")) {
      const re = await loadScript("script-fildset-rating");
      r.push(...re);
    }
    if (sD.includes("range-wrap-js")) {
      const re = await loadScript("script-range-wrap-js");
      r.push(...re);
    }

    if (sD.includes("custom-select")) {
      const re = await loadScript("script-custom-select");
      r.push(...re);
    }
    // if (sD.includes("f-check")) {
    //   const re = await loadScript("script-f-check");
    //   r.push(...re);
    // }
    if (sD.includes("f-radio")) {
      const re = await loadScript("script-f-radio");
      r.push(...re);
    }
    return r;
  }


  const handleLoad = async (tag: string) => {
    console.log("<== ✨ ✨ ✨ tag ✨ ✨ ✨===>", tag);
    if (!tag) return;
    setLoading(true);
    let resulScripts = [] as HtmlNode[];
    const jsPart = await processScriptsData(tag);
    if (jsPart?.length) {
      resulScripts.push(...jsPart);
    }

    // 2. Грузим сам компонент
    const { data } = await refetchJson({ name: tag });
    const content = data?.jsonDocumentByName?.content;
    if (!content) {
      setLoading(false);
      return;
    }

    console.log("<== ✨ ✨ ✨ content ✨ ✨ ✨===>", content);
    console.log("<== ✨ ✨ ✨ resulScripts ✨ ✨ ✨===>", resulScripts);

    const resultWithKeys = ensureNodeKeys(content) as HtmlNode[];
    setLoading(false);
    setClicked("");
    setTempTag("");
    const allNodes = [...resultWithKeys, ...resulScripts];
    // const swiperIsolated = isolateSwiperNodes(allNodes);
    // const isolatedNodes = isolateComponentNodes(swiperIsolated);
    const isolatedNodes = isolateComponentNodes(allNodes);
    updateHtmlJson((prev) => [
      ...prev,
      ...isolatedNodes,
    ]);
  };

  // ==>==>==>==>==>==>==>==>==>==>==>==>==>
  useEffect(() => {
    console.log("<=🔹🟢==tempTag=🟢🔹==>", tempTag);
    if (!tempTag || tempTag === "") return;
    if (tempTag === "svg") {
      setopenSVGModal(true);
    } else {
      handleLoad(tempTag);
    }
  }, [tempTag]);

  // ==>==>==>==>==>==>==>==>==>==>==>==>==>

  useEffect(() => {
    console.log("<=🔹🟢==tempMod=🟢🔹==>", tempMod);

  }, [tempMod]);
  // ==>==>==>==>==>==>==>==>==>==>==>==>==>
  return (
    <section className="">
      <HeroIconPicker
        openSVGModal={openSVGModal}
        setopenSVGModal={setopenSVGModal}
      />
      <ModSliders
        openModSliders={openModSliders}
        setOpenModSliders={setOpenModSliders}
      />
      <ModSocial
        openModSocial={openModSocial}
        setOpenModSocial={setOpenModSocial}
      />

      <div className="">
        <div>
          {TagsCategory.map((el, index) => (
            <button className="btn btn-teal  button-mod-rot !bg-[var(--navy)] rounded-r-sm  !py-3  border-1 border-[#aaa] mb-1 last:mb-0 text-white text-[12px] "
              style={{
                background: "steelblue",
                height: 20,
                width: 18,

              }} onMouseLeave={(e: any) => e.stopPropagation()}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setTempMod(el.tag);
                setOpenModRotate(true);
              }}>
              {el.tag.slice(0, 1).toUpperCase()}
            </button>
          ))}
        </div>
        <div >
          {TagsCategory.map((el, index) => (
            <div key={index} >
              <ModRotate offset={index * 32} tags={el.content} setTempTag={setTempTag} title={el.tag} loading={loading} clicked={clicked} setClicked={setClicked} openModRotate={tempMod === el.tag ? openModRotate : false} setOpenModRotate={setOpenModRotate} /></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminComponent;






