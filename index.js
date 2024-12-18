import app from "./src/app";

Bun.serve({
  port: 3000, // Specify the port
  fetch: app.fetch, // Use Hono's fetch handler
});

console.log("Server running at http://localhost:3000");
