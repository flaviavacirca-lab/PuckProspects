"""
USHL (United States Hockey League) connector.

Source: https://ushl.com/stats

The USHL is the top junior hockey league in the United States (Tier I).
The website is likely powered by HockeyTech (or a similar provider).

Key considerations:
  - HockeyTech-powered sites expose a JSON API at a subdomain such as
    lscluster.hockeytech.com with endpoints like:
      /feed/index.php?feed=statviewfeed&view=players&season=...
    Inspect network requests on ushl.com/stats to find the exact base URL
    and required query parameters (client_code, league_id, etc.).
  - Stats are split into regular season and playoffs — fetch both and tag
    accordingly, or limit to regular season initially.
  - The API typically returns player IDs, full names, team, position, and a
    rich set of stat columns (GP, G, A, PTS, PIM, +/-, PPG, SHG, GWG, etc.).
  - Goalie stats are usually a separate view/feed parameter.
  - USNTDP teams compete in the USHL, so those players will appear here too.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class USHLConnector(BaseConnector):
    """Connector for the USHL (United States Hockey League)."""

    league_code = 'ushl'
    league_name = 'USHL'
    source_url = 'https://ushl.com/stats'

    # ------------------------------------------------------------------
    # fetch_raw
    # ------------------------------------------------------------------
    def fetch_raw(self) -> dict:
        """
        Fetch raw data from the USHL stats source.

        Implementation plan:
          1. Identify the HockeyTech (or equivalent) API base URL by
             inspecting network traffic on ushl.com/stats.  Likely pattern:
               GET https://lscluster.hockeytech.com/feed/index.php
                 ?feed=statviewfeed
                 &view=players
                 &season={season_id}
                 &league_id=...
                 &client_code=ushl
                 &fmt=json
          2. Determine the season_id that corresponds to self.season.
          3. Fetch skater stats (view=players&position=skaters) and goalie
             stats (view=players&position=goalies) separately.
          4. Return {'skaters': [...], 'goalies': [...]}.

        Returns:
            dict with raw JSON response data.
        """
        raise NotImplementedError(
            'USHLConnector.fetch_raw() is not yet implemented. '
            'Inspect network requests on ushl.com/stats to locate the '
            'HockeyTech API endpoint and required parameters.'
        )

    # ------------------------------------------------------------------
    # parse_players
    # ------------------------------------------------------------------
    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Extract player records from raw USHL data.

        Implementation plan:
          1. Iterate over skater and goalie arrays in raw data.
          2. Build a NormalizedPlayer per unique player:
             - first_name / last_name from API fields.
             - position: the API usually provides position codes (C, LW, RW, D, G).
             - external_ids: store HockeyTech player_id for deduplication.
             - shoots_catches: may be available in detailed player endpoint.
             - DOB, height, weight: may require a secondary roster/player
               detail request if not in the stats feed.
          3. Deduplicate across skater and goalie lists.

        Returns:
            list[NormalizedPlayer]
        """
        raise NotImplementedError(
            'USHLConnector.parse_players() is not yet implemented. '
            'Requires parsing HockeyTech API player fields into '
            'NormalizedPlayer records.'
        )

    # ------------------------------------------------------------------
    # parse_skater_stats
    # ------------------------------------------------------------------
    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Extract skater stat lines from raw USHL data.

        Implementation plan:
          1. Parse the skaters array from raw data.
          2. Map HockeyTech fields to NormalizedSkaterStats:
             - gp → games_played
             - goals → goals
             - assists → assists
             - points → points
             - pim → penalty_minutes
             - plus_minus → plus_minus
             - ppg → pp_goals, shg → sh_goals
             - shots → shots, shooting_pct → shooting_pct
             - gwg → gw_goals
          3. team_name from the team field; league_code='ushl'.
          4. player_ref = HockeyTech player_id or normalized name key.

        Returns:
            list[NormalizedSkaterStats]
        """
        raise NotImplementedError(
            'USHLConnector.parse_skater_stats() is not yet implemented. '
            'Requires mapping HockeyTech skater stat fields to '
            'NormalizedSkaterStats.'
        )

    # ------------------------------------------------------------------
    # parse_goalie_stats
    # ------------------------------------------------------------------
    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Extract goalie stat lines from raw USHL data.

        Implementation plan:
          1. Parse the goalies array from raw data.
          2. Map HockeyTech fields to NormalizedGoalieStats:
             - gp → games_played
             - wins → wins, losses → losses, otl → otl
             - gaa → goals_against_avg
             - sv_pct → save_pct
             - so → shutouts
             - saves → saves, shots_against → shots_against
             - minutes → minutes_played (may need MM:SS → float conversion)
          3. team_name from the team field; league_code='ushl'.

        Returns:
            list[NormalizedGoalieStats]
        """
        raise NotImplementedError(
            'USHLConnector.parse_goalie_stats() is not yet implemented. '
            'Requires mapping HockeyTech goalie stat fields to '
            'NormalizedGoalieStats.'
        )
