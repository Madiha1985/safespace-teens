import HomeLanding from "./HomeLanding";
import Link from "next/link";
import {
  FaComments,
  FaBook,
  FaPaintBrush,
  FaHeart,
  FaShieldAlt,
} from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-purple-100 text-zinc-900">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          SafeSpace Teens
        </h1>
        <p className="max-w-2xl mx-auto text-lg opacity-80">
          A safe digital space for teens (12–17) to chat, learn, express
          feelings, and be creative — together.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-purple-600 px-6 py-3 font-semibold text-purple-700 hover:bg-purple-100 transition"
          >
            Login
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-12 space-y-6">
        <h2 className="text-2xl font-bold text-center">
          What you can do inside
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Feature
            icon={<FaComments />}
            title="Chatrooms"
            text="Join study rooms and topic-based chats with peers."
          />
          <Feature
            icon={<FaBook />}
            title="Reading Hub"
            text="Share book reviews and discuss what you’re reading."
          />
          <Feature
            icon={<FaHeart />}
            title="Feeling Journal"
            text="A private space to track moods and thoughts."
          />
          <Feature
            icon={<FaPaintBrush />}
            title="Drawing Board"
            text="Draw together to explain ideas or just relax."
          />
        </div>
      </section>

      {/* SAFETY */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="rounded-xl bg-white p-6 shadow-sm space-y-4 ">
          <div className="flex items-center gap-3 text-purple-700 ">
            <FaShieldAlt className="text-xl" />
            <h3 className="text-xl font-bold">Designed with safety in mind</h3>
          </div>

          <ul className="list-disc pl-6 text-sm opacity-80 space-y-1 ">
            <li>Built specifically for teens aged 12–17</li>
            <li>Private journals — only visible to the user</li>
            <li>Preset avatars (no image uploads)</li>
            <li>Authenticated and protected routes</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold">Ready to join?</h2>
        <p className="text-sm opacity-70">
          Create an account and start learning and sharing safely.
        </p>
        <Link
          href="/register"
          className="inline-block rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 transition"
        >
          Create Account
        </Link>
      </section>
    </div>
  );
}

/* Feature Card Component */
function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <HomeLanding>
    <div className="rounded-xl bg-white p-5 shadow-sm space-y-3 hover:shadow-md hover:border-purple-200 border border-transparent transition">
      <div className="text-purple-600 text-2xl">{icon}</div>
      <div className="font-semibold">{title}</div>
      <p className="text-sm opacity-70">{text}</p>
    </div>
    </HomeLanding>
  );
}
