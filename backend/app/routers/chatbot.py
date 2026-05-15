from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, get_current_user, require_admin
from app.core.limiter import limiter
from app.models.user import User
from app.models.chat import ChatHistory
from app.schemas.chat import ChatRequest, ChatResponse, ChatHistoryOut
from app.services.chatbot_service import chat_with_ai

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
def chat(
    request: Request,
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        record = chat_with_ai(db, current_user.id, payload.message)
        return ChatResponse(response=record.response, created_at=record.created_at)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi AI: {str(e)}")


@router.get("/history", response_model=List[ChatHistoryOut])
def my_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/admin/history", response_model=List[ChatHistoryOut])
def all_chat_history(
    user_id: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = db.query(ChatHistory)
    if user_id:
        query = query.filter(ChatHistory.user_id == user_id)
    return query.order_by(ChatHistory.created_at.desc()).limit(200).all()
