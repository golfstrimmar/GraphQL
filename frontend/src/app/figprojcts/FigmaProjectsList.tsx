import PageHeader from "@/app/plaza/PageHeader";
import RemoveFigmaProject from "./RemoveFigmaProject";

import Link from "next/link";
interface FigmaProjectsListProps {
  figmaProjects: Project[];
}
type Project = {
  id: string;
  name: string;
};
const FigmaProjectsList = async ({ figmaProjects }: FigmaProjectsListProps) => {
  return (
    <div className="flex flex-col gap-2 mb-2 w-full mt-[30px] bg-navy rounded-2xl shadow-xl p-2   border border-slate-200 ">
      {PageHeader("projectsIcon", "Your Figma projects")}
      {figmaProjects.length === 0 && (
        <h5 className="!text-[var(--teal)] text-lg py-4 mb-2 border border-[var(--teal)] text-center rounded">
          No Figma projects found
        </h5>
      )}
      {figmaProjects.length !== 0 &&
        figmaProjects.map((project) => (
          <div key={project.id} className="flex justify-between gap-2 ">
            <Link
              href={`/figprojcts/${project.id}`}
              className="btn-teal flex-1"
            >
              {project.name}
            </Link>
            <RemoveFigmaProject id={project.id} />
          </div>
        ))}
    </div>
  );
};

export default FigmaProjectsList;
