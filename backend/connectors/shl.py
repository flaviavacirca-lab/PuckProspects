"""
SHL (Swedish Hockey League) Connector
Source: https://www.shl.se/statistik
Status: Placeholder — real scraping/API logic to be implemented.

Implementation notes:
- The SHL website at shl.se is a modern React/Next.js-based site that renders
  stats client-side. The visible stats tables are populated via background
  JSON API calls.
- Open browser DevTools → Network tab → filter by XHR/Fetch while loading
  the statistik page to discover the underlying API endpoints.
- The SHL has historically exposed a public JSON API. Look for requests to
  endpoints like:
      https://www.shl.se/api/seasons/{season}/statistics/players
  or similar paths under /api/.
- The site is in Swedish by default. Stat category labels will be in Swedish
  but the API response keys are typically English or abbreviated (GP, G, A, etc.).
- Season format on the site may differ from our internal format. The SHL
  typically uses a numeric season ID or a format like "2025" for the 2025-26
  season. Map self.season ('2025-26') accordingly.
- Skater stats fields typically include: GP (Matcher), G (Mål), A (Assist),
  PTS (Poäng), PIM (Utvisningsminuter), +/-, PPG, SHG, GWG, SOG, Sh%.
- Goalie stats fields typically include: GP, W (Vinster), L (Förluster),
  SO (Nollor), GAA (Insläppta mål/match), SV% (Räddningsprocent), MIN.
- Player profile pages may contain DOB, height, weight, nationality, and
  draft information. These may be accessible via a player detail API endpoint.
- Pagination: Check whether the stats endpoint returns all players at once
  or requires pagination parameters.
- The SHL has roughly 14 teams with ~25 players each, so expect ~350 skaters
  and ~30-40 goalies per season.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class SHLConnector(BaseConnector):
    league_code = 'shl'
    league_name = 'Swedish Hockey League'
    source_url = 'https://www.shl.se/statistik'

    # Suspected API base — verify via browser DevTools network tab
    API_BASE = 'https://www.shl.se/api'

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the SHL stats API.

        Suggested approach:
        1. Map self.season (e.g. '2025-26') to the SHL's season identifier.
           This may be a numeric ID or a year string (e.g. '2025').
           Check the season selector on shl.se/statistik for available values.
        2. Fetch skater stats:
           GET {API_BASE}/seasons/{season_id}/statistics/players?position=forwards
           GET {API_BASE}/seasons/{season_id}/statistics/players?position=defenders
           Or a single endpoint returning all skaters — inspect actual API.
        3. Fetch goalie stats:
           GET {API_BASE}/seasons/{season_id}/statistics/goalkeepers
        4. Optionally fetch player bios from player detail endpoints:
           GET {API_BASE}/players/{player_id}
        5. Return a dict with keys like:
           {'skaters': [...], 'goalies': [...], 'players': [...]}

        Note: The API may require specific headers (Accept: application/json)
        or may include CORS restrictions. Test with the httpx client.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw API response.

        SHL player records may include:
        - name, first_name, last_name
        - date_of_birth (format TBD — likely ISO 8601 or Swedish date format)
        - position (in Swedish or English abbreviations)
        - shoots/catches (L/R or Swedish equivalents)
        - height (cm), weight (kg) — Swedish sites typically use metric
        - nationality
        - team name and player ID (use as external_id)
        - draft information (if available)

        Map position names: 'Center' → 'C', 'Vänsterforward' → 'LW',
        'Högerforward' → 'RW', 'Back' → 'D', 'Målvakt' → 'G'.
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw API response.

        Expected fields per skater (Swedish labels → our fields):
        - GP (Matcher), G (Mål), A (Assist), PTS (Poäng)
        - PIM (Utvisningsminuter), +/-, PPG, SHG, GWG
        - SOG (Skott), Sh% (Skottfrekvens)
        - team_name, player_id/name for linking

        Map to NormalizedSkaterStats. Use player name or SHL player ID
        as player_ref for later matching.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw API response.

        Expected fields per goalie:
        - GP (Matcher), W (Vinster), L (Förluster), OTL
        - SO (Nollor/Shutouts), GAA (Insläppta mål/match)
        - SV% (Räddningsprocent), SA (Skott mot), SV (Räddningar)
        - MIN (Minuter), team_name, player_id/name

        Map to NormalizedGoalieStats. GAA and SV% are likely pre-calculated.
        """
        raise NotImplementedError
