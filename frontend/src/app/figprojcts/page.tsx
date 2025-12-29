import { cookies } from "next/headers";
import client from "@/apollo/apolloClient";
import { GET_FIGMA_PROJECTS_BY_USER } from "@/apollo/queries";
import FigmaProjectsList from "./FigmaProjectsList";
import PlazaHeader from "@/app/plaza/PlazaComponent/PlazaHeader";

type UserFromCookie = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

const FigmaProjects = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value ?? null;

  if (!userCookie) {
    return (
      <div className="flex flex-col gap-2 mb-2">
        <p className="text-slate-600 text-lg py-4 mb-6">
          Please, login to see Projects
        </p>
      </div>
    );
  }

  const user: UserFromCookie = JSON.parse(userCookie);

  const { data } = await client.query({
    query: GET_FIGMA_PROJECTS_BY_USER,
    variables: { userId: user.id },
    fetchPolicy: "network-only",
  });
  const projects = data?.figmaProjectsByUser ?? [];
  return (
    <div className="container">
      <div className="flex flex-col gap-2 mb-2 mt-[100px]">
        <PlazaHeader
          title="Figma Design Projects"
          description="Extract and manage your design system"
        />
        {!user ? (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 ">
            <span className="text-2xl">📁</span>
            <p className="text-slate-600 text-lg py-4 mb-6 border border-slate-200">
              Please, login to see Projects
            </p>{" "}
          </div>
        ) : (
          ""
        )}

        <FigmaProjectsList figmaProjects={projects} />
      </div>
    </div>
  );
};

export default FigmaProjects;
