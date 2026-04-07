"use client";
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from "react";
import { useStateContext } from "@/providers/StateProvider";
// import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
// import { UPDATE_PROJECT, REMOVE_PROJECT } from "@/apollo/mutations";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";
import { ensureNodeKeys } from "@/utils/ensureNodeKeys";
import type { HtmlNode } from "@/types/HtmlNode";
import Loading from "@/components/ui/Loading/Loading";
import Spinner from "@/components/icons/Spinner";
// import dynamic from "next/dynamic";

// const DynamicComponent = dynamic(
//   () => import("@/components/DynamicComponent/DynamicComponent"),
//   {
//     ssr: false,
//     loading: () => <Loading />
//   }
// );

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
export default function DesignForm({ dInp, resetAll }: { dInp: string[], resetAll: () => void }) {
  const { updateHtmlJson } = useStateContext();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<InputType[]>([]);
  const { refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name },
    skip: !name,
    fetchPolicy: "no-cache",
  });
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
      } else {
        return [...prevInputs, { name, type: "", value: "", quantity: 1, checked, background: "#233554c9", color: "#e6f1ff", borderColor: "#8892b0f6", fontData: "font-size:14px; color:#000000; font-weight:400; line-height:1; font-family:'Montserrat', sans-serif;" }];
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
  // ==================== 
  const handleAddToJson = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let resultWithKeysStyles = [] as HtmlNode[];
    inputs.forEach(async (input) => {

      if (input.checked) {
        console.log('<===input===>', input);
        const { name, type, value, quantity, checked, background, color, borderColor, fontData } = input;
        if (!input) return;
        if (name === "filled") {
          for (let i = 1; i < quantity; i++) {
            setLoading(true);
            // getJsonDocument({ variables: { name: "container-" + input.name } });
            const { data } = await refetchJson({ name: "container-" + input.name });
            const content = data?.jsonDocumentByName?.content;
            if (!content) {
              setLoading(false);
              return;
            }

            const resultWithKeys = ensureNodeKeys(content) as HtmlNode[];
            updateHtmlJson(prev => [...prev, ...resultWithKeys]);
            setLoading(false);
          }
        }

      }
    });
  }
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

  return (
    <div className="">
      <form action="">
        <div className="grid grid-cols-[1fr_4fr] gap-2">
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
          {inputs.length > 0 && <div className="flex flex-col gap-4">
            <div className="input-data grid grid-cols-[repeat(5,1fr)_5fr] items-center justify-items-center  gap-4">
              <span >Name</span>
              <span >Quantity</span>
              <span >Background</span>
              <span >Color</span>
              <span >BorderColor</span>
              <span >FontData</span>
            </div>
            {inputs.map((input) => (
              <div key={input.name} className="input-data grid grid-cols-[repeat(5,1fr)_5fr] items-center justify-items-center gap-4">
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
                {input.name === "filled" && <div className="flex flex-col gap-2">
                  <label htmlFor="background">{input.background}</label> <input type="color" name="background" id="background" value={input.background} onChange={(e) => {
                    const { name, value } = e.target;
                    setInputs(prevInputs =>
                      prevInputs.map(input =>
                        input.name === name ? { ...input, background: value } : input
                      )
                    );
                  }} /></div>}

                <div className="flex flex-col gap-2">
                  <label htmlFor="color">{input.color}</label>
                  <input type="color" name="color" id="color" value={input.color} onChange={(e) => {
                    const { name, value } = e.target;
                    setInputs(prevInputs =>
                      prevInputs.map(input =>
                        input.name === name ? { ...input, color: value } : input
                      )
                    );
                  }} /></div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="borderColor">{input.borderColor}</label>
                  <input type="color" name="borderColor" id="borderColor" value={input.borderColor} onChange={(e) => {
                    const { name, value } = e.target;
                    setInputs(prevInputs =>
                      prevInputs.map(input =>
                        input.name === name ? { ...input, borderColor: value } : input
                      )
                    );
                  }} /></div>
                <div className="field-t-input "><textarea name="fontData" id="fontData" value={input.fontData} onChange={(e) => {
                  const { name, value } = e.target;
                  setInputs(prevInputs =>
                    prevInputs.map(input =>
                      input.name === name ? { ...input, fontData: value } : input
                    )
                  );
                }}></textarea></div>
              </div>
            ))}
          </div>
          }

        </div>




        <button className="btn btn-primary mt-4" type="button" onClick={(e) => handleAddToJson(e)}>  {loading ? <Spinner /> : <span>Submit</span>}
        </button>
      </form>
    </div>
  );
}

