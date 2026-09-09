"""
Pydantic model representing a single craft record.
Used to validate/shape API responses so the frontend gets consistent JSON.
"""

from pydantic import BaseModel
from typing import Optional


class Craft(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    description: Optional[str] = None
    ai_description: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True