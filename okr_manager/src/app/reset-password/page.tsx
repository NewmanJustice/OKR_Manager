"use client";
import { Suspense } from "react";
import ResetPasswordPageInner from "./ResetPasswordPageInner";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}

// Assuming there's a Button component used somewhere in ResetPasswordPageInner
<Button
  // ...existing props...
  sx={{ ...sx, borderRadius: 0, ...(sx || {}) }}
>
  // ...existing code...
</Button>
