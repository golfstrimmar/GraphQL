"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from "@/components/icons/CloseIcon";
import { useStateContext } from "@/providers/StateProvider";
import { HtmlNode } from "@/types/HtmlNode";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";

interface ModalSocialProps {
  openModSocial: boolean;
  setOpenModSocial: (open: boolean) => void;
}

const SOCIAL_ICONS = [
  "https://cdn.simpleicons.org/facebook",
  "https://cdn.simpleicons.org/instagram",
  "https://cdn.simpleicons.org/viber",
  "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@8.3.0/icons/twitter.svg",
  "https://cdn.simpleicons.org/whatsapp",
  "https://cdn.simpleicons.org/telegram",
  "https://cdn.simpleicons.org/x",
  "https://cdn.simpleicons.org/pinterest",
  "https://cdn.simpleicons.org/messenger",
  "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@8.3.0/icons/linkedin.svg",
  "https://cdn.simpleicons.org/tiktok",
  "https://cdn.simpleicons.org/discord",
  "https://cdn.simpleicons.org/snapchat",
  "https://cdn.simpleicons.org/reddit",
  "https://cdn.simpleicons.org/youtube",
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

const ModSocial: React.FC<ModalSocialProps> = ({
  openModSocial,
  setOpenModSocial,
}) => {
  const { updateHtmlJson } = useStateContext();
  const [mounted, setMounted] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function svgToJson(node: Element): HtmlNode {
    return {
      tag: node.tagName.toLowerCase(),
      class: node.getAttribute("class") || "",
      text:
        node.children.length === 0 && node.textContent
          ? node.textContent
          : undefined,
      children: Array.from(node.children).map((child) =>
        svgToJson(child as Element)
      ),
      attributes: Object.fromEntries(
        Array.from(node.attributes)
          .filter((a) => a.name !== "class")
          .map((a) => [a.name, a.value])
      ),
    } as HtmlNode;
  }

  const handleClick = async (url: string) => {
    try {
      setLoadingUrl(url);
      console.log("<===url===>", url);

      const res = await fetch(url);
      const svgText = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, "image/svg+xml");
      const svgEl = doc.documentElement;

      const jsonSvg = svgToJson(svgEl);

      const newNode: HtmlNode = {
        tag: "li",
        class: "soc-item",
        attributes: {},
        children: [
          {
            tag: "a",
            class: "soc-link",
            attributes: {
              href: "#!",
              target: "_blank",
            },
            text: "",
            style:
              "width: 24px; height: 24px; display: inline-flex; justify-content: center; align-items: center; cursor: pointer; & > svg{fill:rgba(255, 255, 255, 0.6)}; &:hover > svg { fill:#38bdf8; transition: all 0.3s ease; }",
            children: [jsonSvg],
          },
        ],
      };

      const resultWithKeys = ensureNodeKeys([newNode]) as HtmlNode[];

      updateHtmlJson((prev) => [...prev, ...resultWithKeys]);

      setOpenModSocial(false);
    } catch (e) {
      console.error("Error fetching/parsing SVG:", e);
    } finally {
      setLoadingUrl(null);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {openModSocial && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: [0.25, 0.8, 0.5, 1] }}
          className="w-[100vw] h-[100vh] fixed top-0 left-0 flex justify-center items-center bg-[rgba(0,0,0,.98)] z-[10000] p-4"
        >
          <div
            className="modSocial flex justify-center items-center gap-[10px] px-[10px] py-[5px] rounded-2xl border-2 min-w-[98vw] min-h-[98vh]"
            onClick={(e) => {
              e.stopPropagation();
              if (!(e.target as HTMLElement).closest(".modSocial")) {
                setOpenModSocial(false);
              }
            }}
          >
            <div className="flex flex-col gap-4 p-8 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] min-w-[380px] border border-slate-100 relative">
              <div className="flex flex-wrap justify-center gap-4 max-w-[600px] max-h-[70vh] overflow-y-auto custom-scrollbar p-2">
                {SOCIAL_ICONS.map((url) => {
                  const name = url.split("/").pop();
                  const isLoading = loadingUrl === url;
                  return (
                    <button
                      key={url}
                      className="w-10 h-10 flex items-center justify-center hover:scale-110 hover:opacity-80 transition-all cursor-pointer disabled:opacity-40 disabled:hover:scale-100"
                      onClick={() => handleClick(url)}
                      title={name || undefined}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                      ) : (
                        <img
                          src={url}
                          alt={name || "social icon"}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                className="w-4 h-4 block text-white absolute top-4 right-6 z-[10001] hover:text-gray-500 cursor-pointer transition-colors duration-300"
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
    </AnimatePresence>,
    document.body
  );
};

export default ModSocial;