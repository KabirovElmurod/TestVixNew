from urllib import response

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from ...app.session import get_db
from ...app.schemas.user import UserCreate
from ...app.crud.user import contact_user
from ...app.core.security import get_current_user
router = APIRouter(prefix="/comments", tags=["Users"])



    

# @router.get("/")
# async def list_users(db: AsyncSession = Depends(get_db)):
#     return await get_users(db)



from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

# from fastapi_account.app.session import get_db
from ...app.schemas.contact import MessageResponse
from ...app.cure.auth import hash_password, verify_password, create_access_token


@router.post('/aloqa')
async def aloqa(
    data: MessageResponse,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):  
    # print('\n\n\n', current_user, '\n\n\n')
    await contact_user(db, data, current_user.get('id'))
    return {'message': 'Aloqa muvaffaqiyatli yuborildi', 'status': True}