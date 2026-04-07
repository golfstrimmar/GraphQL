"use client";
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
// import { UPDATE_PROJECT, REMOVE_PROJECT } from "@/apollo/mutations";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import type { HtmlNode } from "@/types/HtmlNode";
import Loading from "@/components/ui/Loading/Loading";
import Spinner from "@/components/icons/Spinner";
import AddIcon from "@/components/icons/AddIcon";
import dynamic from "next/dynamic";


const ModalFormFont = dynamic(
  () => import("./ModalFormFont"),
  {
    ssr: false,
    loading: () => <Loading />
  }
);

type InputType = {
  name: string;
  type: string;
  value: string;
  quantity: number;
  checked: boolean;
  background: string;
  color: string;
  borderColor: string;
  fontData: string;
};


// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function DesignForm({ inputs, setInputs, dInp, resetAll }: { inputs: InputType[], setInputs: React.Dispatch<React.SetStateAction<InputType[]>>, dInp: string[], resetAll: () => void }) {
  const router = useRouter();
  const { updateHtmlJson } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [openFontModal, setOpenFontModal] = useState<boolean>(false);
  const [currentInput, setCurrentInput] = useState<InputType | null>(null);
  const { refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name },
    skip: !name,
    fetchPolicy: "no-cache",
  });

  const CheckboxNames = [
    "filled",
    "outlined",
    "empty",
    "svg-filled",
    "svg-outlined",
    "svg-empty",
    "name-svg",
    "mail-svg",
    "tel-svg",
    "number",
    "check",
    "textarea",
    "radio",
    "rating",
    "range",
    "select",
    "search"
  ]
  type UpdateResult = {
    nodes: HtmlNode[];
    found: boolean;
  };
  // const [getJsonDocument, {
  //   data: dataProject,
  //   loading: loadingProject,
  //   error: errorProject,
  // }] = useLazyQuery(GET_JSON_DOCUMENT, {
  //   fetchPolicy: "network-only",
  //   onCompleted: (data) => {
  //     if (!data) return;
  //     console.log('<===data===>', data.jsonDocumentByName.content);
  //     const jsonContent = data.jsonDocumentByName.content;
  //     console.log('<===jsonContent===>', jsonContent);
  //     const nodes: HtmlNode[] = ensureNodeKeys(jsonContent);
  //     updateHtmlJson(prev => [...prev, ...nodes]);
  //   },
  //   onError: (error) => { console.log("<======>", error); },
  // });

  // ==================== 
  useEffect(() => { if (!inputs) return; console.log('<===inputs===>', inputs); }, [inputs]);
  // ==================== 
  const handleAddInputs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setInputs(prevInputs => {
      const existingInput = prevInputs.find(input => input.name === name);
      if (existingInput) {
        return prevInputs.filter(input => input.name !== name);
      } else if (name === "filled") {
        return [...prevInputs, { name, type: "", value: "", quantity: 1, checked, background: "#233554c9", color: "#e6f1ff", borderColor: "#8892b0f6", fontData: " font-weight:400;  font-family:'Montserrat', sans-serif;" }];
      } else {
        return [...prevInputs, { name, type: "", value: "", quantity: 1, checked, background: "", color: "#e6f1ff", borderColor: "#8892b0f6", fontData: "font-weight:400; font-family:'Montserrat', sans-serif;" }];
      }
    });
  };
  // --------------------
  const handleQuantityChange = (name: string, quantity: number) => {
    setInputs(prevInputs =>
      prevInputs.map(input =>
        input.name === name ? { ...input, quantity } : input
      )
    );
  };
  // ====================display: inline-block; position: absolute; font-size: 14px; line-height: 1; color: #ffffff; top: 0; left: 20px; transform: translateY(20%); z-index: 10; padding: 0; transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1); pointer-events: none;
  const transformResultBackground = (content: any, input: InputType) => {
    const result = content.map((item: any) => {
      console.log("<===.style===>", item.style);
      const updatedCss = item.style.replace(
        /background-color:\s*[^;]+;/g,
        `background-color: ${input.background};`
      );
      return {
        ...item,
        style: updatedCss,
      };
    });
    console.log("<===result===>", result);
    return result;
  };

  // ---- color Label
  const isTargetLabel = (node: HtmlNode) =>
    node.tag === "label" &&
    node.class === "label-filled" &&
    node.attributes?.for === "f1";


  const updateLabelColorInner = (
    nodes: HtmlNode[],
    color: string
  ): UpdateResult => {
    let found = false;

    const newNodes = nodes.map((node) => {
      if (found) return node;

      const isTarget = isTargetLabel(node);

      const style = isTarget
        ? node.style.replace(/color:\s*[^;]+;/g, `color: ${color};`)
        : node.style;

      let children = node.children;

      if (!found && node.children) {
        const res = updateLabelColorInner(node.children, color);
        children = res.nodes;
        if (res.found) found = true;
      }

      if (isTarget) found = true;

      return {
        ...node,
        style,
        children,
      };
    });

    return { nodes: newNodes, found };
  };

  const updateLabelColor = (nodes: HtmlNode[], color: string): HtmlNode[] =>
    updateLabelColorInner(nodes, color).nodes;

  // ---- fontData Label
  const handleFontClick = (fontFamily: string) => {
    if (!currentInput) return;
    console.log("<===fontData===>", currentInput.fontData);
    const fontD = `font-family:'${fontFamily}', sans-serif;`;
    console.log("<===fontD===>", fontD);
    const cleaned = currentInput.fontData.replace(/font-family:\s*[^;]+;/g, "");
    const newFontData = `${cleaned} ${fontD}`.trim();
    // const fontData = `font-family:'${fontFamily}', sans-serif;`;
    setInputs(prevInputs =>
      prevInputs.map(input =>
        input.name === currentInput.name ? { ...input, fontData: newFontData } : input
      )
    );
    setOpenFontModal(false);
    setCurrentInput(null);
  };



  const appendLabelFontDataInner = (
    nodes: HtmlNode[],
    fontData: string
  ): UpdateResult => {
    let found = false;

    const newNodes = nodes.map((node) => {
      if (found) return node;

      const isTarget = isTargetLabel(node);

      const style = isTarget
        ? `${node.style} ${fontData}`.trim()
        : node.style;

      let children = node.children;

      if (!found && node.children) {
        const res = appendLabelFontDataInner(node.children, fontData);
        children = res.nodes;
        if (res.found) found = true;
      }

      if (isTarget) found = true;

      return {
        ...node,
        style,
        children,
      };
    });

    return { nodes: newNodes, found };
  };

  const appendLabelFontData = (nodes: HtmlNode[], fontData: string): HtmlNode[] =>
    appendLabelFontDataInner(nodes, fontData).nodes;



  const transformResultColor = (content: HtmlNode[], input: InputType) => {
    const result = updateLabelColor(content, input.color);
    console.log("<===result===>", result);
    return result;
  };



  const transformResultBorder = (content: any, input: InputType) => {
    const result = content.map((item: any) => {
      const updatedCss = item.style.replace(
        /border:\s*[^;]+;/g,
        `border: 2px solid ${input.borderColor};`
      );

      return {
        ...item,
        style: updatedCss,
      };
    });

    return result;
  };

  const handleAddToJson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let result: HtmlNode[] = [];

    for (const input of inputs) {
      if (!input.checked) continue;

      try {
        const { name, quantity } = input;
        if (!input || name !== "filled") continue;

        for (let i = 0; i < quantity; i++) {
          setLoading(true);
          const { data } = await refetchJson({ name: "container-" + name });
          const content = data?.jsonDocumentByName?.content;
          if (!content) {
            setLoading(false);
            return;
          }

          let local = transformResultBackground(content, input) as HtmlNode[];
          local = transformResultColor(local, input) as HtmlNode[];
          local = appendLabelFontData(local, input.fontData) as HtmlNode[];
          local = transformResultBorder(local, input) as HtmlNode[];

          result = [...result, ...local];
        }

        const { data } = await refetchJson({ name: "script-all-inputs" });
        const content = data?.jsonDocumentByName?.content;
        if (!content) {
          setLoading(false);
          return;
        }

        const newResult = [...result, ...content];
        const resultWithKeys = ensureNodeKeys(newResult) as HtmlNode[];
        updateHtmlJson((prev) => [...prev, ...resultWithKeys]);

        setLoading(false);
      } catch (error) {
        console.log("<======>", error);
      } finally {
        router.push("/plaza");
      }
    }
  };


  return (
    <div className="">
      {/* Модалка для выбора шрифта текста */}
      <ModalFormFont openFontModal={openFontModal} setOpenFontModal={setOpenFontModal} setCurrentInput={setCurrentInput} handleFontClick={handleFontClick} />
      {/*  */}
      <form action="">
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <div className="inputs-check-list">
            {CheckboxNames.map((name) => (
              <div key={name} className="input-check">
                <input id={`input-check-${name}`} name={name} type="checkbox"
                  checked={inputs.some(input => input.name === name && input.checked)}
                  onChange={(e) => handleAddInputs(e)}
                />
                <label htmlFor={`input-check-${name}`}>{name}</label>
              </div>
            ))}
          </div>
          {inputs.length > 0 && <div className="flex flex-col gap-2 border-l-1 border-l-[#e6f1ff] ">
            <div className="input-data grid grid-cols-[repeat(5,7%)_1fr] items-center justify-items-center  text-sm gap-2">
              <span >Name</span>
              <span >Quantity</span>
              <span >Background</span>
              <span >Color</span>
              <span >BorderColor</span>
              <span >FontData</span>
            </div>
            <hr className="mb-2 " />
            {inputs.map((input) => (
              <div key={input.name} className="input-data grid grid-cols-[repeat(5,7%)_1fr] items-center justify-items-center gap-2">
                <h5>{input.name}</h5>

                <div className="f-number">
                  <button className="num-btn num-btn--dec" type="button"
                    onClick={() => {
                      if (input.quantity >= 1) {
                        handleQuantityChange(input.name, input.quantity - 1)
                      }
                    }}
                  >−</button>
                  <input id={`f-number-input-${input.name}`} max="10" min="0" name={`f-number-input-${input.name}`} step="1" type="number" value={input.quantity} placeholder="" />
                  <button className="num-btn num-btn--inc" type="button"
                    onClick={() => handleQuantityChange(input.name, input.quantity + 1)}
                  >+</button>
                </div>
                <div className="flex flex-col text-sm gap-0">
                  <label htmlFor="background">{input.background}</label>

                  <input className="cursor-pointer" type="color" name="background" id="background" value={input.background}
                    disabled={input.name !== "filled"}

                    onChange={(e) => {
                      const { value } = e.target;
                      setInputs((prevInputs) =>
                        prevInputs.map((item) =>
                          item.name === input.name ? { ...item, background: value } : item
                        )
                      );
                    }} />
                </div>

                <div className="flex flex-col  text-sm gap-0">
                  <label htmlFor="color">{input.color}</label>
                  <input className="cursor-pointer" type="color" name="color" id="color" value={input.color}

                    onChange={(e) => {
                      const { value } = e.target;
                      setInputs((prevInputs) =>
                        prevInputs.map((item) =>
                          item.name === input.name ? { ...item, color: value } : item
                        )
                      );
                    }} />


                </div>
                <div className="flex flex-col  text-sm gap-0">
                  <label htmlFor="borderColor">{input.borderColor}</label>
                  <input className="cursor-pointer" type="color" name="borderColor" id="borderColor" value={input.borderColor} onChange={(e) => {
                    const { value } = e.target;
                    setInputs((prevInputs) =>
                      prevInputs.map((item) =>
                        item.name === input.name ? { ...item, borderColor: value } : item
                      )
                    );
                  }} /></div>
                <div className="field-t-input flex items-center gap-2  text-sm gap-0">
                  <textarea className="cursor-pointer max-h-[40px]" name="fontData" id="fontData" value={input.fontData} onChange={(e) => {
                    const { value } = e.target;
                    setInputs((prevInputs) =>
                      prevInputs.map((item) =>
                        item.name === input.name ? { ...item, fontData: value } : item
                      )
                    );
                  }}></textarea>
                  {/* изменение шрифта */}
                  <button
                    type="button"
                    className={` btn  text-sm btn-empty px-2 max-h-8 text-[var(--color-text)]`}
                    onClick={() => {
                      setCurrentInput(input);
                      setOpenFontModal(true);
                    }}

                  >
                    font
                  </button>
                </div>
              </div>
            ))}
          </div>
          }

        </div>



        <hr className="my-2 " />
        <h6 className="text-sm text-gray-400 mt-4  mb-1">Add Form
          Nodes</h6>
        <button className="btn btn-teal mt-4" type="button" onClick={(e) => handleAddToJson(e)}>  {loading ? <Spinner /> : <AddIcon width={18} height={18} />}
        </button>
      </form>
    </div>
  );
}

