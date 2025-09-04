import { z } from "zod";

export const entrySchema = z.object({
  text: z.string().min(5, "Tell me a little more about your day."),
  // Accept a URL, allow empty string which becomes undefined
  songUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type EntryForm = z.infer<typeof entrySchema>;
