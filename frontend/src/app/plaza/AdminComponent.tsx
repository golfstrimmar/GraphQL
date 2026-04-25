"use client";
import React, { useState, useRef, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT, GET_JSON_DOCUMENTS } from "@/apollo/queries";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import { isolateSwiperNodes } from "@/utils/isolateSwiper";
import { isolateComponentNodes } from "@/utils/isolateComponent";
import Spinner from "@/components/icons/Spinner";
import Loading from "@/components/ui/Loading/Loading";
import type { HtmlNode } from "@/types/HtmlNode";
import dynamic from "next/dynamic";
import ModRotate from "./ModRotate";

import {
  Tags
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
  async function loadJson(tag: string) {
    const { data } = await refetchJson({ name: tag });
    const contentJson = data?.jsonDocumentByName?.content;
    if (!contentJson) {
      setLoading(false);
      return [];
    }
    return contentJson as HtmlNode[];
  }

  // ==>==>==>==>==>==>==>==>==>==>==>==>==>
  const handleLoad = async (tag: string) => {
    if (!tag) return;
    setLoading(true);
    const json = await loadJson(tag);
    const resultWithKeys = ensureNodeKeys(json) as HtmlNode[];
    const allNodes = [...resultWithKeys];
    const isolatedNodes = isolateComponentNodes(allNodes);
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
    if (!tempTag || tempTag === "") return;
    if (tempTag === "svg") {
      setopenSVGModal(true);
    } else {
      handleLoad(tempTag);
    }
  }, [tempTag]);

  // ==>==>==>==>==>==>==>==>==>==>==>==>==>
  return (
    <section className="z-5000 mt-[60px] bg-[var(--slate-500)] px-1 pb-2">
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
        {Tags && Tags.map((el, i) => (
          <button
            key={i}
            className="btn w-full adminButton px-1.5! border-1 border-[#aaa] text-black text-[12px] h-[20px] flex items-center justify-center overflow-hidden" // добавил flex и центрирование
            style={{
              background: el.color,
              maxHeight: 20,
              lineHeight: 1 // чтобы текст не раздувал высоту
            }}
            type="button"
            onClick={() => { setClicked(el.tag); setTempTag(el.tag); }}
          >
            {loading && clicked === el.tag ? (
              <Spinner width={14} height={14} />
            ) : (
              <span>{el.tag}</span>
            )}
          </button>
        ))}
        <button className="btn-teal !bg-[var(--navy)] w-full !p-0.25 text-[10px] center !mt-2" onClick={() => setOpenModSocial(true)}>
          Soc
        </button>
      </div>
    </section >
  );
};

export default AdminComponent;






