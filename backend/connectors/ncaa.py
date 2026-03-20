"""
NCAA Division I Men's Ice Hockey connector.

Source: https://www.ncaa.com/stats/icehockey-men/d1

The NCAA publishes season-level individual scoring leaders and goaltending
leaders on its stats site.  The public pages render HTML tables, but a
JSON API may be available behind the scenes (check network requests for
endpoints like /stats/player-leaders or /statistics).

Key considerations:
  - Stats are organised by season and split into scoring and goaltending.
  - Players are identified by name + school; there is no stable NCAA player ID
    exposed on the public site, so player_ref should be a normalized
    "first_last::school" key until a better identifier is found.
  - The site may paginate results — look for "page" or "offset" query params.
  - Supplementary roster pages per school can provide DOB, height, weight,
    shoots/catches, and nationality.
  - Rate-limit requests; NCAA may block aggressive scraping.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class NCAAConnector(BaseConnector):
    """Connector for NCAA Division I Men's Ice Hockey statistics."""

    league_code = 'ncaa'
    league_name = 'NCAA Division I'
    source_url = 'https://www.ncaa.com/stats/icehockey-men/d1'

    # ------------------------------------------------------------------
    # fetch_raw
    # ------------------------------------------------------------------
    def fetch_raw(self) -> dict:
        """
        Fetch raw data from the NCAA stats site.

        Implementation plan:
          1. Check for a JSON API first — inspect the network tab on the stats
             page for XHR requests.  Likely endpoints:
               GET /stats/player-leaders/icehockey-men/d1/{season}
             with query params for stat category and page.
          2. If no API is available, fetch the HTML pages for:
               - Individual scoring leaders
               - Individual goaltending leaders
          3. Store raw HTML or JSON keyed by category, e.g.:
               {'skaters_html': ..., 'goalies_html': ...}
             or
               {'skaters_json': [...], 'goalies_json': [...]}

        Returns:
            dict with raw response data for downstream parsing.
        """
        raise NotImplementedError(
            'NCAAConnector.fetch_raw() is not yet implemented. '
            'Investigate whether NCAA exposes a JSON API behind '
            'https://www.ncaa.com/stats/icehockey-men/d1 or whether '
            'HTML scraping is required.'
        )

    # ------------------------------------------------------------------
    # parse_players
    # ------------------------------------------------------------------
    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Extract player records from raw NCAA data.

        Implementation plan:
          1. Iterate over the scoring and goaltending data.
          2. Build a NormalizedPlayer for each unique player:
             - first_name / last_name from the player name column.
             - position: the stats page may not include position — if absent,
               infer 'G' for goalies and leave skater positions as None.
             - external_ids: store any NCAA-specific ID found (e.g. URL slug).
             - source_urls: link to the player's stats page if available.
          3. Deduplicate players who appear in both skater and goalie tables
             (uncommon but possible for skaters with emergency goalie stints).
          4. For richer bio data (DOB, height, weight, nationality), consider
             scraping individual school roster pages in a follow-up pass.

        Returns:
            list[NormalizedPlayer]
        """
        raise NotImplementedError(
            'NCAAConnector.parse_players() is not yet implemented. '
            'Requires parsing player names and schools from NCAA stats '
            'tables or JSON responses.'
        )

    # ------------------------------------------------------------------
    # parse_skater_stats
    # ------------------------------------------------------------------
    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Extract skater stat lines from raw NCAA data.

        Implementation plan:
          1. Parse the scoring leaders table/JSON.
          2. Map NCAA columns to NormalizedSkaterStats fields:
             - GP → games_played
             - G  → goals
             - A  → assists
             - Pts → points
             - PIM may or may not be available on the leaders page.
          3. Set league_code='ncaa', season=self.season,
             team_name=school name.
          4. player_ref = normalized "first_last::school" key.
          5. Store unmapped columns in raw_data for future use.

        Returns:
            list[NormalizedSkaterStats]
        """
        raise NotImplementedError(
            'NCAAConnector.parse_skater_stats() is not yet implemented. '
            'Requires mapping NCAA scoring leader columns to '
            'NormalizedSkaterStats fields.'
        )

    # ------------------------------------------------------------------
    # parse_goalie_stats
    # ------------------------------------------------------------------
    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Extract goalie stat lines from raw NCAA data.

        Implementation plan:
          1. Parse the goaltending leaders table/JSON.
          2. Map NCAA columns to NormalizedGoalieStats fields:
             - GP → games_played
             - W / L  → wins / losses
             - GAA → goals_against_avg
             - SV% → save_pct
             - SO  → shutouts
             - Min → minutes_played (may need conversion from MM:SS)
          3. Set league_code='ncaa', season=self.season,
             team_name=school name.
          4. player_ref = normalized "first_last::school" key.

        Returns:
            list[NormalizedGoalieStats]
        """
        raise NotImplementedError(
            'NCAAConnector.parse_goalie_stats() is not yet implemented. '
            'Requires mapping NCAA goaltending leader columns to '
            'NormalizedGoalieStats fields.'
        )
