import os
import uuid
from datetime import date as date_type
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.category import Category
from app.models.item import Item, ItemStatus, ItemType
from app.models.user import User, UserRole
from app.schemas.item import ItemCreate, ItemOut, ItemUpdate
from app.services.auth_service import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/items", tags=["items"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "app/uploads")
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "5"))
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _serialize_item(item: Item) -> ItemOut:
    return ItemOut(
        id=item.id,
        title=item.title,
        description=item.description,
        type=item.type,
        location=item.location,
        date=item.date,
        time=item.time,
        image_url=item.image_url,
        additional_details=item.additional_details,
        status=item.status,
        created_at=item.created_at,
        updated_at=item.updated_at,
        category=item.category.name,
        reporterName=item.reporter.name,
    )


def _get_item_or_404(db: Session, item_id: int) -> Item:
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")
    return item


def _resolve_category(db: Session, name: str) -> Category:
    category = db.query(Category).filter(Category.name == name).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown category: {name!r}.",
        )
    return category


@router.get("", response_model=List[ItemOut])
def list_items(
    q: Optional[str] = Query(default=None, description="Search title/description/location"),
    type: Optional[ItemType] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    date: Optional[date_type] = None,
    status_: Optional[ItemStatus] = Query(default=None, alias="status"),
    sort: str = "newest",
    mine: bool = False,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    query = db.query(Item)

    if mine:
        if current_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Login required to view your own items.",
            )
        query = query.filter(Item.reporter_id == current_user.id)

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(Item.title.ilike(like), Item.description.ilike(like), Item.location.ilike(like))
        )
    if type:
        query = query.filter(Item.type == type)
    if category:
        query = query.join(Category).filter(Category.name == category)
    if location:
        query = query.filter(Item.location.ilike(f"%{location}%"))
    if date:
        query = query.filter(Item.date == date)
    if status_:
        query = query.filter(Item.status == status_)

    if sort == "oldest":
        query = query.order_by(Item.created_at.asc())
    elif sort == "updated":
        query = query.order_by(Item.updated_at.desc())
    else:
        query = query.order_by(Item.created_at.desc())

    items = query.all()
    return [_serialize_item(item) for item in items]


@router.get("/{item_id}", response_model=ItemOut)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = _get_item_or_404(db, item_id)
    return _serialize_item(item)


@router.post("", response_model=ItemOut, status_code=status.HTTP_201_CREATED)
async def create_item(
    payload: Annotated[ItemCreate, Form()],
    image: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = _resolve_category(db, payload.category)

    image_url = None
    if image is not None and image.filename:
        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image must be JPEG, PNG, or WebP.",
            )
        contents = await image.read()
        if len(contents) > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image must be under {MAX_UPLOAD_SIZE_MB}MB.",
            )
        extension = os.path.splitext(image.filename)[1] or ".jpg"
        filename = f"{uuid.uuid4().hex}{extension}"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
            f.write(contents)
        image_url = f"/uploads/{filename}"

    item = Item(
        reporter_id=current_user.id,
        category_id=category.id,
        title=payload.title,
        description=payload.description,
        type=payload.type,
        location=payload.location,
        date=payload.date,
        time=payload.time,
        additional_details=payload.additional_details,
        image_url=image_url,
        status=ItemStatus.LOST if payload.type == ItemType.LOST else ItemStatus.FOUND,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return _serialize_item(item)


@router.put("/{item_id}", response_model=ItemOut)
def update_item(
    item_id: int,
    payload: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = _get_item_or_404(db, item_id)

    if item.reporter_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own reports.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    if "category" in update_data:
        category_name = update_data.pop("category")
        category = _resolve_category(db, category_name)
        item.category_id = category.id

    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return _serialize_item(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = _get_item_or_404(db, item_id)

    if item.reporter_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reports.",
        )

    db.delete(item)
    db.commit()
    return None