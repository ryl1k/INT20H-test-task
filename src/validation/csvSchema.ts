import { z } from "zod";

export const csvRowSchema = z.object({
  id: z.coerce.number().int().positive(),
  longitude: z.coerce.number().min(-180).max(180),
  latitude: z.coerce.number().min(-90).max(90),
  timestamp: z.string().min(1, "Timestamp is required"),
  subtotal: z.coerce.number().min(0.01, "Subtotal must be positive")
});

export type CsvRowParsed = z.infer<typeof csvRowSchema>;
