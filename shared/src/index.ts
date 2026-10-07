import { z } from 'zod';

// Auth Schemas
export const RegisterSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

// Project Schema
export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).default("NOT_STARTED"),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

// Task Schema
export const TaskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING"),
  dueDate: z.string().optional(),
  projectId: z.string().uuid("Invalid project ID")
});

// TypeScript Types inferred from Zod
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ProjectInput = z.infer<typeof ProjectSchema>;
export type TaskInput = z.infer<typeof TaskSchema>;