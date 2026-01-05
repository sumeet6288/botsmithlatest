from fastapi import APIRouter, HTTPException, status, Depends
from models import UserResponse, UserUpdate, PasswordChange, User
from auth import get_current_user, verify_password, get_password_hash
from datetime import datetime, timezone

router = APIRouter(prefix="/user", tags=["User Management"])

# Database will be injected
users_collection = None

def init_router(db):
    """Initialize router with database connection."""
    global users_collection
    users_collection = db.users


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile information."""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        created_at=current_user.created_at,
        role=current_user.role,
        status=current_user.status,
        phone=current_user.phone,
        avatar_url=current_user.avatar_url,
        last_login=current_user.last_login
    )


@router.put("/profile", response_model=UserResponse)
async def update_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user)):
    """Update user profile information."""
    email = current_user.email
    
    # Check if new email is already taken
    if user_update.email and user_update.email != email:
        existing_user = await users_collection.find_one({"email": user_update.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    # Prepare update data
    update_data = {}
    for field, value in user_update.dict(exclude_unset=True).items():
        if value is not None:
            update_data[field] = value
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # Update user
    result = await users_collection.update_one(
        {"email": email},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get updated user
    user_doc = await users_collection.find_one({"email": user_update.email or email})
    
    # Handle datetime fields
    created_at = user_doc.get('created_at')
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    last_login = user_doc.get('last_login')
    if isinstance(last_login, str):
        last_login = datetime.fromisoformat(last_login)
    
    return UserResponse(
        id=user_doc['id'],
        name=user_doc['name'],
        email=user_doc['email'],
        created_at=created_at,
        role=user_doc.get('role', 'user'),
        status=user_doc.get('status', 'active'),
        phone=user_doc.get('phone'),
        avatar_url=user_doc.get('avatar_url'),
        last_login=last_login
    )


@router.put("/password")
async def change_password(password_data: PasswordChange, current_user: User = Depends(get_current_user)):
    """Change user password."""
    email = current_user.email
    
    # Get user
    user_doc = await users_collection.find_one({"email": email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # For demo/mock users, skip password verification
    if email != "demo-user-123@botsmith.com":
        # Verify current password for real users
        if not verify_password(password_data.current_password, user_doc['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
    
    # Update password
    new_password_hash = get_password_hash(password_data.new_password)
    await users_collection.update_one(
        {"email": email},
        {"$set": {
            "password_hash": new_password_hash,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Password changed successfully"}


@router.delete("/account")
async def delete_account(current_user: User = Depends(get_current_user)):
    """Delete user account and all associated data."""
    email = current_user.email
    user_id = current_user.id
    
    # Get database collections
    from server import db
    
    try:
        # Delete associated chatbots
        chatbots_result = await db.chatbots.delete_many({"user_id": user_id})
        print(f"Deleted {chatbots_result.deleted_count} chatbots")
        
        # Delete associated sources
        sources_result = await db.sources.delete_many({"user_id": user_id})
        print(f"Deleted {sources_result.deleted_count} sources")
        
        # Delete associated conversations
        conversations_result = await db.conversations.delete_many({"user_id": user_id})
        print(f"Deleted {conversations_result.deleted_count} conversations")
        
        # Delete associated messages
        messages_result = await db.messages.delete_many({"user_id": user_id})
        print(f"Deleted {messages_result.deleted_count} messages")
        
        # Finally, delete user
        result = await users_collection.delete_one({"email": email})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "message": "Account and all associated data deleted successfully",
            "deleted": {
                "chatbots": chatbots_result.deleted_count,
                "sources": sources_result.deleted_count,
                "conversations": conversations_result.deleted_count,
                "messages": messages_result.deleted_count
            }
        }
    except Exception as e:
        print(f"Error deleting account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account and associated data"
        )
