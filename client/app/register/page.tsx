"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import AuthCard from "@/components/AuthCard";

type RegisterResponse = {
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

function friendlyRegisterError(msg: string) {
  const lower = (msg || "").toLowerCase();

  if (lower.includes("password") && (lower.includes("8") || lower.includes("eight"))) {
    return "Password must be at least 8 characters.";
  }
  if (lower.includes("age") && (lower.includes("12") || lower.includes("17"))) {
    return "Age must be between 12 and 17.";
  }
  
  if (lower.includes("email") && lower.includes("valid")) {
    return "Please enter a valid email address.";
  }
  if (lower.includes("already") && (lower.includes("email") || lower.includes("username") || lower.includes("user"))) {
    return "That email or username is already in use.";
  }

  return "Registration failed. Please try again.";
}


export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | null>(14);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
if (!username.trim() || !email.trim() || !password.trim()) {
  setError("Please fill in all fields.");
  setLoading(false);
  return;
}
if (password.trim().length < 8) {
  setError("Password must be at least 8 characters.");
  setLoading(false);
  return;
}
if (age === null) {
  setError("Please enter your age (12–17).");
  setLoading(false);
  return;
}

if (!Number.isInteger(age) || age < 12 || age > 17) {
  setError("Age must be between 12 and 17.");
  setLoading(false);
  return;
}
    try {
      const data = await apiFetch<RegisterResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
          age,
          interests: [], 
        }),
      });

      saveAuth(data.token, data.user);
      router.push("/profile");
    } catch (err: any) {
      setError(friendlyRegisterError(err.message ?? ""));

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create account" subtitle="Start learning and sharing safely">
      <form onSubmit={onRegister} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            className="w-full border rounded-lg p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded-lg p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Age (12–17)</label>
          <input
  type="number"
  min={12}
  max={17}
  step={1}
  className="w-full border rounded-lg p-2"
  value={age ?? ""} //  allows empty
  onChange={(e) => {
    const v = e.target.value;
    if (v === "") {
      setAge(null); //  empty stays empty (not 0)
    } else {
      setAge(Number(v)); //  normal number
    }
  }}
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
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs opacity-70 mt-1">Minimum 8 characters.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button disabled={loading} className="w-full rounded-lg p-2 font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
