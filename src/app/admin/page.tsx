'use client';

import { useState } from 'react';
import { LEAGUES } from '@/lib/leagues';

interface IngestionLog {
  id: number;
  leagueCode: string;
  status: 'success' | 'partial' | 'failed';
  recordsFetched: number;
  durationMs: number;
  timestamp: string;
  errors?: string[];
}

// Mock ingestion history
const MOCK_LOGS: IngestionLog[] = LEAGUES
  .filter(l => l.tier <= 2)
  .flatMap((league, i) => [
    {
      id: i * 2 + 1,
      leagueCode: league.code,
      status: Math.random() > 0.15 ? 'success' as const : Math.random() > 0.5 ? 'partial' as const : 'failed' as const,
      recordsFetched: Math.floor(Math.random() * 200) + 20,
      durationMs: Math.floor(Math.random() * 5000) + 500,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
    },
    {
      id: i * 2 + 2,
      leagueCode: league.code,
      status: 'success' as const,
      recordsFetched: Math.floor(Math.random() * 200) + 20,
      durationMs: Math.floor(Math.random() * 5000) + 500,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7 - 86400000 * 3).toISOString(),
    },
  ])
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState<'sources' | 'logs' | 'health'>('sources');

  const tabs = [
    { key: 'sources' as const, label: 'Source Registry' },
    { key: 'logs' as const, label: 'Ingestion Logs' },
    { key: 'health' as const, label: 'Health Monitor' },
  ];

  return (
    <div className="max-w-[1400px] space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Admin Panel</h1>
        <p className="text-sm text-slate-500 mt-1">Source management, ingestion monitoring, and data health</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/40 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === 'sources' && <SourceRegistry />}
      {selectedTab === 'logs' && <IngestionLogs />}
      {selectedTab === 'health' && <HealthMonitor />}
    </div>
  );
}

function SourceRegistry() {
  const categories = LEAGUES.reduce((acc, l) => {
    if (!acc[l.category]) acc[l.category] = [];
    acc[l.category].push(l);
    return acc;
  }, {} as Record<string, typeof LEAGUES>);

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([category, leagues]) => (
        <div key={category} className="card p-5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{category}</h3>
          <div className="grid gap-3">
            {leagues.map((league) => (
              <div key={league.code} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/20">
                <div className="flex items-center gap-4">
                  <div className="w-16">
                    <span className="badge badge-league text-[10px]">{league.shortName}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{league.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {league.country} · {league.level} · Tier {league.tier}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {league.sourceUrl ? (
                    <a
                      href={league.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline max-w-[200px] truncate"
                    >
                      {league.sourceUrl}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-600">No source URL</span>
                  )}
                  <ConnectorStatusBadge status={league.connectorStatus} />
                  <button className="btn-ghost text-xs px-2 py-1">
                    Refresh
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function IngestionLogs() {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-slate-700/40">
        <h3 className="text-sm font-semibold text-slate-400">Recent Ingestion Runs</h3>
      </div>
      <table className="stat-table">
        <thead>
          <tr>
            <th>League</th>
            <th>Status</th>
            <th className="text-right">Records</th>
            <th className="text-right">Duration</th>
            <th>Timestamp</th>
            <th>Errors</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_LOGS.slice(0, 30).map((log) => {
            const league = LEAGUES.find(l => l.code === log.leagueCode);
            return (
              <tr key={log.id}>
                <td>
                  <span className="badge badge-league text-[10px]">{league?.shortName || log.leagueCode}</span>
                </td>
                <td>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    log.status === 'success' ? 'text-emerald-400' :
                    log.status === 'partial' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      log.status === 'success' ? 'bg-emerald-400' :
                      log.status === 'partial' ? 'bg-amber-400' : 'bg-red-400'
                    }`} />
                    {log.status}
                  </span>
                </td>
                <td className="text-right font-mono">{log.recordsFetched}</td>
                <td className="text-right font-mono text-slate-400">{log.durationMs}ms</td>
                <td className="text-xs text-slate-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="text-xs text-red-400">
                  {log.errors?.join(', ') || '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HealthMonitor() {
  const leaguesWithStatus = LEAGUES.filter(l => l.tier <= 2).map((league) => {
    const logs = MOCK_LOGS.filter(l => l.leagueCode === league.code);
    const lastLog = logs[0];
    const recentFailures = logs.filter(l => l.status === 'failed').length;
    return { league, lastLog, recentFailures, healthy: recentFailures === 0 };
  });

  const healthyCount = leaguesWithStatus.filter(l => l.healthy).length;
  const totalCount = leaguesWithStatus.length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Healthy Sources</div>
          <div className="text-3xl font-bold text-emerald-400 mt-1">{healthyCount}/{totalCount}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Recent Failures</div>
          <div className="text-3xl font-bold text-red-400 mt-1">
            {leaguesWithStatus.filter(l => !l.healthy).length}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider">Active Connectors</div>
          <div className="text-3xl font-bold text-blue-400 mt-1">
            {LEAGUES.filter(l => l.connectorStatus !== 'placeholder').length}
          </div>
        </div>
      </div>

      {/* Per-league health */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Source Health</h3>
        <div className="grid grid-cols-2 gap-3">
          {leaguesWithStatus.map(({ league, lastLog, healthy }) => (
            <div
              key={league.code}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                healthy
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${healthy ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="text-sm font-medium text-slate-200">{league.shortName}</span>
                <span className="text-xs text-slate-500">{league.name}</span>
              </div>
              <div className="text-xs text-slate-500">
                {lastLog
                  ? `Last: ${new Date(lastLog.timestamp).toLocaleDateString()}`
                  : 'Never ingested'
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConnectorStatusBadge({ status }: { status: string }) {
  const styles = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    partial: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    manual: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    placeholder: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`badge border ${styles[status as keyof typeof styles] || styles.placeholder}`}>
      {status}
    </span>
  );
}
