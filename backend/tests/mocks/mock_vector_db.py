"""
Fake ChromaDB Client & Collection

In-memory vector store stub that supports add() and query()
with realistic RAG-shaped responses. Replaces both
chromadb.CloudClient and chromadb.Client.
"""

from typing import Any, Dict, List, Optional


class MockChromaCollection:
    """
    In-memory ChromaDB collection.

    Stores documents and embeddings in plain lists.
    query() returns stored data if available, or a
    hardcoded relevant chunk for empty collections.
    """

    def __init__(self, name: str = "default"):
        self.name = name
        self._ids: List[str] = []
        self._documents: List[str] = []
        self._embeddings: List[Any] = []
        self._metadatas: List[Dict] = []

    def add(
        self,
        ids: List[str],
        documents: List[str],
        embeddings: Any = None,
        metadatas: Optional[List[Dict]] = None,
    ) -> None:
        self._ids.extend(ids)
        self._documents.extend(documents)
        if embeddings is not None:
            self._embeddings.extend(embeddings)
        if metadatas is not None:
            self._metadatas.extend(metadatas)

    def query(
        self,
        query_texts: Optional[List[str]] = None,
        query_embeddings: Optional[List[List[float]]] = None,
        n_results: int = 5,
        **kwargs,
    ) -> Dict[str, Any]:
        """
        Returns stored documents if available, otherwise
        a hardcoded response with realistic RAG shape.
        """
        if self._documents:
            n = min(n_results, len(self._documents))
            return {
                "documents": [self._documents[:n]],
                "distances": [[round(0.1 * (i + 1), 2) for i in range(n)]],
                "metadatas": [
                    self._metadatas[:n]
                    if self._metadatas
                    else [{"source": "test.pdf"}] * n
                ],
                "ids": [self._ids[:n]],
            }

        # Hardcoded fallback for empty collections
        return {
            "documents": [
                ["Mocked document chunk relevant to the query."]
            ],
            "distances": [[0.12]],
            "metadatas": [[{"source": "test.pdf", "page": 1}]],
            "ids": [["doc-chunk-001"]],
        }

    def get(self, ids: Optional[List[str]] = None, **kwargs) -> Dict:
        if ids:
            indices = [
                i for i, doc_id in enumerate(self._ids)
                if doc_id in ids
            ]
            return {
                "ids": [self._ids[i] for i in indices],
                "documents": [self._documents[i] for i in indices],
                "metadatas": [self._metadatas[i] for i in indices]
                if self._metadatas else [],
            }
        return {
            "ids": self._ids,
            "documents": self._documents,
            "metadatas": self._metadatas,
        }

    def count(self) -> int:
        return len(self._ids)


class MockChromaClient:
    """
    Drop-in replacement for chromadb.CloudClient and chromadb.Client.

    Maintains an in-memory registry of named collections.
    """

    def __init__(self):
        self._collections: Dict[str, MockChromaCollection] = {}

    def get_or_create_collection(
        self, name: str = "default", **kwargs
    ) -> MockChromaCollection:
        if name not in self._collections:
            self._collections[name] = MockChromaCollection(name)
        return self._collections[name]

    def get_collection(
        self, name: str = "default", **kwargs
    ) -> MockChromaCollection:
        return self.get_or_create_collection(name)

    def delete_collection(self, name: str) -> None:
        self._collections.pop(name, None)

    def list_collections(self) -> List[Dict[str, str]]:
        return [{"name": n} for n in self._collections]
