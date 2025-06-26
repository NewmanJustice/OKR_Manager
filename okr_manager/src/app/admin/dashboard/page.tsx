import { getSessionUserFromCookies } from '@/utils/session';
import { redirect } from 'next/navigation';
import ManageAdmins from '../manage-admins';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default async function AdminDashboard() {
  // Server-side session check
  const user = await getSessionUserFromCookies();
  if (!user || !user.isAdmin) {
    redirect('/login');
  }
  // Fetch all admins
  const prisma = new PrismaClient();
  const admins = await prisma.user.findMany({ where: { isAdmin: true }, select: { id: true, email: true, name: true } });
  return (
    <main className="max-w-3xl mx-auto mt-10 p-6">
      <div className="flex items-center mb-6">
        <Link href="/admin" className="flex items-center text-gray-700 hover:text-black font-medium text-base mr-4">
          <ArrowBackIcon sx={{ fontSize: 20, mr: 1 }} />
          Back to Admin
        </Link>
        {/* Breadcrumb would go here if present */}
      </div>
      <h1 className="text-2xl font-bold text-center w-full mb-4">Admin Dashboard</h1>
      <ManageAdmins initialAdmins={admins} />
    </main>
  );
}
