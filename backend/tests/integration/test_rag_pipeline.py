"""
Integration Tests — RAG Query Pipeline

Full request lifecycle:
  POST /query/ → rag_service.run_rag_pipeline()
    → semantic_search() → search_repo.query_documents() → MockChromaCollection.query()
    → build_context() → generate_answer()
    → JSON response

The ChromaDB collection is our MockChromaCollection (patched in conftest).
When empty, it returns hardcoded relevant chunks. The full pipeline
transforms these through context building and answer generation.
"""


class TestRAGQueryEndpoint:

    ENDPOINT = "/query/"

    def test_returns_200_on_valid_query(self, client):
        """Valid query returns HTTP 200."""
        response = client.post(
            self.ENDPOINT,
            json={"query": "What is IntelliDoc?", "top_k": 3},
        )
        assert response.status_code == 200

    def test_response_contains_query_field(self, client):
        """Response echoes back the original query."""
        payload = {"query": "How does OCR work?", "top_k": 3}
        body = client.post(self.ENDPOINT, json=payload).json()

        assert body["query"] == "How does OCR work?"

    def test_response_contains_answer(self, client):
        """Response includes an 'answer' field with content."""
        body = client.post(
            self.ENDPOINT,
            json={"query": "Explain document processing", "top_k": 3},
        ).json()

        assert "answer" in body
        assert isinstance(body["answer"], str)
        assert len(body["answer"]) > 0

    def test_response_contains_sources(self, client):
        """Response includes a 'sources' list."""
        body = client.post(
            self.ENDPOINT,
            json={"query": "What is chunking?", "top_k": 3},
        ).json()

        assert "sources" in body
        assert isinstance(body["sources"], list)

    def test_sources_contain_mocked_document(self, client):
        """Sources contain the document text from MockChromaCollection."""
        body = client.post(
            self.ENDPOINT,
            json={"query": "Test query", "top_k": 3},
        ).json()

        # MockChromaCollection returns "Mocked document chunk relevant to the query."
        assert len(body["sources"]) >= 1
        assert "Mocked document chunk" in body["sources"][0]

    def test_answer_includes_query_text(self, client):
        """
        The answer (from llm_stub.generate_answer) includes
        the original query text.
        """
        query = "What are embeddings?"
        body = client.post(
            self.ENDPOINT,
            json={"query": query, "top_k": 3},
        ).json()

        assert query in body["answer"]

    def test_answer_includes_context(self, client):
        """
        The answer includes the built context from the mock documents.
        """
        body = client.post(
            self.ENDPOINT,
            json={"query": "Context test", "top_k": 3},
        ).json()

        # build_context wraps documents with [Document N] headers
        assert "[Document 1]" in body["answer"]

    def test_default_top_k(self, client):
        """Request without top_k defaults to 3."""
        response = client.post(
            self.ENDPOINT,
            json={"query": "Default top_k test"},
        )
        assert response.status_code == 200

    def test_missing_query_returns_422(self, client):
        """Request without 'query' field returns 422 Unprocessable Entity."""
        response = client.post(
            self.ENDPOINT,
            json={"top_k": 5},
        )
        assert response.status_code == 422

    def test_empty_query_still_succeeds(self, client):
        """Empty query string is accepted (validation is not enforced)."""
        response = client.post(
            self.ENDPOINT,
            json={"query": "", "top_k": 1},
        )
        # FastAPI accepts empty strings for str fields by default
        assert response.status_code == 200

    def test_top_k_parameter_accepted(self, client):
        """Custom top_k parameter is accepted."""
        response = client.post(
            self.ENDPOINT,
            json={"query": "Top-k test", "top_k": 10},
        )
        assert response.status_code == 200

    def test_response_is_json(self, client):
        """Response content type is application/json."""
        response = client.post(
            self.ENDPOINT,
            json={"query": "JSON test"},
        )
        assert "application/json" in response.headers["content-type"]
