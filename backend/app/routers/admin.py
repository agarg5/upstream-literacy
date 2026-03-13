from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.message import Conversation, ConversationParticipant, Message
from app.models.moderation import ModerationAction
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/users")
def list_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id, "email": u.email, "name": u.name, "title": u.title,
            "role": u.role, "district_id": u.district_id,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "last_active_at": u.last_active_at.isoformat() if u.last_active_at else None,
        }
        for u in users
    ]


@router.get("/conversations")
def list_all_conversations(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    conversations = db.query(Conversation).order_by(Conversation.created_at.desc()).all()
    results = []
    for conv in conversations:
        participants = (
            db.query(User)
            .join(ConversationParticipant, ConversationParticipant.user_id == User.id)
            .filter(ConversationParticipant.conversation_id == conv.id)
            .all()
        )
        msg_count = db.query(func.count(Message.id)).filter(Message.conversation_id == conv.id).scalar()
        last_msg = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.desc()).first()

        results.append({
            "id": conv.id,
            "participants": [{"id": u.id, "name": u.name, "role": u.role} for u in participants],
            "message_count": msg_count,
            "last_message": {
                "body": last_msg.body,
                "sender_id": last_msg.sender_id,
                "created_at": last_msg.created_at.isoformat(),
            } if last_msg else None,
            "created_at": conv.created_at.isoformat(),
        })
    return results


@router.post("/conversations/{conversation_id}/join")
def join_conversation(
    conversation_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    existing = (
        db.query(ConversationParticipant)
        .filter(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == admin.id,
        )
        .first()
    )
    if not existing:
        db.add(ConversationParticipant(conversation_id=conversation_id, user_id=admin.id))

        # Add system message
        db.add(Message(
            conversation_id=conversation_id,
            sender_id=admin.id,
            body="Upstream Literacy Team has joined the conversation.",
            is_system=True,
        ))
        db.commit()

    return {"status": "joined"}


@router.get("/stats")
def get_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    total_users = db.query(func.count(User.id)).filter(User.role != "admin").scalar()
    total_conversations = db.query(func.count(Conversation.id)).scalar()
    total_messages = db.query(func.count(Message.id)).scalar()
    active_7d = db.query(func.count(User.id)).filter(User.last_active_at >= week_ago).scalar()

    return {
        "total_users": total_users,
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "active_users_7d": active_7d,
    }


@router.post("/moderation")
def create_moderation_action(
    data: dict,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    action = ModerationAction(
        admin_id=admin.id,
        target_type=data["target_type"],
        target_id=data["target_id"],
        action=data["action"],
        reason=data.get("reason", ""),
    )
    db.add(action)
    db.commit()
    return {"status": "ok", "id": action.id}
