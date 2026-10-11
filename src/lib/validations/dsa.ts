import { z } from "zod";

export const difficulties = ["EASY", "MEDIUM", "HARD"] as const;
export const problemStatuses = ["TODO", "ATTEMPTED", "SOLVED", "REVISIT"] as const;

export const dsaSchema = z.object({
  title: z.string().min(2, "Title is required").max(150),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  difficulty: z.enum(difficulties),
  status: z.enum(problemStatuses),
  topicTags: z.string().optional(), // comma-separated
  notes: z.string().max(2000).optional(),
  timeSpent: z.coerce.number().min(0).max(600).optional(),
});

export type DsaFormValues = z.infer<typeof dsaSchema>;
