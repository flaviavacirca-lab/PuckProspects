"""
Analytics computation module.

Computes derived metrics, percentiles, league-relative scoring indices,
and age-adjusted production for all players in the database.

Run after ingestion to update analytics columns.
"""

import logging
from typing import Optional

logger = logging.getLogger('analytics')


def compute_points_per_game(goals: int, assists: int, gp: int) -> Optional[float]:
    if gp <= 0:
        return None
    return round((goals + assists) / gp, 2)


def compute_shooting_pct(goals: int, shots: Optional[int]) -> Optional[float]:
    if shots is None or shots <= 0:
        return None
    return round((goals / shots) * 100, 2)


def compute_league_scoring_index(player_ppg: float, league_avg_ppg: float) -> Optional[float]:
    """Player PPG relative to league average. 1.0 = average, >1.0 = above average."""
    if league_avg_ppg <= 0:
        return None
    return round(player_ppg / league_avg_ppg, 2)


def compute_age_adjusted_ppg(ppg: float, age: int, league_level: str) -> float:
    """
    Adjust PPG for player age relative to league context.

    Younger players in pro/senior leagues get a boost.
    Older players in junior leagues get a penalty.

    Adjustment factors are approximate and should be refined with real data.
    """
    # Base age expectations by league level
    expected_age = {
        'pro': 25,
        'junior': 18,
        'college': 21,
        'u20': 19,
        'u18': 17,
        'development': 17,
    }.get(league_level, 20)

    age_diff = expected_age - age  # positive = younger than expected
    # Each year younger adds ~8% boost, each year older subtracts ~5%
    if age_diff > 0:
        factor = 1 + (age_diff * 0.08)
    else:
        factor = 1 + (age_diff * 0.05)

    return round(ppg * factor, 2)


def compute_percentile(value: float, values: list[float]) -> float:
    """Compute percentile rank (0-100) of a value within a distribution."""
    if not values:
        return 50.0
    below = sum(1 for v in values if v < value)
    equal = sum(1 for v in values if v == value)
    percentile = ((below + 0.5 * equal) / len(values)) * 100
    return round(min(max(percentile, 0), 100), 1)


def compute_team_pts_share(player_points: int, team_total_goals: int) -> Optional[float]:
    """Player's points as a percentage of their team's total goals."""
    if team_total_goals <= 0:
        return None
    return round((player_points / team_total_goals) * 100, 1)


# ── Batch Computation ──

def compute_all_analytics(players_with_stats: list[dict], league_averages: dict) -> list[dict]:
    """
    Given a list of player+stats dicts and league averages,
    compute all derived analytics fields.

    This is the main entry point for post-ingestion analytics.
    In production, this reads from and writes to the database.
    """
    # Group by league for percentile calculations
    by_league: dict[str, list[float]] = {}
    by_age: dict[int, list[float]] = {}
    by_position: dict[str, list[float]] = {}

    for p in players_with_stats:
        ppg = p.get('points_per_game', 0) or 0
        league = p.get('league_code', '')
        age = p.get('age', 0)
        pos = p.get('position_group', '')

        by_league.setdefault(league, []).append(ppg)
        if age:
            by_age.setdefault(age, []).append(ppg)
        if pos:
            by_position.setdefault(pos, []).append(ppg)

    # Compute analytics for each player
    for p in players_with_stats:
        ppg = p.get('points_per_game', 0) or 0
        league = p.get('league_code', '')
        age = p.get('age', 0)
        pos = p.get('position_group', '')
        level = p.get('league_level', 'pro')

        # League scoring index
        avg = league_averages.get(league, {}).get('avg_ppg', 0)
        p['league_scoring_index'] = compute_league_scoring_index(ppg, avg) if avg else None

        # Age-adjusted PPG
        if age and ppg:
            p['age_adjusted_ppg'] = compute_age_adjusted_ppg(ppg, age, level)

        # Percentiles
        if league in by_league:
            p['league_percentile'] = compute_percentile(ppg, by_league[league])
        if age in by_age:
            p['age_percentile'] = compute_percentile(ppg, by_age[age])
        if pos in by_position:
            p['position_percentile'] = compute_percentile(ppg, by_position[pos])

    return players_with_stats
