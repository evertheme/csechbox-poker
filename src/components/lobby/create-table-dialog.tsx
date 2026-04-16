"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSocket } from "@/hooks/use-socket";
import { socketClient } from "@/lib/socket";
import { useLobbyStore } from "@/store/lobby-store";
import type { CreateTablePayload } from "@/types/socket";

/** Full form shape (all fields required for controlled inputs). */
interface CreateTableFormState {
  name: string;
  maxPlayers: number;
  minPlayers: number;
  ante: number;
  bringIn: number;
  smallBet: number;
  bigBet: number;
  buyIn: number;
  timeLimit: number;
}

const defaultForm: CreateTableFormState = {
  name: "",
  maxPlayers: 8,
  minPlayers: 2,
  ante: 10,
  bringIn: 5,
  smallBet: 10,
  bigBet: 20,
  buyIn: 1000,
  timeLimit: 30,
};

export function CreateTableDialog() {
  const router = useRouter();
  const { socket } = useSocket();
  const isOpen = useLobbyStore((s) => s.isCreateGameOpen);
  const setCreateGameOpen = useLobbyStore((s) => s.setCreateGameOpen);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTableFormState>(defaultForm);

  function updateField<K extends keyof CreateTableFormState>(key: K, value: CreateTableFormState[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleNumber<K extends keyof CreateTableFormState>(key: K, raw: string) {
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    setFormData((prev) => ({ ...prev, [key]: n as CreateTableFormState[K] }));
  }

  const handleCreate = () => {
    const s = socket ?? socketClient.getSocket();
    if (!s?.connected) {
      toast.error("Connection error", {
        description: "Not connected to server",
      });
      return;
    }

    const name = formData.name.trim();
    if (!name) {
      toast.error("Invalid name", {
        description: "Please enter a table name",
      });
      return;
    }

    if (formData.minPlayers < 2 || formData.maxPlayers < formData.minPlayers) {
      toast.error("Invalid players", {
        description: "Min players must be at least 2 and not exceed max players.",
      });
      return;
    }

    const payload: CreateTablePayload = {
      name,
      maxPlayers: formData.maxPlayers,
      minPlayers: formData.minPlayers,
      ante: formData.ante,
      bringIn: formData.bringIn,
      smallBet: formData.smallBet,
      bigBet: formData.bigBet,
      buyIn: formData.buyIn,
      timeLimit: formData.timeLimit,
    };

    setIsLoading(true);

    s.emit("create-table", payload, (response) => {
      if (response instanceof Error) {
        setIsLoading(false);
        toast.error("Failed to create table", {
          description: response.message,
        });
        return;
      }
      if (!response) {
        setIsLoading(false);
        toast.error("Failed to create table", {
          description: "No response from server",
        });
        return;
      }
      if (!response.success) {
        setIsLoading(false);
        toast.error("Failed to create table", {
          description: response.error,
        });
        return;
      }

      const { tableId } = response;

      toast.success("Table ready", {
        description: `Table ${tableId} — joining…`,
      });
      setCreateGameOpen(false);

      s.emit("join-table", tableId, (joinResponse) => {
        setIsLoading(false);
        if (joinResponse instanceof Error) {
          toast.error("Could not join table", {
            description: joinResponse.message,
          });
          return;
        }
        if (!joinResponse) {
          toast.error("Could not join table", {
            description: "No response from server",
          });
          return;
        }
        if (joinResponse.success) {
          router.push(`/game/${tableId}`);
        } else {
          toast.error("Could not join table", {
            description: joinResponse.error,
          });
        }
      });
    });
  };

  const handleOpenChange = (open: boolean) => {
    setCreateGameOpen(open);
    if (open) {
      setIsLoading(false);
    } else {
      setFormData(defaultForm);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">Create a game</DialogTitle>
          <DialogDescription>
            Configure the table. Others can join from the lobby until the table is full.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[min(70vh,520px)] gap-4 overflow-y-auto py-4 pr-1">
          <div className="grid gap-2">
            <Label htmlFor="table-name">Table name</Label>
            <Input
              id="table-name"
              autoComplete="off"
              placeholder="Friday night stud"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="min-players">Min players</Label>
              <Input
                id="min-players"
                type="number"
                min={2}
                max={8}
                value={formData.minPlayers}
                onChange={(e) => handleNumber("minPlayers", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-players">Max players</Label>
              <Input
                id="max-players"
                type="number"
                min={2}
                max={8}
                value={formData.maxPlayers}
                onChange={(e) => handleNumber("maxPlayers", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="ante">Ante</Label>
              <Input
                id="ante"
                type="number"
                min={1}
                value={formData.ante}
                onChange={(e) => handleNumber("ante", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bring-in">Bring-in</Label>
              <Input
                id="bring-in"
                type="number"
                min={1}
                value={formData.bringIn}
                onChange={(e) => handleNumber("bringIn", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="small-bet">Small bet</Label>
              <Input
                id="small-bet"
                type="number"
                min={1}
                value={formData.smallBet}
                onChange={(e) => handleNumber("smallBet", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="big-bet">Big bet</Label>
              <Input
                id="big-bet"
                type="number"
                min={1}
                value={formData.bigBet}
                onChange={(e) => handleNumber("bigBet", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="buy-in">Buy-in</Label>
              <Input
                id="buy-in"
                type="number"
                min={1}
                value={formData.buyIn}
                onChange={(e) => handleNumber("buyIn", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time-limit">Time limit (seconds)</Label>
              <Input
                id="time-limit"
                type="number"
                min={10}
                max={120}
                value={formData.timeLimit}
                onChange={(e) => handleNumber("timeLimit", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="poker" onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating…" : "Create game"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
