import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { redirect } from "next/navigation";
import LineManagerLayout from "./LineManagerLayout";

export default async function LineManagerPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }
  if (!(session.user && (session.user as any).isLineManager)) {
    redirect("/"); // redirect to dashboard if not a line manager
  }
  return <LineManagerLayout />;
}
