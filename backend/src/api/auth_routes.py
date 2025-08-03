from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from loguru import logger

from ..core.database import get_database_session
from ..core.auth import get_current_user, require_auth, get_auth_service, AuthService
from ..models.database_models import UserProfile, UserSession
from ..models.schemas import UserProfileResponse, UserProfileUpdate

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: Dict[str, Any] = Depends(require_auth),
    db: Session = Depends(get_database_session),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Get authenticated user's profile."""
    try:
        user_id = current_user["user_id"]
        
        # Get profile from database
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        
        if not profile:
            # Create profile if it doesn't exist
            profile_data = {
                "user_id": user_id,
                "email": current_user["email"],
                "full_name": current_user.get("user_metadata", {}).get("full_name", ""),
                "avatar_url": current_user.get("user_metadata", {}).get("avatar_url", ""),
            }
            
            # Create in local database
            profile = UserProfile(**profile_data)
            db.add(profile)
            db.commit()
            db.refresh(profile)
            
            # Also create in Supabase profiles table
            await auth_service.create_user_profile(profile_data)
        
        return UserProfileResponse(
            user_id=profile.user_id,
            email=profile.email,
            full_name=profile.full_name,
            avatar_url=profile.avatar_url,
            preferences=profile.preferences or {},
            therapy_goals=profile.therapy_goals or [],
            created_at=profile.created_at,
            updated_at=profile.updated_at
        )
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user profile"
        )

@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: Dict[str, Any] = Depends(require_auth),
    db: Session = Depends(get_database_session)
):
    """Update authenticated user's profile."""
    try:
        user_id = current_user["user_id"]
        
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Update profile fields
        if profile_update.full_name is not None:
            profile.full_name = profile_update.full_name
        if profile_update.avatar_url is not None:
            profile.avatar_url = profile_update.avatar_url
        if profile_update.preferences is not None:
            profile.preferences = profile_update.preferences
        if profile_update.therapy_goals is not None:
            profile.therapy_goals = profile_update.therapy_goals
        
        db.commit()
        db.refresh(profile)
        
        return UserProfileResponse(
            user_id=profile.user_id,
            email=profile.email,
            full_name=profile.full_name,
            avatar_url=profile.avatar_url,
            preferences=profile.preferences or {},
            therapy_goals=profile.therapy_goals or [],
            created_at=profile.created_at,
            updated_at=profile.updated_at
        )
        
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user profile"
        )

@router.get("/sessions")
async def get_user_sessions(
    current_user: Dict[str, Any] = Depends(require_auth),
    db: Session = Depends(get_database_session)
):
    """Get user's therapy sessions."""
    try:
        user_id = current_user["user_id"]
        
        sessions = db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.is_active == True
        ).order_by(UserSession.updated_at.desc()).all()
        
        return {
            "sessions": [
                {
                    "session_id": session.session_id,
                    "created_at": session.created_at,
                    "updated_at": session.updated_at,
                    "message_count": len(session.messages) if session.messages else 0
                }
                for session in sessions
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting user sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user sessions"
        )

@router.delete("/sessions/{session_id}")
async def delete_user_session(
    session_id: str,
    current_user: Dict[str, Any] = Depends(require_auth),
    db: Session = Depends(get_database_session)
):
    """Delete a user's therapy session."""
    try:
        user_id = current_user["user_id"]
        
        session = db.query(UserSession).filter(
            UserSession.session_id == session_id,
            UserSession.user_id == user_id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        # Soft delete by marking as inactive
        session.is_active = False
        db.commit()
        
        return {"message": "Session deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting user session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting session"
        )
