"""
WHL (Western Hockey League) Connector
Source: https://whl.ca/stats
Status: Placeholder — real scraping/API logic to be implemented.

Implementation notes:
- The WHL is one of three CHL (Canadian Hockey League) member leagues, along
  with the OHL and QMJHL. All three use the same HockeyTech platform for
  stats and data feeds, so the API structure is virtually identical to the
  OHL connector.
- The WHL stats page at whl.ca/stats loads data client-side via JavaScript
  calling the HockeyTech feed API. Confirm exact URLs using browser DevTools
  → Network tab.
- Typical API endpoint:
      GET https://lscluster.hockeytech.com/feed/index.php
      ?feed=statviewfeed&view=players&season={season_id}
      &league=1&position=skaters&sort=points&limit=100
      &key={client_key}&fmt=json&site_id=1
  The WHL league ID is typically 1, site_id is 1 (verify via network tab).
- The same /feed/index.php endpoint supports the same feed types as OHL:
  - statviewfeed: player stats, standings
  - modulekit: rosters, schedules, game summaries
  - playersearch: player search and biographical data
- The WHL spans western Canada and the US Pacific Northwest. Teams include
  clubs in BC, Alberta, Saskatchewan, Manitoba, Washington, Oregon, and
  Idaho. There are typically 22 teams, so expect a large volume of players.
- Like the OHL, WHL players are predominantly draft-eligible ages (16-20).
  Capturing DOB, nationality, and draft status is critical for prospect
  tracking.
- Season IDs are numeric and WHL-specific. The ID for 2025-26 must be
  discovered from the stats page dropdown or a season list API call.
- The API key is public/client-side. Find it in the JavaScript on whl.ca.
  It will differ from the OHL key but the parameter name is the same.
- Since this connector shares the same platform as OHL and QMJHL, consider
  extracting shared HockeyTech logic into a base class or mixin to avoid
  code duplication across all three CHL connectors.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class WHLConnector(BaseConnector):
    league_code = 'WHL'
    league_name = 'Western Hockey League'
    source_url = 'https://whl.ca/stats'

    # HockeyTech API base (shared across CHL leagues)
    API_BASE = 'https://lscluster.hockeytech.com/feed/index.php'
    LEAGUE_ID = 1   # WHL league identifier in HockeyTech system
    SITE_ID = 1     # WHL site identifier (verify via network tab)

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the WHL/HockeyTech stats API.

        This follows the same pattern as the OHL connector since both use
        the HockeyTech platform. Consider sharing code via a CHL base class.

        Suggested approach:
        1. Map self.season to the HockeyTech numeric season ID for the WHL.
           The WHL uses its own season IDs, separate from the OHL's.
        2. Fetch skater stats:
           GET {API_BASE}?feed=statviewfeed&view=players
               &season={season_id}&league={LEAGUE_ID}
               &position=skaters&sort=points&limit=100&start=0
               &site_id={SITE_ID}&key={api_key}&fmt=json
           Paginate via start= param. With 22 teams, expect 400+ skaters.
        3. Fetch goalie stats with position=goalies.
        4. Fetch player bios from roster feeds or player profiles.
        5. Return a dict:
           {'skaters': [...], 'goalies': [...], 'rosters': [...]}

        Note: The API key is WHL-specific. Extract from JS source on whl.ca.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw API response.

        Same HockeyTech field structure as OHL:
        - first_name, last_name, birthdate, position, shoots
        - height (imperial), weight (lbs), birthplace, nationality
        - draft_year, draft_round, draft_pick, drafted_by, nhl_rights
        - player_id (HockeyTech ID — store in external_ids)

        Convert height to cm, weight to kg. Map draft fields.
        WHL has historically produced many NHL prospects — draft data
        is especially important here.
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw API response.

        Same fields as OHL HockeyTech feed:
        - games_played, goals, assists, points, penalty_minutes
        - plus_minus, power_play_goals, power_play_assists
        - short_handed_goals, game_winning_goals, shots, shooting_pct
        - team_name, player_id

        Map to NormalizedSkaterStats. Set league_code='WHL'.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw API response.

        Same fields as OHL:
        - games_played, wins, losses, otl, shutouts
        - goals_against_average, save_percentage
        - saves, shots_against, minutes_played (may be "MM:SS" string)
        - team_name, player_id

        Parse minutes from "MM:SS" to float if needed.
        Map to NormalizedGoalieStats. Set league_code='WHL'.
        """
        raise NotImplementedError
