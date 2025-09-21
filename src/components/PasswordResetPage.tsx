"use client";
import React, { useEffect, useState } from "react";
import PasswordResetRequestForm from "@/components/PasswordResetRequestForm";
import PasswordResetForm from "@/components/PasswordResetForm";
import { useSearchParams } from "next/navigation";

const PasswordResetPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(searchParams ? searchParams.get("token") : null);
  }, [searchParams]);

  return token ? <PasswordResetForm /> : <PasswordResetRequestForm />;
};

export default PasswordResetPage;
