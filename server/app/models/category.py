from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(100),
        unique=True,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    items = relationship(
        "Item",
        back_populates="category",
        cascade="all, delete-orphan",
    )
