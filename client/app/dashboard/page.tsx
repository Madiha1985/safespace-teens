"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const token = useMemo(() => (typeof window !== "undefined" ? getToken() : null), []);
  const user = useMemo(() => (typeof window !== "undefined" ? getUser() : null), []);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    if (!token) router.push("/login");
  }, [mounted, token, router]);

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto mt-6 p-4 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm opacity-70">
            Choose what you want to do today: chat, read, draw, or journal.
          </p>
        </div>
        <div className="text-sm opacity-70 text-right">
          Welcome, <span className="font-semibold">{user?.username ?? "—"}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/chat" className="border rounded-xl p-4 hover:opacity-90">
          <div className="font-bold">Chatrooms</div>
          <p className="text-sm opacity-70 mt-1">
            Join study rooms and talk with peers safely.
          </p>
        </Link>

        <Link href="/reading" className="border rounded-xl p-4 hover:opacity-90">
          <div className="font-bold">Reading Hub</div>
          <p className="text-sm opacity-70 mt-1">
            Post book reviews and comment on others.
          </p>
        </Link>

        <Link href="/journal" className="border rounded-xl p-4 hover:opacity-90">
          <div className="font-bold">Feeling Journal</div>
          <p className="text-sm opacity-70 mt-1">
            Private mood tracking and reflections.
          </p>
        </Link>

        <Link href="/draw" className="border rounded-xl p-4 hover:opacity-90">
          <div className="font-bold">Drawing Board</div>
          <p className="text-sm opacity-70 mt-1">
            Draw together to explain ideas or be creative.
          </p>
        </Link>

        <Link href="/profile" className="border rounded-xl p-4 hover:opacity-90">
          <div className="font-bold">Profile</div>
          <p className="text-sm opacity-70 mt-1">
            Update interests and choose your avatar.
          </p>
        </Link>
      </div>
    </div>
  );
}
