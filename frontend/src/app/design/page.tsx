import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PlazaHeader from "@/components/PlazaHeader";
import Bage from "@/components/ui/Bage/Bage";

import AdminDesinSystem from "./AdminDesinSystem";

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
        <AdminDesinSystem />
      </div>
    </div>
  );
}
