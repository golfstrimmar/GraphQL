import { useJsonToHtml } from "@/hooks/useJsonToHtml";
import HtmlIcon from "@/components/icons/HtmlIcon";
import Spinner from "@/components/icons/Spinner";
import { useStateContext } from "@/providers/StateProvider";

type JsonToHtmlButtonProps = {
  cN?: string;
};

export default function JsonToHtmlButton({ cN = "py-0.75" }: JsonToHtmlButtonProps) {
  const { loading, runJsonToHtml } = useJsonToHtml();
  const { MarkerJson, setMarkerJson } = useStateContext();
  return (
    <button
      onClick={async () => {
        setMarkerJson(false);
        await runJsonToHtml();
      }}
      disabled={loading}
      className={`btn-primary font-bold text-slate-800 rounded !text-[12px] !lh-0 w-full !px-0 !py-0.75 center 
        ${cN} 
      
        ${MarkerJson ? "admin-shimmer--red" : ""}
        ${loading ? "admin-shimmer--red" : ""}
        
        `}
    >
      {loading ? <Spinner /> : <HtmlIcon width={14} height={14} />}
    </button>
  );
}