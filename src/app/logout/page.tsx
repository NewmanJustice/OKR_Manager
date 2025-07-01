"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/logout").then(() => {
      router.replace("/"); // Redirect to root after logout
    });
  }, [router]);
  return <div className="text-center mt-10">Logging out...</div>;
}
