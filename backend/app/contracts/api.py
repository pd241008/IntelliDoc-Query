from pydantic import BaseModel

class UploadResponse(BaseModel):
    file_id: str
    filename: str

class ProcessResponse(BaseModel):
    file_id: str
    message: str

class HealthResponse(BaseModel):
    status: str
    service: str
    uptime: str
