from fastapi import Depends, HTTPException, Request, WebSocket
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

async def get_current_user_ws(websocket: WebSocket):
    token = websocket.cookies.get("access_token")

    if not token:
        return wrong("Token mavjud emas", status=False)

    try:
        payload = verify_token(token)

        if not payload:
            return wrong("Token xato", status=False)

        return payload

    except Exception as e:
        print("WS auth error:", e)
        return wrong("Token xato", status=False)


