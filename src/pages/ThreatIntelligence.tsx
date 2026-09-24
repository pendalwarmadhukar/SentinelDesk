import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import threatApi from '../services/threatApi';
import { ThreatIntelligence, Severity } from '../types';
import SeverityBadge from '../components/SeverityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Globe2, Search, ExternalLink, ShieldAlert, ShieldCheck, ArrowUpRight, Activity } from 'lucide-react';

export const ThreatIntelligencePage: React.FC = () => {
  const { ip: paramIp } = useParams<{ ip?: string }>();
  const navigate = useNavigate();

  const [threats, setThreats] = useState<ThreatIntelligence[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<ThreatIntelligence | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await threatApi.getAllThreats();
      setThreats(data);

      if (paramIp) {
        const decoded = decodeURIComponent(paramIp);
        const match = data.find((t) => t.ip === decoded);
        setSelectedThreat(match || null);
      } else if (data.length > 0) {
        setSelectedThreat(data[0]);
      }
    } catch (err: any) {
      console.error('Error fetching threat intel:', err);
      setError('Unable to load threat intelligence records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, [paramIp]);

  const filteredThreats = threats.filter(
    (t) =>
      t.ip.includes(searchQuery) ||
      t.threatType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.country && t.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              LOCAL THREAT INTELLIGENCE
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Attacker IOC reputation, hostile subnet telemetry, and recommended perimeter blocks
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Querying internal threat intelligence repository..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchThreats} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Threat IP Directory */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter hostile IPs, types, or country..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* List */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/60 overflow-hidden">
              {filteredThreats.map((threat) => (
                <div
                  key={threat.ip}
                  onClick={() => setSelectedThreat(threat)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    selectedThreat?.ip === threat.ip
                      ? 'bg-cyan-950/40 border-l-2 border-cyan-400'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-xs text-slate-100">{threat.ip}</span>
                    <SeverityBadge severity={threat.riskLevel} size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-sans">{threat.threatType}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1.5">
                    <span>{threat.country || 'Unknown Location'}</span>
                    <span>{threat.eventCount.toLocaleString()} events</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 2 Cols: Selected Threat Profile */}
          <div className="lg:col-span-2 space-y-6">
            {selectedThreat ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-6">
                {/* Top Title & Risk */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      INDICATOR OF COMPROMISE (IOC)
                    </span>
                    <h2 className="text-2xl font-bold font-mono text-cyan-400">
                      {selectedThreat.ip}
                    </h2>
                    <p className="text-xs text-slate-300 font-sans mt-0.5">
                      {selectedThreat.threatType}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400 block">RISK LEVEL</span>
                      <SeverityBadge severity={selectedThreat.riskLevel} size="lg" />
                    </div>
                  </div>
                </div>

                {/* Threat Statistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">First Seen</span>
                    <p className="font-mono text-xs text-slate-200 mt-1">
                      {selectedThreat.firstSeen}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Last Seen</span>
                    <p className="font-mono text-xs text-slate-200 mt-1">
                      {selectedThreat.lastSeen}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Total Detections</span>
                    <p className="font-mono text-xs font-bold text-rose-400 mt-1">
                      {selectedThreat.eventCount.toLocaleString()} events
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Reputation Score</span>
                    <p className="font-mono text-xs font-bold text-amber-400 mt-1">
                      {selectedThreat.reputationScore ?? 85}/100 Malicious
                    </p>
                  </div>
                </div>

                {/* Geolocation & Routing */}
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 font-mono text-xs space-y-2">
                  <h4 className="text-[11px] font-bold uppercase text-slate-400">
                    Network &amp; Autonomous System (ASN)
                  </h4>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-500">Autonomous System:</span>
                    <span className="text-slate-200">{selectedThreat.asn || 'AS-UNKNOWN'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-500">Geo Origin:</span>
                    <span className="text-slate-200">{selectedThreat.country || 'Global Network'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Associated Alerts:</span>
                    <span className="text-cyan-400 font-bold">
                      {selectedThreat.associatedAlertsCount || 1} triggered
                    </span>
                  </div>
                </div>

                {/* Recommended Response Action */}
                <div className="rounded-lg border border-rose-900/60 bg-rose-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <ShieldAlert className="h-4 w-4" />
                    <h4 className="text-xs font-bold uppercase font-mono tracking-wider">
                      Recommended Containment Action
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 font-mono">
                    {selectedThreat.recommendedAction ||
                      'Immediately block all ingress/egress traffic via perimeter firewall.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => navigate(`/alerts?sourceIp=${encodeURIComponent(selectedThreat.ip)}`)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-3.5 py-2 text-xs font-semibold font-mono transition-colors"
                  >
                    View Alerts for this IP <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => navigate(`/logs?search=${encodeURIComponent(selectedThreat.ip)}`)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-2 text-xs font-semibold font-mono transition-colors"
                  >
                    Search in Security Logs
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-500">
                Select an IP indicator to inspect detailed threat telemetry.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatIntelligencePage;
