import { cookies } from "next/headers";
import client from "@/apollo/apolloClient";
import { GET_FIGMA_PROJECTS_BY_USER } from "@/apollo/queries";
import FigmaProjectsList from "./FigmaProjectsList";
import Loading from "@/components/ui/Loading/Loading";

// ---------------
const FigmaProjects = async () => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value ?? null;
  if (!userId) {
    return (
      <div className="flex flex-col gap-2 mb-2">
        <p className="text-slate-600 text-lg py-4 mb-6">
          Please, login to see Projects
        </p>
      </div>
    );
  }
  //////--- Query
  const { data, loading } = await client.query({
    query: GET_FIGMA_PROJECTS_BY_USER,
    variables: { userId },
    fetchPolicy: "cache-first",
  });
  // --------------------------------

  // --------------------------------
  // --------------------------------
  return (
    <div className="container">
      <div className="flex flex-col gap-2 mb-2 mt-[100px]">
        {loading && <Loading />}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Figma Design Pojects
          </h1>
          <p className="text-slate-600 text-lg">
            Extract and manage your design system
          </p>
        </div>
        {/*{userId && (
        <h5 className="text-slate-600 bg-slate-200">userId: {userId}</h5>
      )}*/}

        {!userId ? (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl">📁</span>
            <p className="text-slate-600 text-lg py-4 mb-6">
              Please, login to see Projects
            </p>
          </div>
        ) : (
          data?.figmaProjectsByUser.length === 0 && (
            <p className="text-slate-600 text-lg py-4 mb-6">
              No Figma projects found
            </p>
          )
        )}
        {data?.figmaProjectsByUser.length > 0 && (
          <FigmaProjectsList figmaProjects={data?.figmaProjectsByUser || []} />
        )}
      </div>
    </div>
  );
};
export default FigmaProjects;
