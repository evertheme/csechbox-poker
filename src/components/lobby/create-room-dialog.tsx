"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/hooks/use-socket";
import { createRoomSchema, type CreateRoomInput } from "@/validations/game";

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const socket = useSocket();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoomInput>({ resolver: zodResolver(createRoomSchema) });

  function onSubmit(data: CreateRoomInput) {
    socket.emit("room:create", data.name, data);
    reset();
    setOpen(false);
  }

  return (
    <>
      <Button variant="poker" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New Room
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Create Room">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            placeholder="Room name"
            error={errors.name?.message}
            {...register("name")}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Ante"
              error={errors.ante?.message}
              {...register("ante", { valueAsNumber: true })}
            />
            <Input
              type="number"
              placeholder="Max players"
              error={errors.maxPlayers?.message}
              {...register("maxPlayers", { valueAsNumber: true })}
            />
          </div>
          <Button type="submit" variant="poker" disabled={isSubmitting} className="w-full">
            Create Room
          </Button>
        </form>
      </Dialog>
    </>
  );
}
