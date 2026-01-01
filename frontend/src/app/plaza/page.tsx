import ProjectsList from "./ProjectsList";
import PlazaHeader from "@/app/plaza/PlazaComponent/PlazaHeader";
import "./plaza.scss";
export default function Plaza() {
  return (
    <section className=" pt-[100px] min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-50 pb-[500px]">
      <div className="container">
        <PlazaHeader
          title={"Plaza Editor"}
          description={"Build and manage your HTML/CSS projects"}
        />
        <ProjectsList />
      </div>
    </section>
  );
}
