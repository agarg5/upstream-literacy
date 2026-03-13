import numpy as np


def calculate_match_score(user_a_data: dict, user_b_data: dict) -> float:
    """
    Calculate a match score between two users based on problem overlap,
    semantic similarity of free-text challenges, and demographic similarity.

    Args:
        user_a_data: dict with keys: problem_ids (list[int]),
            challenge_embedding (list[float] | None), district_type (str),
            enrollment (int), frl_pct (float), esl_pct (float)
        user_b_data: same structure as user_a_data

    Returns:
        A float between 0 and 1 (rounded to 4 decimal places).
    """
    # 1. Problem overlap (40% weight)
    a_problems = set(user_a_data.get("problem_ids", []))
    b_problems = set(user_b_data.get("problem_ids", []))
    shared = a_problems & b_problems
    problem_score = len(shared) / max(len(a_problems | b_problems), 1)

    # 2. Semantic similarity (30% weight)
    a_emb = user_a_data.get("challenge_embedding")
    b_emb = user_b_data.get("challenge_embedding")
    if a_emb is not None and b_emb is not None:
        a_vec = np.array(a_emb)
        b_vec = np.array(b_emb)
        cos_sim = np.dot(a_vec, b_vec) / (np.linalg.norm(a_vec) * np.linalg.norm(b_vec) + 1e-8)
        semantic_score = max(0.0, float(cos_sim))
    else:
        semantic_score = problem_score  # fallback to problem overlap

    # 3. Demographic similarity (30% weight)
    max_enrollment = 500_000
    type_match = 1.0 if user_a_data.get("district_type") == user_b_data.get("district_type") else 0.0
    enroll_sim = 1.0 - abs(
        (user_a_data.get("enrollment", 0) - user_b_data.get("enrollment", 0))
    ) / max_enrollment
    frl_sim = 1.0 - abs(user_a_data.get("frl_pct", 0) - user_b_data.get("frl_pct", 0))
    esl_sim = 1.0 - abs(user_a_data.get("esl_pct", 0) - user_b_data.get("esl_pct", 0))
    demo_score = (type_match + max(0.0, enroll_sim) + max(0.0, frl_sim) + max(0.0, esl_sim)) / 4

    return round(0.4 * problem_score + 0.3 * semantic_score + 0.3 * demo_score, 4)


def get_shared_problems(user_a_problems: list[dict], user_b_problems: list[dict]) -> list[dict]:
    """Return list of problem dicts that both users share.

    Args:
        user_a_problems: list of dicts each containing at least an 'id' key.
        user_b_problems: list of dicts each containing at least an 'id' key.

    Returns:
        The subset of user_b_problems whose id also appears in user_a_problems.
    """
    a_ids = {p["id"] for p in user_a_problems}
    return [p for p in user_b_problems if p["id"] in a_ids]
