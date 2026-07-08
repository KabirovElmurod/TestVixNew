from fastapi import Depends, HTTPException, Request 
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from ...app.cure.auth import verify_token
from ...app.wrong import wrong
security = HTTPBearer()

def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    print('sa',token)
    if token is None:
        return wrong('Token mavjud emas', status=False)
    
    # verify_token natijasini tekshirish
    payload = verify_token(token) 

    if not payload:
        return wrong('Token xato', status=False)

    return payload