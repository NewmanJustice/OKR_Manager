"use client";
import * as React from "react";
import Button from '@mui/joy/Button';
import Link from 'next/link';

export default function QuarterlyReviewButton() {
  // For now, always link to the current year/quarter (could be dynamic)
  const now = new Date();
  const year = now.getFullYear();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return (
    <Link href={`/pdm/quarterly-reviews?quarter=${quarter}&year=${year}`} passHref legacyBehavior={false}>
      <Button color="success" variant="solid" sx={{ mb: 2, ml: 2, borderRadius: 0 }}>
        Quarterly Reviews
      </Button>
    </Link>
  );
}
