"use client";

import { Suspense } from "react";
import ChatPageInner from "./ChatPageInner";

export default function ChatClient() {
  return (
    <Suspense fallback={<div className="p-6">Loading chat...</div>}>
      <ChatPageInner />
    </Suspense>
  );
}
