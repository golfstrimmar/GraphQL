import ProjectsList from "./ProjectsList";
import PlazaHeader from "./PlazaHeader";
import CanvasComponent from "./CanvasComponent";
import AdminComponent from "./AdminComponent";
import "./plaza.scss";
export default function Plaza() {
  return (
    <section className=" pt-[80px] min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 pb-[500px]">
      <div className="container">
        <PlazaHeader
          title={"Plaza Editor"}
          description={"Build and manage your HTML/CSS projects"}
        />
        <CanvasComponent />
        <ProjectsList />
        <div className="fixed bottom-0 left-0 w-full border-t-2 border-[var(--teal)] z-50">
          <AdminComponent />
        </div>
      </div>
    </section>
  );
}
