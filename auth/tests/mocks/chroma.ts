/**
 * Fake ChromaDB Client Stub
 *
 * In-memory collection store that returns realistic RAG-shaped
 * responses from query(), matching the ChromaDB JS/Python SDK contract.
 */

interface ChromaDocument {
  ids: string[];
  documents: string[];
  metadatas: Record<string, any>[];
  embeddings: number[][];
}

interface ChromaCollection {
  name: string;
  add: jest.Mock;
  query: jest.Mock;
  get: jest.Mock;
  delete: jest.Mock;
  count: jest.Mock;
  _data: ChromaDocument;
}

const collections = new Map<string, ChromaCollection>();

function createCollection(name: string): ChromaCollection {
  const data: ChromaDocument = {
    ids: [],
    documents: [],
    metadatas: [],
    embeddings: [],
  };

  return {
    name,
    _data: data,

    add: jest.fn(async (params: {
      ids: string[];
      documents?: string[];
      metadatas?: Record<string, any>[];
      embeddings?: number[][];
    }) => {
      data.ids.push(...(params.ids || []));
      data.documents.push(...(params.documents || []));
      data.metadatas.push(...(params.metadatas || []));
      data.embeddings.push(...(params.embeddings || []));
    }),

    query: jest.fn(async (params: {
      queryTexts?: string[];
      queryEmbeddings?: number[][];
      nResults?: number;
    }) => {
      // Return realistic RAG-shaped response
      const nResults = params.nResults || 3;

      // If the collection has real data, return it; otherwise return mock data
      if (data.documents.length > 0) {
        const sliced = data.documents.slice(0, nResults);
        return {
          documents: [sliced],
          distances: [sliced.map((_, i) => 0.1 + i * 0.05)],
          metadatas: [data.metadatas.slice(0, nResults)],
          ids: [data.ids.slice(0, nResults)],
        };
      }

      // Default mock response for empty collections
      return {
        documents: [["Mocked document chunk relevant to the query."]],
        distances: [[0.12]],
        metadatas: [[{ source: "test.pdf", page: 1 }]],
        ids: [["doc-chunk-001"]],
      };
    }),

    get: jest.fn(async (params?: { ids?: string[] }) => {
      if (params?.ids) {
        const indices = params.ids
          .map((id) => data.ids.indexOf(id))
          .filter((i) => i !== -1);
        return {
          ids: indices.map((i) => data.ids[i]),
          documents: indices.map((i) => data.documents[i]),
          metadatas: indices.map((i) => data.metadatas[i]),
        };
      }
      return {
        ids: data.ids,
        documents: data.documents,
        metadatas: data.metadatas,
      };
    }),

    delete: jest.fn(async (params: { ids: string[] }) => {
      for (const id of params.ids) {
        const idx = data.ids.indexOf(id);
        if (idx !== -1) {
          data.ids.splice(idx, 1);
          data.documents.splice(idx, 1);
          data.metadatas.splice(idx, 1);
          data.embeddings.splice(idx, 1);
        }
      }
    }),

    count: jest.fn(async () => data.ids.length),
  };
}

export const mockChromaClient = {
  getOrCreateCollection: jest.fn(async ({ name }: { name: string }) => {
    if (!collections.has(name)) {
      collections.set(name, createCollection(name));
    }
    return collections.get(name)!;
  }),

  getCollection: jest.fn(async ({ name }: { name: string }) => {
    if (!collections.has(name)) {
      throw new Error(`Collection ${name} does not exist`);
    }
    return collections.get(name)!;
  }),

  deleteCollection: jest.fn(async ({ name }: { name: string }) => {
    collections.delete(name);
  }),

  listCollections: jest.fn(async () => {
    return Array.from(collections.keys()).map((name) => ({ name }));
  }),
};

/**
 * Reset all collections and jest call history.
 */
export function resetMockChroma(): void {
  collections.clear();
  mockChromaClient.getOrCreateCollection.mockClear();
  mockChromaClient.getCollection.mockClear();
  mockChromaClient.deleteCollection.mockClear();
  mockChromaClient.listCollections.mockClear();
}
