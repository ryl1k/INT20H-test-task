import { z } from "zod";

const NY_LAT_MIN = 40.4;
const NY_LAT_MAX = 45.1;
const NY_LON_MIN = -79.8;
const NY_LON_MAX = -71.8;

export const createOrderSchema = z.object({
  latitude: z
    .number({ error: "Latitude is required" })
    .min(NY_LAT_MIN, `Latitude must be at least ${NY_LAT_MIN} (NY State)`)
    .max(NY_LAT_MAX, `Latitude must be at most ${NY_LAT_MAX} (NY State)`),
  longitude: z
    .number({ error: "Longitude is required" })
    .min(NY_LON_MIN, `Longitude must be at least ${NY_LON_MIN} (NY State)`)
    .max(NY_LON_MAX, `Longitude must be at most ${NY_LON_MAX} (NY State)`),
  subtotal: z
    .number({ error: "Subtotal is required" })
    .min(0.01, "Subtotal must be greater than 0")
    .max(10000, "Subtotal must be at most $10,000")
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
