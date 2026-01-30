"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      window.localStorage.removeItem("piilot_authed");
      window.localStorage.removeItem("piilot_access_token");
      window.localStorage.removeItem("piilot_refresh_token");
      window.localStorage.removeItem("piilot_role");
    } catch {
      // ignore
    }
    router.replace("/login");
  }, [router]);

  return null;
}
