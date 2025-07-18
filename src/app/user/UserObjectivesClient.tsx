"use client";
import * as React from "react";
import Card from '@mui/joy/Card';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Link from 'next/link';
import Button from '@mui/joy/Button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export interface KeyResult {
  id: number;
  text?: string;
  title?: string;
}
export interface Objective {
  id: number;
  title: string;
  description: string;
  quarter: number;
  year: number;
  key_results: KeyResult[];
}

export default function UserObjectivesClient() {
  const [objectives, setObjectives] = React.useState<Objective[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const { status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }
    if (status !== 'authenticated') return;
    fetch('/api/user/objectives').then(async res => {
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      if (res.ok) setObjectives(await res.json());
      else setError('Failed to load objectives');
      setLoading(false);
    });
  }, [status, router]);

  if (status === 'loading' || loading) return <div>Loading...</div>;
  if (error) return <Typography color="danger">{error}</Typography>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 pt-4">
      <Card variant="outlined" sx={{ width: 900, maxWidth: '98vw', p: 4, mb: 6, boxShadow: 'lg', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography level="h4" sx={{ mb: 2 }}>My OKRs</Typography>
        {objectives.length === 0 ? (
          <Typography>No OKRs assigned to you yet.</Typography>
        ) : (
          <Table variant="outlined" sx={{ width: '100%', background: 'white', boxShadow: 'sm' }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Quarter</th>
                <th>Year</th>
                <th>Key Results</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {objectives.map(obj => (
                <tr key={obj.id}>
                  <td>{obj.title}</td>
                  <td>{obj.description}</td>
                  <td>{obj.quarter}</td>
                  <td>{obj.year}</td>
                  <td>
                    <ul style={{ paddingLeft: 16 }}>
                      {(obj.key_results || []).map((kr: KeyResult, i: number) => (
                        <li key={kr.id || i}>{kr.text || kr.title}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <Link href={`/user/objective/${obj.id}`}>
                      <Button size="sm" variant="soft">View Details</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
