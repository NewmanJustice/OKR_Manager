import ObjectivesClient from './ObjectivesClient';
import { getSessionUserFromCookies } from '@/utils/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default async function ObjectivesPage() {
  const user = await getSessionUserFromCookies();
  if (!user || !user.isAdmin) {
    redirect('/login');
  }
  return (
    <main className="max-w-3xl mx-auto mt-10 p-6">
      <div className="flex items-center mb-6">
        <Link
          href="/admin"
          className="flex items-center text-gray-700 hover:text-black font-medium text-base mr-4"
        >
          <ArrowBackIcon sx={{ fontSize: 20, mr: 1 }} />
          Back to Admin
        </Link>
        {/* Breadcrumb would go here if present */}
      </div>
      <h1 className="text-2xl font-bold text-center w-full mb-4">Objectives</h1>
      <ObjectivesClient />
    </main>
  );
}
