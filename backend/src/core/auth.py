from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from supabase import create_client, Client
from loguru import logger

from .config import settings

# Initialize Supabase client
supabase_client: Optional[Client] = None

if settings.supabase_url and settings.supabase_service_role_key:
    try:
        supabase_client = create_client(
            settings.supabase_url, 
            settings.supabase_service_role_key
        )
        logger.info("Supabase client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")

security = HTTPBearer(auto_error=False)

class AuthService:
    """Authentication service using Supabase."""
    
    def __init__(self):
        self.supabase = supabase_client
    
    async def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token with Supabase."""
        if not self.supabase:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service not available"
            )
        
        try:
            # Verify token with Supabase
            response = self.supabase.auth.get_user(token)
            
            if response.user:
                return {
                    "user_id": response.user.id,
                    "email": response.user.email,
                    "user_metadata": response.user.user_metadata,
                    "is_authenticated": True
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication token"
                )
                
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile from Supabase."""
        if not self.supabase:
            return None
            
        try:
            response = self.supabase.table('profiles').select('*').eq('user_id', user_id).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Failed to get user profile: {e}")
            return None
    
    async def create_user_profile(self, user_data: Dict[str, Any]) -> bool:
        """Create user profile in Supabase."""
        if not self.supabase:
            return False
            
        try:
            response = self.supabase.table('profiles').insert({
                'user_id': user_data['user_id'],
                'email': user_data['email'],
                'full_name': user_data.get('full_name', ''),
                'avatar_url': user_data.get('avatar_url', ''),
            }).execute()
            
            return response.data is not None
            
        except Exception as e:
            logger.error(f"Failed to create user profile: {e}")
            return False

# Initialize auth service
auth_service = AuthService()

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """Dependency to get current authenticated user."""
    if not credentials:
        return None
    
    try:
        return await auth_service.verify_token(credentials.credentials)
    except HTTPException:
        return None

async def require_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """Dependency that requires authentication."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return await auth_service.verify_token(credentials.credentials)

def get_auth_service() -> AuthService:
    """Dependency to get auth service."""
    return auth_service
