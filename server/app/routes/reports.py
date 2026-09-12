from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.item import Item
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportCreate, ReportOut, ReportUpdate
from app.services.auth_service import get_current_user, require_admin

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _serialize_report(report: Report) -> ReportOut:
    return ReportOut(
        id=report.id,
        item_id=report.item_id,
        reported_by=report.reported_by,
        reason=report.reason,
        description=report.description,
        status=report.status,
        created_at=report.created_at,
        itemTitle=report.item.title,
        reportedByName=report.reporter.name,
    )


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(Item).filter(Item.id == payload.item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    report = Report(
        item_id=item.id,
        reported_by=current_user.id,
        reason=payload.reason,
        description=payload.description,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return _serialize_report(report)


@router.get("", response_model=List[ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return [_serialize_report(r) for r in reports]


@router.put("/{report_id}", response_model=ReportOut)
def update_report(
    report_id: int,
    payload: ReportUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    report.status = payload.status
    db.commit()
    db.refresh(report)
    return _serialize_report(report)