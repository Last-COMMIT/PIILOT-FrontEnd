"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HomePage from "@/views/home";
import { isAuthed } from "@/features/auth";

export default function IndexPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/login");
      return;
    }
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, [router]);

  if (!ready) return null;
  return <HomePage />;
}
