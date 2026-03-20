"""
J20 Nationell Connector
Source: https://stats.swehockey.se/
Status: Placeholder — real scraping/API logic to be implemented.

Implementation notes:
- J20 Nationell is Sweden's top U20 development league. Stats are hosted on
  the SwedishHockey stats platform at stats.swehockey.se, which serves stats
  for many Swedish leagues.
- The stats site uses server-rendered HTML tables rather than a JSON API.
  Scraping will likely require parsing HTML with BeautifulSoup or similar.
- Navigation structure:
      stats.swehockey.se → Select "J20 Nationell" from league dropdown
      → Select season → View player statistics
- Direct URLs typically follow a pattern like:
      https://stats.swehockey.se/ScheduleAndResults/Schedule/{league_id}
  The league and season IDs are numeric. These need to be discovered by
  inspecting the dropdowns or URL patterns on the site.
- Stats pages may be split into separate pages for skaters and goalies,
  and may require navigating to "Players" vs "Goalkeepers" tabs.
- The stats tables typically include:
  Skaters: GP, G, A, PTS, PIM, +/-, PPG, SHG, GWG
  Goalies: GP, W, L, GAA, SV%, SO, MIN
- Player detail pages may link from the stats tables and contain bio info
  (DOB, height, weight, nationality, position).
- The site uses ASP.NET ViewState — form submissions may require carrying
  __VIEWSTATE and __EVENTVALIDATION tokens. This can complicate navigation
  between pages.
- Pagination: stats tables may display all players on one page or paginate.
  Check for "next page" links or a "show all" option.
- J20 Nationell has roughly 20+ teams, so expect a large number of players
  (500+ skaters, 40+ goalies).
- This is a key development league for Swedish prospects — many NHL draft
  eligible players compete here.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class J20Connector(BaseConnector):
    league_code = 'j20'
    league_name = 'J20 Nationell'
    source_url = 'https://stats.swehockey.se/'

    # SwedishHockey stats platform — league/season IDs must be discovered
    STATS_BASE = 'https://stats.swehockey.se'

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the SwedishHockey stats platform.

        Suggested approach:
        1. Navigate to the stats site and identify the league/season IDs for
           J20 Nationell. This may require:
           - Fetching the main page and parsing the league dropdown
           - Or maintaining a mapping of known league/season IDs
        2. Fetch the skater statistics page:
           GET {STATS_BASE}/ScheduleAndResults/PlayerStatistics/{league_season_id}
           Parse the HTML table for skater stats.
        3. Fetch the goalie statistics page (may be a separate URL or tab).
        4. Optionally follow player profile links for bio data (DOB, height,
           weight, nationality).
        5. Return a dict with keys like:
           {'skaters_html': '...', 'goalies_html': '...', 'player_pages': [...]}

        Note: The ASP.NET site may require ViewState tokens for navigation.
        If direct URLs work, prefer those over form submissions. Consider
        using BeautifulSoup for HTML parsing.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw HTML responses.

        Player data may come from:
        - Inline data in the stats table rows (name, team, position)
        - Separate player profile pages (DOB, height, weight, nationality)

        SwedishHockey player profiles typically include:
        - Full name, date of birth
        - Position, shoots/catches
        - Height (cm), weight (kg)
        - Nationality
        - Team and jersey number

        Map to NormalizedPlayer. Swedish sites use metric units natively.
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw HTML table data.

        SwedishHockey stats tables typically have columns:
        - # (rank), Player, Team, GP, G, A, PTS, PIM, +/-
        - Some tables may also include PPG, SHG, GWG, SOG

        Parse the HTML table rows and map to NormalizedSkaterStats.
        Use player name + team as player_ref for matching.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw HTML table data.

        SwedishHockey goalie tables typically have columns:
        - # (rank), Player, Team, GP, W, L, GAA, SV%, SO, MIN

        Parse the HTML table rows and map to NormalizedGoalieStats.
        GAA and SV% are pre-calculated in the table.
        """
        raise NotImplementedError
