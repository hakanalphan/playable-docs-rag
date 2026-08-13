import { z } from "zod"; // role enum shared by middleware, NextAuth callbacks, and UI

export const RoleSchema = z.enum(["user", "admin"]);
export type Role = z.infer<typeof RoleSchema>;

export const SessionUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: RoleSchema,
});
export type SessionUser = z.infer<typeof SessionUserSchema>;
