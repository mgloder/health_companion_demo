import { embeddingsStore, HARDCODED_KEY } from '../utils/store.js';

export function registerEmbeddingsRoutes(server) {
  // Get all embeddings
  server.get('/api/embeddings', async (request, reply) => {
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
      embeddings: embeddings.map(file => ({
        filename: file.filename,
        chunkCount: file.chunks.length
      }))
    };
  });

  // Get content for a specific chunk
  server.get('/api/embeddings/:filename/:chunkIndex', async (request, reply) => {
    const { filename, chunkIndex } = request.params;
    const data = embeddingsStore.get(HARDCODED_KEY);
    
    const file = data?.find(f => f.filename === filename);
    const chunk = file?.chunks.find(c => c.chunkIndex === parseInt(chunkIndex));
    
    if (!chunk) {
      reply.code(404).send({
        success: false,
        error: 'Content not found'
      });
      return;
    }
    
    return {
      success: true,
      content: chunk.chunk,
      metadata: {
        filename,
        chunkIndex: chunk.chunkIndex
      }
    };
  });
} 