import enum

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Time,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ItemType(str, enum.Enum):
    LOST = "lost"
    FOUND = "found"


class ItemStatus(str, enum.Enum):
    LOST = "LOST"
    FOUND = "FOUND"
    CLAIMED = "CLAIMED"
    RETURNED = "RETURNED"
    CLOSED = "CLOSED"


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)

    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)

    type = Column(SAEnum(ItemType, native_enum=False, length=10), nullable=False, index=True)

    location = Column(String(200), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    time = Column(Time, nullable=True)

    image_url = Column(String(500), nullable=True)
    additional_details = Column(Text, nullable=True)

    status = Column(
        SAEnum(ItemStatus, native_enum=False, length=10),
        nullable=False,
        default=ItemStatus.LOST,
        index=True,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    reporter = relationship("User", back_populates="items", foreign_keys=[reporter_id])
    category = relationship("Category", back_populates="items")
    claims = relationship("Claim", back_populates="item", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="item", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_items_type_status", "type", "status"),
    )

    def __repr__(self):
        return f"<Item id={self.id} title={self.title!r} type={self.type} status={self.status}>"