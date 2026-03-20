"""
US NTDP (United States National Team Development Program) connector.

Source: https://www.usahockeyntdp.com/stats

The NTDP develops elite American players through the U17 and U18 programs.
Both teams compete in the USHL, so their USHL stats are available via the
USHL connector.  This connector targets NTDP-specific data: international
tournament stats, program rosters, and any stats not captured through the
USHL feed.

Key considerations:
  - Rosters are small (~44 players across U17 and U18 combined) but
    contain nearly every top American draft prospect.
  - The usahockeyntdp.com site may use a custom CMS — inspect network
    requests for any JSON endpoints.  Fallback to HTML scraping.
  - International game stats (IIHF tournaments, Five Nations, etc.) are
    valuable additions beyond USHL regular-season data.
  - Cross-reference with USHLConnector data: NTDP players already have
    USHL stat lines.  This connector adds supplementary data and ensures
    the NTDP program affiliation is captured.
  - Bio data (DOB, height, weight, shoots, hometown) is usually available
    on roster pages and is high-quality for this program.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class USNTDPConnector(BaseConnector):
    """Connector for the US National Team Development Program."""

    league_code = 'usntdp'
    league_name = 'US NTDP'
    source_url = 'https://www.usahockeyntdp.com/stats'

    # ------------------------------------------------------------------
    # fetch_raw
    # ------------------------------------------------------------------
    def fetch_raw(self) -> dict:
        """
        Fetch raw data from the NTDP website.

        Implementation plan:
          1. Check for a JSON/REST API by inspecting network requests on
             usahockeyntdp.com/stats and usahockeyntdp.com/roster.
          2. If no API exists, fetch HTML pages for:
             - U17 roster and stats
             - U18 roster and stats
          3. Optionally fetch international tournament results if a
             dedicated page or feed exists.
          4. Return structured dict, e.g.:
               {
                   'u17_roster_html': ...,
                   'u18_roster_html': ...,
                   'u17_stats_html': ...,
                   'u18_stats_html': ...,
               }

        Returns:
            dict with raw response data.
        """
        raise NotImplementedError(
            'USNTDPConnector.fetch_raw() is not yet implemented. '
            'Inspect usahockeyntdp.com for API endpoints or plan HTML '
            'scraping of roster and stats pages for U17/U18 teams.'
        )

    # ------------------------------------------------------------------
    # parse_players
    # ------------------------------------------------------------------
    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Extract player records from raw NTDP data.

        Implementation plan:
          1. Parse U17 and U18 roster pages.
          2. Build a NormalizedPlayer per player with rich bio data:
             - first_name / last_name from roster.
             - date_of_birth: usually listed on roster pages.
             - position: C, LW, RW, D, or G.
             - height_cm / weight_kg: convert from imperial if needed.
             - shoots_catches: typically available.
             - nationality: almost always 'US' but verify.
             - draft_year: can be inferred from DOB or listed.
             - external_ids: store NTDP-specific identifiers.
          3. Tag each player with their program level (U17 or U18) in
             external_ids or alternate_names.
          4. Deduplicate — a player who moves from U17 to U18 mid-season
             should be one record with both affiliations noted.

        Returns:
            list[NormalizedPlayer]
        """
        raise NotImplementedError(
            'USNTDPConnector.parse_players() is not yet implemented. '
            'Requires parsing NTDP roster pages for detailed player '
            'bio information (DOB, height, weight, position, shoots).'
        )

    # ------------------------------------------------------------------
    # parse_skater_stats
    # ------------------------------------------------------------------
    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Extract skater stat lines from raw NTDP data.

        Implementation plan:
          1. Parse U17 and U18 stats pages/data.
          2. Map fields to NormalizedSkaterStats:
             - GP → games_played, G → goals, A → assists, Pts → points
             - PIM → penalty_minutes
             - Additional columns as available.
          3. Set league_code='usntdp', season=self.season.
          4. team_name should distinguish 'USNTDP U17' vs 'USNTDP U18'.
          5. Note: USHL regular-season stats for NTDP players are handled
             by USHLConnector.  This connector captures NTDP-specific
             aggregates (international tournaments, exhibition games, etc.)
             or serves as a fallback if USHL data is incomplete.

        Returns:
            list[NormalizedSkaterStats]
        """
        raise NotImplementedError(
            'USNTDPConnector.parse_skater_stats() is not yet implemented. '
            'Requires parsing NTDP stats pages and mapping to '
            'NormalizedSkaterStats. Consider scope overlap with USHL connector.'
        )

    # ------------------------------------------------------------------
    # parse_goalie_stats
    # ------------------------------------------------------------------
    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Extract goalie stat lines from raw NTDP data.

        Implementation plan:
          1. Parse goalie rows from U17 and U18 stats pages.
          2. Map fields to NormalizedGoalieStats:
             - GP → games_played, W → wins, L → losses
             - GAA → goals_against_avg, SV% → save_pct
             - SO → shutouts, Min → minutes_played
          3. team_name = 'USNTDP U17' or 'USNTDP U18'.
          4. Same scope note as skater stats — this supplements USHL data.

        Returns:
            list[NormalizedGoalieStats]
        """
        raise NotImplementedError(
            'USNTDPConnector.parse_goalie_stats() is not yet implemented. '
            'Requires parsing NTDP goalie stats and mapping to '
            'NormalizedGoalieStats.'
        )
