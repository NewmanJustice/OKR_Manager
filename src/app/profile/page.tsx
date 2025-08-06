import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { redirect } from "next/navigation";
import ProfileLayout from "./ProfileLayout";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }
  return <ProfileLayout />;
}
