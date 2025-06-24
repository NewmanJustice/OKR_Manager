"use client";
import * as React from "react";
import Card from '@mui/joy/Card';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';

export default function UserObjectivesClient() {
  const [objectives, setObjectives] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetch('/api/user/objectives').then(async res => {
      if (res.ok) setObjectives(await res.json());
      else setError('Failed to load objectives');
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <Typography color="danger">{error}</Typography>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 pt-4">
      <Card variant="outlined" sx={{ width: 900, maxWidth: '98vw', p: 4, mb: 6, boxShadow: 'lg', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography level="h4" sx={{ mb: 2 }}>My Assigned OKRs</Typography>
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
                      {obj.keyResults?.map((kr: any, i: number) => (
                        <li key={kr.id || i}>{kr.text}</li>
                      ))}
                    </ul>
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
