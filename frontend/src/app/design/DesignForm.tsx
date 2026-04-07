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
import { ColorPickerField } from "@/components/ui/ColorPickerField/ColorPickerField";
import { isolateComponentNodes } from "@/utils/isolateComponent";

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
type UpdateResult = {
  nodes: HtmlNode[];
  found: boolean;
};
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
  "textarea",
]
// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function DesignForm({ inputs, setInputs, dInp, resetAll }: { inputs: InputType[], setInputs: React.Dispatch<React.SetStateAction<InputType[]>>, dInp: string[], resetAll: () => void }) {
  const router = useRouter();
  const { updateHtmlJson } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [openFontModal, setOpenFontModal] = useState<boolean>(false);
  const [currentInput, setCurrentInput] = useState<InputType | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [openPicker, setOpenPicker] = useState<{
    name: string;
    field: "background" | "color" | "borderColor" | null;
  } | null>(null);

  const closeAllPickers = () => setOpenPicker(null);
  const { refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, { fetchPolicy: "no-cache", });
  // ====================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        closeAllPickers();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // ==================== 
  useEffect(() => { if (!inputs) return; console.log('<===inputs===>', inputs); }, [inputs]);
  // ==================== 
  const handleAddInputs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setInputs(prevInputs => {
      const existingInput = prevInputs.find(input => input.name === name);
      if (existingInput) {
        return prevInputs.filter(input => input.name !== name);
      } else if (name.includes("filled")) {
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
    node.tag === "label";


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
    return result;
  };



  const transformResultBorder = (content: any, input: InputType) => {
    return content.map((item: any) => {
      const style = item.style || "";

      if (input.name === "empty") {
        // меняем только border-bottom
        const updatedCss = style.replace(
          /border-bottom:\s*[^;]+;/g,
          `border-bottom: 2px solid ${input.borderColor};`
        );

        return {
          ...item,
          style: updatedCss,
        };
      } else {
        // меняем полный border
        const updatedCss = style.replace(
          /border:\s*[^;]+;/g,
          `border: 2px solid ${input.borderColor};`
        );

        return {
          ...item,
          style: updatedCss,
        };
      }
    });
  };

  const handleAddToJson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let result: HtmlNode[] = [];

    try {
      for (const input of inputs) {
        if (!input.checked) continue; // не отмечен — пропускаем

        const { name, quantity } = input;

        if (name === "filled") {
          for (let i = 0; i < quantity; i++) {
            setLoading(true);
            const { data } = await refetchJson({ name: "container-filled" });
            const content = data?.jsonDocumentByName?.content;
            if (!content) {
              setLoading(false);
              return;
            }

            let local = transformResultBackground(content, input) as HtmlNode[];
            local = transformResultColor(local, input) as HtmlNode[];
            local = appendLabelFontData(local, input.fontData) as HtmlNode[];
            local = transformResultBorder(local, input) as HtmlNode[];

            // 1) ключи
            local = ensureNodeKeys(local) as HtmlNode[];

            // 2) изоляция КОНКРЕТНО этого экземпляра
            local = isolateComponentNodes(local);

            result = [...result, ...local];
          }

          continue;
        }
        if (name === "outlined") {
          for (let i = 0; i < quantity; i++) {
            setLoading(true);
            const { data } = await refetchJson({ name: "container-outlined" });
            const content = data?.jsonDocumentByName?.content;
            if (!content) {
              setLoading(false);
              return;
            }

            let local = transformResultColor(content, input) as HtmlNode[];
            local = appendLabelFontData(local, input.fontData) as HtmlNode[];
            local = transformResultBorder(local, input) as HtmlNode[];

            // 1) ключи
            local = ensureNodeKeys(local) as HtmlNode[];

            // 2) изоляция КОНКРЕТНО этого экземпляра
            local = isolateComponentNodes(local);

            result = [...result, ...local];
          }

          continue;
        }
        if (name === "empty") {
          for (let i = 0; i < quantity; i++) {
            setLoading(true);
            const { data } = await refetchJson({ name: "container-empty" });
            const content = data?.jsonDocumentByName?.content;
            if (!content) {
              setLoading(false);
              return;
            }

            let local = transformResultColor(content, input) as HtmlNode[];
            local = appendLabelFontData(local, input.fontData) as HtmlNode[];
            local = transformResultBorder(local, input) as HtmlNode[];

            // 1) ключи
            local = ensureNodeKeys(local) as HtmlNode[];

            // 2) изоляция КОНКРЕТНО этого экземпляра
            local = isolateComponentNodes(local);

            result = [...result, ...local];
          }

          continue;
        }
        if (name === "svg-filled") {
          for (let i = 0; i < quantity; i++) {
            setLoading(true);
            const { data } = await refetchJson({ name: "container-svg-filled" });
            const content = data?.jsonDocumentByName?.content;
            if (!content) {
              setLoading(false);
              return;
            }

            let local = transformResultBackground(content, input) as HtmlNode[];
            local = transformResultColor(local, input) as HtmlNode[];
            local = appendLabelFontData(local, input.fontData) as HtmlNode[];
            local = transformResultBorder(local, input) as HtmlNode[];

            // 1) ключи
            local = ensureNodeKeys(local) as HtmlNode[];

            // 2) изоляция КОНКРЕТНО этого экземпляра
            local = isolateComponentNodes(local);

            result = [...result, ...local];
          }

          continue;
        }
        if (name === "svg-outlined") {
          for (let i = 0; i < quantity; i++) {
            setLoading(true);
            const { data } = await refetchJson({ name: "container-svg-outlined" });
            const content = data?.jsonDocumentByName?.content;
            if (!content) {
              setLoading(false);
              return;
            }

            let local = transformResultColor(content, input) as HtmlNode[];
            local = appendLabelFontData(local, input.fontData) as HtmlNode[];
            local = transformResultBorder(local, input) as HtmlNode[];

            // 1) ключи
            local = ensureNodeKeys(local) as HtmlNode[];

            // 2) изоляция КОНКРЕТНО этого экземпляра
            local = isolateComponentNodes(local);

            result = [...result, ...local];
          }

          continue;
        }
        if (name === "svg-empty") {
          for (let i = 0; i < quantity; i++) {
            setLoading(true);
            const { data } = await refetchJson({ name: "container-svg-empty" });
            const content = data?.jsonDocumentByName?.content;
            if (!content) {
              setLoading(false);
              return;
            }

            let local = transformResultColor(content, input) as HtmlNode[];
            local = appendLabelFontData(local, input.fontData) as HtmlNode[];
            local = transformResultBorder(local, input) as HtmlNode[];

            // 1) ключи
            local = ensureNodeKeys(local) as HtmlNode[];

            // 2) изоляция КОНКРЕТНО этого экземпляра
            local = isolateComponentNodes(local);

            result = [...result, ...local];
          }

          continue;
        }
        if (name === "textarea") {
          for (let i = 0; i < quantity; i++) {
            setLoading(true);
            const { data } = await refetchJson({ name: "textarea-field" });
            const content = data?.jsonDocumentByName?.content;
            if (!content) {
              setLoading(false);
              return;
            }

            let local = transformResultColor(content, input) as HtmlNode[];
            local = appendLabelFontData(local, input.fontData) as HtmlNode[];
            local = transformResultBorder(local, input) as HtmlNode[];

            // 1) ключи
            local = ensureNodeKeys(local) as HtmlNode[];

            // 2) изоляция КОНКРЕТНО этого экземпляра
            local = isolateComponentNodes(local);

            result = [...result, ...local];
          }

          continue;
        }

      }
      console.log("<= ✔️ ✔️ ✔️==result== ✔️ ✔️ ✔️=>", result);
      // один раз в конце добираем общий скрипт
      if (result.length > 0) {
        const { data } = await refetchJson({ name: "script-all-inputs" });
        const content = data?.jsonDocumentByName?.content;
        if (!content) {
          setLoading(false);
          return;
        }

        const newResult = [...result, ...content];
        // 2. ПОМЕЧАЕМ ВСЕ <script> КАК ГЛОБАЛЬНЫЕ
        const newResultWithGlobalScripts = newResult.map((node) =>
          node.tag === "script"
            ? {
              ...node,
              attributes: {
                ...(node.attributes || {}),
                "data-global": "true",
              },
            }
            : node
        );

        // 3. Ключи
        const resultWithKeys = ensureNodeKeys(
          newResultWithGlobalScripts
        ) as HtmlNode[];

        updateHtmlJson((prev) => [...prev, ...resultWithKeys]);
      }
    } catch (error) {
      console.log("<======>", error);
    } finally {
      setLoading(false);
      router.push("/plaza");
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
          {inputs.length > 0 && <div ref={wrapperRef} className="flex flex-col gap-2 border-l-1 border-l-[#e6f1ff] ">
            <div className="input-data grid grid-cols-[8%_5%_15%_15%_15%_1fr] items-center justify-items-center  text-sm gap-2">
              <span >Name</span>
              <span >Quantity</span>
              <span >Background</span>
              <span >Color</span>
              <span >BorderColor</span>
              <span >FontData</span>
            </div>
            <hr className="mb-2 " />
            {inputs.map((input) => (
              <div key={input.name} className="input-data grid grid-cols-[8%_5%_15%_15%_15%_1fr] items-center justify-items-center gap-2">
                <h5>{input.name}</h5>
                <div className="f-number">
                  <button className="num-btn num-btn--dec" type="button"
                    onClick={() => {
                      if (input.quantity >= 1) {
                        handleQuantityChange(input.name, input.quantity - 1)
                      }
                    }}
                  >−</button>
                  <input id={`f-number-input-${input.name}`} max="10" min="0" name={`f-number-input-${input.name}`} step="1" type="number" value={input.quantity} placeholder="" onChange={(e) => handleQuantityChange(input.name, Number(e.target.value))} />
                  <button className="num-btn num-btn--inc" type="button"
                    onClick={() => handleQuantityChange(input.name, input.quantity + 1)}
                  >+</button>
                </div>
                {!input.name.includes("outlined") && !input.name.includes("empty") && !input.name.includes("textarea") && <div className="flex flex-col text-sm gap-0">

                  <div className="relative">
                    <h6>{input.background}</h6>
                    <button

                      className="btn btn-empty px-0.5 font-bold text-sm h-[20px] w-[170px]"
                      style={{ backgroundColor: input.background }}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenPicker((prev) =>
                          prev &&
                            prev.name === input.name &&
                            prev.field === "background"
                            ? null
                            : { name: input.name, field: "background" }
                        );
                      }}
                    />
                    <div
                      className={`absolute top-full left-0 z-10 ${openPicker &&
                        openPicker.name === input.name &&
                        openPicker.field === "background"
                        ? ""
                        : "hidden"
                        }`}
                    >
                      <ColorPickerField
                        value={input.background}
                        onChange={(val) => {
                          setInputs((prev) =>
                            prev.map((item) =>
                              item.name === input.name ? { ...item, background: val } : item
                            )
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>}

                {/* {input.name === "svg-outlined" && <div className="flex flex-col text-sm gap-0"></div>} */}

                {input.name.includes("outlined") && <div className="flex flex-col text-sm gap-0"></div>}
                {input.name.includes("empty") && <div className="flex flex-col text-sm gap-0"></div>}
                {input.name.includes("textarea") && <div className="flex flex-col text-sm gap-0"></div>}
                <div className="relative">
                  <h6>{input.color}</h6>
                  <button

                    type="button"
                    className="btn btn-empty px-0.5 font-bold text-sm h-[20px] w-[170px]"
                    style={{ backgroundColor: input.color }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenPicker((prev) =>
                        prev &&
                          prev.name === input.name &&
                          prev.field === "color"
                          ? null
                          : { name: input.name, field: "color" }
                      );
                    }}
                  />
                  <div
                    className={`absolute top-full left-0 z-10 ${openPicker &&
                      openPicker.name === input.name &&
                      openPicker.field === "color"
                      ? ""
                      : "hidden"
                      }`}
                  >
                    <ColorPickerField
                      value={input.color}
                      onChange={(val) => {
                        setInputs((prev) =>
                          prev.map((item) =>
                            item.name === input.name ? { ...item, color: val } : item
                          )
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="relative">
                  <h6>{input.borderColor}</h6>
                  <button

                    type="button"
                    className="btn btn-empty px-0.5 font-bold text-sm h-[20px] w-[170px]"
                    style={{ backgroundColor: input.borderColor }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenPicker((prev) =>
                        prev &&
                          prev.name === input.name &&
                          prev.field === "borderColor"
                          ? null
                          : { name: input.name, field: "borderColor" }
                      );
                    }}
                  />
                  <div
                    className={`absolute top-full left-0 z-10 ${openPicker &&
                      openPicker.name === input.name &&
                      openPicker.field === "borderColor"
                      ? ""
                      : "hidden"
                      }`}
                  >
                    <ColorPickerField
                      value={input.borderColor}
                      onChange={(val) => {
                        setInputs((prev) =>
                          prev.map((item) =>
                            item.name === input.name ? { ...item, borderColor: val } : item
                          )
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="field-t-input flex  items-center gap-2  text-sm gap-0">
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
        <button className={`btn btn-teal mt-4 ${inputs.length > 0 ? "admin-shimmer" : ""}`} type="button" onClick={(e) => handleAddToJson(e)}>  {loading ? <Spinner /> : <AddIcon width={18} height={18} />}
        </button>
      </form>
    </div>
  );
}

