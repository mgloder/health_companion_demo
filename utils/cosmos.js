import { CosmosClient } from "@azure/cosmos";
import { openai } from './openai.js';

let cosmosClientInstance = null;

export function getCosmosClient() {
  if (!process.env.COSMOS_ENDPOINT) {
    throw new Error("COSMOS_ENDPOINT environment variable is required");
  }

  if (!process.env.COSMOS_KEY) {
    throw new Error("COSMOS_KEY environment variable is required");
  }

  if (!process.env.DATABASE_NAME) {
    throw new Error("DATABASE_NAME environment variable is required");
  }

  if (!process.env.CONTAINER_NAME) {
    throw new Error("CONTAINER_NAME environment variable is required");
  }

  if (cosmosClientInstance) {
    return cosmosClientInstance;
  }

  cosmosClientInstance = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY,
  });

  return cosmosClientInstance;
}

async function getContainer() {
  try {
    const client = getCosmosClient();
    const { database } = await client.databases.createIfNotExists({id: process.env.DATABASE_NAME});
    const { container } = await database.containers.createIfNotExists({ id: process.env.CONTAINER_NAME});
    return container;
  } catch (e) {
    console.error(`Error getting database and container: ${e.message}`);
    throw new Error(`Database ${process.env.DATABASE_NAME} or Container ${process.env.CONTAINER_NAME} does not exist.`);
  }
}

export async function searchSimilar(query, topN = 2) {
  try {
    const queryEmbedding = await openai.createEmbedding({ input: query });
    const container = await getContainer();

    const queryText = `
        SELECT TOP @topN 
          c.text, 
          c.metadata,
          c.filename,
          VectorDistance(c.embedding, @embedding) AS similarity
        FROM c
        ORDER BY VectorDistance(c.embedding, @embedding)
      `;

    const parameters = [
      { name: '@topN', value: topN },
      { name: '@embedding', value: queryEmbedding }
    ];

    const { resources: results } = await container.items.query({ query: queryText, parameters }).fetchAll();
    return results;
  } catch (e) {
    console.error(`Error searching for similar documents: ${e.message}`);
    throw e;
  }
}
