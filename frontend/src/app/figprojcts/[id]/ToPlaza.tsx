"use client";
import { useRouter } from "next/navigation";

// --- 🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢🔹🟢
export default function ToPlaza() {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        router.push("/plaza");
      }}
      className="btn btn-empty px-2 self-end ml-auto !text-[var(--teal)]"
    >
      To Plaza
    </button>
  );
}
