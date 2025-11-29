import { z } from "zod";

export const entrySchema = z.object({
    text: z.string().min(5, "Tell me a little more about your day."),
    gardenType: z.enum(["CLASSIC", "UNDERWATER", "GALAXY"]),
});

export type EntryForm = z.infer<typeof entrySchema>;
