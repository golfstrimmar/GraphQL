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
        <div className="w-6 h-6 bg-gradient-to-br from-blue-800 to-cyan-300 rounded-lg flex items-center justify-center">
          <span>
            {iconName === "projectsIcon" ? (
              <ProjectsIcon width={16} height={16} />
            ) : null}
            {iconName === "canvasIcon" ? (
              <WorkerIcon width={16} height={16} />
            ) : null}
            {iconName === "sandboxIcon" ? (
              <SundboxIcon width={16} height={16} />
            ) : null}
            {iconName === "PreviewIcon" ? (
              <PreviewIcon width={16} height={16} />
            ) : null}
          </span>
        </div>
        <h6 className="font-bold text-slate-800">{title}</h6>
      </div>
    </div>
  );
}
export default PageHeader;
