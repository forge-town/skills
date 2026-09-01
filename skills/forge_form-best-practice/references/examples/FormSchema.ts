import { z } from "zod/v4";

// 表单对应的 Zod Schema —— 一文件一 Schema
export const MyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().int().positive().optional(),
});

export type MyFormData = z.infer<typeof MyFormSchema>;
