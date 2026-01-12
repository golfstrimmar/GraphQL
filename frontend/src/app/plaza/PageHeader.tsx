import ProjectsIcon from "@/components/icons/ProjectsIcon";
import WorkerIcon from "@/components/icons/WorkerIcon";
import SundboxIcon from "@/components/icons/SundboxIcon";
import PreviewIcon from "@/components/icons/PreviewIcon";

type PageHeaderProps = {
  iconName: string;
  title: string;
};

function PageHeader(iconName, title) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <span className="text-white">
            {iconName === "projectsIcon" ? <ProjectsIcon /> : null}
            {iconName === "canvasIcon" ? <WorkerIcon /> : null}
            {iconName === "sandboxIcon" ? <SundboxIcon /> : null}
            {iconName === "PreviewIcon" ? <PreviewIcon /> : null}
          </span>
        </div>
        <h6 className="font-bold text-slate-800">{title}</h6>
      </div>
    </div>
  );
}
export default PageHeader;
