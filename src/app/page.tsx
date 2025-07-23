"use client";
import { useSession } from "next-auth/react";
import LoginForm from "../components/LoginForm";
import UserDashboard from "../components/UserDashboard";

export default function Home() {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  if (!session) {
    return <LoginForm />;
  }
  return <UserDashboard />;
}

