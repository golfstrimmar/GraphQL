import { cookies } from "next/headers";
import client from "@/apollo/apolloClient";
import { GET_FIGMA_PROJECTS_BY_USER } from "@/apollo/queries";
import FigmaProjectsList from "./FigmaProjectsList";
import PlazaHeader from "@/app/plaza/PlazaHeader";
import Bage from "@/components/ui/Bage/Bage";
import ModalCreateFigmaProject from "./ModalCreateFigmaProject";

type UserFromCookie = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹

const FigmaProjects = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value ?? null;
  if (!userCookie) {
    return (
      <div className="container">
        <div className="flex flex-col gap-2 mb-2 mt-[100px] min-h-[100vh]">
          <PlazaHeader
            title="Figma Design Projects"
            description="Extract and manage your design system"
          />{" "}
          <Bage text="Please, login to see Projects" />{" "}
        </div>
      </div>
    );
  }
  const user = JSON.parse(userCookie) as UserFromCookie;
  let projects = [];
  try {
    const { data } = await client.query({
      query: GET_FIGMA_PROJECTS_BY_USER,
      variables: { userId: user.id },
      fetchPolicy: "network-only",
    });

    if (data.figmaProjectsByUser) {
      projects = data?.figmaProjectsByUser ?? [];
    }
  } catch (err: any) {
    console.log("Failed to fetch projects:", err.message);
  }

  return (
    <div className="container">
      <div className="flex flex-col gap-2 mb-2 mt-[100px] min-h-[100vh]">
        <PlazaHeader
          title="Figma Design Projects"
          description="Extract and manage your design system"
        />
        <FigmaProjectsList figmaProjects={projects} />
        <ModalCreateFigmaProject />
      </div>
    </div>
  );
};

export default FigmaProjects;
