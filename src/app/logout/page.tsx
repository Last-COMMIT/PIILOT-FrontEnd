"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/features/auth";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    clearTokens();
    router.replace("/login");
  }, [router]);

  return null;
}
