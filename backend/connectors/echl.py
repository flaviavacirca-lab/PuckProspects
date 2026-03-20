"""
ECHL Connector
Source: https://echl.com/stats
Status: Placeholder — real scraping/API logic to be implemented.

Implementation notes:
- The ECHL website uses a similar infrastructure to the AHL. It is widely
  believed to be powered by the HockeyTech platform, so the same general
  approach used for the AHL connector should apply here.
- Open browser DevTools → Network tab on https://echl.com/stats to confirm
  the actual API domain and parameters. Look for XHR/Fetch requests to
  lscluster.hockeytech.com or a similar feed host.
- The ECHL league ID in the HockeyTech system is typically 8 (verify this).
- API endpoint pattern (similar to AHL):
      GET https://lscluster.hockeytech.com/feed/index.php
      ?feed=statviewfeed&view=players&season={id}&league=8
      &position=skaters&sort=points&limit=100&fmt=json&key={api_key}
- The ECHL stats page includes standard categories: skater stats (GP, G, A,
  PTS, PIM, +/-, PPG, SHG, GWG, SOG) and goalie stats (GP, W, L, OTL, SO,
  GAA, SV%, MIN).
- Player biographical data (DOB, height, weight, nationality, shoots/catches)
  may be available in the stats response or via separate roster/player
  profile endpoints.
- Season ID mapping is required — the numeric season ID changes each year
  and must be discovered from the season selector on the stats page or from
  the API's season list endpoint.
- Like the AHL, the API key is typically a public client-side key embedded
  in the page source. Inspect the JavaScript on echl.com to find it.
- ECHL has more teams than the AHL, so paginate carefully. Ensure the
  limit/offset params cover all players (there may be 500+ skaters total).
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class ECHLConnector(BaseConnector):
    league_code = 'ECHL'
    league_name = 'ECHL'
    source_url = 'https://echl.com/stats'

    # HockeyTech API base (verify via browser network tab)
    API_BASE = 'https://lscluster.hockeytech.com/feed/index.php'
    LEAGUE_ID = 8  # ECHL league identifier in HockeyTech system (verify)

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the ECHL stats API.

        Suggested approach:
        1. Map self.season (e.g. '2025-26') to the HockeyTech numeric season ID.
           Try fetching a season list endpoint first, or maintain a lookup dict.
        2. Fetch skater stats:
           GET {API_BASE}?feed=statviewfeed&view=players&season={id}
               &league={LEAGUE_ID}&position=skaters&sort=points&limit=100
               &start=0&fmt=json&key={api_key}
           Paginate with start= param until all players are retrieved.
        3. Fetch goalie stats with position=goalies.
        4. Optionally fetch player bios from roster pages or a separate feed.
        5. Return a dict:
           {'skaters': [...], 'goalies': [...], 'players': [...]}

        Note: Confirm the API key by inspecting JS source on echl.com.
        The key is public and embedded client-side.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw API response.

        HockeyTech feeds typically include per player:
        - first_name, last_name, birthdate, position, shoots
        - height (may be imperial string like "5'11\""), weight (lbs)
        - team_name, player_id
        - nationality/birthplace (may need separate lookup)

        Convert height to cm and weight to kg for NormalizedPlayer.
        Store the HockeyTech player_id in external_ids for deduplication.
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw API response.

        Expected fields: games_played, goals, assists, points,
        penalty_minutes, plus_minus, power_play_goals,
        short_handed_goals, game_winning_goals, shots,
        shooting_percentage, team_name, player reference.

        Map to NormalizedSkaterStats. Set league_code='ECHL' and
        season=self.season on each record.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw API response.

        Expected fields: games_played, wins, losses, otl, shutouts,
        goals_against_average, save_percentage, saves, shots_against,
        minutes_played, team_name, player reference.

        Map to NormalizedGoalieStats. Set league_code='ECHL' and
        season=self.season on each record.
        """
        raise NotImplementedError
