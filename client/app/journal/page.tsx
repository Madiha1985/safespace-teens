"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";

type Entry = {
  id: string;
  mood: "happy" | "okay" | "sad" | "stressed" | "tired" | "angry";
  entryText: string;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = {
  count: number;
  entries: Entry[];
};

const MOODS: Entry["mood"][] = ["happy", "okay", "sad", "stressed", "tired", "angry"];

export default function JournalPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const token = useMemo(() => (typeof window !== "undefined" ? getToken() : null), []);
  const user = useMemo(() => (typeof window !== "undefined" ? getUser() : null), []);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // create/edit form state
  const [mood, setMood] = useState<Entry["mood"]>("okay");
  const [entryText, setEntryText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    if (!token) router.push("/login");
  }, [mounted, token, router]);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ListResponse>("/api/journal", { method: "GET" }, token);
      setEntries(data.entries);
    } catch (err: any) {
      setError(err.message ?? "Failed to load journal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted || !token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError(null);

    if (!entryText.trim()) {
      setError("Please write something for your journal entry.");
      return;
    }

    try {
      if (editingId) {
        await apiFetch(
          `/api/journal/${editingId}`,
          { method: "PUT", body: JSON.stringify({ mood, entryText }) },
          token
        );
      } else {
        await apiFetch(
          "/api/journal",
          { method: "POST", body: JSON.stringify({ mood, entryText }) },
          token
        );
      }

      setEntryText("");
      setMood("okay");
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err.message ?? "Failed to save entry");
    }
  };

  const startEdit = (e: Entry) => {
    setEditingId(e.id);
    setMood(e.mood);
    setEntryText(e.entryText);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setMood("okay");
    setEntryText("");
  };

  const remove = async (id: string) => {
    if (!token) return;
    setError(null);
    try {
      await apiFetch(`/api/journal/${id}`, { method: "DELETE" }, token);
      await load();
    } catch (err: any) {
      setError(err.message ?? "Failed to delete entry");
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto mt-6 p-4 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Feeling Journal</h1>
          <p className="text-sm opacity-70">
            Private space for your thoughts. Only you can see your entries.
          </p>
        </div>
        <div className="text-sm opacity-70">
          Signed in as <span className="font-semibold">{user?.username ?? "—"}</span>
        </div>
      </header>

      <section className="border rounded-xl p-4">
        <h2 className="font-bold mb-3">{editingId ? "Edit entry" : "New entry"}</h2>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Mood</label>
            <select
              className="border rounded-lg p-2"
              value={mood}
              onChange={(e) => setMood(e.target.value as Entry["mood"])}
            >
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Entry</label>
            <textarea
              className="w-full border rounded-lg p-2 min-h-30"
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              placeholder="Write what you feel or what happened today..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button className="border rounded-lg px-4 py-2 font-semibold">
              {editingId ? "Save changes" : "Add entry"}
            </button>
            {editingId && (
              <button
                type="button"
                className="border rounded-lg px-4 py-2"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">My entries</h2>

        {loading && <p className="opacity-70">Loading…</p>}
        {!loading && entries.length === 0 && (
          <p className="opacity-70">No journal entries yet.</p>
        )}

        {entries.map((e) => (
          <div key={e.id} className="border rounded-xl p-4">
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-semibold">Mood: {e.mood}</div>
              <div className="text-xs opacity-60">
                {new Date(e.createdAt).toISOString().replace("T", " ").slice(0, 19) + "Z"}
              </div>
            </div>

            <p className="mt-2 whitespace-pre-wrap">{e.entryText}</p>

            <div className="mt-3 flex gap-2">
              <button className="border rounded-lg px-3 py-1" onClick={() => startEdit(e)}>
                Edit
              </button>
              <button className="border rounded-lg px-3 py-1" onClick={() => remove(e.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
