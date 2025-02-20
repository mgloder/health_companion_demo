import { pipeline } from 'stream/promises';
import { createWriteStream, readFileSync } from 'fs';
import { unlink, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { chunkText } from '../utils/text.js';
import { saveDataToFiles } from '../utils/storage.js';
import { embeddingsStore, HARDCODED_KEY } from '../utils/store.js';
import { openai } from '../utils/openai.js';
import pdf from "pdf-parse/lib/pdf-parse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function registerUploadRoutes(server) {
  server.post('/api/upload', async (request, reply) => {
    try {
      const uploadDir = path.join(__dirname, '..', 'uploads');
      // Ensure upload directory exists
      await mkdir(uploadDir, { recursive: true });

      const pdfFile = await request.file();
      const filename = pdfFile.filename;
      const filepath = path.join(uploadDir, filename);

      try {
        request.log.debug(`Saving file to disk: ${filepath}`);
        await pipeline(
          pdfFile.file,
          createWriteStream(filepath)
        );

        // 读取 PDF 文件内容
        const dataBuffer = readFileSync(filepath);
        // 解析 PDF 文件
        const pdfData = await pdf(dataBuffer);

        const fileContent = pdfData.text;
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

          const embeddingResponse = await openai.createEmbedding({
            model: "text-embedding-3-small",
            input: chunks[i],
          });

          embeddings.push({
            chunk: chunks[i],
            embedding: embeddingResponse,
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
          error: err.message,
          stack: err.stack
        });
        throw err;
      }

      // Save to disk
      await saveDataToFiles(embeddingsStore.get(HARDCODED_KEY));

      return {
        success: true,
        message: `Successfully uploaded and processed ${filename} files`,
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
