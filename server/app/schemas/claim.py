from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.claim import ClaimStatus


# ---------- input schemas ----------

class ClaimCreate(BaseModel):
    """POST /api/claims body. Matches claimService.createClaim's
    { itemId, message, proof } -> { item_id, message, proof }."""

    item_id: int
    message: str = Field(min_length=1)
    proof: Optional[str] = None


class ClaimUpdate(BaseModel):
    """PUT /api/claims/{id} body — the owner approves or rejects.
    Only PENDING -> APPROVED/REJECTED should be allowed; enforcing
    that transition is route/service logic, not schema validation."""

    status: ClaimStatus


# ---------- output schemas ----------

class ClaimOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: int
    item_id: int
    claimant_id: int
    message: str
    proof: Optional[str] = None
    status: ClaimStatus
    created_at: datetime
    updated_at: datetime

    # Claims.jsx and Dashboard.jsx both expect flat itemTitle /
    # claimantName strings, but these aren't native Claim columns —
    # they come from the related Item and User. The route must
    # populate these explicitly (claim.item.title, claim.claimant.name)
    # rather than relying on from_attributes to reach through the
    # relationship.
    itemTitle: Optional[str] = None
    claimantName: Optional[str] = None