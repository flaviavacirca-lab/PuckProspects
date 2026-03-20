"""
Swiss National League (NL) Connector
Source: https://www.sihf.ch/en/game-center/national-league/#/statistics
Status: Placeholder — real scraping/API logic to be implemented.

Implementation notes:
- The Swiss National League is the top hockey league in Switzerland. Stats are
  hosted on the Swiss Ice Hockey Federation site (sihf.ch).
- The site has an English version at sihf.ch/en/.
- The statistics page uses hash-based routing (#/statistics), indicating a
  Single Page Application (SPA) that loads data via AJAX/API calls. The HTML
  returned by a direct GET will not contain stats data.
- Open browser DevTools → Network tab → filter by XHR/Fetch while navigating
  to #/statistics to discover the underlying API endpoints.
- The API likely uses endpoints like:
      https://www.sihf.ch/api/...
  or an external data provider. Swiss hockey sites sometimes use a third-party
  stats provider (e.g., SAP, Sportradar, or a custom backend).
- Look for requests to domains like:
      api.sihf.ch, data.sihf.ch, or external stat provider domains
- Season format needs to be mapped from self.season ('2025-26') to whatever
  the API expects (e.g. numeric ID, '2025-2026', '2025').
- Skater stats typically include: GP, G, A, PTS, PIM, +/-, PPG, SHG, GWG,
  SOG, Sh%, TOI.
- Goalie stats typically include: GP, W, L, OTL, SO, GAA, SV%, SA, SV, MIN.
- Player bios may include DOB, nationality, height, weight, position, and
  shoots/catches. Switzerland has players from many European nations.
- The NL has 14 teams — expect ~350 skaters and ~30 goalies per season.
- Height/weight will likely be in metric (cm/kg) as is standard in Europe.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class NLConnector(BaseConnector):
    league_code = 'nl'
    league_name = 'Swiss National League'
    source_url = 'https://www.sihf.ch/en/game-center/national-league/#/statistics'

    # SIHF API base — verify via browser DevTools network tab
    API_BASE = 'https://www.sihf.ch'

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the SIHF stats API.

        Suggested approach:
        1. Inspect network traffic on the #/statistics page to find the API.
           The SPA will make XHR/Fetch calls to load stats data.
        2. Map self.season (e.g. '2025-26') to the API's season identifier.
        3. Fetch skater stats via the discovered API endpoint:
           GET {API_BASE}/api/statistics/players?league=NL&season={id}
           (actual endpoint TBD — discover via DevTools)
        4. Fetch goalie stats similarly.
        5. Check if the API requires authentication tokens, API keys, or
           specific headers. SPA APIs often embed tokens in the page source.
        6. Handle pagination if results are split across pages.
        7. Return a dict with keys like:
           {'skaters': [...], 'goalies': [...], 'players': [...]}

        Note: Since the site uses hash-based routing, the stats data is
        definitively loaded via JavaScript. A direct HTML scrape will not work;
        the API endpoints must be used.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw API response.

        Swiss NL player records may include:
        - name, firstName, lastName
        - dateOfBirth (likely ISO 8601)
        - position (C, LW, RW, D, G or local equivalents)
        - shoots/catches (L/R)
        - height (cm), weight (kg)
        - nationality (Swiss, Swedish, Finnish, Canadian, etc. — diverse league)
        - team, player ID (use as external_id)
        - license type (Swiss vs import player — relevant for roster rules)

        Map to NormalizedPlayer.
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw API response.

        Expected fields per skater:
        - GP, G, A, PTS, PIM, +/-
        - PPG, SHG, GWG, SOG, Sh%
        - TOI (if available)
        - team_name, player_id/name for linking

        Map to NormalizedSkaterStats.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw API response.

        Expected fields per goalie:
        - GP, W, L, OTL, SO
        - GAA, SV%, SA, SV, MIN
        - team_name, player_id/name

        Map to NormalizedGoalieStats.
        """
        raise NotImplementedError
