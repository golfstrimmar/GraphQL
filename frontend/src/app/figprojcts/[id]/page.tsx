import { cookies } from "next/headers";
import client from "@/apollo/apolloClient";
import { redirect } from "next/navigation";
import { GET_FIGMA_PROJECT_DATA } from "@/apollo/queries";
import Bage from "@/components/ui/Bage/Bage";
import RenderColorPalette from "./RenderColorPalette";
import RenderColorVars from "./RenderColorVars";
import RenderTypography from "./RenderTypography";
import RenderTextMixins from "./RenderTextMixins";
import RenderTextStyles from "./RenderTextStyles";
import ImageUploader from "./ImageUploader";
import Link from "next/link";
export default async function FigmaProjectPage({
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
  const { data, loading, error } = await client.query({
    query: GET_FIGMA_PROJECT_DATA,
    variables: { projectId: id },
    fetchPolicy: "network-only",
  });

  const project = data?.getFigmaProjectData ?? [];

  console.log("<== 🔹 🔹 🔹 🔹=project=🔹 🔹 🔹 🔹==>", project);

  return (
    <div className="container">
      <div className="p-4 mt-[60px] mb-8 w-full">
        {!userCookie && (
          <div className="mt-[100px]">
            <Bage text="Login required" />
          </div>
        )}
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-slate-700 hover:underline">
                Home
              </Link>
            </li>
            <li className="px-1 text-slate-400">/</li>
            <li>
              <Link
                href="/figprojcts"
                className="hover:text-slate-700 hover:underline"
              >
                Figma projects
              </Link>
            </li>
            <li className="px-1 text-slate-400">/</li>
            <li className="text-slate-700 font-medium truncate max-w-[200px]">
              {project?.name || "Project"}
            </li>
          </ol>
        </nav>

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
        <ImageUploader project={project} />
        <RenderColorPalette colors={project.colors} />
        <RenderColorVars colors={project.colors} />
        <RenderTypography fonts={project.fonts} />
        <RenderTextMixins colors={project.colors} />
        <RenderTextStyles textNodes={project.textNodes} />
        {/**/}
      </div>
    </div>
  );
}
