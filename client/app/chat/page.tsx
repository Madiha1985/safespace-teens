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
  const currentRoomRef = useRef<string>(ROOMS[0].id);

  

  const [selectedRoom, setSelectedRoom] = useState(ROOMS[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<string>("Not connected");
  const [mounted, setMounted] = useState(false);
 

  const token = useMemo(() => (typeof window !== "undefined" ? getToken() : null), []);
  const user = useMemo(() => (typeof window !== "undefined" ? getUser() : null), []);

useEffect(() => {
  currentRoomRef.current = selectedRoom;
}, [selectedRoom]);


useEffect(() => {
  setMounted(true);
}, []);


  // Redirect if not logged in
  useEffect(() => {
    if (!token) router.push("/login");
  }, [token, router]);

  // Load room history when room changes
  useEffect(() => {
    const run = async () => {
      if (!token) return;
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
  }, [selectedRoom, token]);

  // Connect socket once (and re-join room when room changes)
  useEffect(() => {
    if (!token) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

    // Connect once
    if (!socketRef.current) {
      setStatus("Connecting socket...");
      const s = io(SOCKET_URL, { auth: { token } });
      socketRef.current = s;

      s.on("connect", () => setStatus("Socket connected"));
      s.on("connect_error", (err) => setStatus(`Socket error: ${err.message}`));
      s.on("message:new", (payload: ChatMessage) => {
  // Only append if it matches the CURRENT room (ref always stays updated)
  if (payload.roomId === currentRoomRef.current) {
    setMessages((prev) => [...prev, payload]);
  }
});

    }

    // Join current room
    socketRef.current.emit("room:join", { roomId: selectedRoom });

    return () => {
      // Leave when switching rooms/unmount
      socketRef.current?.emit("room:leave", { roomId: selectedRoom });
    };
  }, [selectedRoom, token]);

  // Cleanup socket on page unmount
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;
    socketRef.current?.emit("message:send", {
      roomId: selectedRoom,
      message: text.trim(),
    });
    setText("");
  };
if (!mounted) return null;

const myUserId = user?.id;
const isMine = (m: ChatMessage) => myUserId && m.userId && String(m.userId) === String(myUserId);


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
        <div className="font-bold mb-2">Room: {selectedRoom}</div>

        <div className="flex-1 overflow-y-auto border rounded-lg p-3 space-y-2">
          {/* {messages.map((m, idx) => (
            <div key={m.id ?? `${m.createdAt}-${idx}`} className="text-sm">
              <span className="font-semibold">{m.username}</span>
              <span className="opacity-60">{new Date(m.createdAt).toISOString().replace("T", " ").slice(0, 19) + "Z"}
 </span>
         

              <div>{m.message}</div>
            </div>
          ))} */}
{messages.map((m, idx) => {
  const mine = isMine(m);

  return (
    <div
      key={m.id ?? `${m.createdAt}-${idx}`}
      className={`text-sm p-2 rounded-lg border max-w-[85%] ${
        mine ? "ml-auto text-right" : "mr-auto"
      }`}
    >
      <div className="flex items-baseline gap-2 justify-between">
        <span className="font-semibold">
          {mine ? "You" : m.username}
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
      </section>
    </div>
  );
}
