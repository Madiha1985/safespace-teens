"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken, getUser, saveAuth } from "@/lib/auth";

const AVATARS = Array.from({ length: 8 }, (_, i) => `/avatars/${i + 1}.png`);

type UpdateAvatarResponse = {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    age: number;
    interests: string[];
    avatarUrl: string;
    role: string;
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const token = useMemo(() => (typeof window !== "undefined" ? getToken() : null), []);
  const user = useMemo(() => (typeof window !== "undefined" ? getUser() : null), []);

  const [selected, setSelected] = useState<string>(user?.avatarUrl || "");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    if (!token) router.push("/login");
  }, [mounted, token, router]);

  useEffect(() => {
    setSelected(user?.avatarUrl || "");
  }, [user?.avatarUrl]);

  const saveAvatar = async () => {
    if (!token) return;
    setStatus(null);

    if (!selected) {
      setStatus("Please select an avatar.");
      return;
    }

    try {
      const data = await apiFetch<UpdateAvatarResponse>(
        "/api/users/avatar",
        { method: "PATCH", body: JSON.stringify({ avatarUrl: selected }) },
        token
      );

      // update localStorage so header/chat etc show new avatar
      saveAuth(token, data.user);
      setStatus("Avatar updated ✅");
    } catch (err: any) {
      setStatus(err.message ?? "Failed to update avatar");
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm opacity-70">Choose a preset avatar.</p>
        </div>
        <div className="text-sm opacity-70 text-right">
          <div>
            <span className="font-semibold">{user?.username ?? "—"}</span>
          </div>
          <div>{user?.email ?? ""}</div>
        </div>
      </header>

      <section className="border rounded-xl p-4 space-y-4">
        <div className="font-bold">Pick an avatar</div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {AVATARS.map((src) => (
            <button
              key={src}
              onClick={() => setSelected(src)}
              className={`border rounded-xl p-2 hover:opacity-90 ${
                selected === src ? "ring-2 ring-black" : ""
              }`}
              aria-label={`Select avatar ${src}`}
              type="button"
            >
              <Image src={src} alt="Avatar" width={80} height={80} className="w-20 h-20 mx-auto rounded-full" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="border rounded-lg px-4 py-2 font-semibold" onClick={saveAvatar}>
            Save avatar
          </button>
          {status && <p className="text-sm opacity-80">{status}</p>}
        </div>
      </section>
    </div>
  );
}
