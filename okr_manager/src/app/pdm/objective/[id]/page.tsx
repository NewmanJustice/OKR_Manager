import Link from 'next/link';
import { getSessionUserFromCookies } from '@/utils/session';
import { redirect } from 'next/navigation';
import prisma from '@/utils/prisma';
import ObjectiveKeyResultsClientWrapper from './ObjectiveKeyResultsClientWrapper';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';

export default async function ObjectivePage({ params }: { params: Promise<{ id: string }> }) {
  // Server-side session check
  const user = await getSessionUserFromCookies();
  if (!user || !user.isLineManager) {
    redirect('/login');
  }
  const awaitedParams = await params;
  const objectiveId = Number(awaitedParams.id);
  const objective = await prisma.objective.findUnique({
    where: { id: objectiveId },
    include: { key_results: true },
  });
  if (!objective) {
    return <div>Objective not found</div>;
  }
  return (
    <main className="max-w-3xl mx-auto mt-10 p-6">
      <Card variant="outlined" sx={{ borderRadius: 'lg', boxShadow: 'md', p: 4, maxWidth: '90vw', mx: 'auto' }}>
        <CardContent>
          <Link href="/pdm" className="text-blue-700 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
          <h1 className="text-2xl font-bold mb-4 text-center">{objective.title}</h1>
          <div className="mb-2 text-center text-gray-600">Target Date: Quarter {objective.quarter}, {objective.year}</div>
          <ObjectiveKeyResultsClientWrapper keyResults={objective.key_results} />
        </CardContent>
      </Card>
    </main>
  );
}
