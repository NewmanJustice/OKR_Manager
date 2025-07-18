import ObjectiveKeyResultsClient from "./ObjectiveKeyResultsClient";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";

// Define KeyResult type
interface KeyResult {
  id: number | string;
  text?: string;
  title?: string;
}

// Define Objective type
interface Objective {
  id: string | number;
  key_results?: KeyResult[];
  title?: string;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  // Forward cookies for authentication
  const awaitedCookies = await cookies();
  const cookieHeader = awaitedCookies.toString();
  const res = await fetch(`${baseUrl}/api/user/objectives`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });
  if (!res.ok || res.headers.get('content-type')?.includes('text/html')) {
    return redirect("/login");
  }
  let objectives;
  try {
    objectives = await res.json();
  } catch {
    return redirect("/login");
  }
  const objective = objectives.find((obj: Objective) => String(obj.id) === String(id));
  if (!objective) {
    return notFound();
  }
  return <ObjectiveKeyResultsClient keyResults={objective.key_results || []} objectiveTitle={objective.title || ''} />;
}

