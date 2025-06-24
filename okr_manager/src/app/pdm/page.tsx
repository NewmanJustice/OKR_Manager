import { getSessionUserFromCookies } from '@/utils/session';
import { redirect } from 'next/navigation';
import EvidenceUpload from './evidence-upload';

export default async function PDMDashboard() {
  // Server-side session check
  const user = await getSessionUserFromCookies();
  if (!user || user.role !== 'PDM') {
    redirect('/login');
  }
  return (
    <main className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-4">PDM Dashboard</h1>
      <p className="mb-8">Welcome, {user?.email} (Principal Development Manager)</p>
      <EvidenceUpload />
      {/* Add PDM features here */}
    </main>
  );
}
