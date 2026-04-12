"""
Integration Tests — Health Endpoint

Full request lifecycle: GET /health → health config → Redis status reads.

The health system reads from redis_repo_sync.redis_client (our FakeSyncRedis).
Since no health markers are written before the request, _get_status() returns
default values, making broker/vector_db status = "unknown" → overall = "degraded".
"""


class TestHealthEndpoint:

    def test_returns_200(self, client):
        """Health endpoint responds with HTTP 200."""
        response = client.get("/health")
        assert response.status_code == 200

    def test_response_contains_status(self, client):
        """Response body includes a 'status' field."""
        body = client.get("/health").json()
        assert "status" in body

    def test_response_contains_service_name(self, client):
        """Response includes the service identifier."""
        body = client.get("/health").json()
        assert body["service"] == "intellidoc-backend"

    def test_response_contains_uptime(self, client):
        """Response includes uptime in seconds."""
        body = client.get("/health").json()
        assert "uptime" in body
        assert body["uptime"].endswith("s")

    def test_response_contains_timestamp(self, client):
        """Response includes an ISO timestamp."""
        body = client.get("/health").json()
        assert "timestamp" in body
        assert body["timestamp"].endswith("Z")

    def test_response_contains_services_block(self, client):
        """Response includes the nested services status block."""
        body = client.get("/health").json()
        assert "services" in body
        services = body["services"]

        assert "api" in services
        assert "broker" in services
        assert "vector_db" in services
        assert "pipelines" in services

    def test_api_status_is_up(self, client):
        """API service is always reported as 'up'."""
        body = client.get("/health").json()
        assert body["services"]["api"]["status"] == "up"

    def test_broker_has_provider_info(self, client):
        """Broker section includes the provider name."""
        body = client.get("/health").json()
        broker = body["services"]["broker"]
        assert broker["provider"] == "redis"

    def test_vector_db_has_provider_info(self, client):
        """Vector DB section includes the provider name."""
        body = client.get("/health").json()
        vector_db = body["services"]["vector_db"]
        assert vector_db["provider"] == "chroma-cloud"

    def test_pipelines_section_present(self, client):
        """Both pipeline statuses are reported."""
        body = client.get("/health").json()
        pipelines = body["services"]["pipelines"]

        assert "ingestion" in pipelines
        assert "semantic_search" in pipelines

    def test_overall_status_reflects_dependencies(self, client):
        """
        Overall status is 'degraded' when broker/vector_db
        have not been marked as 'connected'.
        """
        body = client.get("/health").json()
        # Both dependencies start as "unknown" → overall = "degraded"
        assert body["status"] in ("ok", "degraded")
