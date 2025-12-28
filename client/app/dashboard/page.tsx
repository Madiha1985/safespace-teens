"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/auth";

type Rec = { title: string; desc: string; href: string };

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const refreshAuth = () => {
    setToken(getToken());
    setUser(getUser());
  };

  useEffect(() => {
    setMounted(true);
    refreshAuth();

    const onAuthChanged = () => refreshAuth();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") refreshAuth();
    };

    window.addEventListener("auth-changed", onAuthChanged);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("auth-changed", onAuthChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) router.push("/login");
  }, [mounted, token, router]);

  if (!mounted) return null;

  const interests: string[] = user?.interests ?? [];

  const recommendations = (): Rec[] => {
    const recs: Rec[] = [];

    if (interests.includes("math")) {
      recs.push({
        title: "Join Study Math",
        desc: "Ask questions & practice together.",
        href: "/chat?room=study-math",
      });
    }
    if (interests.includes("science")) {
      recs.push({
        title: "Join Study Science",
        desc: "Discuss concepts and homework.",
        href: "/chat?room=study-science",
      });
    }
    if (interests.includes("reading")) {
      recs.push({
        title: "Write a Book Review",
        desc: "Share what you’re reading with others.",
        href: "/reading",
      });
      recs.push({
        title: "Join Book Club (Fantasy)",
        desc: "Talk about stories with peers.",
        href: "/chat?room=book-fantasy",
      });
    }
    if (interests.includes("art") || interests.includes("drawing")) {
      recs.push({
        title: "Open Drawing Board",
        desc: "Draw ideas or relax creatively.",
        href: "/draw",
      });
    }

    // Always useful
    recs.push({
      title: "Add a Journal Entry",
      desc: "Track mood & thoughts privately.",
      href: "/journal",
    });

    // remove duplicates by title
    const uniq = Array.from(new Map(recs.map((r) => [r.title, r])).values());
    return uniq.slice(0, 4);
  };

  const quickRooms = [
    { id: "study-math", label: "Study • Math" },
    { id: "study-science", label: "Study • Science" },
    { id: "book-fantasy", label: "Book Club • Fantasy" },
    { id: "book-nonfiction", label: "Book Club • Non-fiction" },
  ];

  return (
    <div className="max-w-5xl mx-auto mt-6 p-4 space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm opacity-70">
            Choose what you want to do today — and try something recommended for you.
          </p>

          {/* Interests chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {interests.length > 0 ? (
              interests.map((i) => (
                <span
                  key={i}
                  className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                >
                  {i}
                </span>
              ))
            ) : (
              <p className="text-sm opacity-70">
                No interests selected yet. Add them in{" "}
                <Link className="underline" href="/profile">
                  Profile
                </Link>
                .
              </p>
            )}
          </div>
        </div>

        <div className="text-sm opacity-70 text-right">
          Welcome, <span className="font-semibold">{user?.username ?? "—"}</span>
        </div>
      </header>

      {/* Recommended */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Recommended for you</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendations().map((r) => (
            <Link key={r.title} href={r.href} className="border rounded-xl p-4 hover:opacity-90">
              <div className="font-bold">{r.title}</div>
              <p className="text-sm opacity-70 mt-1">{r.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick start rooms */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Quick start rooms</h2>
        <div className="flex flex-wrap gap-2">
          {quickRooms.map((r) => (
            <Link
              key={r.id}
              href={`/chat?room=${encodeURIComponent(r.id)}`}
              className="border rounded-full px-4 py-2 text-sm hover:opacity-90"
            >
              {r.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Main cards */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Explore</h2>

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
      </section>
    </div>
  );
}
