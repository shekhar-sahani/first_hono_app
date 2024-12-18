import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { openAPISpecs } from "hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { db } from "./db/index"; // Drizzle database connection
import { users } from "./db/schema"; // Drizzle schema
import * as v from "valibot";

const app = new Hono();

app.get("/");

// Validation schemas with Valibot
const userSchema = v.object({
  name: v.string(),
  age: v.number(),
});

const userResponseSchema = v.array(
  v.object({
    id: v.number(),
    name: v.string(),
    age: v.number(),
  })
);

app.get("/", (c) => {
  return c.html(`
    <html>
      <head>
        <title>Hono API Documentation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            color: #333;
            padding: 20px;
          }
          h1 {
            color: #007bff;
          }
          .content {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          h2 {
            color: #28a745;
          }
          a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
          }
          .link-container {
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="content">
          <h1>Welcome to the Hono API</h1>
          <p>Explore the Hono + Drizzle API for managing users and more.</p>
          
          <h2>Available Endpoints</h2>
          <ul>
            <li><strong>GET /users</strong> - Fetch all users</li>
            <li><strong>POST /users</strong> - Create a new user</li>
            <li><strong>GET /openapi</strong> - View OpenAPI spec</li>
            <li><strong>GET /docs</strong> - Interactive API Documentation powered by Scalar</li>
          </ul>

          <div class="link-container">
            <p>Start exploring the API:</p>
            <ul>
              <li><a href="/docs" target="_blank">API Docs (Scalar)</a></li>
              <li><a href="/openapi" target="_blank">OpenAPI Spec</a></li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Fetch all users
app.get(
  "/users",
  describeRoute({
    summary: "Fetch users",
    description: "Retrieve all users from the database.",
    responses: {
      200: {
        description: "List of users",
        content: {
          "application/json": {
            schema: userResponseSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const allUsers = await db.select().from(users);
    return c.json(allUsers);
  }
);

// Create a user
app.post(
  "/users",
  describeRoute({
    summary: "Create a user",
    description: "Add a new user to the database.",
    requestBody: {
      content: {
        "application/json": {
          schema: userSchema,
        },
      },
    },
    responses: {
      201: {
        description: "User created successfully",
        content: {
          "application/json": {
            schema: userSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const body = await c.req.json();
    const { name, age } = body;

    if (!name || !age) {
      return c.json({ error: "Name and age are required" }, 400);
    }

    const newUser = await db.insert(users).values({ name, age }).returning();
    return c.json(newUser, 201);
  }
);

// OpenAPI Spec Generation
app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Hono API with Scalar",
        version: "1.0.0",
        description: "API for managing users using Hono + Drizzle.",
      },
      servers: [{ url: "http://localhost:3000", description: "Local Server" }],
    },
  })
);

// Scalar API Reference
app.get(
  "/docs",
  apiReference({
    theme: "saturn", // Choose a theme: 'saturn' or 'matrix'
    spec: { url: "/openapi" }, // Point Scalar to the OpenAPI spec route
  })
);

export default app;
