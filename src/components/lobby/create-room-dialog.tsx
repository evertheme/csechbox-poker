"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSocket } from "@/hooks/use-socket";
import { createRoomSchema, type CreateRoomInput } from "@/validations/game";

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
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
    socket?.emit(
      "room:create",
      data.name,
      { config: data.config, isPrivate: data.isPrivate, password: data.password },
      () => {}
    );
    reset();
    setOpen(false);
  }

  return (
    <>
      <Button variant="poker" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Room
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Room</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">Room name</Label>
              <Input
                id="room-name"
                aria-invalid={!!errors.name}
                placeholder="Room name"
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
                  aria-invalid={!!errors.config?.maxPlayers}
                  {...register("config.maxPlayers", { valueAsNumber: true })}
                />
                {errors.config?.maxPlayers && (
                  <p className="text-sm text-destructive">{errors.config.maxPlayers.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" variant="poker" disabled={isSubmitting} className="w-full">
              Create Room
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
