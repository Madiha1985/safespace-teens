"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, getUser, logout } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

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

    // update when login/logout happens in same tab
    const onAuthChanged = () => refreshAuth();

    // update if storage changes (other tab)
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

  if (!mounted) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // const isActive = (path: string) => (pathname === path ? "font-semibold underline" : "");
  const isActive = (path: string) =>
  pathname === path
    ? "font-semibold underline underline-offset-4 text-purple-200"
    : "hover:text-purple-200 transition";


  return (
   <nav className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between">

      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="font-bold text-white hover:text-purple-200 transition">
          SafeSpace Teens
        </Link>

        {token && (
          <>
            <Link href="/chat" className={isActive("/chat")}>Chat</Link>
            <Link href="/reading" className={isActive("/reading")}>Reading</Link>
            <Link href="/journal" className={isActive("/journal")}>Journal</Link>
            <Link href="/draw" className={isActive("/draw")}>Draw</Link>
            <Link href="/profile" className={isActive("/profile")}>Profile</Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {token ? (
          <>
            {/* Avatar (optional) */}
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            ) : null}

            <span className="text-sm font-medium text-white">{user?.username ?? "User"}</span>

            <button onClick={handleLogout} className="bg-white text-purple-700 px-3 py-1 rounded text-sm font-medium hover:bg-purple-100 transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={isActive("/login")}>Login</Link>
            <Link href="/register" className={isActive("/register")}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
