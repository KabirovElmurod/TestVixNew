from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..session import get_db
from ..schemas.savollar import (
    AdminQuestionCreate,
    AdminQuestionUpdate,
    AdminVariantCreate,
    AdminVariantUpdate
)
from ..crud.admin_savollar import (
    admin_get_all_questions,
    admin_get_question_by_id,
    admin_create_question,
    admin_update_question,
    admin_delete_question,
    admin_get_variants_by_question_id,
    admin_add_variant,
    admin_update_variant,
    admin_delete_variant
)
from ..core.security import get_current_user
from ..wrong import wrong

router = APIRouter(prefix="/savollar/admin", tags=["Admin Savollar"])

@router.get("/test/{test_id}/questions")
async def get_questions_by_test_id(
    test_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    print('\n\n\n salom\n\n\n')
    """Get all questions for a specific test"""
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    try:
        questions = await admin_get_all_questions(db, test_id)
        return questions
    except Exception as e:
        return wrong(f"Savollarni olishda xatolik: {str(e)}", status=False)

@router.get("/questions/{question_id}")
async def get_question_by_id(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get a specific question by ID"""
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    try:
        question = await admin_get_question_by_id(db, question_id)
        if not question:
            return wrong("Savol topilmadi", status=False)
        return question
    except Exception as e:
        return wrong(f"Savolni olishda xatolik: {str(e)}", status=False)

@router.post("/questions")
async def create_question(
    question: AdminQuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create a new question (admin)"""
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    try:
        question_data = {
            'test_id': question.test_id,
            'text': question.text,
            'svg_json': question.svg_json or '',
            'variantlar': []
        }
        result = await admin_create_question(db, question_data)
        return result
    except Exception as e:
        return wrong(f"Savol yaratishda xatolik: {str(e)}", status=False)

@router.put("/questions/{question_id}")
async def update_question(
    question_id: int,
    question: AdminQuestionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Update a question (admin)"""
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    try:
        question_data = {}
        if question.text != 'null':
            question_data['text'] = question.text
        if question.svg_json != 'null':
            question_data['svg_json'] = question.svg_json
        
        result = await admin_update_question(db, question_id, question_data)
        return result
    except Exception as e:
        return wrong(f"Savolni yangilashda xatolik: {str(e)}", status=False)

@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Delete a question"""
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    try:
        result = await admin_delete_question(db, question_id)
        return result
    except Exception as e:
        return wrong(f"Savolni o'chirishda xatolik: {str(e)}", status=False)

@router.get("/questions/{question_id}/variants")
async def get_variants_by_question_id(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get all variants for a specific question"""
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    try:
        variants = await admin_get_variants_by_question_id(db, question_id)
        return variants
    except Exception as e:
        return wrong(f"Variantlarni olishda xatolik: {str(e)}", status=False)

@router.post("/questions/{question_id}/variants")
async def create_variant(
    question_id: int,
    variant: AdminVariantCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create a new variant (admin)"""
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    try:
        variant_data = {
            'text': variant.text,
            'is_true': variant.is_true
        }
        result = await admin_add_variant(db, question_id, variant_data)
        return result
    except Exception as e:
        return wrong(f"Variant yaratishda xatolik: {str(e)}", status=False)

@router.put("/questions/{question_id}/variants/{variant_id}")
async def update_variant(
    question_id: int,
    variant_id: int,
    variant: AdminVariantUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Update a variant (admin)"""
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    try:
        variant_data = {}
        if variant.text is not None:
            variant_data['text'] = variant.text
        if variant.is_true is not None:
            variant_data['is_true'] = variant.is_true
        
        result = await admin_update_variant(db, question_id, variant_id, variant_data)
        return result
    except Exception as e:
        return wrong(f"Variantni yangilashda xatolik: {str(e)}", status=False)

@router.delete("/questions/{question_id}/variants/{variant_id}")
async def delete_variant(
    question_id: int,
    variant_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Delete a variant (admin)"""
    if current_user.get('status') == False:
        return {"message": "Foydalanuvchi tekshirishda xatolik yuz berdi", "status": False, 'user': False}
    
    try:
        result = await admin_delete_variant(db, question_id, variant_id)
        return result
    except Exception as e:
        return wrong(f"Variantni o'chirishda xatolik: {str(e)}", status=False)