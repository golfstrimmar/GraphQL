"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar/Navbar";
import { useStateContext } from "@/providers/StateProvider";
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showModal, setUser } = useStateContext();
  useEffect(() => {
    const TIMEOUT = 30 * 60 * 1000;

    const clearStorage = async () => {
      localStorage.removeItem("lastActivity");
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (e) {
        console.error("Auto logout cookie clear failed", e);
      }
      setUser(null);
      showModal("You have been logged out due to inactivity.", "error");
      window.location.href = "/";
    };

    const last = localStorage.getItem("lastActivity");
    if (last && Date.now() - parseInt(last) > TIMEOUT) {
      clearStorage();
      return;
    }

    const events = ["mousemove", "click", "keydown", "scroll"];
    const updateActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };
    events.forEach((event) => window.addEventListener(event, updateActivity));

    const interval = setInterval(() => {
      const last = localStorage.getItem("lastActivity");
      if (last && Date.now() - parseInt(last) > TIMEOUT) {
        clearStorage();
      }
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
      events.forEach((event) =>
        window.removeEventListener(event, updateActivity),
      );
    };
  }, []);

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
