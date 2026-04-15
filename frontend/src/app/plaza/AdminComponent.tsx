"use client";
import React, { useState, useRef, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT, GET_JSON_DOCUMENTS } from "@/apollo/queries";
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
  const { refetch: refetchJsons } = useQuery(GET_JSON_DOCUMENTS, {
    fetchPolicy: "no-cache",
  });
  // ==>==>==>==>==>==>==>==>==>==>==>==>==>
  const TAGS_TO_LOAD_MANY = [
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

  // async function loadStyle(name: string): Promise<HtmlNode[]> {
  //   const { data: stylesData } = await refetchJson({ name });
  //   const contentStyles = stylesData?.jsonDocumentByName?.content;
  //   if (!contentStyles) return [];
  //   return ensureNodeKeys(contentStyles) as HtmlNode[];
  // }

  // async function loadScript(name: string): Promise<HtmlNode[]> {
  //   const { data: scriptsData } = await refetchJson({ name });
  //   const contentScripts = scriptsData?.jsonDocumentByName?.content;
  //   if (!contentScripts) return [];
  //   return ensureNodeKeys(contentScripts) as HtmlNode[];
  // }

  // async function processScriptsData(sD: string) {
  //   let r: HtmlNode[] = [];
  //   if (sD.includes("textarea-field") || sD.includes("input-field") || sD.includes("search-f")) {
  //     const re = await loadScript("script-all-inputs");
  //     r.push(...re);
  //   }


  //   const re = await loadScript(`script-${sD}`);
  //   r.push(...re);

  //   return r;
  // }

  async function loadJson(tag: string) {
    const { data } = await refetchJson({ name: tag });
    const contentJson = data?.jsonDocumentByName?.content;
    if (!contentJson) {
      setLoading(false);
      return [];
    }
    return contentJson as HtmlNode[];
  }

  // async function loadJsons(names: string[]) {
  //   const { data: jsonsData } = await refetchJsons({ names });
  //   const contentJsons = jsonsData?.jsonDocumentsByNames;
  //   if (!contentJsons) return [];
  //   return contentJsons as HtmlNode[];
  // }

  // ==>==>==>==>==>==>==>==>==>==>==>==>==>
  const handleLoad = async (tag: string) => {
    if (!tag) return;
    setLoading(true);
    // let resulScripts = [] as HtmlNode[];
    // const jsPart = await processScriptsData(tag);
    // if (jsPart?.length) {
    //   resulScripts.push(...jsPart);
    // }
    console.log("<== ✨ ✨ ✨ tag ✨ ✨ ✨===>", tag);

    const json = await loadJson(tag);
    const resultWithKeys = ensureNodeKeys(json) as HtmlNode[];
    const allNodes = [...resultWithKeys];
    const isolatedNodes = isolateComponentNodes(allNodes);
    console.log("<=🔹🟢==isolatedNodes=🟢🔹==>", isolatedNodes);
    updateHtmlJson((prev) => [
      ...prev,
      ...isolatedNodes,
    ]);
    setLoading(false);
    setClicked("");
    setTempTag("");
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
        setTempTag={setTempTag}
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






