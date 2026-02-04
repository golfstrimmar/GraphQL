"use client";
import React, { useEffect, useRef, useState } from "react";
import { useStateContext } from "@/providers/StateProvider";
import dynamic from "next/dynamic";
import Loading from "@/components/ui/Loading/Loading";
const ModalTexts = dynamic(() => import("../forTextComponent/ModalTexts"), {
  ssr: false,
  loading: () => <Loading />,
});

type NodeToSend = {
  _key: string;
  tag: string;
  text: string;
  class: string;
  style: string;
  attributes?: Record<string, string>;
  children: NodeToSend[] | string;
};

interface TextComponentProps {
  node: NodeToSend;
  itemClass: string;
  updateNodeByKey: (key: string, changes: Partial<NodeToSend>) => void;
}

const TextComponent: React.FC<TextComponentProps> = ({
  node,
  itemClass,
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
    const id = setTimeout(() => {
      updateNodeByKey(node._key, { text: newValue });
    }, 1000);
    return () => clearTimeout(id);
  };
  return (
    <div className="bg-white  rounded !max-h-[max-content]  ml-[5px]  flex flex-col relative ">
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

      <p className={itemClass}>
        <span>Text:</span>
        {texts && texts.length > 0 && (
          <button
            className="btn-teal  text-[12px]"
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
          className="btn-teal !max-h-[20px] text-sm"
          onClick={() => {
            setTextValue("Lorem");
            const id = setTimeout(() => {
              updateNodeByKey(node._key, { text: "Lorem" });
            }, 100);
            return () => clearTimeout(id);
          }}
        >
          Lorem 1
        </button>
        <button
          className="btn-teal !max-h-[20px] text-sm"
          onClick={() => {
            setTextValue("Lorem ipsum dolor sit amet.");
            const id = setTimeout(() => {
              updateNodeByKey(node._key, {
                text: "Lorem ipsum dolor sit amet.",
              });
            }, 100);
            return () => clearTimeout(id);
          }}
        >
          Lorem 5
        </button>
        <button
          className="btn-teal !max-h-[20px] text-sm"
          onClick={() => {
            setTextValue(
              "Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias reiciendis consequatur iure neque praesentium iste.",
            );
            const id = setTimeout(() => {
              updateNodeByKey(node._key, {
                text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias reiciendis consequatur iure neque praesentium iste.",
              });
            }, 100);
            return () => clearTimeout(id);
          }}
        >
          Lorem 15
        </button>
        <button
          className="btn-teal !max-h-[20px] text-sm"
          onClick={() => {
            setTextValue(
              "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur consequuntur adipisci nulla velit mollitia cum quis, cumque reprehenderit natus illum doloribus consectetur ipsam iste quisquam!",
            );
            const id = setTimeout(() => {
              updateNodeByKey(node._key, {
                text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur consequuntur adipisci nulla velit mollitia cum quis, cumque reprehenderit natus illum doloribus consectetur ipsam iste quisquam!",
              });
            }, 100);
            return () => clearTimeout(id);
          }}
        >
          Lorem 25
        </button>
        <button
          className="btn-teal !max-h-[20px] text-sm"
          onClick={() => {
            setTextValue("");
            const id = setTimeout(() => {
              updateNodeByKey(node._key, {
                text: "",
              });
            }, 100);
            return () => clearTimeout(id);
          }}
        >
          🧹
        </button>
      </p>

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
          const id = setTimeout(() => {
            updateNodeByKey(node._key, { text: e.target.value });
          }, 2000);
          return () => clearTimeout(id);
        }}
        className="textarea-styles"
      />
    </div>
  );
};

export default TextComponent;
