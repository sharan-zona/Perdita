from datetime import date as date_type
from datetime import datetime
from datetime import time as time_type
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.item import ItemStatus, ItemType


# ---------- input schemas ----------

class ItemCreate(BaseModel):
    """Validation shape for creating an item.

    IMPORTANT GAP: ReportLost.jsx/ReportFound.jsx submit this as
    multipart/form-data (required for the image file), not JSON. A
    FastAPI route can't take a single Pydantic model as the body of a
    multipart request — it needs each field declared as `Form(...)`
    individually, plus `image: UploadFile = File(None)` separately.
    This schema is still useful (Phase 6 route logic will construct
    an ItemCreate from the individual Form(...) params and validate
    it before touching the DB), but it cannot be used directly as a
    route parameter the way UserCreate/UserLogin can.
    """

    title: str = Field(min_length=1, max_length=150)
    description: str = Field(min_length=1)
    type: ItemType

    # The frontend form (ReportForm.jsx) sends the category NAME as a
    # string, populated from utils/constants.js CATEGORIES — not a
    # category_id. The route layer is responsible for resolving this
    # name to a Category row (or rejecting unknown categories) before
    # the Item is created; this schema only validates that some
    # non-empty category string was provided.
    category: str = Field(min_length=1, max_length=50)

    location: str = Field(min_length=1, max_length=200)
    date: date_type
    time: Optional[time_type] = None
    additional_details: Optional[str] = None


class ItemUpdate(BaseModel):
    """PUT /api/items/{id} body. All fields optional so Dashboard.jsx
    can send a partial update — e.g. just {"status": "RETURNED"}."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=150)
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    date: Optional[date_type] = None
    time: Optional[time_type] = None
    additional_details: Optional[str] = None
    status: Optional[ItemStatus] = None


# ---------- output schemas ----------

class ReporterSummary(BaseModel):
    """Deliberately minimal — section 9 says not to expose
    unnecessary private information. No email/phone here."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: int
    title: str
    description: str
    type: ItemType
    location: str
    date: date_type
    time: Optional[time_type] = None
    image_url: Optional[str] = Field(default=None, serialization_alias="imageUrl")
    additional_details: Optional[str] = None
    status: ItemStatus
    created_at: datetime
    updated_at: datetime

    # NOTE: `category` here is the Category ORM object's name, not the
    # FK id. Because a raw SQLAlchemy relationship (item.category) is
    # a Category object, not a string, ItemOut.category can't be
    # populated purely via from_attributes — the route must pass
    # `category=item.category.name` explicitly when building this
    # response.
    category: str

    # Same issue as category: ItemCard.jsx/ItemDetails.jsx expect a
    # flat reporterName string, but the ORM only gives us
    # item.reporter (a User object). Route must set this explicitly:
    # reporterName=item.reporter.name
    reporterName: Optional[str] = None