"""
KHL (Kontinental Hockey League) Connector
Source: https://en.khl.ru/stat/
Status: Placeholder — real scraping/API logic to be implemented.

Implementation notes:
- The KHL has an English-language site at en.khl.ru with a stats section.
  The Russian version is at khl.ru.
- The site is a large, modern web application. Stats pages may use a mix of
  server-rendered HTML and client-side JavaScript for data loading.
- Open browser DevTools → Network tab → filter by XHR/Fetch while loading
  the stats page to discover API endpoints. The KHL has historically had
  API endpoints like:
      https://khl.api.webcaster.pro/api/khl_mobile/...
  or endpoints under the main domain:
      https://en.khl.ru/api/...
- Stats are organized by season. The KHL season format may differ from ours —
  they may use '2025/2026' or a numeric season ID. Check the season selector
  on the stats page.
- The KHL is a large league with 23+ teams across Russia, China, Finland,
  Latvia, Belarus, and Kazakhstan. Expect 600+ skaters and 50+ goalies.
- Skater stats typically include: GP, G, A, PTS, PIM, +/-, PPG, SHG,
  GWG, SOG, Sh%, TOI, Hits, Blocks.
- Goalie stats typically include: GP, W, L, OTL, SO, GAA, SV%, SA, SV, MIN.
- Player profiles contain: DOB, height, weight, nationality, position,
  shoots/catches, draft information, and career history.
- Height/weight may be in metric (cm/kg) given the Russian/European context.
- The KHL stats pages may paginate results — check for page parameters or
  "load more" AJAX calls.
- Some players may have names in Cyrillic — the English site should provide
  transliterated names, but verify encoding handling.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class KHLConnector(BaseConnector):
    league_code = 'khl'
    league_name = 'Kontinental Hockey League'
    source_url = 'https://en.khl.ru/stat/'

    # Suspected API base — verify via browser DevTools network tab
    API_BASE = 'https://en.khl.ru'

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the KHL stats site/API.

        Suggested approach:
        1. Map self.season (e.g. '2025-26') to the KHL's season identifier.
           Check the stats page season selector for format (e.g. '2025/2026'
           or a numeric ID like 1097).
        2. Fetch skater stats — either via discovered API endpoint:
           GET {API_BASE}/api/stats/players?season={season_id}&position=skaters
           Or by scraping the HTML stats table:
           GET {API_BASE}/stat/players/skaters/?season={season_id}
        3. Fetch goalie stats similarly.
        4. Handle pagination — the KHL has many players. Iterate through pages
           or use a limit/offset parameter to get all records.
        5. Optionally fetch player bios from profile pages.
        6. Return a dict with keys like:
           {'skaters': [...], 'goalies': [...], 'players': [...]}

        Note: The English site (en.khl.ru) provides transliterated player names.
        Prefer this over the Russian site (khl.ru) for name consistency.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw response.

        KHL player records typically include:
        - name (transliterated from Cyrillic on the English site)
        - date_of_birth
        - position, shoots/catches
        - height (cm), weight (kg)
        - nationality (many countries represented)
        - team, player ID

        Consider storing both Latin and Cyrillic name variants in
        alternate_names for cross-reference.
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw response.

        Expected fields per skater:
        - GP, G, A, PTS, PIM, +/-
        - PPG, PPA, SHG, SHA, GWG
        - SOG, Sh%, TOI (time on ice)
        - Hits, Blocked Shots (if available)
        - team_name, player_id/name for linking

        The KHL provides relatively comprehensive stats. Map available
        fields to NormalizedSkaterStats and store extras in raw_data.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw response.

        Expected fields per goalie:
        - GP, W, L, OTL, SO
        - GAA, SV%, GA, SA, SV, MIN
        - team_name, player_id/name

        Map to NormalizedGoalieStats.
        """
        raise NotImplementedError
