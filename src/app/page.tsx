"use client";
import { useSession } from "next-auth/react";
import LoginForm from "../components/LoginForm";

export default function Home() {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  if (!session) {
    return <LoginForm />;
  }
  return <div>Authenticated! Welcome to Objectives Manager.</div>;
}

