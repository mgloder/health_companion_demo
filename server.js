import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import fastifyEnv from "@fastify/env";
import FastifyStatic from "@fastify/static";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import path from "path";
import { fileURLToPath } from "url";
import { Agent, ProxyAgent } from "undici";
import pino from "pino";
import { generateInstructions } from "./instructionConfig.js";
import { handler as parseExerciseHandler } from "./parse-exercise.js";
import { handler as summaryCheckinHandler } from "./summary-checkin.js";
import { handler as chatHandler } from "./chat.js";
import crypto from "crypto";
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import busboy from 'busboy';

// Configure logger
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

// Initialize proxy agent
const dispatcher = process.env.NODE_ENV === 'development' && process.env.ALL_PROXY
  ? new ProxyAgent({
      uri: process.env.ALL_PROXY
    })
  : new Agent();

logger.debug({
  msg: "Proxy agent initialized",
  mode: process.env.NODE_ENV,
  proxy: process.env.ALL_PROXY || "none",
});

// Fastify + React + Vite configuration
const server = Fastify({
  logger: logger,
});
logger.info("Fastify server created");

const schema = {
  type: "object",
  required: ["OPENAI_API_KEY"],
  properties: {
    OPENAI_API_KEY: {
      type: "string",
    },
  },
};

// Register plugins with logging
logger.debug("Registering static files plugin...");
await server.register(FastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/public/",
  decorateReply: false,
});
logger.debug("Static files plugin registered");

logger.debug("Registering env plugin...");
await server.register(fastifyEnv, { dotenv: true, schema });
logger.debug("Env plugin registered");

logger.debug("Registering Vite plugin...");
await server.register(FastifyVite, {
  root: import.meta.url,
  renderer: "@fastify/react",
  dev: process.env.NODE_ENV !== "production",
});
logger.debug("Vite plugin registered");

// Add this before fastify session registration
const sessionSecret = process.env.SECRET_KEY || crypto.randomBytes(32).toString('hex');
logger.debug("Session secret initialized");

await server.register(fastifyCookie);
await server.register(fastifySession, {
  secret: sessionSecret,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 86400,
    sameSite: 'lax',
    domain: process.env.APP_DOMAIN || 'localhost',
    path: '/',
  },
  saveUninitialized: true,
  cookieName: 'sessionId',
});

await server.vite.ready();
logger.info("Vite is ready");

server.get("/api-env", async (request, reply) => {
  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  };
});

// Server-side API route to return an ephemeral realtime session token
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

// Add new API endpoint for exercise parsing
server.post("/api/parse-exercise", async (request, reply) => {
  logger.info("Parse exercise request received");
  try {
    logger.debug("Parsing exercise summary...");
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          reply.code(code).send(data);
        },
      }),
    };

    // Call the handler with the existing agent
    await parseExerciseHandler(
      {
        ...request,
        body: request.body,
        dispatcher,
      },
      mockRes,
    );
    logger.debug("Exercise summary parsed successfully");
  } catch (error) {
    logger.error({ err: error }, "Error parsing exercise summary");
    reply.code(500).send({ error: "Failed to parse exercise summary" });
  }
});

// Add new API endpoint for summary
server.post("/api/summary", async (request, reply) => {
  try {
    await summaryCheckinHandler(
      {
        ...request,
        body: request.body,
        dispatcher,
      },
      reply,
    );
  } catch (error) {
    logger.error({ err: error }, "Error summary checkin");
    reply.code(500).send({ error: "Failed to parse exercise summary" });
  }
});

// Chat API
server.post('/api/chat', async (request, reply) => {
  // Initialize session if it doesn't exist
  if (!request.session.id) {
    request.session.set('initialized', true);
  }
  
  const { aiMessage, type, data } = await chatHandler(request, dispatcher);
  
  // Ensure session is saved
  await request.session.save();
  
  return { message: aiMessage, type, data };
});

// Add this before the upload route
server.addContentTypeParser('multipart/form-data', (request, payload, done) => {
  done(null);
});

// File upload endpoint
server.post('/api/upload', async (request, reply) => {
  try {
    const bb = busboy({ headers: request.headers });
    const uploadDir = path.join(__dirname, 'uploads');
    const uploadedFiles = [];

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Handle file upload
    bb.on('file', async (name, file, info) => {
      const filename = info.filename;
      const filepath = path.join(uploadDir, filename);
      
      try {
        await pipeline(
          file,
          createWriteStream(filepath)
        );

        const fileInfo = {
          filename,
          filepath,
          mimetype: info.mimeType,
          encoding: info.encoding
        };

        // Store file info in session
        if (!request.session.uploadedFiles) {
          request.session.uploadedFiles = [];
        }
        request.session.uploadedFiles.push(fileInfo);
        uploadedFiles.push(fileInfo);

      } catch (err) {
        logger.error({ err }, 'Error saving file');
        throw err;
      }
    });

    // Handle end of upload
    const uploadPromise = new Promise((resolve, reject) => {
      bb.on('finish', () => resolve());
      bb.on('error', (err) => reject(err));
    });

    // Pipe request to busboy
    request.raw.pipe(bb);
    await uploadPromise;
    await request.session.save();

    return {
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} files`,
      files: uploadedFiles
    };

  } catch (error) {
    logger.error({ err: error }, "Error uploading files");
    reply.code(500).send({ 
      success: false,
      error: "Failed to upload files",
      details: error.message 
    });
  }
});

// Add this proxy configuration before any routes
server.addHook('onRequest', (request, reply, done) => {
  if (process.env.NODE_ENV === 'production') {
    request.raw.ip = request.headers['x-forwarded-for'] || request.raw.ip;
    request.raw.protocol = 'https';
  }
  done();
});

// Server startup with logging
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
