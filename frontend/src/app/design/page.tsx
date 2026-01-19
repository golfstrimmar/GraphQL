import { cookies } from "next/headers";
import client from "@/apollo/apolloClient";
import { redirect } from "next/navigation";
import PlazaHeader from "@/components/PlazaHeader";
// import { GET_FIGMA_PROJECT_DATA } from "@/apollo/queries";
// import Link from "next/link";
import Bage from "@/components/ui/Bage/Bage";
import DesignColors from "./DesignColors";

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

  // const { data, loading, error } = await client.query({
  //   query: GET_FIGMA_PROJECT_DATA,
  //   variables: { projectId: id },
  //   fetchPolicy: "network-only",
  // });

  // const project = data?.getFigmaProjectData ?? [];
  // console.log("<== 🔹 🔹 🔹 🔹=project=🔹 🔹 🔹 🔹==>", project);

  return (
    <div className="container">
      <div className="p-4 mt-[60px] mb-8 w-full">
        {!userCookie && (
          <div className="mt-[100px]">
            <Bage text="Login required" />
          </div>
        )}
        <PlazaHeader
          title={"Design System"}
          description={
            "Define and maintain the visual language of your product."
          }
        />
        <DesignColors />
      </div>
    </div>
  );
}
