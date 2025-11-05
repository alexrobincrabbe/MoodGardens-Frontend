import { z } from "zod";

export const entrySchema = z.object({
    text: z.string().min(5, "Tell me a little more about your day."),
    songUrl: z
        .string()
        .url()
        .optional()
        .or(z.literal("").transform(() => undefined)),
});

export type EntryForm = z.infer<typeof entrySchema>;
