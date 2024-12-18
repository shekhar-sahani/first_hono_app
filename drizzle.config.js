// drizzle.config.js
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql", // Add dialect as 'postgresql' here
  dbCredentials: {
    url: "postgresql://postgres:starlord@localhost:5432/first_hono_db",
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "starlord",
    database: "first_hono_db",
    ssl: false,
  },
});
