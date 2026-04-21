import { cookies } from "next/headers";
import client from "@/apollo/apolloClient";
import { GET_ALL_PROJECTS_BY_USER } from "@/apollo/queries";
import PageHeader from "./PageHeader";
import Project from "./Project";
import CreateNewProject from "./CreateNewProject";
import Bage from "@/components/ui/Bage/Bage";

type UserFromCookie = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};
export interface ProjectNode {
  _key?: string;
  tag: string;
  text: string;
  class: string;
  style: string;
  children: (ProjectNode | string)[];
}

// 🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default async function ProjectsComponent() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value ?? null;

  if (!userCookie) {
    return <Bage text="Please, login to see Projects" />;
  }
  const user: UserFromCookie = JSON.parse(userCookie);
  const { data } = await client.query({
    query: GET_ALL_PROJECTS_BY_USER,
    variables: { userId: user?.id },
    fetchPolicy: "network-only",
  });
  const projects = data?.getAllProjectsByUser ?? [];

  // ====>====>====>====>====>====>====>====>====>====>====>====>====>====>====>
  return (
    <>
      <div
        id="projects-section"
        className="bg-navy rounded-2xl shadow-xl p-2   border border-slate-200  relative  mt-[25px]"
      >
        <div className="flex items-center gap-2">
          {PageHeader("projectsIcon", "Your Ulon projects")}

        </div>
        <div className=" flex flex-col flex-wrap gap-2 ">
          {projects.length > 0 &&
            projects.map((project) => {
              return <Project project={project} key={project.id} />;
            })}
          {projects?.length === 0 && <Bage text="No projects yet" />}
        </div>
        <CreateNewProject />

      </div>
    </>
  );
}
