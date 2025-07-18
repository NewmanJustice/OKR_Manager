import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to the user dashboard
  redirect("/user");
  return null;
}
