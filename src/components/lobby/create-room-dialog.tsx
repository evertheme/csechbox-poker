"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createRoomSchema, type CreateRoomInput } from "@/validations/game";

function buildCreateRoomPayload(data: CreateRoomInput) {
  const { name, config } = data;
  return {
    name,
    maxPlayers: config.maxPlayers,
    minPlayers: config.minPlayers,
    ante: config.ante,
    bringIn: config.bringIn,
    smallBet: config.smallBet,
    bigBet: config.bigBet,
    buyIn: config.buyIn,
    timeLimit: config.timeLimit,
  };
}

export function CreateRoomDialog() {
  const router = useRouter();
  const isCreatingRoom = useLobbyStore((s) => s.isCreatingRoom);
  const setIsCreatingRoom = useLobbyStore((s) => s.setIsCreatingRoom);
  const { socket } = useSocket();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema) as Resolver<CreateRoomInput>,
    defaultValues: {
      name: "",
      isPrivate: false,
      config: {
        maxPlayers: 6,
        minPlayers: 2,
        ante: 5,
        bringIn: 10,
        smallBet: 20,
        bigBet: 40,
        buyIn: 500,
        timeLimit: 30,
      },
    },
  });

  function onSubmit(data: CreateRoomInput) {
    const s = socket ?? socketClient.getSocket();
    if (!s?.connected) {
      toast.error("Not connected", {
        description: "Connect to the server before creating a room.",
      });
      return;
    }

    const payload = buildCreateRoomPayload(data);

    s.emit("create-room", payload, (res) => {
      if (res.success) {
        toast.success("Room created", { description: res.message });
        reset();
        setIsCreatingRoom(false);
        router.push(`/game/${res.roomId}`);
      } else {
        toast.error("Could not create room", { description: res.error });
      }
    });
  }

  return (
    <>
      <Button variant="poker" size="sm" type="button" onClick={() => setIsCreatingRoom(true)}>
        <Plus className="h-4 w-4" />
        New room
      </Button>
      <Dialog open={isCreatingRoom} onOpenChange={setIsCreatingRoom}>
        <DialogContent className="border-zinc-800 bg-zinc-900 sm:max-w-md">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0">
            <DialogHeader>
              <DialogTitle className="text-white">Create room</DialogTitle>
              <DialogDescription>
                Name your table and set stakes. You will join the room after it is created.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Room name</Label>
                <Input
                  id="room-name"
                  autoComplete="off"
                  aria-invalid={!!errors.name}
                  placeholder="e.g. Friday night stud"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ante">Ante</Label>
                  <Input
                    id="ante"
                    type="number"
                    aria-invalid={!!errors.config?.ante}
                    {...register("config.ante", { valueAsNumber: true })}
                  />
                  {errors.config?.ante && (
                    <p className="text-sm text-destructive">{errors.config.ante.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-players">Max players</Label>
                  <Input
                    id="max-players"
                    type="number"
                    min={2}
                    max={8}
                    aria-invalid={!!errors.config?.maxPlayers}
                    {...register("config.maxPlayers", { valueAsNumber: true })}
                  />
                  {errors.config?.maxPlayers && (
                    <p className="text-sm text-destructive">{errors.config.maxPlayers.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="buy-in">Buy-in</Label>
                  <Input
                    id="buy-in"
                    type="number"
                    aria-invalid={!!errors.config?.buyIn}
                    {...register("config.buyIn", { valueAsNumber: true })}
                  />
                  {errors.config?.buyIn && (
                    <p className="text-sm text-destructive">{errors.config.buyIn.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="small-bet">Small bet</Label>
                  <Input
                    id="small-bet"
                    type="number"
                    aria-invalid={!!errors.config?.smallBet}
                    {...register("config.smallBet", { valueAsNumber: true })}
                  />
                  {errors.config?.smallBet && (
                    <p className="text-sm text-destructive">{errors.config.smallBet.message}</p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreatingRoom(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="poker" disabled={isSubmitting}>
                Create room
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
