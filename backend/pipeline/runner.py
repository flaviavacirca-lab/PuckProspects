"""
Ingestion pipeline runner.

Orchestrates connector execution, validation, and persistence.
Can run all connectors or a specific subset.

Usage:
    python -m backend.pipeline.runner                    # run all
    python -m backend.pipeline.runner --leagues ahl ohl  # run specific leagues
    python -m backend.pipeline.runner --season 2024-25   # specific season
"""

import argparse
import logging
import time
from datetime import datetime

from backend.connectors.registry import get_connector, get_all_connectors, CONNECTOR_REGISTRY
from backend.connectors.base import ConnectorResult
from backend.config import CURRENT_SEASON

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(name)s] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
logger = logging.getLogger('pipeline')


def run_connector(league_code: str, season: str) -> ConnectorResult | None:
    """Run a single connector and return the result."""
    connector = get_connector(league_code, season)
    if connector is None:
        logger.warning(f'No connector registered for league: {league_code}')
        return None

    result = connector.run()
    log_result(result)
    return result


def run_all(season: str, league_codes: list[str] | None = None) -> list[ConnectorResult]:
    """Run all registered connectors (or a subset) sequentially."""
    codes = league_codes or list(CONNECTOR_REGISTRY.keys())
    results = []

    logger.info(f'Starting ingestion pipeline for {len(codes)} leagues, season {season}')
    pipeline_start = time.time()

    for code in codes:
        result = run_connector(code, season)
        if result:
            results.append(result)

    duration = time.time() - pipeline_start
    successes = sum(1 for r in results if r.status == 'success')
    failures = sum(1 for r in results if r.status == 'failed')
    partial = sum(1 for r in results if r.status == 'partial')

    logger.info(
        f'Pipeline complete in {duration:.1f}s — '
        f'{successes} success, {partial} partial, {failures} failed'
    )

    return results


def log_result(result: ConnectorResult):
    """Log a connector result. In production, this would also persist to ingestion_log table."""
    level = {
        'success': logging.INFO,
        'partial': logging.WARNING,
        'failed': logging.ERROR,
    }.get(result.status, logging.INFO)

    logger.log(
        level,
        f'[{result.league_code}] {result.status.upper()} — '
        f'{result.records_fetched} records in {result.duration_ms}ms'
        + (f' — errors: {result.errors}' if result.errors else '')
    )


def main():
    parser = argparse.ArgumentParser(description='PuckProspects Ingestion Pipeline')
    parser.add_argument('--leagues', nargs='+', help='League codes to ingest (default: all)')
    parser.add_argument('--season', default=CURRENT_SEASON, help=f'Season to ingest (default: {CURRENT_SEASON})')
    parser.add_argument('--list', action='store_true', help='List all registered connectors')
    args = parser.parse_args()

    if args.list:
        print('Registered connectors:')
        for code, cls in sorted(CONNECTOR_REGISTRY.items()):
            print(f'  {code:20s} → {cls.__name__} ({cls.source_url})')
        return

    results = run_all(args.season, args.leagues)

    # Summary
    print('\n' + '=' * 60)
    print('INGESTION SUMMARY')
    print('=' * 60)
    for r in results:
        status_icon = {'success': '✓', 'partial': '◐', 'failed': '✗'}.get(r.status, '?')
        print(f'  {status_icon} {r.league_code:20s} {r.status:10s} {r.records_fetched:5d} records  {r.duration_ms:6d}ms')
    print('=' * 60)


if __name__ == '__main__':
    main()
