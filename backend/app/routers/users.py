from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, require_admin
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserOut, AdminPasswordReset

router = APIRouter(prefix="/admin/users", tags=["Admin - Users"])


@router.get("", response_model=List[UserOut])
def list_users(
    search: str = "",
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = db.query(User).filter(User.role == "user")
    if search:
        query = query.filter(User.full_name.ilike(f"%{search}%"))
    return query.order_by(User.created_at.desc()).all()


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    return user


@router.patch("/{user_id}/lock")
def toggle_lock(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id, User.role == "user").first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    user.is_locked = not user.is_locked
    db.commit()
    action = "khóa" if user.is_locked else "mở khóa"
    return {"message": f"Đã {action} tài khoản thành công", "is_locked": user.is_locked}


@router.put("/{user_id}/password")
def reset_user_password(
    user_id: int,
    payload: AdminPasswordReset,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id, User.role == "user").first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Đặt lại mật khẩu thành công"}
