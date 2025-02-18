import { embeddingsStore, HARDCODED_KEY } from '../utils/store.js';
import { openai } from '../utils/openai.js';
import { cosineSimilarity } from '../utils/math.js';

export function registerSearchRoutes(server) {
  server.post('/api/search', async (request, reply) => {
    try {
      const { query } = request.body;
      
      request.log.info({
        msg: 'Processing search request',
        query,
        storeKey: HARDCODED_KEY
      });

      const storedEmbeddings = embeddingsStore.get(HARDCODED_KEY);
      if (!storedEmbeddings) {
        request.log.warn('No embeddings found in store');
        return {
          success: false,
          error: 'No documents available for search'
        };
      }

      // Step 1: Use GPT to identify relevant files
      const fileList = storedEmbeddings.map(file => file.filename).join('\n');
      
      const fileSelectionResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
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
      request.log.error({
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
} 