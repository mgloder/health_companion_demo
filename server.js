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
import OpenAI from 'openai';
import { readFile } from 'fs/promises';

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

// Initialize OpenAI client once
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 seconds timeout
  maxRetries: 3,  // Retry failed requests up to 3 times
  fetch: async (url, options) => {
    try {
      logger.debug({
        msg: 'Making OpenAI API request',
        url,
        method: options.method,
        timeout: options.timeout
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url, { 
        ...options, 
        dispatcher,
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        logger.error({
          msg: 'OpenAI API error response',
          status: response.status,
          statusText: response.statusText,
          url,
          responseBody: await response.text()
        });
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
      
      logger.debug({
        msg: 'OpenAI API request successful',
        status: response.status
      });
      
      return response;
    } catch (error) {
      logger.error({
        msg: 'OpenAI API fetch error',
        error: error.message,
        stack: error.stack,
        url,
        isTimeout: error.name === 'AbortError'
      });

      // Add delay between retries
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      throw error;
    }
  }
});

logger.info("OpenAI client initialized");

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

// In-memory storage for embeddings
const embeddingsStore = new Map();

// Add these helper functions at the top
function chunkText(text, maxTokens = 5000) {  // Using 5000 tokens ~ 20000 chars
  const chunks = [];
  
  // Approximate page size (2000 chars)
  const pageSize = maxTokens * 1.8;  // tokens * buffer
  
  // Split text into paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  
  for (const paragraph of paragraphs) {
    // If paragraph is smaller than page size, treat normally
    if (paragraph.length <= pageSize) {
      if (chunks.length === 0 || (chunks[chunks.length - 1].length + paragraph.length > pageSize)) {
        chunks.push(paragraph);
      } else {
        chunks[chunks.length - 1] += '\n\n' + paragraph;
      }
    } else {
      // For large paragraphs, split into sentences
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      
      for (const sentence of sentences) {
        // If sentence is smaller than page size, treat normally
        if (sentence.length <= pageSize) {
          if (chunks.length === 0 || (chunks[chunks.length - 1].length + sentence.length > pageSize)) {
            chunks.push(sentence.trim());
          } else {
            chunks[chunks.length - 1] += ' ' + sentence.trim();
          }
        } else {
          // For large sentences, split into words
          const words = sentence.split(/\s+/);
          let currentChunk = '';
          
          for (const word of words) {
            if (currentChunk.length + word.length + 1 > pageSize) {
              if (currentChunk) {
                chunks.push(currentChunk.trim());
              }
              currentChunk = word;
            } else {
              currentChunk += (currentChunk ? ' ' : '') + word;
            }
          }
          
          if (currentChunk) {
            if (chunks.length === 0 || (chunks[chunks.length - 1].length + currentChunk.length > pageSize)) {
              chunks.push(currentChunk.trim());
            } else {
              chunks[chunks.length - 1] += ' ' + currentChunk.trim();
            }
          }
        }
      }
    }
  }

  logger.debug({
    msg: 'Text chunking details',
    totalChunks: chunks.length,
    chunkSizes: chunks.map(chunk => ({
      chars: chunk.length,
      preview: chunk.substring(0, 100) + '...'
    }))
  });

  return chunks;
}

server.post('/api/upload', async (request, reply) => {
  try {
    const bb = busboy({ headers: request.headers });
    const uploadDir = path.join(__dirname, 'uploads');
    const uploadedFiles = [];
    const processingPromises = []; 
    const HARDCODED_KEY = 1;  // Hardcoded key for embeddings store
    
    logger.info({
      msg: 'Starting file upload process',
      uploadDir,
      storeKey: HARDCODED_KEY
    });

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });
    logger.debug(`Upload directory ensured: ${uploadDir}`);

    // Handle file upload
    bb.on('file', async (name, file, info) => {
      const filename = info.filename;
      const filepath = path.join(uploadDir, filename);
      
      const processPromise = (async () => {
        try {
          logger.debug(`Saving file to disk: ${filepath}`);
          await pipeline(
            file,
            createWriteStream(filepath)
          );
          
          const fileContent = await readFile(filepath, 'utf-8');
          const chunks = chunkText(fileContent);
          
          // Get embeddings for each chunk
          const embeddings = [];
          for (let i = 0; i < chunks.length; i++) {
            logger.debug({
              msg: 'Processing chunk',
              filename,
              chunkIndex: i,
              chunkSize: chunks[i].length,
              preview: chunks[i].substring(0, 100) + '...'
            });

            const embeddingResponse = await openai.embeddings.create({
              model: "text-embedding-3-small",
              input: chunks[i],
            });

            embeddings.push({
              chunk: chunks[i],
              embedding: embeddingResponse.data[0].embedding,
              chunkIndex: i
            });

            logger.debug({
              msg: 'Chunk embedded successfully',
              filename,
              chunkIndex: i,
              embeddingLength: embeddingResponse.data[0].embedding.length
            });
          }

          const fileInfo = {
            filename,
            filepath,
            mimetype: info.mimeType,
            encoding: info.encoding,
            chunks: embeddings
          };

          // Store file info in session
          if (!request.session.uploadedFiles) {
            request.session.uploadedFiles = [];
          }
          request.session.uploadedFiles.push(fileInfo);
          uploadedFiles.push(fileInfo);

          // Use hardcoded key for embeddings store
          if (!embeddingsStore.has(HARDCODED_KEY)) {
            embeddingsStore.set(HARDCODED_KEY, []);
          }
          embeddingsStore.get(HARDCODED_KEY).push({
            filename,
            chunks: embeddings
          });

          logger.info({
            msg: 'File processed and embedded successfully',
            filename,
            storeKey: HARDCODED_KEY,
            numberOfChunks: chunks.length
          });
          
        } catch (err) {
          logger.error({
            msg: 'Error processing file',
            filename,
            error: err.message,
            stack: err.stack
          });
          throw err;
        }
      })();

      processingPromises.push(processPromise);
    });

    // Handle end of upload
    const uploadPromise = new Promise((resolve, reject) => {
      bb.on('finish', resolve);
      bb.on('error', reject);
    });

    // Pipe request to busboy
    request.raw.pipe(bb);
    
    // Wait for upload to complete
    await uploadPromise;
    
    // Wait for all file processing to complete
    await Promise.all(processingPromises);
    
    // Save session after all processing is complete
    await request.session.save();

    logger.info({
      msg: 'All files processed successfully',
      storeKey: HARDCODED_KEY,
      totalFiles: uploadedFiles.length,
      embeddingsStored: embeddingsStore.get(HARDCODED_KEY)?.length || 0
    });

    return {
      success: true,
      message: `Successfully uploaded and processed ${uploadedFiles.length} files`,
      files: uploadedFiles.map(({ filename, mimetype }) => ({
        filename,
        mimetype
      }))
    };

  } catch (error) {
    logger.error({
      msg: "Upload process failed",
      error: error.message,
      stack: error.stack
    });
    reply.code(500).send({ 
      success: false,
      error: "Failed to upload files",
      details: error.message 
    });
  }
});

// Update the embeddings endpoint to use hardcoded key
server.get('/api/embeddings', async (request, reply) => {
  const HARDCODED_KEY = 1;
  const embeddings = embeddingsStore.get(HARDCODED_KEY);
  
  if (!embeddings) {
    reply.code(404).send({
      success: false,
      error: 'No embeddings found'
    });
    return;
  }

  return {
    success: true,
    embeddings: embeddings
  };
});

// Add this proxy configuration before any routes
server.addHook('onRequest', (request, reply, done) => {
  if (process.env.NODE_ENV === 'production') {
    request.raw.ip = request.headers['x-forwarded-for'] || request.raw.ip;
    request.raw.protocol = 'https';
  }
  done();
});

// Add this helper function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Add search API endpoint
server.post('/api/search', async (request, reply) => {
  try {
    const { query } = request.body;
    const HARDCODED_KEY = 1;
    
    logger.info({
      msg: 'Processing search request',
      query,
      storeKey: HARDCODED_KEY
    });

    const storedEmbeddings = embeddingsStore.get(HARDCODED_KEY);
    if (!storedEmbeddings) {
      logger.warn('No embeddings found in store');
      return {
        success: false,
        error: 'No documents available for search'
      };
    }

    // Step 1: Use GPT to identify relevant files


    const fileList = storedEmbeddings.map(file => file.filename).join('\n');
    
    const fileSelectionResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that identifies the most relevant files for a query. Respond only with the filenames, separated by commas, in order of relevance. Maximum 3 files."
        },
        {
          role: "user",
          content: `Available files:\n${fileList}\n\nQuery: ${query}\n\nWhich files are most relevant to this query? List only filenames, separated by commas.`
        }
      ],
      temperature: 0.3,
    });

    const relevantFiles = fileSelectionResponse.choices[0].message.content
      .split(',')
      .map(filename => filename.trim())
      .filter(filename => storedEmbeddings.some(f => f.filename === filename))
      .slice(0, 3);

    logger.debug({
      msg: 'GPT selected relevant files',
      files: relevantFiles
    });

    // Step 2: Get embeddings for the query
    const queryEmbedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    // Step 3: Find the most relevant chunks from selected files
    const relevantChunks = [];
    
    for (const filename of relevantFiles) {
      const file = storedEmbeddings.find(f => f.filename === filename);
      if (!file) continue;

      // Get chunk similarities for this file
      const chunkSimilarities = file.chunks.map(chunk => ({
        filename: file.filename,
        chunk: chunk.chunk,
        chunkIndex: chunk.chunkIndex,
        similarity: cosineSimilarity(chunk.embedding, queryEmbedding.data[0].embedding)
      }));

      // Get top 3 chunks from this file
      const topChunks = chunkSimilarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

      relevantChunks.push(...topChunks);
    }

    // Sort all chunks by similarity and get top 3 overall
    const finalResults = relevantChunks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    logger.info({
      msg: 'Search completed successfully',
      query,
      selectedFiles: relevantFiles,
      numResults: finalResults.length,
      topScores: finalResults.map(r => r.similarity)
    });

    return {
      success: true,
      results: finalResults.map(result => ({
        filename: result.filename,
        chunk: result.chunk,
        similarity: result.similarity,
        chunkIndex: result.chunkIndex
      }))
    };

  } catch (error) {
    logger.error({
      msg: 'Search failed',
      error: error.message,
      stack: error.stack
    });

    reply.code(500).send({
      success: false,
      error: 'Search failed',
      details: error.message
    });
  }
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
