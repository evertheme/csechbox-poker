"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { socketClient } from "@/lib/socket";
import type { ChatMessage } from "@/types/socket";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  roomId: string;
  className?: string;
}

export function ChatPanel({ roomId, className }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = socketClient.getSocket();
    if (!s?.connected) return;

    const onMsg = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    s.on("chat-message", onMsg);
    return () => {
      s.off("chat-message", onMsg);
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const s = socketClient.getSocket();
    s?.emit("send-message", roomId, text);
    setDraft("");
  }

  return (
    <div
      className={cn(
        "flex h-[min(70vh,420px)] flex-col rounded-lg border border-white/10 bg-black/30",
        className
      )}
    >
      <div className="border-b border-white/10 px-3 py-2 text-sm font-medium text-white">
        Table chat
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-2 text-sm">
        {messages.length === 0 ? (
          <p className="text-zinc-500">No messages yet.</p>
        ) : (
          messages.map((m, i) => (
            <div key={`${m.timestamp}-${i}`} className="text-zinc-300">
              <span className="font-medium text-white/90">{m.username}: </span>
              <span>{m.text}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form
        className="flex gap-2 border-t border-white/10 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message…"
          className="border-zinc-700 bg-zinc-900"
          autoComplete="off"
        />
        <Button type="submit" size="sm" variant="secondary">
          Send
        </Button>
      </form>
    </div>
  );
}
