"use client";
import dynamic from 'next/dynamic';

const PDMObjectivesTable = dynamic(() => import('./PDMObjectivesTable'), { ssr: false });

export default function PDMObjectivesTableWrapper() {
  return <PDMObjectivesTable />;
}
