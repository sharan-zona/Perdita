import enum

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ClaimStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)

    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True)
    claimant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    message = Column(Text, nullable=False)
    proof = Column(Text, nullable=True)

    status = Column(
        SAEnum(ClaimStatus, native_enum=False, length=10),
        nullable=False,
        default=ClaimStatus.PENDING,
        index=True,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    item = relationship("Item", back_populates="claims")
    claimant = relationship("User", back_populates="claims")

    def __repr__(self):
        return f"<Claim id={self.id} item_id={self.item_id} status={self.status}>"