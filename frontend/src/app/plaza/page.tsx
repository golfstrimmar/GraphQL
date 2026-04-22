
import PlazaHeader from "@/components/PlazaHeader";
import CanvasComponent from "./CanvasComponent";
import AdminComponent from "./AdminComponent";
import PreviewComponent from "./PreviewComponent";
import ProjectsComponent from "./ProjectsComponent";
import "./plaza.scss";
import PreviewIcon from "@/components/icons/PreviewIcon";
import ScrollButtons from "./ScrollButtons";



export default function Plaza() {
  return (
    <section className="plaza-container min-h-[calc(100vh)] w-full bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 pb-[300px]">

      <div className="grid grid-cols-[1fr_150px] w-full gap-2">
        <div className="flex flex-col h-full  pt-[80px] pl-[25px] min-h-[calc(100vh)]">
          <ScrollButtons />
          <PlazaHeader
            title={"Plaza Editor"}
            description={"Build and manage your HTML/CSS projects"}
          />
          <hr className="my-8 text-[transparent]" />
          <PreviewComponent />
          <CanvasComponent />
          <ProjectsComponent />
        </div>
        <AdminComponent />
      </div>
    </section>
  );
}
