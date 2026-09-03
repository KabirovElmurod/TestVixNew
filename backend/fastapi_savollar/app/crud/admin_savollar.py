from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.savollar import Savollar, Variantlar
from ..wrong import wrong
from ..crud.func import (
    generate_unique_savol_id,
    generate_unique_savol_code,
    generate_unique_savol_key,
    generate_hash_url,
    generate_hash_savol
)

async def admin_get_all_questions(db: AsyncSession, test_id: int = None):
    """Admin uchun barcha savollarni olish (test_id bo'yicha filterlash mumkin)"""
    try:
        query = select(Savollar)
        if test_id:
            query = query.where(Savollar.test_id == test_id)
        
        result = await db.execute(query.order_by(Savollar.id.desc()))
        questions = result.scalars().all()
        
        # Convert to dict format
        questions_list = []
        for question in questions:
            question_dict = {
                'id': question.id,
                'test_id': question.test_id,
                'text': question.text,
                'svg_json': question.svg_json,
                # 'savol_id': question.savol_id,
                # 'savol_code': question.savol_code,
                # 'savol_key': question.savol_key,
                # 'variantlar': question.variantlar if hasattr(question, 'variantlar') else []
            }
            questions_list.append(question_dict)
        print('\n\n\n', questions_list, '\n\n\n')
        return questions_list
    except Exception as e:
        print(f"Error in admin_get_all_questions: {e}")
        return []

async def admin_get_question_by_id(db: AsyncSession, question_id: int):
    """Admin uchun bitta savolni olish"""
    try:
        result = await db.execute(select(Savollar).where(Savollar.id == question_id))
        question = result.scalar_one_or_none()
        
        if not question:
            return None
        
        return {
            'id': question.id,
            'test_id': question.test_id,
            'text': question.text,
            'svg_json': question.svg_json,
            'savol_id': question.savol_id,
            'savol_code': question.savol_code,
            'savol_key': question.savol_key,
            'variantlar': question.variantlar if hasattr(question, 'variantlar') else []
        }
    except Exception as e:
        print(f"Error in admin_get_question_by_id: {e}")
        return None

async def admin_create_question(db: AsyncSession, question_data: dict):
    """Admin uchun savol yaratish"""
    try:
        savol_id = await generate_unique_savol_id(db)
        savol_code = await generate_unique_savol_code(db)
        savol_key = await generate_unique_savol_key(db)
        
        new_question = Savollar(
            test_id=question_data['test_id'],
            savol_id=savol_id,
            savol_code=savol_code,
            savol_key=savol_key,
            text=question_data['text'],
            svg_json=question_data.get('svg_json', ''),
            variantlar=question_data.get('variantlar', [])
        )
        
        db.add(new_question)
        await db.commit()
        await db.refresh(new_question)
        
        return {
            'id': new_question.id,
            'test_id': new_question.test_id,
            'text': new_question.text,
            'svg_json': new_question.svg_json,
            'savol_id': new_question.savol_id,
            'variantlar': new_question.variantlar,
            'status': True,
            'message': 'Savol muvaffaqiyatli yaratildi'
        }
    except Exception as e:
        await db.rollback()
        print(f"Error in admin_create_question: {e}")
        return wrong(f"Savol yaratishda xatolik: {str(e)}", status=False)

async def admin_update_question(db: AsyncSession, question_id: int, question_data: dict):
    """Admin uchun savolni yangilash"""
    try:
        result = await db.execute(select(Savollar).where(Savollar.id == question_id))
        question = result.scalar_one_or_none()
        
        if not question:
            return wrong("Savol topilmadi", status=False)
        
        if 'text' in question_data:
            question.text = question_data['text']
        if 'svg_json' in question_data:
            question.svg_json = question_data['svg_json']
        if 'variantlar' in question_data:
            question.variantlar = question_data['variantlar']
        
        await db.commit()
        await db.refresh(question)
        
        return {
            'id': question.id,
            'test_id': question.test_id,
            'text': question.text,
            'svg_json': question.svg_json,
            'variantlar': question.variantlar,
            'status': True,
            'message': 'Savol muvaffaqiyatli yangilandi'
        }
    except Exception as e:
        await db.rollback()
        print(f"Error in admin_update_question: {e}")
        return wrong(f"Savolni yangilashda xatolik: {str(e)}", status=False)

async def admin_delete_question(db: AsyncSession, question_id: int):
    """Admin uchun savolni o'chirish"""
    try:
        result = await db.execute(select(Savollar).where(Savollar.id == question_id))
        question = result.scalar_one_or_none()
        
        if not question:
            return wrong("Savol topilmadi", status=False)
        
        await db.delete(question)
        await db.commit()
        
        return {
            'status': True,
            'message': 'Savol muvaffaqiyatli o\'chirildi'
        }
    except Exception as e:
        await db.rollback()
        print(f"Error in admin_delete_question: {e}")
        return wrong(f"Savolni o'chirishda xatolik: {str(e)}", status=False)

async def admin_get_variants_by_question_id(db: AsyncSession, question_id: int):
    """Admin uchun savol variantlarini olish"""
    try:
        result = await db.execute(select(Variantlar).where(Variantlar.savol_id == question_id))
        variants = result.scalars().all()
        variants_list = []
        for v in variants:
            variants_list.append({
                'id': v.id,
                'savol_id': v.savol_id,
                'text': v.text,
                'is_true': v.is_true
            })
        
        print('\n\n\n variants_list:', variants_list, '\n\n\n')
        return variants_list
    except Exception as e:
        print(f"Error in admin_get_variants_by_question_id: {e}")
        return []

async def admin_add_variant(db: AsyncSession, question_id: int, variant_data: dict):
    """Admin uchun savolga variant qo'shish"""
    try:
        # First check if question exists
        result = await db.execute(select(Savollar).where(Savollar.id == question_id))
        question = result.scalar_one_or_none()
        
        if not question:
            return wrong("Savol topilmadi", status=False)
        
        # Create new variant
        new_variant = Variantlar(
            savol_id=question_id,
            text=variant_data['text'],
            is_true=variant_data['is_true']
        )
        
        db.add(new_variant)
        await db.commit()
        await db.refresh(new_variant)
        
        return {
            'status': True,
            'message': 'Variant muvaffaqiyatli qo\'shildi',
            'variant': {
                'id': new_variant.id,
                'savol_id': new_variant.savol_id,
                'text': new_variant.text,
                'is_true': new_variant.is_true
            }
        }
    except Exception as e:
        await db.rollback()
        print(f"Error in admin_add_variant: {e}")
        return wrong(f"Variant qo'shishda xatolik: {str(e)}", status=False)

async def admin_update_variant(db: AsyncSession, question_id: int, variant_id: int, variant_data: dict):
    """Admin uchun variantni yangilash"""
    try:
        # First check if question exists
        result = await db.execute(select(Savollar).where(Savollar.id == question_id))
        question = result.scalar_one_or_none()
        
        if not question:
            return wrong("Savol topilmadi", status=False)
        
        # Find the variant
        result = await db.execute(select(Variantlar).where(
            Variantlar.id == variant_id,
            Variantlar.savol_id == question_id
        ))
        variant = result.scalar_one_or_none()
        
        if not variant:
            return wrong("Variant topilmadi", status=False)
        
        # Update variant fields
        if 'text' in variant_data:
            variant.text = variant_data['text']
        if 'is_true' in variant_data:
            variant.is_true = variant_data['is_true']
        
        await db.commit()
        await db.refresh(variant)
        
        return {
            'status': True,
            'message': 'Variant muvaffaqiyatli yangilandi',
            'variant': {
                'id': variant.id,
                'savol_id': variant.savol_id,
                'text': variant.text,
                'is_true': variant.is_true
            }
        }
    except Exception as e:
        await db.rollback()
        print(f"Error in admin_update_variant: {e}")
        return wrong(f"Variantni yangilashda xatolik: {str(e)}", status=False)

async def admin_delete_variant(db: AsyncSession, question_id: int, variant_id: int):
    """Admin uchun variantni o'chirish"""
    try:
        # First check if question exists
        result = await db.execute(select(Savollar).where(Savollar.id == question_id))
        question = result.scalar_one_or_none()
        
        if not question:
            return wrong("Savol topilmadi", status=False)
        
        # Find the variant
        result = await db.execute(select(Variantlar).where(
            Variantlar.id == variant_id,
            Variantlar.savol_id == question_id
        ))
        variant = result.scalar_one_or_none()
        
        if not variant:
            return wrong("Variant topilmadi", status=False)
        
        await db.delete(variant)
        await db.commit()
        
        return {
            'status': True,
            'message': 'Variant muvaffaqiyatli o\'chirildi'
        }
    except Exception as e:
        await db.rollback()
        print(f"Error in admin_delete_variant: {e}")
        return wrong(f"Variantni o'chirishda xatolik: {str(e)}", status=False)