"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

type ChatMessage = {
  id?: string;
  roomId: string;
  userId?: string;
  username: string;
  message: string;
  createdAt: string;
  type?: "system" | "user";
};

type HistoryResponse = {
  roomId: string;
  count: number;
  messages: ChatMessage[];
};

const ROOMS = [
  { id: "study-math", label: "Study • Math" },
  { id: "study-science", label: "Study • Science" },
  { id: "book-fantasy", label: "Book Club • Fantasy" },
  { id: "book-nonfiction", label: "Book Club • Non-fiction" },
];

export default function ChatPage() {
  const router = useRouter();

  const socketRef = useRef<Socket | null>(null);
  const currentRoomRef = useRef<string | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Not connected");
  const [mounted, setMounted] = useState(false);

  // localStorage-based auth (browser-only)
  const token = useMemo(() => (typeof window !== "undefined" ? getToken() : null), []);
  const user = useMemo(() => (typeof window !== "undefined" ? getUser() : null), []);

  const myUserId = user?.id;
  const isMine = (m: ChatMessage) =>
    !!myUserId && !!m.userId && String(m.userId) === String(myUserId);

  // Mark as mounted (client)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep current room ref updated
  useEffect(() => {
    currentRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  // Redirect if not logged in (only after mounted)
  useEffect(() => {
    if (!mounted) return;
    if (!token) router.push("/login");
  }, [mounted, token, router]);

  // Load history when a room is selected
  useEffect(() => {
    const run = async () => {
      if (!mounted) return;
      if (!token || !selectedRoom) return;

      setMessages([]);
      setStatus("Loading history...");

      try {
        const data = await apiFetch<HistoryResponse>(
          `/api/rooms/${encodeURIComponent(selectedRoom)}/messages?limit=50`,
          { method: "GET" },
          token
        );
        setMessages(data.messages);
        setStatus("History loaded");
      } catch (err: any) {
        setStatus(`History error: ${err.message ?? "unknown"}`);
      }
    };

    run();
  }, [mounted, selectedRoom, token]);

  // Connect socket once (after mounted + token)
  useEffect(() => {
    if (!mounted) return;
    if (!token) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

    if (!socketRef.current) {
      setStatus("Connecting socket...");
      const s = io(SOCKET_URL, { auth: { token } });
      socketRef.current = s;

      s.on("connect", () => setStatus("Socket connected"));
      s.on("connect_error", (err) => setStatus(`Socket error: ${err.message}`));

      s.on("message:new", (payload: ChatMessage) => {
        // append only messages for the current selected room
        if (currentRoomRef.current && payload.roomId === currentRoomRef.current) {
          setMessages((prev) => [...prev, payload]);
        }
      });
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [mounted, token]);

  // Join/leave when room changes
  useEffect(() => {
    if (!mounted) return;
    if (!token || !selectedRoom || !socketRef.current) return;

    socketRef.current.emit("room:join", { roomId: selectedRoom });

    return () => {
      socketRef.current?.emit("room:leave", { roomId: selectedRoom });
    };
  }, [mounted, selectedRoom, token]);

  const sendMessage = () => {
    if (!selectedRoom) return;
    if (!text.trim()) return;

    socketRef.current?.emit("message:send", {
      roomId: selectedRoom,
      message: text.trim(),
    });

    setText("");
  };

  // ✅ IMPORTANT: return AFTER hooks are declared (safe)
  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <aside className="border rounded-xl p-4">
        <div className="font-bold mb-2">Rooms</div>

        <div className="space-y-2">
          {ROOMS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoom(r.id)}
              className={`w-full text-left p-2 rounded-lg border ${
                selectedRoom === r.id ? "font-semibold" : ""
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="text-xs mt-4 opacity-70">
          Status: {status}
          <br />
          User: {user?.username ?? "—"}
        </div>
      </aside>

      <section className="md:col-span-3 border rounded-xl p-4 flex flex-col h-[70vh]">
        {!selectedRoom ? (
          <div className="flex flex-1 items-center justify-center text-center">
            <div>
              <h2 className="text-xl font-bold mb-2">Welcome 👋</h2>
              <p className="opacity-70">Choose a room from the left to start chatting.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="font-bold mb-2">Room: {selectedRoom}</div>

            <div className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-2">
              {messages.map((m, idx) => {
                const mine = isMine(m);
                const system = m.type === "system" || m.userId === "system";

                return (
                  <div
                    key={m.id ?? `${m.createdAt}-${idx}`}
                    className={`text-sm p-2 rounded-lg border max-w-[85%] ${
                      system
                        ? "mx-auto text-center opacity-70"
                        : mine
                        ? "ml-auto text-right"
                        : "mr-auto"
                    }`}
                  >
                    <div className="flex items-baseline gap-2 justify-between">
                      <span className="font-semibold">
                        {system ? "System" : mine ? "You" : m.username}
                      </span>
                      <span className="text-xs opacity-60">
                        {new Date(m.createdAt).toISOString().replace("T", " ").slice(0, 19) + "Z"}
                      </span>
                    </div>
                    <div className="mt-1">{m.message}</div>
                  </div>
                );
              })}

              {messages.length === 0 && (
                <p className="text-sm opacity-70">No messages yet. Say hi 👋</p>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 border rounded-lg p-2"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <button className="border rounded-lg px-4 font-semibold" onClick={sendMessage}>
                Send
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
