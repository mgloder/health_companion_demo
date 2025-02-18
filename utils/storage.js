import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
});

export async function saveDataToFiles(data) {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    await mkdir(dataDir, { recursive: true });
    
    const embeddingsPath = path.join(dataDir, 'embeddings.json');
    const contentPath = path.join(dataDir, 'content.json');
    
    const embeddingsData = data.map(file => ({
      filename: file.filename,
      chunks: file.chunks.map(chunk => ({
        chunkIndex: chunk.chunkIndex,
        embedding: chunk.embedding
      }))
    }));
    
    const contentData = data.map(file => ({
      filename: file.filename,
      chunks: file.chunks.map(chunk => ({
        chunkIndex: chunk.chunkIndex,
        content: chunk.chunk
      }))
    }));
    
    await writeFile(embeddingsPath, JSON.stringify(embeddingsData, null, 2));
    await writeFile(contentPath, JSON.stringify(contentData, null, 2));
    
    logger.info({
      msg: 'Data saved to files',
      embeddingsPath,
      contentPath,
      fileCount: data.length
    });
  } catch (error) {
    logger.error({
      msg: 'Failed to save data',
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

export async function loadDataFromFiles() {
  try {
    const embeddingsPath = path.join(__dirname, '..', 'data', 'embeddings.json');
    const contentPath = path.join(__dirname, '..', 'data', 'content.json');
    
    const embeddingsData = JSON.parse(await readFile(embeddingsPath, 'utf-8'));
    const contentData = JSON.parse(await readFile(contentPath, 'utf-8'));
    
    const mergedData = embeddingsData.map(embeddingFile => {
      const contentFile = contentData.find(c => c.filename === embeddingFile.filename);
      return {
        filename: embeddingFile.filename,
        chunks: embeddingFile.chunks.map(embeddingChunk => {
          const contentChunk = contentFile.chunks.find(c => c.chunkIndex === embeddingChunk.chunkIndex);
          return {
            chunkIndex: embeddingChunk.chunkIndex,
            chunk: contentChunk.content,
            embedding: embeddingChunk.embedding
          };
        })
      };
    });
    
    logger.info({
      msg: 'Data loaded from files',
      fileCount: mergedData.length
    });
    
    return mergedData;
  } catch (error) {
    logger.info('No existing data files found');
    return [];
  }
} 