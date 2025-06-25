import { getSessionUserFromCookies } from '@/utils/session';
import { redirect } from 'next/navigation';
import EvidenceUpload from './evidence-upload';
import PDMObjectivesTableWrapper from './PDMObjectivesTableWrapper';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';

export default async function PDMDashboard() {
  // Server-side session check
  const user = await getSessionUserFromCookies();
  if (!user || user.role !== 'PDM') {
    redirect('/login');
  }
  return (
    <main className="max-w-3xl mx-auto mt-10 p-6">
      <Card variant="outlined" sx={{ borderRadius: 'lg', boxShadow: 'md', p: 4 }}>
        <CardContent>
          <h1 className="text-2xl font-bold mb-4 text-center">PDM Dashboard</h1>
          <EvidenceUpload />
          <div className="mt-8">
            <PDMObjectivesTableWrapper />
          </div>
          {/* Add PDM features here */}
        </CardContent>
      </Card>
    </main>
  );
}
