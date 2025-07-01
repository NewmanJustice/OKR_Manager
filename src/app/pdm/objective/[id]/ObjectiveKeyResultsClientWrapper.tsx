"use client";
import ObjectiveKeyResultsClient, { KeyResult } from './ObjectiveKeyResultsClient';

export default function ObjectiveKeyResultsClientWrapper({ keyResults }: { keyResults: KeyResult[] }) {
  return <ObjectiveKeyResultsClient keyResults={keyResults} />;
}
