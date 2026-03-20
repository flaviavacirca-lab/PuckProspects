"""Configuration for the PuckProspects ingestion pipeline."""

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://puckprospects:puckprospects@localhost:5432/puckprospects')
INGESTION_CONCURRENCY = int(os.getenv('INGESTION_CONCURRENCY', '3'))
REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', '30'))
USER_AGENT = 'PuckProspects/1.0 (Hockey Analytics Platform)'
CURRENT_SEASON = '2025-26'
