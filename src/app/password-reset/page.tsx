import React, { Suspense } from "react";
import PasswordResetPage from "@/components/PasswordResetPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordResetPage />
    </Suspense>
  );
}
