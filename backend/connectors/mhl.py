"""
MHL (Molodezhnaya Hokkeinaya Liga / Junior Hockey League) Connector
Source: https://mhl.khl.ru/stat/
Status: Placeholder — real scraping/API logic to be implemented.

Implementation notes:
- The MHL is Russia's top junior hockey league, operating under the KHL
  umbrella. It serves as the primary development league for KHL clubs.
- The stats site is at mhl.khl.ru. The site is primarily in Russian with
  limited or no English version available.
- Since the MHL operates under the KHL, it may share web infrastructure
  and API patterns with the KHL site. Check for similar API endpoints:
      https://mhl.khl.ru/api/...
  or feed endpoints similar to the KHL's architecture.
- Open browser DevTools → Network tab → filter by XHR/Fetch while loading
  the stats page to discover API endpoints.
- Stats pages are organized by season. Season identifiers may be numeric IDs
  or formatted strings. Map self.season ('2025-26') to the MHL's format.
- The site is in Russian — player names will be in Cyrillic. For our purposes,
  we need to transliterate names to Latin characters. Consider using a
  transliteration library (e.g., transliterate or cyrtranslit) or check if
  the API provides Latin name variants.
- Skater stats typically include: GP (И), G (Г), A (П), PTS (О), PIM (Штр),
  +/-, and possibly PPG, SHG, SOG.
- Goalie stats typically include: GP (И), W (В), L (П), SO (СО), GAA, SV%,
  MIN.
- Player profiles may contain DOB, height, weight, nationality, position,
  and draft eligibility information.
- The MHL has 30+ teams and is a large league — expect 700+ skaters and
  60+ goalies. Pagination will likely be necessary.
- This is a critical league for Russian prospect tracking — many NHL-drafted
  players develop in the MHL before moving to the KHL.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class MHLConnector(BaseConnector):
    league_code = 'mhl'
    league_name = 'MHL (Junior Hockey League)'
    source_url = 'https://mhl.khl.ru/stat/'

    # MHL stats site — may share KHL infrastructure
    STATS_BASE = 'https://mhl.khl.ru'

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the MHL stats site/API.

        Suggested approach:
        1. Map self.season (e.g. '2025-26') to the MHL's season identifier.
           Check the stats page for available seasons and their format.
        2. Discover API endpoints by inspecting network traffic on the stats
           page. Look for patterns similar to the KHL site.
        3. Fetch skater stats — via API if discovered, or by scraping HTML:
           GET {STATS_BASE}/stat/players/?season={season_id}
           Handle pagination to get all players.
        4. Fetch goalie stats similarly.
        5. Handle Cyrillic names — either:
           a) Find a Latin name variant in the API response
           b) Transliterate Cyrillic names using a library
           c) Store Cyrillic as primary with transliterated alternate_name
        6. Return a dict with keys like:
           {'skaters': [...], 'goalies': [...], 'players': [...]}

        Note: The site may have different encoding (Windows-1251 vs UTF-8).
        Verify response encoding and handle accordingly.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw response.

        MHL player records may include:
        - name (in Cyrillic — needs transliteration for primary fields)
        - date_of_birth (critical for draft eligibility tracking)
        - position, shoots/catches
        - height (cm), weight (kg) — metric units expected
        - nationality (mostly Russian, but some from other CIS countries)
        - team, player ID

        Store Cyrillic name in alternate_names for cross-reference.
        Use transliterated Latin name for first_name/last_name/full_name.
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw response.

        Russian stat abbreviations → our fields:
        - И (Игры/Games) → games_played
        - Г (Голы/Goals) → goals
        - П (Передачи/Assists) → assists
        - О (Очки/Points) → points
        - Штр (Штрафные минуты/Penalty Minutes) → penalty_minutes
        - +/- → plus_minus

        Additional stats may include PPG, SHG, GWG, SOG if available.
        Map to NormalizedSkaterStats.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw response.

        Russian stat abbreviations → our fields:
        - И (Игры) → games_played
        - В (Выигрыши/Wins) → wins
        - П (Проигрыши/Losses) → losses
        - СО (Сухие матчи/Shutouts) → shutouts
        - КН (Коэффициент надежности/GAA) → goals_against_avg
        - %ОБ (%Отбитых бросков/SV%) → save_pct

        Map to NormalizedGoalieStats.
        """
        raise NotImplementedError
