"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/icons/CloseIcon";
import { useStateContext } from "@/providers/StateProvider";
import { useQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";
import { HtmlNode } from "@/types/HtmlNode";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";

interface ModalSocialProps {
  openModSocial: boolean;
  setOpenModSocial: (open: boolean) => void;
}


const SOCIAL_ICONS = [
  "https://cdn.simpleicons.org/facebook",
  "https://cdn.simpleicons.org/instagram",
  "https://cdn.simpleicons.org/x",
  "https://cdn.simpleicons.org/youtube",
  "https://cdn.simpleicons.org/whatsapp",
  "https://cdn.simpleicons.org/telegram",
  "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@8.3.0/icons/linkedin.svg",
  "https://cdn.simpleicons.org/tiktok",
  "https://cdn.simpleicons.org/discord",
  "https://cdn.simpleicons.org/snapchat",
  "https://cdn.simpleicons.org/reddit",
  "https://cdn.simpleicons.org/pinterest",
  "https://cdn.simpleicons.org/messenger",
  "https://cdn.simpleicons.org/signal",
  "https://cdn.simpleicons.org/github",
  "https://cdn.simpleicons.org/gmail",
  "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@8.3.0/icons/google.svg",
  "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/googledrive.svg",
  "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/googlemaps.svg",
  "https://cdn.simpleicons.org/twitch",
  "https://cdn.simpleicons.org/spotify",
  "https://cdn.simpleicons.org/vimeo",
  "https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/slack.svg",
  "https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/zoom.svg",
  "https://cdn.simpleicons.org/viber",
  "https://cdn.simpleicons.org/wechat",
  "https://cdn.simpleicons.org/line",
  "https://cdn.simpleicons.org/threads",
  "https://cdn.simpleicons.org/tumblr",
  "https://cdn.simpleicons.org/medium",
  "https://cdn.simpleicons.org/dribbble",
  "https://cdn.simpleicons.org/behance",
  "https://cdn.simpleicons.org/wordpress",
  "https://cdn.simpleicons.org/rss",
];

const ModSocial: React.FC<ModalSocialProps> = ({ openModSocial, setOpenModSocial }) => {
  const { updateHtmlJson } = useStateContext();

  const handleClick = (url: string) => {
    console.log("<===url===>", url);

    const newNode: HtmlNode = {
      tag: "a",
      class: "social-link",
      attributes: { href: "#!", target: "_blank" },
      text: "",
      style: "width: 24px; height: 24px;    display: inline-flex; justify-content: center; align-items: center; cursor: pointer; & > svg{fill:#000000}; &:hover > svg { fill: #64ffda; transition: all 0.3s ease; }",

      children: [
        {
          text: "",
          style: "width: 100%; height: 100%; ",
          tag: "img",
          class: "social-img",
          attributes: { src: url },
          children: [],
        }
      ],
    };
    updateHtmlJson((prev: HtmlNode[]) => [
      ...prev,
      ...(ensureNodeKeys([newNode]) as HtmlNode[]),
    ]);
    setOpenModSocial(false);
  };




  return (
    <AnimatePresence>
      {openModSocial && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: [0.25, 0.8, 0.5, 1] }}
          className="w-[100vw] h-[100vh] fixed top-0 left-0 flex justify-center items-center bg-[rgba(0,0,0,.98)] z-100 p-4"
        >
          <div className="modSocial flex justify-center items-center gap-[10px] px-[10px] py-[5px] rounded-2xl border-2 min-w-[98vw] min-h-[98vh]" onClick={(e) => {
            e.stopPropagation(); if (!(e.target as HTMLElement).closest(".modSocial")) setOpenModSocial(false);
          }}>
            <div className="flex flex-col gap-4 p-8 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] min-w-[380px] border border-slate-100">
              <div className="flex flex-wrap justify-center gap-4 max-w-[600px] max-h-[70vh] overflow-y-auto custom-scrollbar p-2">
                {SOCIAL_ICONS.map((url) => {
                  const name = url.split("/").pop();
                  return (
                    <button
                      key={url}
                      className="w-10 h-10 flex items-center justify-center hover:scale-110 hover:opacity-80 transition-all cursor-pointer"
                      onClick={() => handleClick(url)}
                      title={name}
                    >
                      <img src={url} alt={name || "social icon"} className="w-full h-full object-contain" />
                    </button>
                  );
                })}
              </div>

              <button className="w-4 h-4 block text-white absolute top-4 right-6 z-10000 hover:text-gray-500 cursor-pointer transition-colors duration-300"
                onClick={() => {
                  setOpenModSocial(false);
                }}
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModSocial