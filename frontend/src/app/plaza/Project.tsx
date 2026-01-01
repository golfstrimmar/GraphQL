import ButtonRemoveProject from "./ButtonRemoveProject";
import ButtonRenderProject from "./ButtonRenderProject";

export default function Project({ project }) {
  return (
    <div className="flex gap-2 items-center ">
      <ButtonRenderProject project={project} />
      <ButtonRemoveProject id={project.id} />
    </div>
  );
}
