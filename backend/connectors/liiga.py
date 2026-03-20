"""
Liiga (Finnish top hockey league) Connector
Source: https://liiga.fi/en/statistics
Status: Placeholder — real scraping/API logic to be implemented.

Implementation notes:
- Liiga is Finland's top professional hockey league. The website at liiga.fi
  has an English version available at liiga.fi/en/.
- The site is a modern SPA (likely React or Vue) that renders stats client-side.
  The stats tables are populated via background JSON API calls.
- Open browser DevTools → Network tab → filter by XHR/Fetch while loading
  the statistics page to discover API endpoints.
- The API likely lives under a path like:
      https://liiga.fi/api/v1/players/stats
  or similar. Look for /api/ prefixed endpoints in network requests.
- Season identifiers may use a numeric format or year-based format
  (e.g. '2025' for 2025-26 season). Check the season dropdown on the
  statistics page.
- The English site should return data with English keys, but some fields
  may still use Finnish abbreviations.
- Skater stats typically include: GP, G, A, PTS, PIM, +/-, PPG, SHG,
  GWG, SOG, Sh%, FO% (faceoff percentage), AVG TOI.
- Goalie stats typically include: GP, W, L, OTL, SO, GAA, SV%, SA, SV, MIN.
- Player bios (DOB, height, weight, position, shoots, nationality) may be
  available via player detail endpoints or embedded in the stats response.
- Liiga has 16 teams with roughly 25 players each, so expect ~400 skaters
  and ~35 goalies per season.
- Finland is a major hockey nation — Liiga is an important league for
  NHL draft prospects and development.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class LiigaConnector(BaseConnector):
    league_code = 'liiga'
    league_name = 'Liiga'
    source_url = 'https://liiga.fi/en/statistics'

    # Suspected API base — verify via browser DevTools network tab
    API_BASE = 'https://liiga.fi/api/v1'

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the Liiga stats API.

        Suggested approach:
        1. Map self.season (e.g. '2025-26') to Liiga's season identifier.
           This may be a year (2025) or a numeric ID. Inspect the season
           selector on liiga.fi/en/statistics.
        2. Fetch skater stats:
           GET {API_BASE}/players/stats?season={season_id}&position=skaters
           Or discover the actual endpoint via DevTools.
        3. Fetch goalie stats:
           GET {API_BASE}/players/stats?season={season_id}&position=goalies
        4. Optionally fetch player profile data:
           GET {API_BASE}/players/{player_id}
        5. Return a dict with keys like:
           {'skaters': [...], 'goalies': [...], 'players': [...]}

        Note: The API may require specific headers (Accept: application/json,
        Accept-Language: en) or authentication tokens. Check network requests
        for required headers.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw API response.

        Liiga player records may include:
        - name, firstName, lastName
        - dateOfBirth (likely ISO 8601 format)
        - position (C, LW, RW, D, G or Finnish equivalents)
        - shoots/catches (L/R)
        - height (cm), weight (kg) — Finnish sites use metric
        - nationality
        - team, player ID (use as external_id)

        Map Finnish position names if needed: 'Keskushyökkääjä' → 'C',
        'Vasemman laidan hyökkääjä' → 'LW', 'Puolustaja' → 'D',
        'Maalivahti' → 'G'. The English API version likely uses English labels.
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw API response.

        Expected fields per skater:
        - GP, G, A, PTS, PIM, +/-
        - PPG, SHG, GWG, SOG, Sh%
        - FO% (faceoff percentage), AVG TOI (average time on ice)
        - team_name, player_id/name for linking

        Liiga may provide additional advanced stats like Corsi, Fenwick,
        or expected goals — store these in raw_data if available.
        Map to NormalizedSkaterStats.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw API response.

        Expected fields per goalie:
        - GP, W, L, OTL, SO
        - GAA, SV%, SA, SV, MIN
        - team_name, player_id/name

        Map to NormalizedGoalieStats. GAA and SV% are likely pre-calculated.
        """
        raise NotImplementedError
