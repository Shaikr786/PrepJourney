import { z } from "zod";

export const confidenceLevels = [
  "LEARNING",
  "PRACTICED",
  "REVISION",
  "INTERVIEW_READY",
] as const;

export const categories = [
  "JAVA",
  "DSA",
  "DBMS",
  "OS",
  "SYSTEM_DESIGN",
  "NETWORKING",
  "BEHAVIORAL",
  "CAREER",
  "EXAM",
  "SOFT_SKILLS",
  "PROJECT",
  "OTHER",
] as const;

export const sessionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  topic: z.string().min(2, "Topic is required").max(100),
  category: z.enum(categories),
  date: z.string().min(1, "Date is required"),
  durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute").max(600),
  conceptsCovered: z.string().optional(),
  practiceNotes: z.string().max(2000).optional(),
  keyTakeaway: z.string().max(1000).optional(),
  confidence: z.enum(confidenceLevels),
  revisionNeeded: z.coerce.boolean().default(false),
  nextStep: z.string().max(300).optional(),
});

export type SessionFormValues = z.infer<typeof sessionSchema>;
