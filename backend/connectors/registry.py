"""
Connector registry — maps league codes to connector classes.

To add a new connector:
  1. Create a new file in backend/connectors/ (e.g., my_league.py)
  2. Subclass BaseConnector and implement fetch_raw(), parse_players(), parse_skater_stats()
  3. Register it here by importing and adding to CONNECTOR_REGISTRY
"""

from backend.connectors.base import BaseConnector

# ── Import all connector modules ──
from backend.connectors.ahl import AHLConnector
from backend.connectors.echl import ECHLConnector
from backend.connectors.ohl import OHLConnector
from backend.connectors.whl import WHLConnector
from backend.connectors.qmjhl import QMJHLConnector
from backend.connectors.ncaa import NCAAConnector
from backend.connectors.ushl import USHLConnector
from backend.connectors.nahl import NAHLConnector
from backend.connectors.shl import SHLConnector
from backend.connectors.j20 import J20Connector
from backend.connectors.liiga import LiigaConnector
from backend.connectors.khl import KHLConnector
from backend.connectors.mhl import MHLConnector
from backend.connectors.nl import NLConnector
from backend.connectors.del_league import DELConnector
from backend.connectors.elh import ELHConnector
from backend.connectors.usntdp import USNTDPConnector
from backend.connectors.bchl import BCHLConnector
from backend.connectors.hockey_canada import HockeyCanadaConnector


# Maps league code → connector class
CONNECTOR_REGISTRY: dict[str, type[BaseConnector]] = {
    'ahl':           AHLConnector,
    'echl':          ECHLConnector,
    'ohl':           OHLConnector,
    'whl':           WHLConnector,
    'qmjhl':         QMJHLConnector,
    'ncaa':          NCAAConnector,
    'ushl':          USHLConnector,
    'nahl':          NAHLConnector,
    'shl':           SHLConnector,
    'j20':           J20Connector,
    'liiga':         LiigaConnector,
    'khl':           KHLConnector,
    'mhl':           MHLConnector,
    'nl':            NLConnector,
    'del':           DELConnector,
    'elh':           ELHConnector,
    'usntdp':        USNTDPConnector,
    'bchl':          BCHLConnector,
    'hockey_canada': HockeyCanadaConnector,
}


def get_connector(league_code: str, season: str = '2025-26') -> BaseConnector | None:
    """Instantiate a connector for the given league."""
    cls = CONNECTOR_REGISTRY.get(league_code)
    if cls is None:
        return None
    return cls(season=season)


def get_all_connectors(season: str = '2025-26') -> list[BaseConnector]:
    """Instantiate all registered connectors."""
    return [cls(season=season) for cls in CONNECTOR_REGISTRY.values()]
