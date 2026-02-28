"use client";
import React, { useState, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import ButtonUnit from "@/components/ButtonUnit/ButtonUnit";
import { AnimatePresence, motion } from "framer-motion";
import Input from "@/components/ui/Input/Input";
import { useQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import ServicesButtons from "./ServicesButtons";
import { applyDSHeadersToTree } from "@/app/plaza/utils/applyDSHeadersToTree";
import ReactDOMServer from "react-dom/server";
import * as OutlineIcons from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
const HeroIconPicker = dynamic(() => import("./HeroIconPicker"), {
  ssr: false,
  loading: () => <Loading />,
});

const TagsNamen1 = [
  { tag: "section", color: "rgb(220, 230, 220)" },
  { tag: "div", color: "rgb(226, 232, 240)" },
  { tag: "container", color: "dodgerblue" },
  { tag: "a", color: "#3b82f6" }, // blue
  { tag: "button", color: "#06b6d4" }, // cyan
  { tag: "p", color: "#22c55e" }, // green
  { tag: "span", color: "#8b5cf6" }, // violet
  { tag: "ul", color: "#f97316" }, // orange
  { tag: "li", color: "#eab308" }, // yellow
  { tag: "is", color: "#0ea5e9" },
  { tag: "img", color: "#0ea5e9" }, // sky
  { tag: "svg", color: "#06b6d4" }, // cyan
  { tag: "nav", color: "#14b8a6" }, // teal

  { tag: "h1", color: "#ef4444" }, // red
  { tag: "h2", color: "#ef4444" },
  { tag: "h3", color: "#ef4444" },
  { tag: "h4", color: "#ef4444" },
  { tag: "h5", color: "#ef4444" },
  { tag: "h6", color: "#ef4444" },
];
const TagsNamen2 = [
  { tag: "form", color: "#ebebeb" },
  { tag: "br", color: "#ebebeb" }, // gray
  { tag: "hr", color: "#ebebeb" }, // zinc
  { tag: "aside", color: "#06b6d4" }, // cyan
  { tag: "fieldset", color: "#f43f5e" },
  { tag: "article", color: "#14b8a6" },
  { tag: "header", color: "#6366f1" }, // indigo
  { tag: "ol", color: "#f59e0b" }, // amber
  { tag: "option", color: "#a855f7" }, // purple
  { tag: "optgroup", color: "#d946ef" }, // fuchsia
  { tag: "select", color: "#8b5cf6" }, // violet
  { tag: "source", color: "#38bdf8" }, // sky-light
  { tag: "legend", color: "#ec4899" }, // pink

  // { tag: "input", color: "#3b82f6" }, // blue
  // { tag: "textarea", color: "#6366f1" }, // indigo
  // { tag: "label", color: "#f97316" },
];
const TagsNamen4 = [
  { tag: "section container wrap", color: "powderblue" },
  { tag: "flex row", color: "powderblue" },
  { tag: "flex col", color: "powderblue" },
  { tag: "grid 100px_1fr", color: "powderblue" },
  { tag: "grid minmax", color: "powderblue" },
  { tag: "ul flex row", color: "powderblue" },
  { tag: "ul flex col", color: "powderblue" },
];
const TagsNamen5 = [
  // { tag: "SECTION", color: "powderblue" },
  // { tag: "HERO", color: "powderblue" },
  { tag: "CARDS", color: "powderblue" },
  { tag: "CARD", color: "powderblue" },
  { tag: "CARD EMPTY", color: "powderblue" },
  { tag: "input-field", color: "powderblue" },
  { tag: "input-name-svg", color: "powderblue" },
  { tag: "input-mail-svg", color: "powderblue" },
  { tag: "input-tel-svg", color: "powderblue" },
  { tag: "f-number", color: "powderblue" },
  { tag: "f-check", color: "powderblue" },
  { tag: "textarea-field", color: "powderblue" },
  { tag: "fieldset-radio", color: "powderblue" },
  { tag: "fildset-rating", color: "powderblue" },
  { tag: "range-wrap-js", color: "powderblue" },
  { tag: "search-f", color: "powderblue" },
  { tag: "modal", color: "powderblue" },
];
type ProjectData = {
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>;
  _key?: string;
  children: ProjectData[] | string;
};
// ==>==>==>==>==>==>==>==>==>==>==>==>==>
// ==>==>==>==>==>==>==>==>==>==>==>==>==>
// ==>==>==>==>==>==>==>==>==>==>==>==>==>

const AdminComponent = () => {
  const { updateHtmlJson, SCSS } = useStateContext();
  const [openSVGModal, setopenSVGModal] = useState<boolean>(false);
  const [name, setName] = useState<string | null>(null);

  const { refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name },
    skip: !name,
    fetchPolicy: "no-cache",
  });
  // ==>==>==>==>==>==>==>==>==>==>==>==>==>
  const handleLoad = async (tag: string) => {
    if (!tag) return;
    setName(tag);
    let resultWithKeysStyles = [] as ProjectData[];
    if (tag.includes("input")) {
      const { data: stylesData } = await refetchJson({
        name: "style-input-field",
      });
      const contentStyles = stylesData?.jsonDocumentByName?.content;
      resultWithKeysStyles = ensureNodeKeys(contentStyles) as ProjectData[];
    }
    // 1. Грузим сам компонент
    const { data } = await refetchJson({ name: tag });
    const content = data?.jsonDocumentByName?.content;
    if (!content) return;

    const resultWithKeys = ensureNodeKeys(content) as ProjectData[];

    // const extraStyles: ProjectData[] = [];

    // if (tag.includes("input")) {
    //   const { data: stylesData } = await refetchJson({
    //     name: "style-input-field",
    //   });
    //   const stylesContent = stylesData?.jsonDocumentByName?.content;
    //   console.log("<===stylesContent[0]===>", stylesContent[0].text);
    //   resultWithKeys[0].style = stylesContent[0].text;
    //   console.log("<===resultWithKeys===>", resultWithKeys[0].style);
    //   // if (stylesContent) {
    //   //   const stylesArray = Array.isArray(stylesContent)
    //   //     ? stylesContent
    //   //     : [stylesContent];
    //   //   if (!SCSS.replace(/[\r\n\t]+/g, "").includes(stylesArray[0].text)) {
    //   //     const stylesWithKeys = ensureNodeKeys(stylesArray) as ProjectData[];
    //   //     extraStyles.push(...stylesWithKeys);
    //   //   }
    //   // }
    // }

    // if (tag.includes("svg")) {
    //   const { data: svgStylesData } = await refetchJson({
    //     name: "style-input-svg",
    //   });
    //   const svgStylesContent = svgStylesData?.jsonDocumentByName?.content;
    //   if (svgStylesContent) {
    //     const svgStylesArray = Array.isArray(svgStylesContent)
    //       ? svgStylesContent
    //       : [svgStylesContent];
    //     const svgStylesWithKeys = ensureNodeKeys(
    //       svgStylesArray,
    //     ) as ProjectData[];
    //     extraStyles.push(...svgStylesWithKeys);
    //   }
    // }
    // if (tag.includes("check")) {
    //   const { data: checkStylesData } = await refetchJson({
    //     name: "style-check",
    //   });
    //   const checkStylesContent = checkStylesData?.jsonDocumentByName?.content;
    //   if (checkStylesContent) {
    //     const checkStylesArray = Array.isArray(checkStylesContent)
    //       ? checkStylesContent
    //       : [checkStylesContent];
    //     const checkStylesWithKeys = ensureNodeKeys(
    //       checkStylesArray,
    //     ) as ProjectData[];
    //     extraStyles.push(...checkStylesWithKeys);
    //   }
    // }
    // if (tag.includes("number")) {
    //   const { data: numberStylesData } = await refetchJson({
    //     name: "style-number",
    //   });
    //   const numberStylesContent = numberStylesData?.jsonDocumentByName?.content;
    //   if (numberStylesContent) {
    //     const numberStylesArray = Array.isArray(numberStylesContent)
    //       ? numberStylesContent
    //       : [numberStylesContent];
    //     const numberStylesWithKeys = ensureNodeKeys(
    //       numberStylesArray,
    //     ) as ProjectData[];
    //     extraStyles.push(...numberStylesWithKeys);
    //   }
    // }
    // if (tag.includes("radio")) {
    //   const { data: radioStylesData } = await refetchJson({
    //     name: "style-radio",
    //   });
    //   const radioStylesContent = radioStylesData?.jsonDocumentByName?.content;
    //   if (radioStylesContent) {
    //     const radioStylesArray = Array.isArray(radioStylesContent)
    //       ? radioStylesContent
    //       : [radioStylesContent];
    //     const radioStylesWithKeys = ensureNodeKeys(
    //       radioStylesArray,
    //     ) as ProjectData[];
    //     extraStyles.push(...radioStylesWithKeys);
    //   }
    // }
    // if (tag.includes("textarea")) {
    //   const { data: textareaStylesData } = await refetchJson({
    //     name: "style-textarea",
    //   });
    //   const textareaStylesContent =
    //     textareaStylesData?.jsonDocumentByName?.content;
    //   if (textareaStylesContent) {
    //     const textareaStylesArray = Array.isArray(textareaStylesContent)
    //       ? textareaStylesContent
    //       : [textareaStylesContent];
    //     const textareaStylesWithKeys = ensureNodeKeys(
    //       textareaStylesArray,
    //     ) as ProjectData[];
    //     extraStyles.push(...textareaStylesWithKeys);
    //   }
    // }

    updateHtmlJson((prev) => [
      ...prev,
      ...resultWithKeys,
      ...resultWithKeysStyles,
    ]);
  };

  // ==>==>==>==>==>==>==>==>==>==>==>==>==>
  const renderTags = (tags) => (
    <div className=" flex flex-wrap gap-1 bg-slate-200 p-1 ">
      {tags.map((el, i) => (
        <button
          key={i}
          className="btn adminButton px-1.5! border-1 border-[#aaa] text-black text-[12px]"
          style={{ background: el.color }}
          type="button"
          onClick={() => {
            if (el.tag === "svg") {
              setopenSVGModal(true);
            } else {
              handleLoad(el.tag);
            }
          }}
        >
          {el.tag}
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
      <div className="bg-black/60 backdrop-blur-lg py-1">
        <ServicesButtons />
        {renderTags(TagsNamen1)}
        {renderTags(TagsNamen2)}
        <hr className="bordered border-slate-200 my-0.5 " />
        {renderTags(TagsNamen4)}
        <hr className="bordered border-slate-200 my-0.5" />
        {renderTags(TagsNamen5)}
      </div>
    </>
  );
};

export default AdminComponent;
