"""
BCHL (British Columbia Hockey League) connector.

Source: https://bchl.ca/stats

The BCHL is a Tier II junior A league in British Columbia, part of the
broader CJHL (Canadian Junior Hockey League) ecosystem.  It is a strong
development pathway to the NCAA and, to a lesser extent, the CHL.

Key considerations:
  - The BCHL website is likely powered by HockeyTech or a similar
    platform.  Inspect network traffic on bchl.ca/stats to identify
    the API base URL and required query parameters (client_code,
    league_id, season_id, etc.).
  - HockeyTech-style endpoint pattern:
      lscluster.hockeytech.com/feed/index.php
        ?feed=statviewfeed&view=players&client_code=bchl&...
  - Stats typically include regular season and playoffs.
  - The BCHL site may also provide roster pages with bio data (DOB,
    height, weight, shoots, hometown, NCAA commitment).
  - Many BCHL players are committed to NCAA programs — the "committed"
    field is valuable metadata if available.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class BCHLConnector(BaseConnector):
    """Connector for the BCHL (British Columbia Hockey League)."""

    league_code = 'bchl'
    league_name = 'BCHL'
    source_url = 'https://bchl.ca/stats'

    # ------------------------------------------------------------------
    # fetch_raw
    # ------------------------------------------------------------------
    def fetch_raw(self) -> dict:
        """
        Fetch raw data from the BCHL stats source.

        Implementation plan:
          1. Identify the HockeyTech (or equivalent) API base URL by
             inspecting network requests on bchl.ca/stats.
          2. Determine the season_id mapping for self.season.
          3. Fetch skater stats and goalie stats via separate API calls:
               - view=players&position=skaters
               - view=players&position=goalies
          4. Optionally fetch roster data for bio information.
          5. Return {'skaters': [...], 'goalies': [...]}.

        Returns:
            dict with raw JSON response data.
        """
        raise NotImplementedError(
            'BCHLConnector.fetch_raw() is not yet implemented. '
            'Inspect network requests on bchl.ca/stats to locate the '
            'HockeyTech API endpoint and required parameters.'
        )

    # ------------------------------------------------------------------
    # parse_players
    # ------------------------------------------------------------------
    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Extract player records from raw BCHL data.

        Implementation plan:
          1. Iterate over skater and goalie arrays in raw data.
          2. Build a NormalizedPlayer per unique player:
             - first_name / last_name from API fields.
             - position: API should provide position codes (C, LW, RW, D, G).
             - external_ids: store HockeyTech player_id.
             - Bio data (DOB, height, weight, shoots) may be in the stats
               feed or may require a secondary roster/player detail request.
             - nationality: many BCHL players are Canadian or American.
          3. If the API exposes NCAA commitment info, store it in
             external_ids or a suitable field for downstream use.
          4. Deduplicate across skater and goalie lists.

        Returns:
            list[NormalizedPlayer]
        """
        raise NotImplementedError(
            'BCHLConnector.parse_players() is not yet implemented. '
            'Requires parsing player records from the BCHL stats platform.'
        )

    # ------------------------------------------------------------------
    # parse_skater_stats
    # ------------------------------------------------------------------
    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Extract skater stat lines from raw BCHL data.

        Implementation plan:
          1. Parse the skaters array from raw data.
          2. Map platform fields to NormalizedSkaterStats:
             - gp → games_played, goals → goals, assists → assists
             - points → points, pim → penalty_minutes
             - plus_minus → plus_minus
             - ppg → pp_goals, shg → sh_goals, gwg → gw_goals
             - shots → shots, shooting_pct → shooting_pct
          3. Set league_code='bchl', season=self.season, team_name from data.
          4. player_ref = HockeyTech player_id or normalized name key.

        Returns:
            list[NormalizedSkaterStats]
        """
        raise NotImplementedError(
            'BCHLConnector.parse_skater_stats() is not yet implemented. '
            'Requires mapping BCHL platform skater fields to '
            'NormalizedSkaterStats.'
        )

    # ------------------------------------------------------------------
    # parse_goalie_stats
    # ------------------------------------------------------------------
    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Extract goalie stat lines from raw BCHL data.

        Implementation plan:
          1. Parse the goalies array from raw data.
          2. Map platform fields to NormalizedGoalieStats:
             - gp → games_played, wins → wins, losses → losses, otl → otl
             - gaa → goals_against_avg, sv_pct → save_pct
             - so → shutouts, saves → saves
             - minutes → minutes_played (convert MM:SS if needed)
          3. Set league_code='bchl', season=self.season.

        Returns:
            list[NormalizedGoalieStats]
        """
        raise NotImplementedError(
            'BCHLConnector.parse_goalie_stats() is not yet implemented. '
            'Requires mapping BCHL platform goalie fields to '
            'NormalizedGoalieStats.'
        )
