from fastapi import APIRouter, HTTPException, status, Depends
from models import UserCreate, UserLogin, UserResponse, Token, User
from auth import get_password_hash, verify_password, create_access_token, get_current_user_email
from datetime import datetime, timezone

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Database will be injected
users_collection = None

def init_router(db):
    """Initialize router with database connection."""
    global users_collection
    users_collection = db.users



@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user and return access token."""
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = user_data.model_dump()
    user_dict.pop('password')
    user = User(
        **user_dict,
        password_hash=get_password_hash(user_data.password)
    )
    
    # Store in database
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['updated_at'] = user_doc['updated_at'].isoformat()
    if user_doc.get('last_login'):
        user_doc['last_login'] = user_doc['last_login'].isoformat()
    if user_doc.get('suspension_until'):
        user_doc['suspension_until'] = user_doc['suspension_until'].isoformat()
    
    await users_collection.insert_one(user_doc)
    
    # Create access token for auto-login
    access_token = create_access_token(data={"sub": user.email})
    
    return Token(
        access_token=access_token,
        token_type="bearer"
    )


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user and return access token."""
    # Find user
    user_doc = await users_collection.find_one({"email": user_data.email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user is banned or suspended
    status_val = user_doc.get('status', 'active')
    if status_val == 'banned':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been banned"
        )
    elif status_val == 'suspended':
        suspension_until = user_doc.get('suspension_until')
        if suspension_until:
            if isinstance(suspension_until, str):
                suspension_until = datetime.fromisoformat(suspension_until)
            if datetime.now(timezone.utc) < suspension_until:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Your account is suspended until {suspension_until.isoformat()}"
                )
            else:
                # Suspension expired, reactivate account
                await users_collection.update_one(
                    {"email": user_data.email},
                    {"$set": {"status": "active", "suspension_until": None, "suspension_reason": None}}
                )
    
    # Verify password
    if not verify_password(user_data.password, user_doc['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Update last login
    await users_collection.update_one(
        {"email": user_data.email},
        {
            "$set": {
                "last_login": datetime.now(timezone.utc).isoformat()
            },
            "$inc": {"login_count": 1}
        }
    )
    
    # Create access token
    access_token = create_access_token(data={"sub": user_doc['email']})
    
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user(email: str = Depends(get_current_user_email)):
    """Get current authenticated user with all profile fields."""
    user_doc = await users_collection.find_one({"email": email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Handle datetime fields
    created_at = user_doc.get('created_at')
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    last_login = user_doc.get('last_login')
    if isinstance(last_login, str):
        last_login = datetime.fromisoformat(last_login)
    
    trial_ends_at = user_doc.get('trial_ends_at')
    if isinstance(trial_ends_at, str):
        trial_ends_at = datetime.fromisoformat(trial_ends_at)
    
    subscription_ends_at = user_doc.get('subscription_ends_at')
    if isinstance(subscription_ends_at, str):
        subscription_ends_at = datetime.fromisoformat(subscription_ends_at)
    
    # Get plan_id from subscription object if it exists, otherwise use the direct plan_id field
    subscription = user_doc.get('subscription', {})
    actual_plan_id = subscription.get('plan_id') or user_doc.get('plan_id', 'free')
    subscription_status = subscription.get('status') or user_doc.get('subscription_status')
    
    return UserResponse(
        id=user_doc['id'],
        name=user_doc['name'],
        email=user_doc['email'],
        created_at=created_at,
        role=user_doc.get('role', 'user'),
        status=user_doc.get('status', 'active'),
        phone=user_doc.get('phone'),
        avatar_url=user_doc.get('avatar_url'),
        last_login=last_login,
        # Profile Information
        company=user_doc.get('company'),
        job_title=user_doc.get('job_title'),
        bio=user_doc.get('bio'),
        address=user_doc.get('address'),
        # Subscription & Plan - use subscription object values if available
        plan_id=actual_plan_id,
        subscription_status=subscription_status,
        trial_ends_at=trial_ends_at,
        subscription_ends_at=subscription_ends_at,
        lifetime_access=user_doc.get('lifetime_access', False),
        # Custom Limits
        custom_limits=user_doc.get('custom_limits'),
        # Feature Flags
        feature_flags=user_doc.get('feature_flags'),
        # Settings
        timezone=user_doc.get('timezone'),
        language=user_doc.get('language'),
        theme=user_doc.get('theme'),
        # Branding
        branding=user_doc.get('branding'),
        # Metadata
        tags=user_doc.get('tags', []),
        segments=user_doc.get('segments', [])
    )


# Mock endpoint removed



@router.post("/logout")
async def logout():
    """Logout user (client should remove token)."""
    return {"message": "Successfully logged out"}
