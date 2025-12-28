"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function HomeLanding({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const token = getToken();
    if (token) router.replace("/dashboard");
  }, [mounted, router]);

  // avoid hydration mismatch
  if (!mounted) return null;

  return <>{children}</>;
}
