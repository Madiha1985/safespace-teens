"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getToken, getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

const ROOMS = [
  { id: "study-math", label: "Study • Math" },
  { id: "study-science", label: "Study • Science" },
  { id: "book-fantasy", label: "Book Club • Fantasy" },
  { id: "book-nonfiction", label: "Book Club • Non-fiction" },
];

type Stroke = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  size: number;
  mode: "pen" | "eraser";
};

export default function DrawPage() {
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [mounted, setMounted] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const [mode, setMode] = useState<"pen" | "eraser">("pen");
  const [size, setSize] = useState(4);
  const [status, setStatus] = useState<"connected" | "connecting" | "error">("connecting");

  const token = useMemo(() => (typeof window !== "undefined" ? getToken() : null), []);
  const user = useMemo(() => (typeof window !== "undefined" ? getUser() : null), []);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    if (!token) router.push("/login");
  }, [mounted, token, router]);

  // init canvas
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // set a fixed internal resolution for consistency
    canvas.width = 900;
    canvas.height = 520;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [mounted]);

  // connect socket once
  useEffect(() => {
    if (!mounted || !token) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

    if (!socketRef.current) {
      const s = io(SOCKET_URL, { auth: { token } });
      socketRef.current = s;

    setStatus("connecting");

s.on("connect", () => setStatus("connected"));
s.on("connect_error", () => setStatus("error"));


      // receive strokes
      s.on("draw:stroke", ({ stroke }: { roomId: string; stroke: Stroke }) => {
        drawStroke(stroke);
      });

      // receive clear
      s.on("draw:clear", () => {
        clearCanvas();
      });
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [mounted, token]);

  // join room for drawing
  useEffect(() => {
    if (!mounted || !token || !selectedRoom || !socketRef.current) return;

    socketRef.current.emit("room:join", { roomId: selectedRoom });

    return () => {
      socketRef.current?.emit("room:leave", { roomId: selectedRoom });
    };
  }, [mounted, token, selectedRoom]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawStroke = (stroke: Stroke) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    if (stroke.mode === "eraser") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = stroke.size * 2;
      ctx.beginPath();
      ctx.moveTo(stroke.x0, stroke.y0);
      ctx.lineTo(stroke.x1, stroke.y1);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.lineWidth = stroke.size;
    ctx.beginPath();
    ctx.moveTo(stroke.x0, stroke.y0);
    ctx.lineTo(stroke.x1, stroke.y1);
    ctx.stroke();
    ctx.restore();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selectedRoom) return;

    drawingRef.current = true;
    const p = getCanvasPoint(e);
    lastPointRef.current = p;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !selectedRoom) return;

    const last = lastPointRef.current;
    if (!last) return;

    const next = getCanvasPoint(e);

    const stroke: Stroke = {
      x0: last.x,
      y0: last.y,
      x1: next.x,
      y1: next.y,
      size,
      mode,
    };

    // draw locally
    drawStroke(stroke);

    // send to others
    socketRef.current?.emit("draw:stroke", { roomId: selectedRoom, stroke });

    lastPointRef.current = next;
  };

  const onPointerUp = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const onClear = () => {
    if (!selectedRoom) return;
    clearCanvas();
    socketRef.current?.emit("draw:clear", { roomId: selectedRoom });
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto mt-6 p-4 space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">Shared Drawing Board</h1>
          <p className="opacity-70 text-sm">
            Draw together in a room (pen, eraser, clear). Great for explaining ideas.
          </p>
        </div>
        <div className="text-sm opacity-70 text-right">
          User: <span className="font-semibold">{user?.username ?? "—"}</span>
          <br />
         <div className="flex items-center gap-2 justify-end">
  <span
    className={`inline-block w-2 h-2 rounded-full ${
      status === "connected"
        ? "bg-green-500"
        : status === "connecting"
        ? "bg-yellow-400"
        : "bg-red-500"
    }`}
  />
  <span className="text-xs opacity-70">
    {status === "connected"
      ? "Connected"
      : status === "connecting"
      ? "Connecting…"
      : "Connection error"}
  </span>
</div>

        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <aside className="border rounded-xl p-4 space-y-3">
          <div className="font-bold">Choose room</div>
          {ROOMS.map((r) => (
            <button
              key={r.id}
              className={`w-full text-left px-3 py-2 rounded-lg border transition ${
  selectedRoom === r.id
    ? "bg-purple-100 text-purple-800 font-semibold border-purple-200"
    : "hover:bg-purple-50 hover:border-purple-200"
}`}

              onClick={() => setSelectedRoom(r.id)}
            >
              {r.label}
            </button>
          ))}

          <div className="pt-2 border-t space-y-2">
            <div className="font-bold">Tools</div>

            <div className="flex gap-2">
              <button
               className={`border rounded-lg px-3 py-1 transition ${
  mode === "pen" ? "bg-purple-600 text-white border-purple-600" : "hover:bg-purple-50"
}`}

                onClick={() => setMode("pen")}
              >
                Pen
              </button>
              <button
                className={`border rounded-lg px-3 py-1 transition ${
  mode === "eraser" ? "bg-purple-600 text-white border-purple-600" : "hover:bg-purple-50"
}`}

                onClick={() => setMode("eraser")}
              >
                Eraser
              </button>
            </div>

            <div>
              <label className="block text-sm mb-1">Brush size: {size}</label>
              <input
                type="range"
                min={2}
                max={16}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <button className="bg-purple-600 text-white rounded-lg px-3 py-2 font-semibold hover:bg-purple-700 transition disabled:opacity-60" 
            onClick={onClear} 
            disabled={!selectedRoom}>
              Clear board
            </button>

            {!selectedRoom && (
              <p className="text-xs opacity-70">
                Pick a room to start drawing.
              </p>
            )}
          </div>
        </aside>

        <section className="md:col-span-3 border rounded-xl p-4">
          <div className="font-bold mb-2 text-purple-700">
            Room: {selectedRoom ?? "— (choose a room)"}
          </div>

          <div className="border rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-96 bg-white touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          </div>

          <p className="text-xs opacity-70 mt-2">
            Tip: Use this board to explain math problems or draw story characters with friends.
          </p>
        </section>
      </div>
    </div>
  );
}
