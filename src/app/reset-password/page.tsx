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
