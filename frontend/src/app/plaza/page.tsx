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
        </div>
      </div>
    </section>
  );
}
