"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = socket ?? socketClient.getSocket();
    if (!s?.connected) return;

    const onMsg = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    s.on("chat-message", onMsg);
    return () => {
      s.off("chat-message", onMsg);
    };
  }, [socket, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = inputValue.trim();
    if (!text) return;
    const s = socket ?? socketClient.getSocket();
    s?.emit("send-message", roomId, text);
    setInputValue("");
  }

  return (
    <Card className={cn("flex h-[min(70vh,420px)] flex-col border-zinc-800 bg-zinc-900/90", className)}>
      <CardHeader className="shrink-0 space-y-0 border-b border-zinc-800 py-3">
        <CardTitle className="text-base text-white">Table chat</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-0 p-0">
        <ScrollArea className="min-h-0 flex-1 px-3">
          <div className="space-y-2 py-3 pr-3 text-sm">
            {messages.length === 0 ? (
              <p className="text-zinc-500">No messages yet.</p>
            ) : (
              messages.map((m, i) => {
                const mine = user?.id === m.playerId;
                return (
                  <div
                    key={`${m.timestamp}-${i}`}
                    className={cn(
                      "rounded-md px-2 py-1",
                      mine ? "bg-emerald-900/40" : "bg-zinc-800/50"
                    )}
                  >
                    <span
                      className={cn(
                        "font-medium",
                        mine ? "text-emerald-300" : "text-white/90"
                      )}
                    >
                      {m.username}:{" "}
                    </span>
                    <span className="text-zinc-200">{m.text}</span>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
        <form
          className="flex shrink-0 gap-2 border-t border-zinc-800 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Message…"
            className="border-zinc-700 bg-zinc-950"
            autoComplete="off"
          />
          <Button type="submit" size="icon" variant="secondary" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
