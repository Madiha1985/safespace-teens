"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";

type ReviewListItem = {
  id: string;
  username: string;
  bookTitle: string;
  genre: string;
  rating: number;
  reviewText: string;
  commentsCount: number;
  createdAt: string;
};

type ReviewsResponse = {
  count: number;
  reviews: ReviewListItem[];
};

export default function ReadingHubPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const token = useMemo(() => (typeof window !== "undefined" ? getToken() : null), []);
  const user = useMemo(() => (typeof window !== "undefined" ? getUser() : null), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);

  // Create form state
  const [bookTitle, setBookTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    if (!token) router.push("/login");
  }, [mounted, token, router]);

  const load = async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<ReviewsResponse>("/api/reviews", { method: "GET" }, token);
      setReviews(data.reviews);
    } catch (err: any) {
      setError(err.message ?? "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted || !token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, token]);

  const createReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError(null);

    // simple frontend validation
    if (!bookTitle.trim() || !reviewText.trim()) {
      setError("Please enter a book title and your review.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    try {
      await apiFetch(
        "/api/reviews",
        {
          method: "POST",
          body: JSON.stringify({
            bookTitle: bookTitle.trim(),
            genre: genre.trim(),
            rating,
            reviewText: reviewText.trim(),
          }),
        },
        token
      );

      // reset form
      setBookTitle("");
      setGenre("");
      setRating(5);
      setReviewText("");

      // reload list
      await load();
    } catch (err: any) {
      setError(err.message ?? "Failed to create review");
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto mt-6 p-4 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reading Hub</h1>
          <p className="opacity-70 text-sm">
            Share what you read, write reviews, and learn from your peers.
          </p>
        </div>
        <div className="text-sm opacity-70">
          Signed in as <span className="font-semibold">{user?.username ?? "—"}</span>
        </div>
      </header>

      {/* Create Review */}
      <section className="border rounded-xl p-4">
        <h2 className="font-bold mb-3">Write a review</h2>

        <form onSubmit={createReview} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Book title</label>
            <input
              className="w-full border rounded-lg p-2"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="e.g., Harry Potter and the Philosopher’s Stone"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Genre</label>
            <input
              className="w-full border rounded-lg p-2"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="Fantasy"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Rating (1–5)</label>
            <input
              type="number"
              min={1}
              max={5}
              className="w-full border rounded-lg p-2"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-sm mb-1">Your review</label>
            <textarea
              className="w-full border rounded-lg p-2 min-h-25"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you like? What did you learn? Would you recommend it?"
            />
          </div>

          {error && <p className="text-sm text-red-600 md:col-span-4">{error}</p>}

          <div className="md:col-span-4">
            <button className="border rounded-lg px-4 py-2 font-semibold">
              Post review
            </button>
          </div>
        </form>
      </section>

      {/* Reviews list */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Latest reviews</h2>
          <button onClick={load} className="text-sm underline opacity-80">
            Refresh
          </button>
        </div>

        {loading && <p className="opacity-70">Loading...</p>}

        {!loading && reviews.length === 0 && (
          <p className="opacity-70">No reviews yet. Be the first to post!</p>
        )}

        {reviews.map((r) => (
          <Link
            key={r.id}
            href={`/reading/${r.id}`}
            className="block border rounded-xl p-4 hover:opacity-90"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="font-bold">
                {r.bookTitle}{" "}
                <span className="text-sm opacity-70 font-normal">
                  {r.genre ? `• ${r.genre}` : ""}
                </span>
              </div>
              <div className="text-sm opacity-70">{r.rating}/5</div>
            </div>

            <div className="text-sm opacity-70 mt-1">
              by <span className="font-semibold">{r.username}</span> •{" "}
              {new Date(r.createdAt).toISOString().replace("T", " ").slice(0, 19) + "Z"} •{" "}
              {r.commentsCount} comments
            </div>

            <p className="mt-3 text-sm">
              {r.reviewText.length > 220 ? r.reviewText.slice(0, 220) + "…" : r.reviewText}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
