import { z } from "zod";

export const gameConfigSchema = z.object({
  maxPlayers: z.number().int().min(2).max(8).default(6),
  minPlayers: z.number().int().min(2).max(8).default(2),
  ante: z.number().int().min(1).default(5),
  bringIn: z.number().int().min(1).default(10),
  smallBet: z.number().int().min(1).default(20),
  bigBet: z.number().int().min(1).default(40),
  buyIn: z.number().int().min(1).default(500),
  timeLimit: z.number().int().min(10).max(120).default(30),
});

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, "Room name must be at least 3 characters")
    .max(32, "Room name must be at most 32 characters"),
  isPrivate: z.boolean().default(false),
  password: z.string().optional(),
  config: gameConfigSchema,
});

export const gameActionSchema = z.object({
  action: z.enum(["fold", "check", "call", "bet", "raise", "all-in"]),
  amount: z.number().int().min(0).optional(),
});

export type GameConfigInput = z.infer<typeof gameConfigSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type GameActionInput = z.infer<typeof gameActionSchema>;
