import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.union([z.undefined(), z.enum(["development", "production"])]),
    POSTGRES_HOST: z.union([z.undefined(), z.string()]),
    POSTGRES_PORT: z
        .string()
        .regex(/^[0-9]+$/)
        .transform((value) => parseInt(value)),
    POSTGRES_DB: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    APP_PORT: z.union([
        z.undefined(),
        z
            .string()
            .regex(/^[0-9]+$/)
            .transform((value) => parseInt(value)),
    ]),
    WB_API_TOKEN: z.union([z.undefined(), z.string()]),
    GOOGLE_SHEETS: z.union([z.undefined(), z.string()]),
    GOOGLE_EMAIL: z.union([z.undefined(), z.string()]),
    GOOGLE_PRIVATE_KEY: z.union([z.undefined(), z.string()]),
});

const env = envSchema.parse(process.env);

export default env;
