from app.services.auth import hash_password, verify_password, create_access_token
from jose import jwt
from app.config import get_settings


def test_hash_password():
    hashed = hash_password("testpassword")
    assert hashed != "testpassword"
    assert len(hashed) > 20


def test_verify_password():
    hashed = hash_password("mypassword")
    assert verify_password("mypassword", hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_create_access_token():
    token = create_access_token({"sub": "42"})
    settings = get_settings()
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    assert payload["sub"] == "42"
    assert "exp" in payload
