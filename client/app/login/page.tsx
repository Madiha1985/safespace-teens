"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import AuthCard from "@/components/AuthCard";

type LoginResponse = {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    age: number;
    interests: string[];
    role: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
if (!emailOrUsername.trim() || !password.trim()) {
  setError("Please enter your email/username and password.");
  setLoading(false);
  return;
}

    try {
      const data = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ emailOrUsername, password }),
      });

      saveAuth(data.token, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Login failed.Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Login to SafeSpace Teens">
      <form onSubmit={onLogin} className="space-y-3 ">
        <div>
          <label className="block text-sm mb-1">Email or Username</label>
          <input
            className="w-full border rounded-lg p-2"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
          />
        </div>
        <div>
  <label className="block text-sm mb-1">Password</label>
  <div className="flex gap-2">
    <input
      type={showPassword ? "text" : "password"}
      className="w-full border rounded-lg p-2"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <button
      type="button"
      className="border rounded-lg px-3"
      onClick={() => setShowPassword((s) => !s)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>
</div>


        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          className="w-full border rounded-lg p-2 font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
<p className="text-sm mt-4 opacity-70">
  Don’t have an account?{" "}
  <a className="underline" href="/register">
    Create one
  </a>
</p>
    </AuthCard>
  );
}
