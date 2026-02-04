import { cookies } from "next/headers";
import client from "@/apollo/apolloClient";
// import DesignFonts from "./DesignFonts";
// import Loading from "@/components/ui/Loading/Loading";
import ListDesignSystems from "./ListDesignSystems";
import PlazaHeader from "@/components/PlazaHeader";
import { GET_DESIGN_SYSTEMS_BY_USER } from "@/apollo/queries";
import Bage from "@/components/ui/Bage/Bage";
import type { DesignSystem } from "@/types/DesignSystem";
// ---------------------------------------------
type UserFromCookie = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};
// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default async function AdminDesignSystem() {
  let designSystems: DesignSystem[] = [];
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value ?? null;
  if (!userCookie) {
    return (
      <div className="container">
        <div className="flex flex-col gap-2 mb-2 mt-[100px] min-h-[100vh]">
          <PlazaHeader
            title="Figma Design Projects"
            description="Extract and manage your design system"
          />
          <Bage text="Please, login to see Projects" />
        </div>
      </div>
    );
  }
  const user = JSON.parse(userCookie) as UserFromCookie;

  try {
    if (!user?.id) return;

    const { data } = await client.query({
      query: GET_DESIGN_SYSTEMS_BY_USER,
      variables: { userId: user.id },
      fetchPolicy: "network-only",
    });

    designSystems = data?.getDesignSystemsByUser ?? [];
  } catch (err: any) {
    console.log("Failed to fetch DesignSystems:", err.message);
  }

  return (
    <div>
      <div className="">
        <ListDesignSystems designSystems={designSystems} />
      </div>
    </div>
  );
}
