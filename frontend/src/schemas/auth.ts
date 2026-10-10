import { z } from "zod"

/** Matches POST /auth/login */
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Identifier must be at least 3 characters")
    .max(100, "Identifier must be at most 100 characters"),
  password: z
    .string()
    .min(3, "Password must be at least 3 characters")
    .max(100, "Password must be at most 100 characters"),
})

/** Matches POST /auth/register */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must be at most 100 characters"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(100, "Email must be at most 100 characters"),
  password: z
    .string()
    .min(3, "Password must be at least 3 characters")
    .max(100, "Password must be at most 100 characters"),
  role: z.enum(["user", "admin"]).default("user"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
