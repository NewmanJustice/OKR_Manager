"use client";
import ObjectiveKeyResultsClient from './ObjectiveKeyResultsClient';

export default function ObjectiveKeyResultsClientWrapper({ keyResults }: { keyResults: any[] }) {
  return <ObjectiveKeyResultsClient keyResults={keyResults} />;
}
