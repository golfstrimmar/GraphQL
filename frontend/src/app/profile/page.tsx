import { cookies } from "next/headers";
import transformData from "@/hooks/useTransformData";
import Image from "next/image";
import ButtonRemoveUser from "@/components/ButtonRemoveUser/ButtonRemoveUser";
import PlazaHeader from "@/components/PlazaHeader";
import Bage from "@/components/ui/Bage/Bage";

export default async function Profile() {
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
  return (
    <div>
      {user && (
        <div className="mt-[150px]">
          <div className="container ">
            <div className="flex flex-col gap-4 items-center">
              {user.picture ? (
                <Image
                  src={user.picture}
                  alt={user.name}
                  width={200}
                  height={200}
                  className="rounded-full"
                />
              ) : (
                <Image
                  src="./svg/avatar.svg"
                  alt={user.name}
                  width={300}
                  height={300}
                  className="rounded-full"
                />
              )}

              <h2 className="!text-2xl">{user.name}</h2>
              <p>
                <small>Id:</small> <strong>{user.id}</strong>
              </p>
              <p>
                <small>Email:</small> <strong>{user.email}</strong>
              </p>
              <p>
                <small>Joined:</small>
                <strong> {transformData(user.createdAt)}</strong>
              </p>
              {user.projects && user.projects.length > 0 ? (
                <div>
                  <p>
                    <small>Projects:</small>
                  </p>
                  <ul>
                    {user.projects.map((p) => (
                      <li key={p.id}>
                        {p.id}: {p.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No projects yet</p>
              )}
              <ButtonRemoveUser />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
