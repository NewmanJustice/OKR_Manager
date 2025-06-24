import { getSessionUserFromCookies } from '@/utils/session';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  // Server-side session check
  const user = await getSessionUserFromCookies();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }
  return (
    <main className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, {user?.email} (Administrator)</p>
      {/* Add admin features here */}
    </main>
  );
}
