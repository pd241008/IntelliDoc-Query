"""
Fake Embedding Model

Deterministic 384-dimension vector generator that replaces
SentenceTransformer('all-MiniLM-L6-v2') in tests.

Returns consistent, reproducible vectors without downloading
any ML models or calling external APIs.
"""

from typing import Any, List, Union


class FakeNumpyArray:
    """
    Minimal numpy array stand-in with .tolist() support.

    SentenceTransformer.encode() returns numpy arrays. Our code calls
    .tolist() on the result. This class provides that interface.
    """

    def __init__(self, data: Any):
        self._data = data

    def tolist(self) -> Any:
        return self._data

    def __iter__(self):
        return iter(self._data)

    def __len__(self) -> int:
        return len(self._data)

    def __getitem__(self, idx):
        return self._data[idx]


class FakeEmbeddingModel:
    """
    Drop-in replacement for SentenceTransformer.

    API contract:
      - encode(str) → 1-D array of shape (384,)
      - encode(list[str]) → 2-D array of shape (N, 384)
      - .tolist() converts to Python lists
      - 'convert_to_list' kwarg returns Python lists directly
    """

    EMBEDDING_DIM = 384  # Matches all-MiniLM-L6-v2

    def encode(
        self,
        sentences: Union[str, List[str]],
        batch_size: int = 32,
        show_progress_bar: bool = False,
        normalize_embeddings: bool = False,
        convert_to_list: bool = False,
        **kwargs,
    ) -> Any:
        single_input = isinstance(sentences, str)
        if single_input:
            sentences = [sentences]

        results: List[List[float]] = []
        for i, text in enumerate(sentences):
            # Deterministic vector: slight variation per text for realism
            seed = hash(text) % 1000
            vec = [
                round((seed + j) / 10000.0, 6)
                for j in range(self.EMBEDDING_DIM)
            ]
            results.append(vec)

        # Match SentenceTransformer's output contract
        if convert_to_list:
            return results[0] if single_input else results

        if single_input:
            return FakeNumpyArray(results[0])

        return FakeNumpyArray(results)
