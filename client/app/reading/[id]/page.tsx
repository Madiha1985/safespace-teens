"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";
import StarRating from "@/components/StarRating";

type Comment = {
  id: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
};

type ReviewDetail = {
  id: string;
  userId: string;
  username: string;
  bookTitle: string;
  genre: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  comments: Comment[];
};

type ReviewResponse = {
  review: ReviewDetail;
};

export default function ReviewDetailPage() {
  const router = useRouter();
  const params = useParams();
 const rawId = params?.id;
const id = Array.isArray(rawId) ? rawId[0] : String(rawId);


  const [mounted, setMounted] = useState(false);

  const token = useMemo(() => (typeof window !== "undefined" ? getToken() : null), []);
  const user = useMemo(() => (typeof window !== "undefined" ? getUser() : null), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<ReviewDetail | null>(null);

  const [commentText, setCommentText] = useState("");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    if (!token) router.push("/login");
  }, [mounted, token, router]);

  const load = async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
if (!id || id === "undefined" || id === "null") return;

    try {
      const data = await apiFetch<ReviewResponse>(`/api/reviews/${id}`, { method: "GET" }, token);
      setReview(data.review);
    } catch (err: any) {
      setError(err.message ?? "Failed to load review");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted || !token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, token, id]);

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError(null);

    if (!commentText.trim()) {
      setError("Please write a comment.");
      return;
    }

    try {
      await apiFetch(
        `/api/reviews/${id}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ text: commentText.trim() }),
        },
        token
      );

      setCommentText("");
      await load();
    } catch (err: any) {
      setError(err.message ?? "Failed to add comment");
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto mt-6 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/reading" className="underline text-sm opacity-80">
          ← Back to Reading Hub
        </Link>
        <div className="text-sm opacity-70">
          Signed in as <span className="font-semibold">{user?.username ?? "—"}</span>
        </div>
      </div>

      {loading && <p className="opacity-70">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && review && (
        <>
          <section className="border rounded-xl p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h1 className="text-2xl font-bold">{review.bookTitle}</h1>
              <StarRating value={review.rating} readOnly />

            </div>

            <div className="text-sm opacity-70 mt-1">
              by <span className="font-semibold">{review.username}</span>{" "}
              {review.genre ? `• ${review.genre}` : ""} •{" "}
              {new Date(review.createdAt).toISOString().replace("T", " ").slice(0, 19) + "Z"}
            </div>

            <p className="mt-3 whitespace-pre-wrap">{review.reviewText}</p>
          </section>

          <section className="border rounded-xl p-4">
            <h2 className="font-bold mb-3">Comments ({review.comments.length})</h2>

            <form onSubmit={addComment} className="space-y-2">
              <textarea
                className="w-full border rounded-lg p-2 min-h-32"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a supportive comment..."
              />
              <button className="border rounded-lg px-4 py-2 font-semibold">
                Post comment
              </button>
            </form>

            <div className="mt-4 space-y-3">
              {review.comments.length === 0 && (
                <p className="opacity-70 text-sm">No comments yet.</p>
              )}

              {review.comments.map((c) => (
                <div key={c.id} className="border rounded-lg p-3 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">{c.username}</span>
                    <span className="text-xs opacity-60">
                      {new Date(c.createdAt).toISOString().replace("T", " ").slice(0, 19) + "Z"}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap">{c.text}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
