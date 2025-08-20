import React, { Suspense } from "react";
import RegisterPage from "../../components/RegisterPage";

export default function Register() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPage />
    </Suspense>
  );
}
