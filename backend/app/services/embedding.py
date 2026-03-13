from openai import OpenAI

from app.config import get_settings


def generate_embedding(text: str) -> list[float]:
    """Generate an embedding vector for the given text using OpenAI.

    Uses the text-embedding-3-small model (1536 dimensions).
    Returns an empty list if no API key is configured or the text is empty.
    """
    settings = get_settings()
    if not settings.openai_api_key:
        return []
    if not text or not text.strip():
        return []

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text.strip(),
    )
    return response.data[0].embedding
