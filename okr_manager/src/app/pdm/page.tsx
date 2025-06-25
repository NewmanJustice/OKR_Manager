import { getSessionUserFromCookies } from '@/utils/session';
import { redirect } from 'next/navigation';
import PDMObjectivesTableWrapper from './PDMObjectivesTableWrapper';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import PDMDashboardDrawerClient from './PDMDashboardDrawerClient';

export default async function PDMDashboard() {
  // Server-side session check
  const user = await getSessionUserFromCookies();
  if (!user || user.role !== 'PDM') {
    redirect('/login');
  }
  return (
    <main className="max-w-3xl mx-auto mt-10 p-6">
      <div className="w-full max-w-[1200px] min-w-[320px] mx-auto">
        <PDMDashboardDrawerClient />
        <Card variant="outlined" sx={{ width: '100%', borderRadius: 'lg', boxShadow: 'md', p: 4, mx: 'auto' }}>
          <CardContent>
            <h1 className="text-2xl font-bold mb-4 text-center">Dashboard</h1>
            <div className="mt-8">
              <PDMObjectivesTableWrapper />
            </div>
            {/* Add PDM features here */}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
