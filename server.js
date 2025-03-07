import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import fastifyEnv from "@fastify/env";
import FastifyStatic from "@fastify/static";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import fastifyMultipart from "@fastify/multipart";
import path from "path";
import { fileURLToPath } from "url";
import pino from "pino";
import crypto from "crypto";
import { embeddingsStore, HARDCODED_KEY } from './utils/store.js';
import { loadDataFromFiles } from './utils/storage.js';
import { registerChatRoutes } from './api/chat.js';
import { initializeOpenAI } from './utils/openai.js';

// Initialize logger
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
    },
  },
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fastify configuration
const server = Fastify({
  logger: logger,
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

// Register env plugin first
await server.register(fastifyEnv, {
  dotenv: true,
  schema
});

// Initialize OpenAI client
initializeOpenAI();

logger.info("Environment variables loaded and OpenAI client initialized");

// Then register other plugins
await server.register(FastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/public/",
  decorateReply: false,
});

await server.register(FastifyVite, {
  root: import.meta.url,
  renderer: "@fastify/react",
  dev: process.env.NODE_ENV !== "production",
});

// Session configuration
const sessionSecret = process.env.SECRET_KEY || crypto.randomBytes(32).toString('hex');

const sessionConfig = {
  secret: sessionSecret,
  cookie: {
    secure: false,  // Since we're using HTTPS on Azure
    httpOnly: true,
    maxAge: 8640000,  // 24 hours in milliseconds
    sameSite: 'strict',  // Changed to strict since it's same-origin
    path: '/',
    domain: process.env.APP_DOMAIN || 'localhost',  // Let the browser set the domain automatically
  },
  saveUninitialized: false,
  rolling: true,
  cookieName: 'sessionId'
};

await server.register(fastifyCookie);
await server.register(fastifySession, sessionConfig);

// Register multipart for file uploads
await server.register(fastifyMultipart, {
  limits: {
    fieldNameSize: 100,
    fieldSize: 100,
    fields: 10,
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1, // only allow one file upload
    headerPairs: 2000,
  },
});

logger.debug("All plugins registered");

// Register API routes
import { registerUploadRoutes } from './api/upload.js';
import { registerSearchRoutes } from './api/search.js';
import { registerEmbeddingsRoutes } from './api/embeddings.js';
import { registerTranscribeRoutes } from './api/transcribe.js';
import { registerActionRoutes } from './api/action.js';
import { searchSimilar } from "./utils/cosmos.js";

registerUploadRoutes(server);
registerSearchRoutes(server);
registerEmbeddingsRoutes(server);
registerChatRoutes(server);
registerTranscribeRoutes(server, logger)
registerActionRoutes(server)

// Load existing data when server starts
try {
  const savedData = await loadDataFromFiles();
  embeddingsStore.set(HARDCODED_KEY, savedData);
  logger.info({
    msg: 'Initialized data store from files',
    fileCount: savedData.length,
    totalChunks: savedData.reduce((sum, file) => sum + file.chunks.length, 0)
  });
} catch (error) {
  logger.warn('Failed to load data from files, starting with empty store');
  embeddingsStore.set(HARDCODED_KEY, []);
}

// Production configuration
if (process.env.NODE_ENV === 'production') {
  server.addHook('onRequest', (request, reply, done) => {
    request.raw.ip = request.headers['x-forwarded-for'] || request.raw.ip;
    request.raw.protocol = 'https';
    done();
  });
}

server.get("/token", async (request, reply) => {
  logger.info("Token request received");
  try {
    logger.debug("Generating instructions...");
    const config = await generateInstructions();

    logger.debug("Making request to OpenAI...");
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      dispatcher,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    const responseClone = r.clone();
    const bodyText = await responseClone.text();
    logger.debug("Response received:", {
      status: r.status,
      headers: Object.fromEntries(r.headers.entries()),
      body: bodyText,
    });

    return new Response(r.body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Error in token endpoint");
    throw error;
  }
});

server.get("/api-env", async (request, reply) => {
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    APP_DOMAIN: process.env.APP_DOMAIN,
  };
});

server.get('/clear-cookie', async (request, reply) => {
  logger.info("Clearing cookie");
  await request.session.destroy();
  reply
    .clearCookie('sessionId', { path: '/' })
    .send({ message: 'Cookie has been cleared' });
});

server.post("/api/test", async (request, reply) => {
  return await searchSimilar(request.body.message);
});

// Wait for Vite to be ready
await server.vite.ready();

// Start server
try {
  await server.listen({
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
  });
  logger.info(`Server is running on port ${process.env.PORT || 3000}`);
} catch (err) {
  logger.error({ err }, "Server failed to start");
  process.exit(1);
}
