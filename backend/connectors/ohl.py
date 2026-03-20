"""
OHL (Ontario Hockey League) Connector
Source: https://ontariohockeyleague.com/stats
Status: Placeholder — real scraping/API logic to be implemented.

Implementation notes:
- The OHL is one of three leagues in the CHL (Canadian Hockey League). All
  three CHL leagues (OHL, WHL, QMJHL) use the HockeyTech platform for their
  websites and stats APIs. This means the API structure is nearly identical
  across all three — if you crack one, the others follow the same pattern.
- The OHL stats page at ontariohockeyleague.com/stats loads data via
  JavaScript from a HockeyTech feed endpoint. Use browser DevTools → Network
  tab to confirm the exact URLs.
- Typical API endpoint pattern:
      GET https://lscluster.hockeytech.com/feed/index.php
      ?feed=statviewfeed&view=players&season={season_id}
      &league=2&position=skaters&sort=points&limit=100
      &key={client_key}&fmt=json&site_id=2
  The OHL league ID is typically 2, and site_id is also 2 (verify).
- The /feed/index.php endpoint supports multiple feed types:
  - statviewfeed: player stats, team stats, standings
  - modulekit: schedules, game summaries, rosters
  - playersearch: biographical data, search by name/team
- For player bios (DOB, height, weight, nationality, draft status), use:
      ?feed=modulekit&view=roster&season_id={id}&team_id={team_id}
      &key={key}&fmt=json
  or fetch individual player profiles.
- CHL leagues are critical for draft-eligible prospects. Many players in
  these leagues are 16-20 years old and NHL draft eligible. DOB and draft
  status fields are especially important.
- Season IDs are numeric and league-specific. For the OHL, the 2025-26
  season might be something like season_id=76 (verify). The season dropdown
  on the stats page or a season list API call can reveal the correct ID.
- The API key is public/client-side. Look in the JS bundle or inline scripts
  on ontariohockeyleague.com for the key parameter.
- Response format: typically JSONP with a callback wrapper. Pass fmt=json
  to get clean JSON, or strip the callback if that param is not supported.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class OHLConnector(BaseConnector):
    league_code = 'OHL'
    league_name = 'Ontario Hockey League'
    source_url = 'https://ontariohockeyleague.com/stats'

    # HockeyTech API base (shared across CHL leagues)
    API_BASE = 'https://lscluster.hockeytech.com/feed/index.php'
    LEAGUE_ID = 2   # OHL league identifier in HockeyTech system
    SITE_ID = 2     # OHL site identifier (verify via network tab)

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the OHL/HockeyTech stats API.

        Suggested approach:
        1. Map self.season to the HockeyTech numeric season ID.
           Option A: Fetch season list via the API.
           Option B: Maintain a hardcoded mapping dict, updated each year.
        2. Fetch skater stats:
           GET {API_BASE}?feed=statviewfeed&view=players
               &season={season_id}&league={LEAGUE_ID}
               &position=skaters&sort=points&limit=100&start=0
               &site_id={SITE_ID}&key={api_key}&fmt=json
           Paginate with start= until all rows are collected.
        3. Fetch goalie stats with position=goalies.
        4. Fetch player bios from roster endpoints or player profile feeds.
           This is especially important for CHL leagues because draft-eligible
           player data (DOB, nationality, draft year) is high value.
        5. Return a dict:
           {'skaters': [...], 'goalies': [...], 'rosters': [...]}

        Note: Extract the API key from the OHL site's JavaScript source.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw API response.

        CHL/HockeyTech player data typically includes:
        - first_name, last_name, birthdate (YYYY-MM-DD)
        - position (C, LW, RW, D, G), shoots (L/R)
        - height (imperial string), weight (lbs)
        - birthplace, hometown, nationality
        - draft_year, draft_round, draft_pick, drafted_by (if NHL-drafted)
        - nhl_rights (team holding rights, if any)
        - player_id (HockeyTech ID — store in external_ids)

        CHL players are often draft-eligible. Pay special attention to:
        - draft_status: whether they are eligible for upcoming NHL draft
        - draft_year: when they are/were eligible
        - nhl_rights_holder: if already drafted, who holds their rights

        Height conversion: "6'1\"" → 185 cm. Weight: lbs → kg (÷ 2.205).
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw API response.

        Expected fields from HockeyTech statviewfeed:
        - games_played, goals, assists, points, penalty_minutes
        - plus_minus, power_play_goals, power_play_assists
        - short_handed_goals, short_handed_assists
        - game_winning_goals, shots, shooting_percentage
        - team_name (or team_code), player_id

        Map to NormalizedSkaterStats. Set league_code='OHL'.
        Use player name or HockeyTech player_id as player_ref.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw API response.

        Expected fields:
        - games_played, wins, losses, otl (or ot_losses), shutouts
        - goals_against_average, save_percentage
        - saves, shots_against, minutes_played (may be formatted as MM:SS)
        - team_name, player_id

        Note: minutes_played may need parsing from "MM:SS" string to float.
        Map to NormalizedGoalieStats. Set league_code='OHL'.
        """
        raise NotImplementedError
