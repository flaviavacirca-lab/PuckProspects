"""Normalized player data models used across all connectors."""

from dataclasses import dataclass, field
from typing import Optional
from datetime import date


@dataclass
class NormalizedPlayer:
    """Canonical player record — all connectors must produce this."""
    first_name: str
    last_name: str
    full_name: str
    date_of_birth: Optional[date] = None
    nationality: Optional[str] = None
    position: Optional[str] = None          # C, LW, RW, D, G
    position_group: Optional[str] = None    # F, D, G
    shoots_catches: Optional[str] = None    # L, R
    height_cm: Optional[int] = None
    weight_kg: Optional[int] = None
    draft_status: Optional[str] = None
    draft_year: Optional[int] = None
    draft_round: Optional[int] = None
    draft_overall: Optional[int] = None
    drafted_by: Optional[str] = None
    nhl_rights_holder: Optional[str] = None
    alternate_names: list[str] = field(default_factory=list)
    external_ids: dict = field(default_factory=dict)
    source_urls: list[str] = field(default_factory=list)


@dataclass
class NormalizedSkaterStats:
    """Normalized skater stat line — one per player/season/league/team."""
    player_ref: str                          # temporary key for matching (e.g. normalized name)
    season: str
    league_code: str
    team_name: str
    games_played: int = 0
    goals: int = 0
    assists: int = 0
    points: int = 0
    penalty_minutes: int = 0
    plus_minus: Optional[int] = None
    pp_goals: Optional[int] = None
    pp_assists: Optional[int] = None
    sh_goals: Optional[int] = None
    sh_assists: Optional[int] = None
    shots: Optional[int] = None
    shooting_pct: Optional[float] = None
    faceoff_pct: Optional[float] = None
    avg_toi: Optional[float] = None
    gw_goals: Optional[int] = None
    hits: Optional[int] = None
    blocked_shots: Optional[int] = None
    raw_data: Optional[dict] = None
    source_url: Optional[str] = None


@dataclass
class NormalizedGoalieStats:
    """Normalized goalie stat line."""
    player_ref: str
    season: str
    league_code: str
    team_name: str
    games_played: int = 0
    games_started: Optional[int] = None
    wins: int = 0
    losses: int = 0
    otl: int = 0
    shutouts: int = 0
    goals_against: Optional[int] = None
    goals_against_avg: Optional[float] = None
    saves: Optional[int] = None
    shots_against: Optional[int] = None
    save_pct: Optional[float] = None
    minutes_played: Optional[float] = None
    raw_data: Optional[dict] = None
    source_url: Optional[str] = None
