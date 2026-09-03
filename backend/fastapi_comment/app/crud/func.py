
import hmac
import hashlib


def generate_hash_url(id: int, test_code: str | int):
    key = 'awuduwhduahuhsuihwhauhdw87y7a8hudw78dhuah87'
    message = f"{id}|{test_code}"
    hash_value = hmac.new(key.encode(), message.encode(), hashlib.sha256).hexdigest()
    return hash_value

def verify_hash_url(id: int, test_code: str | int, hash_value: str):
    key = 'awuduwhduahuhsuihwhauhdw87y7a8hudw78dhuah87'
    message = f"{id}|{test_code}"
    expected_hash = hmac.new(key.encode(), message.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_hash, hash_value)

