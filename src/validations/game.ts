import { z } from "zod";

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, "Room name must be at least 3 characters")
    .max(32, "Room name must be at most 32 characters"),
  maxPlayers: z.number().int().min(2).max(8).default(6),
  ante: z.number().int().min(1).default(5),
  bringIn: z.number().int().min(1).default(10),
  smallBet: z.number().int().min(1).default(20),
  bigBet: z.number().int().min(1).default(40),
  isPrivate: z.boolean().default(false),
  password: z.string().optional(),
});

export const gameActionSchema = z.object({
  action: z.enum(["fold", "check", "call", "bet", "raise"]),
  amount: z.number().int().min(0).optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type GameActionInput = z.infer<typeof gameActionSchema>;
