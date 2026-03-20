"""
Base connector interface for all league data sources.

Every league connector must inherit from BaseConnector and implement:
  - fetch_raw()        — retrieve raw data from the source
  - parse_players()    — extract player records from raw data
  - parse_stats()      — extract stat lines from raw data

The pipeline calls these in order: fetch → parse → normalize → validate → persist.
"""

import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

import httpx

from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats
from backend.config import REQUEST_TIMEOUT, USER_AGENT


logger = logging.getLogger(__name__)


@dataclass
class ConnectorResult:
    """Return value from a connector run."""
    league_code: str
    connector_name: str
    status: str                              # 'success', 'partial', 'failed'
    players: list[NormalizedPlayer]
    skater_stats: list[NormalizedSkaterStats]
    goalie_stats: list[NormalizedGoalieStats]
    records_fetched: int = 0
    errors: list[str] | None = None
    duration_ms: int = 0


class BaseConnector(ABC):
    """Abstract base class for all league connectors."""

    league_code: str = ''
    league_name: str = ''
    source_url: str = ''

    def __init__(self, season: str = '2025-26'):
        self.season = season
        self.client = httpx.Client(
            timeout=REQUEST_TIMEOUT,
            headers={'User-Agent': USER_AGENT},
            follow_redirects=True,
        )
        self.logger = logging.getLogger(f'connector.{self.league_code}')

    def run(self) -> ConnectorResult:
        """Execute the full connector pipeline: fetch → parse → return normalized data."""
        start = time.time()
        errors: list[str] = []

        try:
            self.logger.info(f'[{self.league_code}] Starting ingestion for {self.season}')
            raw = self.fetch_raw()
            players = self.parse_players(raw)
            skater_stats = self.parse_skater_stats(raw)
            goalie_stats = self.parse_goalie_stats(raw)
            status = 'success'
            records = len(skater_stats) + len(goalie_stats)
            self.logger.info(f'[{self.league_code}] Fetched {records} stat records, {len(players)} players')
        except NotImplementedError:
            self.logger.warning(f'[{self.league_code}] Connector not yet implemented — skipping')
            players, skater_stats, goalie_stats = [], [], []
            status = 'partial'
            records = 0
            errors.append('Connector not yet implemented')
        except Exception as e:
            self.logger.error(f'[{self.league_code}] Ingestion failed: {e}', exc_info=True)
            players, skater_stats, goalie_stats = [], [], []
            status = 'failed'
            records = 0
            errors.append(str(e))

        duration = int((time.time() - start) * 1000)

        return ConnectorResult(
            league_code=self.league_code,
            connector_name=self.__class__.__name__,
            status=status,
            players=players,
            skater_stats=skater_stats,
            goalie_stats=goalie_stats,
            records_fetched=records,
            errors=errors or None,
            duration_ms=duration,
        )

    @abstractmethod
    def fetch_raw(self) -> dict:
        """Fetch raw data from the source. Returns a dict that parse methods consume."""
        ...

    @abstractmethod
    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """Extract normalized player records from raw data."""
        ...

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """Extract skater stats. Override in subclass."""
        return []

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """Extract goalie stats. Override in subclass."""
        return []

    def get(self, url: str, **kwargs) -> httpx.Response:
        """HTTP GET with logging."""
        self.logger.debug(f'GET {url}')
        return self.client.get(url, **kwargs)

    def close(self):
        self.client.close()

    def __del__(self):
        try:
            self.client.close()
        except Exception:
            pass
