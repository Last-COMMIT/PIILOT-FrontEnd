"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HomePage from "@/views/home";

const AUTH_KEY = "piilot_authed";

export default function IndexPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const authed = window.localStorage.getItem(AUTH_KEY) === "1";
      if (!authed) {
        router.replace("/login");
        return;
      }
      setReady(true);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!ready) return null;
  return <HomePage />;
}
