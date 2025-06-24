import { getSessionUserFromCookies } from '@/utils/session';
import { redirect } from 'next/navigation';
import ManageAdmins from './manage-admins';
import { PrismaClient } from '@prisma/client';

export default async function AdminDashboard() {
  // Server-side session check
  const user = await getSessionUserFromCookies();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }
  // Fetch all admins
  const prisma = new PrismaClient();
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true, email: true, name: true } });
  return (
    <main className="max-w-3xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, {user?.email} (Administrator)</p>
      <ManageAdmins initialAdmins={admins} />
    </main>
  );
}
