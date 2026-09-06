from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


# ---------- input schemas ----------

class UserCreate(BaseModel):
    """POST /api/auth/register body."""

    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: Optional[str] = Field(default=None, max_length=20)


class UserLogin(BaseModel):
    """POST /api/auth/login body."""

    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """PUT /api/users/me body. All fields optional — a profile edit
    may only touch one field, matching Profile.jsx's single form."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)


# ---------- output schemas ----------

class UserOut(BaseModel):
    """Public-safe user representation. Deliberately excludes
    password_hash — never serialize that model field, ever."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    """Response shape for /api/auth/login. Matches what AuthContext.jsx
    already expects: data.access_token and data.user."""

    access_token: str
    token_type: str = "bearer"
    user: UserOut
    