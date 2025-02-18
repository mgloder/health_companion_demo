import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
});

export function chunkText(text, maxTokens = 5000) {  // Using 5000 tokens ~ 20000 chars
  const chunks = [];
  
  // Approximate page size (2000 chars)
  const pageSize = maxTokens * 0.75 * 4;  // tokens * buffer * chars per token
  
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