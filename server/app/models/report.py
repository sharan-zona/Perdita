import enum

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ReportReason(str, enum.Enum):
    SPAM = "Spam"
    FAKE_LISTING = "Fake listing"
    INAPPROPRIATE_CONTENT = "Inappropriate content"
    WRONG_INFORMATION = "Wrong information"
    SUSPICIOUS_ACTIVITY = "Suspicious activity"
    OTHER = "Other"


class ReportStatus(str, enum.Enum):
    PENDING = "PENDING"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True)
    reported_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    reason = Column(SAEnum(ReportReason, native_enum=False, length=30), nullable=False)
    description = Column(Text, nullable=True)

    status = Column(
        SAEnum(ReportStatus, native_enum=False, length=10),
        nullable=False,
        default=ReportStatus.PENDING,
        index=True,
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    item = relationship("Item", back_populates="reports")
    reporter = relationship("User", back_populates="reports", foreign_keys=[reported_by])

    def __repr__(self):
        return f"<Report id={self.id} item_id={self.item_id} reason={self.reason}>"