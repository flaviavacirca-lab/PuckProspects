"""
Hockey Canada connector.

Source: https://www.hockeycanada.ca/en-ca

Hockey Canada oversees a wide range of development programs and
competitions that are not covered by the CHL (OHL/WHL/QMJHL) or
CJHL (BCHL, AJHL, etc.) connectors.  This includes:

  - National junior team selection camps and rosters
  - Program of Excellence camps
  - World Junior Championship roster/stats (Team Canada)
  - Hlinka Gretzky Cup roster/stats
  - U17/U18 national program data
  - Provincial development programs (may be manual)

Key considerations:
  - This is a partial/manual connector.  Hockey Canada does not expose
    a single, unified stats API.  Data is scattered across news articles,
    PDF rosters, and event-specific pages.
  - For structured data, check for RSS feeds, event result pages, or any
    API endpoints in the hockeycanada.ca network requests.
  - Much of the data may need to be entered manually or sourced from
    third-party sites (e.g., EliteProspects, IIHF).
  - Focus on capturing roster membership and basic bio data for national
    program participants.  Detailed game stats may not be available.
  - This connector is most valuable for tagging players as national
    program participants (e.g., "invited to WJC camp") rather than as a
    primary stats source.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class HockeyCanadaConnector(BaseConnector):
    """Connector for Hockey Canada development programs and national teams."""

    league_code = 'hockey_canada'
    league_name = 'Hockey Canada'
    source_url = 'https://www.hockeycanada.ca/en-ca'

    # ------------------------------------------------------------------
    # fetch_raw
    # ------------------------------------------------------------------
    def fetch_raw(self) -> dict:
        """
        Fetch raw data from Hockey Canada sources.

        Implementation plan:
          1. This is a partial/manual connector.  Automated fetching is
             limited to whatever structured data Hockey Canada publishes.
          2. Potential automated sources:
             - Event roster pages (e.g., WJC, Hlinka Gretzky) if they
               follow a predictable URL pattern.
             - RSS or news feeds for roster announcements.
             - IIHF game sheets for international tournaments (separate
               source but relevant).
          3. For data that cannot be fetched automatically, support a
             manual upload path:
               - Accept a local JSON/CSV file with manually compiled
                 roster and stats data.
               - Path could be configured via environment variable or
                 passed as a constructor parameter.
          4. Return a dict keyed by program/event, e.g.:
               {
                   'wjc_roster': [...],
                   'hlinka_roster': [...],
                   'manual_data': {...},
               }

        Returns:
            dict with raw data (automated + manual).
        """
        raise NotImplementedError(
            'HockeyCanadaConnector.fetch_raw() is not yet implemented. '
            'This is a partial/manual connector — data sources are '
            'scattered across hockeycanada.ca event pages, PDF rosters, '
            'and may require manual data entry for many programs.'
        )

    # ------------------------------------------------------------------
    # parse_players
    # ------------------------------------------------------------------
    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Extract player records from raw Hockey Canada data.

        Implementation plan:
          1. Parse roster data from each program/event in the raw dict.
          2. Build a NormalizedPlayer per unique player:
             - first_name / last_name from roster listings.
             - date_of_birth: often listed on official rosters.
             - position: C, LW, RW, D, G — usually provided.
             - height_cm / weight_kg: sometimes listed; convert from
               imperial if needed.
             - nationality: 'CA' for most, but verify for dual citizens.
             - external_ids: tag with program participation, e.g.:
                 {'hockey_canada_programs': ['WJC 2026', 'Hlinka 2025']}
          3. Deduplicate players appearing in multiple programs.
          4. For players already in the system from other connectors
             (OHL, WHL, QMJHL, etc.), this data supplements rather than
             replaces — the merge/dedup layer handles reconciliation.

        Returns:
            list[NormalizedPlayer]
        """
        raise NotImplementedError(
            'HockeyCanadaConnector.parse_players() is not yet implemented. '
            'Requires parsing roster data from Hockey Canada event pages '
            'or manually uploaded data files.'
        )

    # ------------------------------------------------------------------
    # parse_skater_stats
    # ------------------------------------------------------------------
    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Extract skater stat lines from raw Hockey Canada data.

        Implementation plan:
          1. Parse any available tournament/event stats.
          2. International tournament stats (WJC, Hlinka, etc.) are
             typically limited: GP, G, A, PTS, PIM.
          3. Map to NormalizedSkaterStats with:
             - league_code='hockey_canada'
             - team_name = event/program name (e.g., 'Canada WJC')
             - season = self.season or the event year
          4. Stats from Hockey Canada events are supplementary — the
             primary stat lines come from the player's club league
             connector (OHL, WHL, QMJHL, NCAA, etc.).
          5. If no stats are available (roster-only data), return an
             empty list — that is acceptable for this connector.

        Returns:
            list[NormalizedSkaterStats]
        """
        raise NotImplementedError(
            'HockeyCanadaConnector.parse_skater_stats() is not yet '
            'implemented. International tournament stats are limited and '
            'may not be available from Hockey Canada directly. Consider '
            'IIHF game sheets as an alternative source.'
        )

    # ------------------------------------------------------------------
    # parse_goalie_stats
    # ------------------------------------------------------------------
    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Extract goalie stat lines from raw Hockey Canada data.

        Implementation plan:
          1. Parse any available goalie stats from tournament/event data.
          2. International tournament goalie stats are typically:
             GP, W, L, GAA, SV%, SO.
          3. Map to NormalizedGoalieStats with:
             - league_code='hockey_canada'
             - team_name = event/program name
          4. Same supplementary scope as skater stats — primary goalie
             stats come from the player's club league connector.
          5. Return empty list if no goalie stats are available.

        Returns:
            list[NormalizedGoalieStats]
        """
        raise NotImplementedError(
            'HockeyCanadaConnector.parse_goalie_stats() is not yet '
            'implemented. Goalie stats from Hockey Canada programs are '
            'limited and may require manual data entry.'
        )
