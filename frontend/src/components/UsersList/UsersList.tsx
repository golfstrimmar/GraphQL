"use client";
import { useMutation } from "@apollo/client";
import { useState, useEffect } from "react";
import transformData from "@/hooks/useTransformData";
import { useStateContext } from "@/providers/StateProvider";
import { REMOVE_USER } from "@/apollo/mutations";
type Project = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  projects?: Project[];
};

export default function UsersList({ initialUsers }: { initialUsers: User[] }) {
  const { users, setModalMessage, setUser } = useStateContext();
  const [usersToShow, setUsersToShow] = useState<User[]>(initialUsers);
  //////////////
  const [removeUser] = useMutation(REMOVE_USER);
  ////////////////
  useEffect(() => {
    console.log("<====users====>", users);
    setUsersToShow(users);
  }, [users]);
  return (
    <div className="container">
      <ul className="mt-[150px] mb-[150px]">
        {usersToShow &&
          usersToShow?.map((u) => (
            <li
              key={u.id}
              className="mt-2 flex flex-col gap-1 border rounded p-2 bg-navy"
            >
              <div className="flex items-end gap-1 ">
                <span className="-mb-[2px]">Name:</span>
                <h3 className="inline-block  p-0">{u.name}</h3>
              </div>
              <span>id: {u.id}</span>
              <p>Email: {u.email}</p>
              <p>CreatedAt: {transformData(u.createdAt)}</p>
              <span>Ulon projects :</span>
              {u.projects?.length === 0 && (
                <span className="text-red-500">no Ulon projects</span>
              )}
              <ul className="pl-4">
                {u.projects?.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    <span>id:{p.id}</span>
                    <span> name: {p.name}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  removeUser({ variables: { userId: u.id } });
                  setUser(null);
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  setModalMessage("User removed");
                }}
                className="mt-2 btn btn-allert"
              >
                Remove user
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
