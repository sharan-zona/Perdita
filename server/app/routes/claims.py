from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.claim import Claim, ClaimStatus
from app.models.item import Item, ItemStatus
from app.models.user import User, UserRole
from app.schemas.claim import ClaimCreate, ClaimOut, ClaimUpdate
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/claims", tags=["claims"])


def _serialize_claim(claim: Claim) -> ClaimOut:
    return ClaimOut(
        id=claim.id,
        item_id=claim.item_id,
        claimant_id=claim.claimant_id,
        message=claim.message,
        proof=claim.proof,
        status=claim.status,
        created_at=claim.created_at,
        updated_at=claim.updated_at,
        itemTitle=claim.item.title,
        claimantName=claim.claimant.name,
    )


@router.post("", response_model=ClaimOut, status_code=status.HTTP_201_CREATED)
def create_claim(
    payload: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(Item).filter(Item.id == payload.item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    if item.reporter_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can't claim an item you reported yourself.",
        )

    if item.status not in (ItemStatus.LOST, ItemStatus.FOUND):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This item is no longer open for claims.",
        )

    existing = (
        db.query(Claim)
        .filter(
            Claim.item_id == item.id,
            Claim.claimant_id == current_user.id,
            Claim.status == ClaimStatus.PENDING,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a pending claim on this item.",
        )

    claim = Claim(
        item_id=item.id,
        claimant_id=current_user.id,
        message=payload.message,
        proof=payload.proof,
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return _serialize_claim(claim)


@router.get("", response_model=List[ClaimOut])
def list_claims(
    mine: bool = False,
    role: Optional[str] = Query(default=None, description="'owner' = claims received on my items"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if role == "owner":
        query = db.query(Claim).join(Item).filter(Item.reporter_id == current_user.id)
    else:
        query = db.query(Claim).filter(Claim.claimant_id == current_user.id)

    claims = query.order_by(Claim.created_at.desc()).all()
    return [_serialize_claim(c) for c in claims]


@router.put("/{claim_id}", response_model=ClaimOut)
def update_claim(
    claim_id: int,
    payload: ClaimUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Claim not found.")

    item = claim.item
    if item.reporter_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the item's reporter can approve or reject claims on it.",
        )

    if claim.status != ClaimStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This claim has already been decided.",
        )

    claim.status = payload.status

    if payload.status == ClaimStatus.APPROVED:
        item.status = ItemStatus.CLAIMED
        other_pending = (
            db.query(Claim)
            .filter(
                Claim.item_id == item.id,
                Claim.id != claim.id,
                Claim.status == ClaimStatus.PENDING,
            )
            .all()
        )
        for other in other_pending:
            other.status = ClaimStatus.REJECTED

    db.commit()
    db.refresh(claim)
    return _serialize_claim(claim)