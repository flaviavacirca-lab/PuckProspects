"""
Czech Extraliga (ELH / Tipsport Extraliga) Connector
Source: https://www.hokej.cz/statistiky
Status: Placeholder — real scraping/API logic to be implemented.

Implementation notes:
- The Czech Extraliga is the top professional hockey league in the Czech
  Republic. The official stats are on hokej.cz, the Czech Ice Hockey
  Association website.
- The site is in Czech. There is no official English version.
- The website at hokej.cz is a modern site that likely loads stats data
  via API calls. Open browser DevTools → Network tab → filter by XHR/Fetch
  while loading the statistiky page to discover API endpoints.
- Possible API patterns:
      https://www.hokej.cz/api/...
      https://api.hokej.cz/...
  or the site may use an embedded data provider or GraphQL endpoint.
- Season format needs to be mapped from self.season ('2025-26') to whatever
  the API expects (e.g. '2025-2026', numeric ID, or similar).
- Czech stat category names:
  Zápasy (GP), Góly (G), Asistence (A), Body (PTS), Trestné minuty (PIM).
- Skater stats typically include: GP (Z), G (G), A (A), PTS (B), PIM (TM),
  +/-, PPG, SHG, GWG, SOG, Sh%.
- Goalie stats typically include: GP (Z), W (V), L (P), OTL, SO,
  GAA (PG/Z), SV% (Ú%), SA, SV, MIN.
- Player bios may include DOB, nationality, height, weight, position,
  and shoots/catches.
- The Extraliga has 14 teams — expect ~350 skaters and ~30 goalies per season.
- Height/weight in metric (cm/kg) as standard in Czech Republic.
- The Czech Republic is a major hockey nation — many NHL draft prospects
  play in the Extraliga or the lower Czech leagues before moving abroad.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class ELHConnector(BaseConnector):
    league_code = 'elh'
    league_name = 'Czech Extraliga'
    source_url = 'https://www.hokej.cz/statistiky'

    # Suspected API base — verify via browser DevTools network tab
    API_BASE = 'https://www.hokej.cz'

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the Czech Extraliga stats site/API.

        Suggested approach:
        1. Inspect network traffic on the /statistiky page to discover API
           endpoints. Look for XHR/Fetch requests returning JSON data.
        2. Map self.season (e.g. '2025-26') to the site's season identifier.
           Check the season dropdown/selector on the stats page.
        3. Fetch skater stats via the discovered API endpoint:
           GET {API_BASE}/api/stats/players?season={id}&competition=extraliga
           (actual endpoint TBD — discover via DevTools)
        4. Fetch goalie stats similarly.
        5. Check if the API uses a different subdomain or external provider.
        6. Handle pagination if results are split across pages.
        7. Return a dict with keys like:
           {'skaters': [...], 'goalies': [...], 'players': [...]}

        Note: The site is in Czech. API response keys may use Czech terms
        or standardized English abbreviations — inspect actual responses.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw API response.

        Czech Extraliga player records may include:
        - jméno (name), křestní jméno (first name), příjmení (last name)
        - datum narození (date of birth)
        - pozice (position): Útočník (F), Obránce (D), Brankář (G)
        - střílí/chytá (shoots/catches — Levá/Pravá → L/R)
        - výška (height in cm), váha (weight in kg)
        - národnost (nationality)
        - tým (team), player ID (use as external_id)

        Map Czech position names: 'Útočník' → F (or more specific C/LW/RW),
        'Obránce' → D, 'Brankář' → G.
        Czech names may contain diacritics (háčky and čárky) — preserve these
        in the normalized output.
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw API response.

        Czech stat labels → our fields:
        - Z/Zápasy → games_played
        - G/Góly → goals
        - A/Asistence → assists
        - B/Body → points
        - TM/Trestné minuty → penalty_minutes
        - +/- → plus_minus
        - PPG (přesilovka góly) → pp_goals
        - SHG (oslabení góly) → sh_goals
        - Střely → shots

        Map to NormalizedSkaterStats.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw API response.

        Czech stat labels → our fields:
        - Z/Zápasy → games_played
        - V/Výhry → wins
        - P/Prohry → losses
        - SO/Shutouty → shutouts
        - PG/Z (Průměr gólů/zápas) → goals_against_avg
        - Ú%/Úspěšnost → save_pct
        - Střely → shots_against
        - MIN/Minuty → minutes_played

        Map to NormalizedGoalieStats.
        """
        raise NotImplementedError
