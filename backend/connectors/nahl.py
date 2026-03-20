"""
NAHL (North American Hockey League) connector.

Source: https://nahl.com/stats

The NAHL is a Tier II junior hockey league in the United States.  Its
website uses a platform similar to the USHL (likely HockeyTech or a
shared provider).

Key considerations:
  - Inspect network requests on nahl.com/stats to find the underlying API.
    HockeyTech-style endpoints would look like:
      lscluster.hockeytech.com/feed/index.php?client_code=nahl&...
    The client_code and league_id will differ from the USHL.
  - Stats split into regular season and playoffs — start with regular season.
  - The API typically returns GP, G, A, PTS, PIM, +/-, PPG, SHG, GWG, etc.
    for skaters and GP, W, L, OTL, GAA, SV%, SO for goalies.
  - NAHL rosters turn over frequently; many players move to USHL or NCAA
    mid-season — watch for partial-season lines.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class NAHLConnector(BaseConnector):
    """Connector for the NAHL (North American Hockey League)."""

    league_code = 'nahl'
    league_name = 'NAHL'
    source_url = 'https://nahl.com/stats'

    # ------------------------------------------------------------------
    # fetch_raw
    # ------------------------------------------------------------------
    def fetch_raw(self) -> dict:
        """
        Fetch raw data from the NAHL stats source.

        Implementation plan:
          1. Identify the API base URL by inspecting network traffic on
             nahl.com/stats.  Expected HockeyTech-style pattern:
               GET https://lscluster.hockeytech.com/feed/index.php
                 ?feed=statviewfeed
                 &view=players
                 &season={season_id}
                 &league_id=...
                 &client_code=nahl
                 &fmt=json
          2. Determine the season_id mapping for self.season.
          3. Fetch skater stats and goalie stats separately.
          4. Return {'skaters': [...], 'goalies': [...]}.

        Returns:
            dict with raw JSON response data.
        """
        raise NotImplementedError(
            'NAHLConnector.fetch_raw() is not yet implemented. '
            'Inspect network requests on nahl.com/stats to locate the '
            'API endpoint and required parameters (client_code, season_id).'
        )

    # ------------------------------------------------------------------
    # parse_players
    # ------------------------------------------------------------------
    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Extract player records from raw NAHL data.

        Implementation plan:
          1. Iterate over skater and goalie arrays.
          2. Build a NormalizedPlayer per unique player:
             - first_name / last_name from API fields.
             - position: API should provide position codes.
             - external_ids: store the platform player_id.
             - Bio data (DOB, height, weight) may require a secondary
               roster or player detail request.
          3. Deduplicate across skater and goalie lists.

        Returns:
            list[NormalizedPlayer]
        """
        raise NotImplementedError(
            'NAHLConnector.parse_players() is not yet implemented. '
            'Requires parsing player records from the NAHL stats API.'
        )

    # ------------------------------------------------------------------
    # parse_skater_stats
    # ------------------------------------------------------------------
    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Extract skater stat lines from raw NAHL data.

        Implementation plan:
          1. Parse the skaters array from raw data.
          2. Map API fields to NormalizedSkaterStats:
             - gp → games_played, goals → goals, assists → assists
             - points → points, pim → penalty_minutes
             - plus_minus → plus_minus
             - ppg → pp_goals, shg → sh_goals, gwg → gw_goals
             - shots → shots, shooting_pct → shooting_pct
          3. Set league_code='nahl', season=self.season, team_name from data.
          4. player_ref = platform player_id or normalized name key.

        Returns:
            list[NormalizedSkaterStats]
        """
        raise NotImplementedError(
            'NAHLConnector.parse_skater_stats() is not yet implemented. '
            'Requires mapping NAHL API skater fields to NormalizedSkaterStats.'
        )

    # ------------------------------------------------------------------
    # parse_goalie_stats
    # ------------------------------------------------------------------
    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Extract goalie stat lines from raw NAHL data.

        Implementation plan:
          1. Parse the goalies array from raw data.
          2. Map API fields to NormalizedGoalieStats:
             - gp → games_played, wins → wins, losses → losses, otl → otl
             - gaa → goals_against_avg, sv_pct → save_pct
             - so → shutouts, saves → saves
             - minutes → minutes_played
          3. Set league_code='nahl', season=self.season.

        Returns:
            list[NormalizedGoalieStats]
        """
        raise NotImplementedError(
            'NAHLConnector.parse_goalie_stats() is not yet implemented. '
            'Requires mapping NAHL API goalie fields to NormalizedGoalieStats.'
        )
