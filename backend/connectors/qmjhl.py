"""
QMJHL (Quebec Major Junior Hockey League) Connector
Source: https://theqmjhl.ca/stats
Status: Placeholder — real scraping/API logic to be implemented.

Implementation notes:
- The QMJHL (Ligue de hockey junior majeur du Quebec / LHJMQ) is the third
  CHL member league alongside the OHL and WHL. Like the other two, it uses
  the HockeyTech platform for its stats and data feeds.
- The API structure is the same as OHL and WHL. The only differences are the
  league_id, site_id, API key, and season IDs.
- The QMJHL stats page at theqmjhl.ca/stats loads via JavaScript from a
  HockeyTech feed. Confirm exact URLs with browser DevTools → Network tab.
- Typical API endpoint:
      GET https://lscluster.hockeytech.com/feed/index.php
      ?feed=statviewfeed&view=players&season={season_id}
      &league=3&position=skaters&sort=points&limit=100
      &key={client_key}&fmt=json&site_id=3
  The QMJHL league ID is typically 3, site_id is 3 (verify).
- Bilingual considerations: the QMJHL site may return some data in French
  (e.g. team names like "Remparts de Quebec", position labels). Player names
  frequently include French accented characters (e.g. "Frederic", "Rene-Paul").
  Ensure proper UTF-8 handling and consider normalizing accented characters
  for player_ref matching while preserving originals in the player record.
- The QMJHL has 18 teams across Quebec and the Maritime provinces. Expect
  roughly 350-400 skaters and 40-50 goalies per season.
- Like OHL/WHL, these are draft-eligible aged players (16-20). DOB,
  nationality, and draft status are high-value fields for prospect tracking.
- Season IDs are QMJHL-specific. Discover via the stats page season dropdown
  or a season list API call.
- The API key is specific to the QMJHL site. Extract it from the JavaScript
  on theqmjhl.ca.
- Since all three CHL leagues (OHL, WHL, QMJHL) share the same HockeyTech
  API platform, strongly consider creating a shared CHLBaseConnector or mixin
  that encapsulates the common fetching/parsing logic. Each league connector
  would then only need to supply its league_id, site_id, api_key, and
  season_id mapping.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class QMJHLConnector(BaseConnector):
    league_code = 'QMJHL'
    league_name = 'Quebec Major Junior Hockey League'
    source_url = 'https://theqmjhl.ca/stats'

    # HockeyTech API base (shared across CHL leagues)
    API_BASE = 'https://lscluster.hockeytech.com/feed/index.php'
    LEAGUE_ID = 3   # QMJHL league identifier in HockeyTech system
    SITE_ID = 3     # QMJHL site identifier (verify via network tab)

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the QMJHL/HockeyTech stats API.

        Same HockeyTech platform as OHL and WHL. Consider sharing code via
        a CHL base class to avoid duplicating the fetch logic three times.

        Suggested approach:
        1. Map self.season to the QMJHL-specific HockeyTech season ID.
        2. Fetch skater stats:
           GET {API_BASE}?feed=statviewfeed&view=players
               &season={season_id}&league={LEAGUE_ID}
               &position=skaters&sort=points&limit=100&start=0
               &site_id={SITE_ID}&key={api_key}&fmt=json
           Paginate via start= param.
        3. Fetch goalie stats with position=goalies.
        4. Fetch player bios from roster feeds or player profiles.
        5. Return a dict:
           {'skaters': [...], 'goalies': [...], 'rosters': [...]}

        Note: The API key is QMJHL-specific. Extract from JS on theqmjhl.ca.
        Be mindful of French-language data in responses.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw API response.

        Same HockeyTech field structure as OHL/WHL:
        - first_name, last_name, birthdate, position, shoots
        - height (imperial), weight (lbs), birthplace, nationality
        - draft_year, draft_round, draft_pick, drafted_by, nhl_rights
        - player_id (HockeyTech ID — store in external_ids)

        QMJHL-specific notes:
        - Player and team names may contain French accented characters
          (accents aigu, grave, circumflex, cedilla). Preserve these in
          the NormalizedPlayer record but generate an ASCII-normalized
          player_ref for matching (e.g. "Frederic" for "Frederic").
        - Some team names may appear in French (e.g. "Olympiques de Gatineau").

        Convert height to cm, weight to kg. Map draft fields.
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw API response.

        Same fields as OHL/WHL HockeyTech feed:
        - games_played, goals, assists, points, penalty_minutes
        - plus_minus, power_play_goals, power_play_assists
        - short_handed_goals, game_winning_goals, shots, shooting_pct
        - team_name, player_id

        Map to NormalizedSkaterStats. Set league_code='QMJHL'.
        Handle French team names consistently.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw API response.

        Same fields as OHL/WHL:
        - games_played, wins, losses, otl, shutouts
        - goals_against_average, save_percentage
        - saves, shots_against, minutes_played (may be "MM:SS" string)
        - team_name, player_id

        Parse minutes from "MM:SS" to float if needed.
        Map to NormalizedGoalieStats. Set league_code='QMJHL'.
        """
        raise NotImplementedError
