from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.report import ReportReason, ReportStatus


# ---------- input schemas ----------

class ReportCreate(BaseModel):
    """POST /api/reports body. Matches reportService.createReport's
    { itemId, reason, description } -> { item_id, reason, description }."""

    item_id: int
    reason: ReportReason
    description: Optional[str] = None


class ReportUpdate(BaseModel):
    """PUT /api/reports/{id} body — admin resolves or dismisses.
    Matches AdminDashboard.jsx's handleResolveReport(id, status)."""

    status: ReportStatus


# ---------- output schemas ----------

class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: int
    item_id: int
    reported_by: int
    reason: ReportReason
    description: Optional[str] = None
    status: ReportStatus
    created_at: datetime

    # AdminDashboard.jsx's table reads r.itemTitle and
    # r.reportedByName directly. Neither is a native Report column —
    # same pattern as ItemOut/ClaimOut, the route must populate these
    # explicitly from report.item.title and report.reporter.name.
    itemTitle: Optional[str] = None
    reportedByName: Optional[str] = None