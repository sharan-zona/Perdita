from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.matching_service import get_matches_for_user

router = APIRouter(prefix="/api/matches", tags=["matches"])


@router.get("")
def list_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_matches_for_user(db, current_user.id)