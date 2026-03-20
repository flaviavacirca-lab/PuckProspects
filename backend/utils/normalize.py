"""Utility functions for name normalization, fuzzy matching, and data cleaning."""

import re
from typing import Optional
from datetime import date, datetime

try:
    from unidecode import unidecode
except ImportError:
    def unidecode(s: str) -> str:
        return s


def normalize_name(name: str) -> str:
    """Lowercase, strip accents, remove punctuation for fuzzy matching."""
    name = unidecode(name).lower().strip()
    name = re.sub(r"[^a-z0-9\s]", "", name)
    name = re.sub(r"\s+", " ", name)
    return name


def compute_age(dob: Optional[date], reference: Optional[date] = None) -> Optional[int]:
    if dob is None:
        return None
    ref = reference or date.today()
    return ref.year - dob.year - ((ref.month, ref.day) < (dob.month, dob.day))


def parse_height_to_cm(height_str: str) -> Optional[int]:
    """Parse heights like 6'1\" or 185cm."""
    if not height_str:
        return None
    m = re.match(r"(\d+)'(\d+)\"?", height_str)
    if m:
        feet, inches = int(m.group(1)), int(m.group(2))
        return round(feet * 30.48 + inches * 2.54)
    m = re.match(r"(\d{2,3})\s*cm", height_str, re.IGNORECASE)
    if m:
        return int(m.group(1))
    return None


def parse_weight_to_kg(weight_str: str) -> Optional[int]:
    """Parse weights like 195 lbs or 88 kg."""
    if not weight_str:
        return None
    m = re.match(r"(\d+)\s*(lbs?|pounds?)", weight_str, re.IGNORECASE)
    if m:
        return round(int(m.group(1)) * 0.453592)
    m = re.match(r"(\d+)\s*(kg)?", weight_str, re.IGNORECASE)
    if m:
        return int(m.group(1))
    return None


def position_group(pos: Optional[str]) -> Optional[str]:
    if not pos:
        return None
    pos = pos.upper().strip()
    if pos in ('C', 'LW', 'RW', 'F', 'W'):
        return 'F'
    if pos in ('D', 'LD', 'RD'):
        return 'D'
    if pos in ('G',):
        return 'G'
    return None


def safe_int(val) -> Optional[int]:
    if val is None or val == '' or val == '-':
        return None
    try:
        return int(float(str(val).replace(',', '')))
    except (ValueError, TypeError):
        return None


def safe_float(val) -> Optional[float]:
    if val is None or val == '' or val == '-':
        return None
    try:
        return float(str(val).replace(',', ''))
    except (ValueError, TypeError):
        return None


def parse_season(season_str: str) -> str:
    """Normalize season strings like '2024-2025' or '2024/25' to '2024-25'."""
    season_str = season_str.strip()
    m = re.match(r"(\d{4})[-/](\d{2,4})", season_str)
    if m:
        start = m.group(1)
        end = m.group(2)
        if len(end) == 4:
            end = end[2:]
        return f"{start}-{end}"
    return season_str
