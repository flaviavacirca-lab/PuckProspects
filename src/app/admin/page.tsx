'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types matching API responses ──

interface SourceHealth {
  connectorName: string;
  label: string;
  league: string;
  sourceType: string;
  maturity: string;
  tier: number;
  cadence: string;
  enabled: boolean;
  healthy: boolean;
  consecutiveFailures: number;
  lastSuccessAt: string | null;
  lastRunStatus: string | null;
  lastRunRecordsFetched: number;
  lastRunRecordsInserted: number;
  lastRunDurationMs: number | null;
  lastRunAt: string | null;
}

interface PipelineHealth {
  totalSources: number;
  activeSources: number;
  healthySources: number;
  unhealthySources: number;
  implementedSources: number;
  sources: SourceHealth[];
  totalIngestionRuns: number;
  recentErrorRate: number;
  flaggedMatchCount: number;
  lastFullRunAt: string | null;
}

interface IngestionRun {
  id: number;
  connectorName: string;
  league: string;
  status: string;
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errorCount: number;
  errors: string[];
  durationMs: number | null;
  startedAt: string;
  completedAt: string | null;
}

interface FlaggedMatch {
  id: number;
  sourceName: string;
  sourceFullName: string;
  sourceLeague: string;
  reason: string;
  bestConfidence: number;
  candidateCount: number;
  resolution: string;
  flaggedAt: string;
}

// ── Main Page ──

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState<'health' | 'sources' | 'runs' | 'flagged'>('health');
  const [health, setHealth] = useState<PipelineHealth | null>(null);
  const [runs, setRuns] = useState<IngestionRun[]>([]);
  const [flagged, setFlagged] = useState<FlaggedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, runsRes, flaggedRes] = await Promise.allSettled([
        fetch('/api/pipeline/health').then(r => r.json()),
        fetch('/api/pipeline/runs?limit=30').then(r => r.json()),
        fetch('/api/pipeline/flagged?limit=50').then(r => r.json()),
      ]);

      if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
      if (runsRes.status === 'fulfilled') setRuns(runsRes.value.runs || []);
      if (flaggedRes.status === 'fulfilled') setFlagged(flaggedRes.value.flagged || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const tabs = [
    { key: 'health' as const, label: 'Health Monitor' },
    { key: 'sources' as const, label: 'Source Registry' },
    { key: 'runs' as const, label: 'Ingestion Runs' },
    { key: 'flagged' as const, label: `Flagged Matches${health?.flaggedMatchCount ? ` (${health.flaggedMatchCount})` : ''}` },
  ];

  return (
    <div className="max-w-[1400px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Source management, ingestion monitoring, and data health</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === 'health' && <HealthMonitor health={health} />}
      {selectedTab === 'sources' && <SourceRegistry sources={health?.sources || []} />}
      {selectedTab === 'runs' && <IngestionRuns runs={runs} />}
      {selectedTab === 'flagged' && <FlaggedMatches flagged={flagged} />}
    </div>
  );
}

// ── Health Monitor ──

function HealthMonitor({ health }: { health: PipelineHealth | null }) {
  if (!health) return <LoadingPlaceholder />;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Sources" value={`${health.activeSources}/${health.totalSources}`} accent="blue" />
        <StatCard label="Healthy" value={`${health.healthySources}`} accent="green" />
        <StatCard label="Unhealthy" value={`${health.unhealthySources}`} accent={health.unhealthySources > 0 ? 'red' : 'green'} />
        <StatCard label="Implemented" value={`${health.implementedSources}`} accent="blue" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Runs" value={`${health.totalIngestionRuns}`} accent="gray" />
        <StatCard label="7-Day Error Rate" value={`${health.recentErrorRate}%`} accent={health.recentErrorRate > 20 ? 'red' : 'green'} />
        <StatCard label="Flagged Matches" value={`${health.flaggedMatchCount}`} accent={health.flaggedMatchCount > 0 ? 'amber' : 'gray'} />
        <StatCard label="Last Run" value={health.lastFullRunAt ? timeAgo(health.lastFullRunAt) : 'Never'} accent="gray" />
      </div>

      {/* Per-source health grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Source Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {health.sources
            .filter(s => s.enabled)
            .map((src) => (
            <div
              key={src.connectorName}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                src.healthy
                  ? 'bg-green-50/50 border-green-200'
                  : 'bg-red-50/50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${src.healthy ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <span className="text-sm font-medium text-gray-800">{src.label}</span>
                  <div className="text-xs text-gray-500">{src.league} / T{src.tier} / {src.maturity}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">
                  {src.lastRunAt ? timeAgo(src.lastRunAt) : 'Never run'}
                </div>
                {src.lastRunRecordsFetched > 0 && (
                  <div className="text-xs text-gray-400">{src.lastRunRecordsFetched} records</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Source Registry ──

function SourceRegistry({ sources }: { sources: SourceHealth[] }) {
  const byTier = sources.reduce((acc, s) => {
    const key = `Tier ${s.tier}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, SourceHealth[]>);

  return (
    <div className="space-y-6">
      {Object.entries(byTier).map(([tier, tierSources]) => (
        <div key={tier} className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{tier}</h3>
          <div className="space-y-2">
            {tierSources.map((src) => (
              <div key={src.connectorName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      src.enabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {src.league}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{src.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {src.sourceType} / {src.cadence}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MaturityBadge maturity={src.maturity} />
                  <EnabledBadge enabled={src.enabled} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Ingestion Runs ──

function IngestionRuns({ runs }: { runs: IngestionRun[] }) {
  if (runs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        No ingestion runs recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Connector</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Fetched</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Inserted</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Updated</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Duration</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Started</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Errors</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {runs.map((run) => (
            <tr key={run.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <span className="font-medium text-gray-800">{run.connectorName}</span>
                <span className="ml-2 text-xs text-gray-400">{run.league}</span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={run.status} />
              </td>
              <td className="px-4 py-3 text-right font-mono text-gray-700">{run.recordsFetched}</td>
              <td className="px-4 py-3 text-right font-mono text-gray-700">{run.recordsInserted}</td>
              <td className="px-4 py-3 text-right font-mono text-gray-700">{run.recordsUpdated}</td>
              <td className="px-4 py-3 text-right font-mono text-gray-500">
                {run.durationMs ? `${run.durationMs}ms` : '-'}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {new Date(run.startedAt).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-xs text-red-600 max-w-[200px] truncate">
                {run.errors.length > 0 ? run.errors[0] : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Flagged Matches ──

function FlaggedMatches({ flagged }: { flagged: FlaggedMatch[] }) {
  if (flagged.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        No flagged identity matches. All resolved or none recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-600">
          Uncertain Player Matches — Needs Review
        </h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Player</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Source</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">League</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reason</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Confidence</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Candidates</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {flagged.map((f) => (
            <tr key={f.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">{f.sourceFullName}</td>
              <td className="px-4 py-3 text-gray-600">{f.sourceName}</td>
              <td className="px-4 py-3">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-blue-100 text-blue-700">
                  {f.sourceLeague}
                </span>
              </td>
              <td className="px-4 py-3">
                <ReasonBadge reason={f.reason} />
              </td>
              <td className="px-4 py-3 text-right font-mono">
                {(f.bestConfidence * 100).toFixed(0)}%
              </td>
              <td className="px-4 py-3 text-right text-gray-600">{f.candidateCount}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium ${
                  f.resolution === 'pending' ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {f.resolution}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Shared Components ──

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    amber: 'text-amber-600',
    gray: 'text-gray-700',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${colors[accent] || colors.gray}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    partial: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
    started: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'success' ? 'bg-green-500' :
        status === 'failed' ? 'bg-red-500' :
        status === 'partial' ? 'bg-amber-500' : 'bg-blue-500'
      }`} />
      {status}
    </span>
  );
}

function MaturityBadge({ maturity }: { maturity: string }) {
  const styles: Record<string, string> = {
    implemented: 'bg-green-100 text-green-700',
    partial: 'bg-amber-100 text-amber-700',
    scaffolded: 'bg-gray-100 text-gray-600',
    future: 'bg-gray-50 text-gray-400',
    blocked: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[maturity] || styles.scaffolded}`}>
      {maturity}
    </span>
  );
}

function EnabledBadge({ enabled }: { enabled: boolean }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
      enabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
    }`}>
      {enabled ? 'enabled' : 'disabled'}
    </span>
  );
}

function ReasonBadge({ reason }: { reason: string }) {
  const labels: Record<string, string> = {
    low_confidence: 'Low confidence',
    ambiguous_match: 'Ambiguous',
    multiple_candidates: 'Multiple matches',
    dob_mismatch: 'DOB mismatch',
  };
  return (
    <span className="text-xs text-gray-600">{labels[reason] || reason}</span>
  );
}

function LoadingPlaceholder() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}
