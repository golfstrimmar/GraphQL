import { cookies } from "next/headers";
import client from "@/apollo/apolloClient";
import { redirect } from "next/navigation";
import { GET_FIGMA_PROJECT_DATA } from "@/apollo/queries";
import Bage from "@/components/ui/Bage/Bage";
import RenderColorPalette from "./RenderColorPalette";
import RenderTypography from "./RenderTypography";
import RenderScssMixins from "./RenderScssMixins";
import RenderTextStyles from "./RenderTextStyles";
import Link from "next/link";
export default async function FigmaProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log("<===id===>", id);
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value ?? null;
  if (!userCookie) {
    redirect("/login");
  }
  const { data, loading, error } = await client.query({
    query: GET_FIGMA_PROJECT_DATA,
    variables: { projectId: id },
    fetchPolicy: "network-only",
  });

  const project = data?.getFigmaProjectData ?? [];

  console.log("<===project===>", project);

  return (
    <div className="container">
      <div className="p-4 mt-[60px] mb-8 w-full">
        {!userCookie && (
          <div className="mt-[100px]">
            <Bage text="Login required" />
          </div>
        )}
        <div className="flex items-end   gap-1  bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 mb-4">
          <span>Fgma project: </span>
          <h3 className=" text-gray-800 ">{project?.name}</h3>
          <Link
            href={`/plaza`}
            className="btn btn-empty px-2 self-end ml-auto !text-[var(--teal)]"
          >
            Transform to ULON Project
          </Link>
        </div>
        <RenderColorPalette colors={project.colors} />
        <RenderTypography fonts={project.fonts} />
        <RenderScssMixins colors={project.colors} />
        <RenderTextStyles textNodes={project.textNodes} />
      </div>
    </div>
  );
}
