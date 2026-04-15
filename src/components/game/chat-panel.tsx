"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/use-socket";
import { socketClient } from "@/lib/socket";
import { useAuthStore } from "@/store/auth-store";
import type { ChatMessage } from "@/types/socket";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

export interface ChatPanelProps {
  roomId: string;
  className?: string;
}

export function ChatPanel({ roomId, className }: ChatPanelProps) {
  const { socket } = useSocket();
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = socket ?? socketClient.getSocket();
    if (!s?.connected) return;

    const onMsg = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    s.on("chat-message", onMsg);
    return () => {
      s.off("chat-message", onMsg);
    };
  }, [socket, roomId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    const s = socket ?? socketClient.getSocket();
    if (!s?.connected) return;
    s.emit("send-message", roomId, text);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card
      className={cn(
        "flex h-[500px] flex-col border-zinc-800 bg-zinc-900/90",
        className
      )}
    >
      <CardHeader className="shrink-0 border-b border-zinc-800 py-3">
        <CardTitle className="text-base text-white">Table chat</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-0 p-0">
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm"
        >
          {messages.length === 0 ? (
            <p className="text-center text-zinc-500">No messages yet.</p>
          ) : (
            messages.map((m, i) => {
              const mine = user?.id === m.playerId;
              return (
                <div
                  key={`${m.timestamp}-${i}`}
                  className={cn(
                    "rounded-md px-2 py-1.5",
                    mine ? "bg-emerald-900/40" : "bg-zinc-800/50"
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={cn(
                        "font-medium",
                        mine ? "text-emerald-300" : "text-white/90"
                      )}
                    >
                      {m.username}
                    </span>
                    <span className="shrink-0 text-[10px] text-zinc-500">
                      {formatTime(m.timestamp)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-zinc-200">{m.text}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-zinc-800 p-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message…"
            className="border-zinc-700 bg-zinc-950"
            autoComplete="off"
          />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label="Send message"
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
