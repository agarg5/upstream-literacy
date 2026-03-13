import pytest
from app.services.matching import calculate_match_score, get_shared_problems


def test_perfect_match():
    """Two identical users should have a high match score."""
    user_a = {
        'problem_ids': [1, 2, 3],
        'challenge_embedding': None,
        'district_type': 'urban',
        'enrollment': 50000,
        'frl_pct': 0.6,
        'esl_pct': 0.2,
    }
    user_b = dict(user_a)
    score = calculate_match_score(user_a, user_b)
    assert score > 0.9


def test_no_overlap():
    """Users with no shared problems and different demographics should have low score."""
    user_a = {
        'problem_ids': [1, 2],
        'challenge_embedding': None,
        'district_type': 'urban',
        'enrollment': 200000,
        'frl_pct': 0.8,
        'esl_pct': 0.4,
    }
    user_b = {
        'problem_ids': [3, 4],
        'challenge_embedding': None,
        'district_type': 'rural',
        'enrollment': 5000,
        'frl_pct': 0.2,
        'esl_pct': 0.05,
    }
    score = calculate_match_score(user_a, user_b)
    assert score < 0.3


def test_partial_overlap():
    """Users with some shared problems should score between 0.3 and 0.7."""
    user_a = {
        'problem_ids': [1, 2, 3],
        'challenge_embedding': None,
        'district_type': 'urban',
        'enrollment': 50000,
        'frl_pct': 0.6,
        'esl_pct': 0.2,
    }
    user_b = {
        'problem_ids': [2, 3, 4],
        'challenge_embedding': None,
        'district_type': 'suburban',
        'enrollment': 30000,
        'frl_pct': 0.5,
        'esl_pct': 0.15,
    }
    score = calculate_match_score(user_a, user_b)
    assert 0.3 < score < 0.8


def test_semantic_similarity_with_embeddings():
    """When embeddings are present, semantic score should factor in."""
    import numpy as np
    embedding = list(np.random.randn(1536))
    user_a = {
        'problem_ids': [1],
        'challenge_embedding': embedding,
        'district_type': 'urban',
        'enrollment': 50000,
        'frl_pct': 0.5,
        'esl_pct': 0.2,
    }
    user_b = {
        'problem_ids': [1],
        'challenge_embedding': embedding,  # identical embedding
        'district_type': 'urban',
        'enrollment': 50000,
        'frl_pct': 0.5,
        'esl_pct': 0.2,
    }
    score = calculate_match_score(user_a, user_b)
    assert score > 0.9


def test_score_between_0_and_1():
    """Score should always be between 0 and 1."""
    import numpy as np
    for _ in range(20):
        user_a = {
            'problem_ids': list(np.random.choice(range(1, 13), size=np.random.randint(1, 5), replace=False)),
            'challenge_embedding': None,
            'district_type': np.random.choice(['urban', 'suburban', 'rural']),
            'enrollment': int(np.random.randint(1000, 300000)),
            'frl_pct': float(np.random.uniform(0, 1)),
            'esl_pct': float(np.random.uniform(0, 1)),
        }
        user_b = {
            'problem_ids': list(np.random.choice(range(1, 13), size=np.random.randint(1, 5), replace=False)),
            'challenge_embedding': None,
            'district_type': np.random.choice(['urban', 'suburban', 'rural']),
            'enrollment': int(np.random.randint(1000, 300000)),
            'frl_pct': float(np.random.uniform(0, 1)),
            'esl_pct': float(np.random.uniform(0, 1)),
        }
        score = calculate_match_score(user_a, user_b)
        assert 0 <= score <= 1


def test_get_shared_problems():
    user_a_problems = [{'id': 1, 'title': 'A'}, {'id': 2, 'title': 'B'}]
    user_b_problems = [{'id': 2, 'title': 'B'}, {'id': 3, 'title': 'C'}]
    shared = get_shared_problems(user_a_problems, user_b_problems)
    assert len(shared) == 1
    assert shared[0]['id'] == 2


def test_empty_problems():
    user_a = {
        'problem_ids': [],
        'challenge_embedding': None,
        'district_type': 'urban',
        'enrollment': 50000,
        'frl_pct': 0.5,
        'esl_pct': 0.2,
    }
    user_b = dict(user_a)
    score = calculate_match_score(user_a, user_b)
    assert 0 <= score <= 1
