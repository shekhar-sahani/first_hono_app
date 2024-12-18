import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { openAPISpecs } from "hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { db } from "./db/index"; // Drizzle database connection
import { users } from "./db/schema"; // Drizzle schema
import * as v from "valibot";

const app = new Hono();

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
