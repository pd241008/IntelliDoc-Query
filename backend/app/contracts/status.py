from pydantic import BaseModel
from datetime import datetime

class StatusContract(BaseModel):
    file_id: str
    step: str
    message: str
    status: str
    timestamp: datetime
