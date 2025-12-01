"use client";

import { useMutation } from "@apollo/client";
import { REMOVE_USER } from "@/apollo/mutations";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter } from "next/navigation";
const ButtonRemoveUser = () => {
  const { user, setUser, setModalMessage } = useStateContext();
  const [removeUser] = useMutation(REMOVE_USER);
  const router = useRouter();
  return (
    <button
      onClick={() => {
        removeUser({ variables: { userId: user.id } });
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setModalMessage("User removed");
        router.push("/");
      }}
      className="mt-2 btn btn-allert"
    >
      Remove user
    </button>
  );
};

export default ButtonRemoveUser;
