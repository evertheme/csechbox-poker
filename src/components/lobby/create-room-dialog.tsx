"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import type { CreateRoomPayload } from "@/types/socket";

/** Full form shape (all fields required for controlled inputs). */
interface CreateRoomFormState {
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

const defaultForm: CreateRoomFormState = {
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

export function CreateRoomDialog() {
  const router = useRouter();
  const { socket } = useSocket();
  const isCreatingRoom = useLobbyStore((s) => s.isCreatingRoom);
  const setIsCreatingRoom = useLobbyStore((s) => s.setIsCreatingRoom);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRoomFormState>(defaultForm);

  function updateField<K extends keyof CreateRoomFormState>(key: K, value: CreateRoomFormState[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleNumber<K extends keyof CreateRoomFormState>(key: K, raw: string) {
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) return;
    setFormData((prev) => ({ ...prev, [key]: n as CreateRoomFormState[K] }));
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
        description: "Please enter a room name",
      });
      return;
    }

    if (formData.minPlayers < 2 || formData.maxPlayers < formData.minPlayers) {
      toast.error("Invalid players", {
        description: "Min players must be at least 2 and not exceed max players.",
      });
      return;
    }

    const payload: CreateRoomPayload = {
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

    s.emit("create-room", payload, (response) => {
      if (!response.success) {
        setIsLoading(false);
        toast.error("Failed to create room", {
          description: response.error,
        });
        return;
      }

      toast.success("Room created!", {
        description: `Room ${response.roomId} is ready`,
      });
      setIsCreatingRoom(false);

      s.emit("join-room", response.roomId, (joinResponse) => {
        setIsLoading(false);
        if (joinResponse.success) {
          router.push(`/game/${response.roomId}`);
        } else {
          toast.error("Could not join room", {
            description: joinResponse.error,
          });
        }
      });
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsCreatingRoom(open);
    if (open) {
      setIsLoading(false);
    } else {
      setFormData(defaultForm);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="poker" size="sm" type="button" onClick={() => handleOpenChange(true)}>
        <Plus className="h-4 w-4" />
        New room
      </Button>
      <Dialog open={isCreatingRoom} onOpenChange={handleOpenChange}>
        <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-white">Create new room</DialogTitle>
            <DialogDescription>Set up your poker room configuration.</DialogDescription>
          </DialogHeader>

          <div className="grid max-h-[min(70vh,520px)] gap-4 overflow-y-auto py-4 pr-1">
            <div className="grid gap-2">
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
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
              {isLoading ? "Creating…" : "Create room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
