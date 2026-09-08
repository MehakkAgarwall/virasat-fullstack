"""
Pydantic model representing a single artisan profile record (artisan_profiles table).
Field names mirror the actual DB columns (camelCase), matching the schema already
used by the TS/tRPC backend that first created this table, so both backends agree
on the same shape.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Artisan(BaseModel):
    id: int
    artisanKey: str
    primaryCraftId: Optional[int] = None
    studioName: str
    personalName: str
    craftSpecialization: str
    location: str
    state: str
    yearsOfPractice: int = 0
    bio: str
    profilePhotoUrl: str
    coverPhotoUrl: str
    publicContact: str = ""
    languages: str = ""
    experienceInfo: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True