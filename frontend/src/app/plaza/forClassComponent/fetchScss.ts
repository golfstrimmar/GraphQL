// useFetchScss.ts
import { useStateContext } from "@/providers/StateProvider";
import type { HtmlNode } from "@/types/HtmlNode";
import { useLazyQuery } from "@apollo/client";
import { GET_JSON_DOCUMENT } from "@/apollo/queries";

export function useFetchScss() {
  const { updateHtmlJson } = useStateContext();
  const [jsonDocumentByName] = useLazyQuery(GET_JSON_DOCUMENT, {
    fetchPolicy: "no-cache",
  });

  const fetchScss = async (arg: string): Promise<HtmlNode | undefined> => {
    const arg2 = arg.replace(/^_+/, "");
    const { data } = await jsonDocumentByName({
      variables: { name: `style-input-field-${arg2}` },
    });

    const docs = data?.jsonDocumentByName;
    const content = docs?.content?.[0] as HtmlNode | undefined;

    updateHtmlJson((prev) => {
      const tree = (Array.isArray(prev) ? prev : [prev]).filter(Boolean);
      return tree.filter(
        (el) => !(el.tag === "style" && el.text.includes("_"))
      );
    });

    return content;
  };

  return { fetchScss };
}