import ProjectsList from "./ProjectsList";
import PlazaHeader from "@/components/PlazaHeader";
import CanvasComponent from "./CanvasComponent";
import AdminComponent from "./AdminComponent";
import PreviewComponent from "./PreviewComponent";
import "./plaza.scss";
import PreviewIcon from "@/components/icons/PreviewIcon";
import ScrollButtons from "./ScrollButtons";



export default function Plaza() {
  return (
    <section className=" min-h-[calc(100vh)]  bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50">
      <div className="container  min-h-[calc(100vh)]">
        <div className="flex flex-col h-full  pt-[80px]  min-h-[calc(100vh)]">
          <ScrollButtons />

          <PlazaHeader
            title={"Plaza Editor"}
            description={"Build and manage your HTML/CSS projects"}
          />
          <hr className="my-8 text-[transparent]" />
          <PreviewComponent />
          <CanvasComponent />
          <ProjectsList />

          <div id="admin-siction" className="fixed bottom-[25%] left-0  z-[5000] transition-transform duration-[200ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]   group">
            {/* <div className="w-full -mb-[1px]">
             <button className="btn btn-primary admin-shimmer rounded-b-none w-full !py-1 shadow-xl border-b-0 transition-all duration-500 group-hover:opacity-0 group-hover:pointer-events-none flex justify-center items-center gap-4 translate-y-0">
              <span className="text-[14px] font-bold tracking-widest uppercase">↑ Admin Panel ↑</span>
            </button> 
          </div>*/}
            {/* <div className="bg-[#060e1bd4] backdrop-blur border-t-4 border-[var(--teal)] shadow-[0_-15px_40px_rgba(0,0,0,0.6)]"> */}
            <AdminComponent />
            {/* </div> */}</div>
        </div>
      </div>
    </section>
  );
}
