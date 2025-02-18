import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { unlink, mkdir, readFile } from 'fs/promises';
import path from 'path';
import busboy from 'busboy';
import { fileURLToPath } from 'url';
import { chunkText } from '../utils/text.js';
import { saveDataToFiles } from '../utils/storage.js';
import { embeddingsStore, HARDCODED_KEY } from '../utils/store.js';
import { openai } from '../utils/openai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function registerUploadRoutes(server) {
  server.post('/api/upload', async (request, reply) => {
    try {
      const bb = busboy({ headers: request.headers });
      const uploadDir = path.join(__dirname, '..', 'uploads');
      const uploadedFiles = [];
      const processingPromises = [];

      // Ensure upload directory exists
      await mkdir(uploadDir, { recursive: true });

      bb.on('file', async (name, file, info) => {
        const filename = info.filename;
        const filepath = path.join(uploadDir, filename);

        const processPromise = (async () => {
          try {
            request.log.debug(`Saving file to disk: ${filepath}`);
            await pipeline(
              file,
              createWriteStream(filepath)
            );

            const fileContent = await readFile(filepath, 'utf-8');
            const chunks = chunkText(fileContent);

            // Get embeddings for each chunk
            const embeddings = [];
            for (let i = 0; i < chunks.length; i++) {
              request.log.debug({
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
            }

            // Store embeddings with duplicate handling
            if (!embeddingsStore.has(HARDCODED_KEY)) {
              embeddingsStore.set(HARDCODED_KEY, []);
            }
            
            // Remove existing file data if it exists
            const currentData = embeddingsStore.get(HARDCODED_KEY);
            const fileIndex = currentData.findIndex(f => f.filename === filename);
            if (fileIndex !== -1) {
              currentData.splice(fileIndex, 1);
            }
            
            // Add new file data
            currentData.push({
              filename,
              chunks: embeddings
            });

            uploadedFiles.push({
              filename,
              mimetype: info.mimeType
            });

            // Clean up uploaded file
            try {
              await unlink(filepath);
            } catch (unlinkError) {
              request.log.warn({
                msg: 'Failed to clean up temporary file',
                filepath,
                error: unlinkError.message
              });
            }

          } catch (err) {
            request.log.error({
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

      const uploadPromise = new Promise((resolve, reject) => {
        bb.on('finish', resolve);
        bb.on('error', reject);
      });

      request.raw.pipe(bb);
      await uploadPromise;
      await Promise.all(processingPromises);

      // Save to disk
      await saveDataToFiles(embeddingsStore.get(HARDCODED_KEY));

      return {
        success: true,
        message: `Successfully uploaded and processed ${uploadedFiles.length} files`,
        files: uploadedFiles
      };

    } catch (error) {
      request.log.error({
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
} 