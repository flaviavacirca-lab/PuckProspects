"""
AHL (American Hockey League) Connector
Source: https://theahl.com/stats
Status: Placeholder — real scraping/API logic to be implemented.

Implementation notes:
- The AHL website at theahl.com renders stats client-side using JavaScript.
  The visible stats tables are populated via background JSON API calls.
- Open browser DevTools → Network tab → filter by XHR/Fetch while loading the
  stats page to discover the underlying API endpoints.
- Historically the AHL has used a HockeyTech-powered API similar to the CHL
  leagues. Look for requests to domains like lscluster.hockeytech.com or
  similar feed endpoints.
- Typical API pattern:
      GET https://lscluster.hockeytech.com/feed/index.php
      ?feed=statviewfeed&view=players&season=73&league=4
      &position=skaters&sort=points&limit=100&...
  The 'league' param for AHL is typically 4, and 'season' is a numeric ID
  that changes each year.
- The API returns JSONP by default (callback wrapper). Strip the callback
  wrapper to get clean JSON, or pass fmt=json if supported.
- Skater stats fields typically include: GP, G, A, PTS, PIM, +/-, PPG, SHG,
  GWG, SOG, Sh%, etc.
- Goalie stats fields typically include: GP, W, L, OTL, SO, GAA, SV%, MIN,
  GA, SA, etc.
- Player bios (DOB, height, weight, position, shoots) are sometimes available
  via a separate player profile endpoint or within the stats response.
- Pagination: the API may cap results at 100 per page. Use offset/limit
  params or iterate until fewer results are returned.
- Season IDs must be discovered — scrape the season dropdown on the stats page
  or maintain a manual mapping (e.g. 2025-26 → season_id=76 or similar).
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class AHLConnector(BaseConnector):
    league_code = 'AHL'
    league_name = 'American Hockey League'
    source_url = 'https://theahl.com/stats'

    # HockeyTech API base (verify via browser network tab)
    API_BASE = 'https://lscluster.hockeytech.com/feed/index.php'
    LEAGUE_ID = 4  # AHL league identifier in HockeyTech system

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the AHL stats API.

        Suggested approach:
        1. Map self.season (e.g. '2025-26') to the HockeyTech numeric season ID.
           This may require fetching the season list first or using a hardcoded
           mapping dict.
        2. Fetch skater stats:
           GET {API_BASE}?feed=statviewfeed&view=players&season={id}
               &league={LEAGUE_ID}&position=skaters&sort=points&limit=100
               &fmt=json&key={api_key}
           Paginate by incrementing start= param if results are capped.
        3. Fetch goalie stats with position=goalies.
        4. Optionally fetch player bios via a separate endpoint or extract
           from roster pages.
        5. Return a dict with keys like:
           {'skaters': [...], 'goalies': [...], 'players': [...]}

        Note: An API key may be required. Check the JS source on theahl.com
        for the key value — it is typically embedded in the page source and
        is a public/client-side key, not a secret.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw API response.

        The HockeyTech feed typically includes these fields per player:
        - name, first_name, last_name
        - birthdate (YYYY-MM-DD)
        - position (C, LW, RW, D, G)
        - shoots (L/R)
        - height, weight (may need unit conversion)
        - team_name, team_id
        - player_id (use as external_id)

        Map these to NormalizedPlayer fields. Height may arrive in
        imperial format (e.g. "6'1\"") and need conversion to cm.
        Weight may be in lbs and need conversion to kg.
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw API response.

        Expected fields in each skater record:
        - games_played, goals, assists, points, penalty_minutes
        - plus_minus, power_play_goals, short_handed_goals
        - game_winning_goals, shots, shooting_percentage
        - team_name, player_id/name for linking

        Map to NormalizedSkaterStats. Use player name or ID as player_ref
        for later matching against NormalizedPlayer records.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw API response.

        Expected fields in each goalie record:
        - games_played, wins, losses, otl, shutouts
        - goals_against_average, save_percentage
        - saves, shots_against, minutes_played
        - team_name, player_id/name for linking

        Map to NormalizedGoalieStats. GAA and SV% are typically
        pre-calculated by the API.
        """
        raise NotImplementedError
