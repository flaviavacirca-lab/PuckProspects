"""
DEL (Deutsche Eishockey Liga) Connector
Source: https://www.penny-del.org/statistik
Status: Placeholder — real scraping/API logic to be implemented.

Note: This file is named del_league.py (not del.py) to avoid conflicting
with Python's built-in 'del' keyword/statement.

Implementation notes:
- The DEL is Germany's top professional hockey league, currently branded as
  the Penny DEL for sponsorship reasons.
- The website at penny-del.org is in German. Stats are under /statistik.
- The site likely uses a modern frontend framework that loads stats data via
  API calls. Open browser DevTools → Network tab → filter by XHR/Fetch
  while loading the statistik page to discover API endpoints.
- Possible API patterns:
      https://www.penny-del.org/api/...
  or the DEL may use an external stats provider. German leagues sometimes
  use providers like SAP, Sportradar, or league-specific platforms.
- Season format needs to be mapped from self.season ('2025-26') to whatever
  the API/site expects (e.g. '2025-2026', '2025', or a numeric ID).
- The site is in German — stat category names will be in German:
  Spiele (GP), Tore (G), Vorlagen (A), Punkte (PTS), Strafminuten (PIM).
- Skater stats typically include: GP (Sp), G (T), A (V), PTS (Pkt),
  PIM (Str), +/-, PPG (ÜT), SHG (UZT), GWG, SOG (Sch), Sh%.
- Goalie stats typically include: GP (Sp), W (S), L (N), OTL, SO,
  GAA (GGA), SV% (FQ), SA, SV, MIN.
- Player bios may include DOB, nationality, height, weight, position,
  and shoots/catches.
- The DEL has 14 teams — expect ~350 skaters and ~30 goalies per season.
- Height/weight in metric (cm/kg) as standard in Germany.
"""

from backend.connectors.base import BaseConnector
from backend.models.player import NormalizedPlayer, NormalizedSkaterStats, NormalizedGoalieStats


class DELConnector(BaseConnector):
    league_code = 'del'
    league_name = 'Deutsche Eishockey Liga'
    source_url = 'https://www.penny-del.org/statistik'

    # Suspected API base — verify via browser DevTools network tab
    API_BASE = 'https://www.penny-del.org'

    def fetch_raw(self) -> dict:
        """
        TODO: Implement data fetching from the DEL stats site/API.

        Suggested approach:
        1. Inspect network traffic on the /statistik page to discover API
           endpoints. Look for XHR/Fetch requests returning JSON data.
        2. Map self.season (e.g. '2025-26') to the DEL's season identifier.
        3. Fetch skater stats via the discovered API endpoint:
           GET {API_BASE}/api/statistics?season={id}&type=skaters
           (actual endpoint TBD — discover via DevTools)
        4. Fetch goalie stats similarly.
        5. Check for external data provider domains in network traffic
           (e.g., Sportradar, SAP). The actual data source may be a
           third-party platform.
        6. Handle pagination if needed.
        7. Return a dict with keys like:
           {'skaters': [...], 'goalies': [...], 'players': [...]}

        Note: The German site may return stat labels in German. The JSON
        response keys may still use English abbreviations or German terms.
        """
        raise NotImplementedError(f'{self.league_name} connector not yet implemented')

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        """
        Parse player biographical data from raw API response.

        DEL player records may include:
        - name, vorname (first name), nachname (last name)
        - geburtsdatum (date of birth)
        - position (Stürmer/Forward, Verteidiger/Defense, Torwart/Goalie)
        - schusshand (shoots — Links/Rechts → L/R)
        - größe (height in cm), gewicht (weight in kg)
        - nationalität (nationality)
        - team, player ID (use as external_id)

        Map German position names: 'Stürmer' → F, 'Verteidiger' → D,
        'Torwart' → G. More specific positions (Center, Linksaußen,
        Rechtsaußen) map to C, LW, RW.
        """
        raise NotImplementedError

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        """
        Parse skater statistics from raw API response.

        German stat labels → our fields:
        - Sp/Spiele → games_played
        - T/Tore → goals
        - V/Vorlagen → assists
        - Pkt/Punkte → points
        - Str/Strafminuten → penalty_minutes
        - +/- → plus_minus
        - ÜT/Überzahltore → pp_goals
        - UZT/Unterzahltore → sh_goals
        - Sch/Schüsse → shots

        Map to NormalizedSkaterStats.
        """
        raise NotImplementedError

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        """
        Parse goalie statistics from raw API response.

        German stat labels → our fields:
        - Sp/Spiele → games_played
        - S/Siege → wins
        - N/Niederlagen → losses
        - SO → shutouts
        - GGA/Gegentorschnitt → goals_against_avg
        - FQ/Fangquote → save_pct
        - Sch/Schüsse → shots_against
        - MIN/Minuten → minutes_played

        Map to NormalizedGoalieStats.
        """
        raise NotImplementedError
