import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import fastifyEnv from "@fastify/env";
import FastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { ProxyAgent } from "undici";

const dispatcher = new ProxyAgent("http://127.0.0.1:7890");

// Fastify + React + Vite configuration
const server = Fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
});

const schema = {
  type: "object",
  required: ["OPENAI_API_KEY"],
  properties: {
    OPENAI_API_KEY: {
      type: "string",
    },
  },
};

// Register static file serving first
await server.register(FastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/public/",
  decorateReply: false, // Important: prevents route conflicts
});

// Then register environment variables
await server.register(fastifyEnv, { dotenv: true, schema });

// Finally register Vite
await server.register(FastifyVite, {
  root: import.meta.url,
  renderer: "@fastify/react",
  dev: process.env.NODE_ENV !== "production",
});

await server.vite.ready();

// Server-side API route to return an ephemeral realtime session token
server.get("/token", async () => {
  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    // Using http proxy agent when node env is dev
    dispatcher: process.env.NODE_ENV !== "production" ? dispatcher : null,
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "coral",
    }),
  });

  return new Response(r.body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
});

await server.listen({
  port: process.env.PORT || 3000,
  host: "0.0.0.0",
});
