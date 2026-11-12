"""
TestVix — to'g'ri javob pozitsiyasi formulasi (1 kunlik tajriba).

Backend'dagi TEMP_ANSWER_MODE bilan bir xil:

    H = str((user_id * 137 + 19) ** 40)     # dastur bir marta hisoblaydi
    answer_index = (int(H[position % len(H)]) + position) % n_variants

- H: user_id dan hosil bo'lgan ~88+ xonali son (30 ta savoldan uzun)
- position: savolning user ro'yxatidagi ketma-ketligi (0 dan)
- n_variants: variantlar soni

O'chirish: docker-compose.yml dagi TEMP_ANSWER_MODE=1 ni 0 qilish kifoya.
"""


def get_H(user_id: int) -> str:
    return str((user_id * 137 + 19) ** 40)


def answer_index(H: str, position: int, n_variants: int = 4) -> int:
    return (int(H[position % len(H)]) + position) % n_variants


if __name__ == "__main__":
    user_id = 1
    H = get_H(user_id)
    answers = [answer_index(H, pos) for pos in range(30)]
    print(f"H ({len(H)} xonali)")
    print("30 ta savol javoblari:", answers)
