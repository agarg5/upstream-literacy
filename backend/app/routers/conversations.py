from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.message import Conversation, ConversationParticipant, Message
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("")
def list_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    participations = (
        db.query(ConversationParticipant)
        .filter(ConversationParticipant.user_id == current_user.id)
        .all()
    )
    conv_ids = [p.conversation_id for p in participations]
    if not conv_ids:
        return []

    results = []
    for cp in participations:
        conv = db.query(Conversation).filter(Conversation.id == cp.conversation_id).first()
        if not conv:
            continue

        # Get other participants
        other_participants = (
            db.query(ConversationParticipant, User)
            .join(User, ConversationParticipant.user_id == User.id)
            .filter(
                ConversationParticipant.conversation_id == conv.id,
                ConversationParticipant.user_id != current_user.id,
            )
            .all()
        )

        # Last message
        last_msg = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(desc(Message.created_at))
            .first()
        )

        # Unread count
        unread = (
            db.query(func.count(Message.id))
            .filter(
                Message.conversation_id == conv.id,
                Message.created_at > (cp.last_read_at or datetime.min),
                Message.sender_id != current_user.id,
            )
            .scalar()
        )

        participants_list = [
            {"id": u.id, "name": u.name, "title": u.title, "role": u.role}
            for _, u in other_participants
        ]

        results.append({
            "id": conv.id,
            "participants": participants_list,
            "last_message": {
                "id": last_msg.id,
                "sender_id": last_msg.sender_id,
                "body": last_msg.body,
                "created_at": last_msg.created_at.isoformat(),
            } if last_msg else None,
            "unread_count": unread,
            "created_at": conv.created_at.isoformat(),
        })

    results.sort(key=lambda x: x["last_message"]["created_at"] if x["last_message"] else x["created_at"], reverse=True)
    return results


@router.post("")
def create_conversation(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recipient_id = data.get("recipient_id")
    if not recipient_id:
        raise HTTPException(status_code=400, detail="recipient_id required")

    recipient = db.query(User).filter(User.id == recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    # Check for existing conversation between these two users
    my_convs = (
        db.query(ConversationParticipant.conversation_id)
        .filter(ConversationParticipant.user_id == current_user.id)
        .subquery()
    )
    existing = (
        db.query(ConversationParticipant.conversation_id)
        .filter(
            ConversationParticipant.user_id == recipient_id,
            ConversationParticipant.conversation_id.in_(my_convs),
        )
        .first()
    )
    if existing:
        return {"id": existing[0], "existing": True}

    conv = Conversation()
    db.add(conv)
    db.flush()

    db.add(ConversationParticipant(conversation_id=conv.id, user_id=current_user.id))
    db.add(ConversationParticipant(conversation_id=conv.id, user_id=recipient_id))
    db.commit()

    return {"id": conv.id, "existing": False}


@router.get("/{conversation_id}/messages")
def get_messages(
    conversation_id: int,
    page: int = 1,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify participant (allow admin to view any)
    if current_user.role != "admin":
        participant = (
            db.query(ConversationParticipant)
            .filter(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id == current_user.id,
            )
            .first()
        )
        if not participant:
            raise HTTPException(status_code=403, detail="Not a participant")

    messages = (
        db.query(Message, User)
        .join(User, Message.sender_id == User.id)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": msg.id,
            "sender_id": msg.sender_id,
            "sender_name": user.name,
            "body": msg.body,
            "is_system": msg.is_system,
            "created_at": msg.created_at.isoformat(),
        }
        for msg, user in messages
    ]


@router.post("/{conversation_id}/messages")
def send_message(
    conversation_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify participant or admin
    participant = (
        db.query(ConversationParticipant)
        .filter(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == current_user.id,
        )
        .first()
    )
    if not participant and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not a participant")

    # If admin joining the conversation
    if not participant and current_user.role == "admin":
        participant = ConversationParticipant(
            conversation_id=conversation_id, user_id=current_user.id
        )
        db.add(participant)

    body = data.get("body", "").strip()
    if not body:
        raise HTTPException(status_code=400, detail="Message body required")

    msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        body=body,
        is_system=data.get("is_system", False) and current_user.role == "admin",
    )
    db.add(msg)

    # Update last read for sender
    participant.last_read_at = datetime.utcnow()
    current_user.last_active_at = datetime.utcnow()
    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "sender_name": current_user.name,
        "body": msg.body,
        "is_system": msg.is_system,
        "created_at": msg.created_at.isoformat(),
    }


@router.put("/{conversation_id}/read")
def mark_read(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    participant = (
        db.query(ConversationParticipant)
        .filter(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == current_user.id,
        )
        .first()
    )
    if not participant:
        raise HTTPException(status_code=403, detail="Not a participant")

    participant.last_read_at = datetime.utcnow()
    db.commit()
    return {"status": "ok"}
