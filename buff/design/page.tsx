import { cookies } from "next/headers";
import client from "@/apollo/apolloClient";
import { redirect } from "next/navigation";
import Bage from "@/components/ui/Bage/Bage";
import FigmaProjectsList from "./FigmaProjectsList";
import CreateDesign from "./CreateDesign";
import { GET_FIGMA_PROJECTS_BY_USER } from "@/apollo/queries";
// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default async function Design({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value ?? null;
  if (!userCookie) {
    redirect("/login");
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
      <div className="p-4 mt-[60px] mb-8 w-full min-h-[100vh]">
        {!userCookie && (
          <div className="mt-[100px]">
            <Bage text="Login required" />
          </div>
        )}
        <FigmaProjectsList figmaProjects={projects} />
        <CreateDesign />
      </div>
    </div>
  );
}
