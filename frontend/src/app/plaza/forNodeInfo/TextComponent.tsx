"use client";
import React, { useEffect, useRef, useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
const ModalTexts = dynamic(() => import("../forTextComponent/ModalTexts"), {
  ssr: false,
  loading: () => <Loading />,
});

import type { HtmlNode } from "@/types/HtmlNode";

interface TextComponentProps {
  node: HtmlNode;
  updateNodeByKey: (key: string, changes: Partial<HtmlNode>) => void;
}

const TextComponent: React.FC<TextComponentProps> = ({
  node,
  updateNodeByKey,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { texts } = useStateContext();
  const [modalTextsOpen, setModalTextsOpen] = useState<boolean>(false);
  const [textValue, setTextValue] = useState("");

  useEffect(() => {
    if (!node?._key) return;
    setTextValue(node?.text || "");
  }, [node?._key, node?.text]);

  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (!texts) return;
    console.log("<=🟢🟢🟢==texts===>", texts);
  }, [texts]);

  const handleTextChange = (newValue: string) => {
    if (!node._key) return () => { };
    const id = setTimeout(() => {
      updateNodeByKey(node._key!, { text: newValue });
    }, 1000);
    return () => clearTimeout(id);
  };
  return (
    <div className="unitStyle">
      {modalTextsOpen && (
        <ModalTexts
          node={node}
          modalTextsOpen={modalTextsOpen}
          setModalTextsOpen={setModalTextsOpen}
          updateNodeByKey={updateNodeByKey}
          handleTextChange={handleTextChange}
          textValue={textValue}
          setTextValue={setTextValue}
        />
      )}

      <div className="itemClass">
        <h6 className="my-1">Text:</h6>
        {texts && texts.length > 0 && (
          <button
            className="btn btn-empty text-[12px] text-[var(--black)] mr-1 px-1 !max-h-[20px"
            onClick={() =>
              setModalTextsOpen(() => {
                return !modalTextsOpen;
              })
            }
          >
            Texts
          </button>
        )}
        <button
          className="btn btn-empty text-[12px] text-[var(--black)] mr-1 px-1 !max-h-[20px"
          onClick={() => {
            setTextValue("Lorem");
            if (node._key) {
              const id = setTimeout(() => {
                updateNodeByKey(node._key!, { text: "Lorem" });
              }, 100);
              return () => clearTimeout(id);
            }
          }}
        >
          Lorem 1
        </button>
        <button
          className="btn btn-empty text-[12px] text-[var(--black)] mr-1 px-1 !max-h-[20px"
          onClick={() => {
            setTextValue("Lorem ipsum dolor sit amet.");
            if (node._key) {
              const id = setTimeout(() => {
                updateNodeByKey(node._key!, {
                  text: "Lorem ipsum dolor sit amet.",
                });
              }, 100);
              return () => clearTimeout(id);
            }
          }}
        >
          Lorem 5
        </button>
        <button
          className="btn btn-empty text-[12px] text-[var(--black)] mr-1 px-1 !max-h-[20px"
          onClick={() => {
            setTextValue(
              "Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias reiciendis consequatur iure neque praesentium iste.",
            );
            if (node._key) {
              const id = setTimeout(() => {
                updateNodeByKey(node._key!, {
                  text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias reiciendis consequatur iure neque praesentium iste.",
                });
              }, 100);
              return () => clearTimeout(id);
            }
          }}
        >
          Lorem 15
        </button>
        <button
          className="btn btn-empty text-[12px] text-[var(--black)] mr-1 px-1 !max-h-[20px"
          onClick={() => {
            setTextValue(
              "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur consequuntur adipisci nulla velit mollitia cum quis, cumque reprehenderit natus illum doloribus consectetur ipsam iste quisquam!",
            );
            if (node._key) {
              const id = setTimeout(() => {
                updateNodeByKey(node._key!, {
                  text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur consequuntur adipisci nulla velit mollitia cum quis, cumque reprehenderit natus illum doloribus consectetur ipsam iste quisquam!",
                });
              }, 100);
              return () => clearTimeout(id);
            }
          }}
        >
          Lorem 25
        </button>
        <button
          className="btn btn-empty text-[12px] text-[var(--black)] mr-1 px-1 !max-h-[20px"
          onClick={() => {
            setTextValue("");
            if (node._key) {
              const id = setTimeout(() => {
                updateNodeByKey(node._key!, {
                  text: "",
                });
              }, 100);
              return () => clearTimeout(id);
            }
          }}
        >
          🧹
        </button>
      </div>

      <textarea
        ref={(el) => {
          if (!el) return;
          textareaRef.current = el;
          adjustHeight(el);
        }}
        value={textValue}
        onChange={(e) => {
          e.preventDefault();
          setTextValue(e.target.value);
          if (node._key) {
            const id = setTimeout(() => {
              updateNodeByKey(node._key!, { text: e.target.value });
            }, 2000);
            return () => clearTimeout(id);
          }
        }}
        className="textarea-styles"
      />
    </div>
  );
};

export default TextComponent;
