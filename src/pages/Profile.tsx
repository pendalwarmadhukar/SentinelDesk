import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/authApi';
import {
  User as UserIcon,
  Shield,
  Key,
  Clock,
  CheckCircle2,
  Save,
  Lock,
  Smartphone,
  Copy,
  Check,
  Terminal,
  RefreshCw,
  AlertTriangle,
  Award,
  Activity,
  FileCode,
  Radio,
  Trash2,
} from 'lucide-react';

const PRESET_AVATARS = [
  { label: 'Cyber Analyst (Female 1)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256' },
  { label: 'Incident Lead (Male 1)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256' },
  { label: 'Threat Hunter (Female 2)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256' },
  { label: 'Forensics Lead (Male 2)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256' },
  { label: 'Tactical Cyber Operator', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=256' },
];

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'api' | 'activity'>('info');

  // Form Fields
  const [name, setName] = useState(user?.name || 'Alex Vance');
  const [department, setDepartment] = useState(user?.department || 'Cyber Threat Intelligence & Incident Response');
  const [shift, setShift] = useState(user?.shift || 'Alpha Shift (08:00 - 16:00 UTC)');
  const [role, setRole] = useState(user?.role || 'Tier 2 Senior SOC Analyst');
  const [clearanceLevel, setClearanceLevel] = useState(user?.clearanceLevel || 'TOP SECRET // SCI-TK');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '+1 (555) 019-2834');
  const [workstation, setWorkstation] = useState(user?.workstation || 'SOC Ops Floor - Pod Bravo (Console #04)');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC-5 (America/New_York)');
  const [bio, setBio] = useState(
    user?.bio ||
      'Specialized in host intrusion forensics, living-off-the-land techniques (LotL), and threat intelligence hunting for Advanced Persistent Threats (APTs).'
  );
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
  );

  // States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Password rotation state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // MFA State
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled ?? true);
  const [mfaType, setMfaType] = useState(user?.mfaType || 'FIDO2 WebAuthn (YubiKey 5C NFC)');
  const [isTogglingMfa, setIsTogglingMfa] = useState(false);

  // API Token State
  const [apiToken, setApiToken] = useState(user?.apiToken || 'snt_live_9b4e721a94f0e2193b2a884');
  const [tokenCopied, setTokenCopied] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  // Keep local fields in sync with user state
  useEffect(() => {
    if (user) {
      setName(user.name);
      setDepartment(user.department || 'Cyber Threat Intelligence & Incident Response');
      setShift(user.shift || 'Alpha Shift (08:00 - 16:00 UTC)');
      setRole(user.role);
      setClearanceLevel(user.clearanceLevel || 'TOP SECRET // SCI-TK');
      setPhoneNumber(user.phoneNumber || '+1 (555) 019-2834');
      setWorkstation(user.workstation || 'SOC Ops Floor - Pod Bravo (Console #04)');
      setTimezone(user.timezone || 'UTC-5 (America/New_York)');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || PRESET_AVATARS[0].url);
      setMfaEnabled(user.mfaEnabled ?? true);
      setMfaType(user.mfaType || 'FIDO2 WebAuthn (YubiKey 5C NFC)');
      if (user.apiToken) setApiToken(user.apiToken);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      await updateUser({
        name,
        department,
        shift,
        role,
        clearanceLevel,
        phoneNumber,
        workstation,
        timezone,
        bio,
        avatarUrl,
      });
      setSaveSuccessMsg('Profile updated and cryptographic credentials synced.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMsg(null);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setPasswordMsg({
        type: 'success',
        text: 'Master credentials rotated successfully. Security log event #SEC-PASS-ROTATED recorded.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 5000);
    } catch (err: any) {
      setPasswordMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Unable to rotate password. Please retry.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggleMfa = async () => {
    setIsTogglingMfa(true);
    const nextState = !mfaEnabled;
    try {
      const res = await authApi.toggleMfa(nextState);
      setMfaEnabled(res.mfaEnabled);
      setMfaType(res.mfaType);
      await updateUser({ mfaEnabled: res.mfaEnabled, mfaType: res.mfaType });
    } catch (err) {
      console.error('Failed to toggle MFA:', err);
    } finally {
      setIsTogglingMfa(false);
    }
  };

  const handleGenerateToken = async () => {
    setIsGeneratingToken(true);
    try {
      const res = await authApi.generateApiToken();
      setApiToken(res.token);
      await updateUser({ apiToken: res.token });
    } catch (err) {
      console.error('Failed to generate token:', err);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!window.confirm('Are you sure you want to revoke this API token? Any running SIEM CLI integrations using it will fail.')) {
      return;
    }
    try {
      await authApi.revokeApiToken();
      setApiToken('');
      await updateUser({ apiToken: undefined });
    } catch (err) {
      console.error('Failed to revoke token:', err);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Page Title & Clearance Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              ANALYST PROFILE &amp; BADGE
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Security clearance credentials, operational shift dispatch, and cryptographic authorization
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-semibold">SESSION AUTHENTICATED</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{user?.badge || 'SD-8492'}</span>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs font-mono text-emerald-300 shadow-lg">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Holographic Badge & KPI Card, Right Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Digital SOC Security Badge */}
        <div className="space-y-6">
          {/* Security Badge Card */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950 to-cyan-950/40 p-6 shadow-2xl backdrop-blur-md">
            {/* Top Lanyard & Security Barcode Hologram */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 font-mono text-[10px] text-slate-400">
              <span className="tracking-widest uppercase font-bold text-cyan-400">SENTINEL-DESK SOC</span>
              <span className="rounded bg-cyan-950/60 px-1.5 py-0.5 text-cyan-300 border border-cyan-800/40 font-mono">
                {user?.badge || 'SD-8492'}
              </span>
            </div>

            {/* Avatar & Call Sign */}
            <div className="my-5 flex flex-col items-center text-center">
              <div className="relative mb-3 flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyan-400 bg-slate-900 p-1 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-full w-full rounded-full object-cover"
                  onError={(e) => {
                    (e.target as any).src = PRESET_AVATARS[0].url;
                  }}
                />
                <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950 ring-2 ring-slate-900" title="Active on duty">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>
              </div>

              <h2 className="text-lg font-bold text-white font-mono">{name}</h2>
              <p className="text-xs font-mono text-cyan-300 font-semibold">{role}</p>

              {/* Clearance Pill */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-bold text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                <Award className="h-3.5 w-3.5 text-amber-400" />
                <span>{clearanceLevel}</span>
              </div>
            </div>

            {/* Badge Security Metadata */}
            <div className="space-y-2 border-t border-slate-800/80 pt-4 font-mono text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Unit:</span>
                <span className="truncate max-w-[170px] text-slate-200" title={department}>{department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shift:</span>
                <span className="text-slate-200">{shift.split(' ')[0]} Shift</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Console:</span>
                <span className="text-slate-200 truncate max-w-[170px]">{workstation.split('-')[1]?.trim() || workstation}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800/50">
                <span className="text-slate-500">MFA Status:</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${mfaEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {mfaEnabled ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {mfaEnabled ? 'Active' : 'Unsecured'}
                </span>
              </div>
            </div>

            {/* Stylized Barcode footer */}
            <div className="mt-5 border-t border-slate-800/60 pt-3 text-center">
              <div className="h-5 w-full bg-[repeating-linear-gradient(90deg,#64748b,#64748b_2px,transparent_2px,transparent_4px,#94a3b8_4px,#94a3b8_7px,transparent_7px,transparent_9px)] opacity-60 rounded" />
              <span className="mt-1 block font-mono text-[9px] tracking-widest text-slate-500">
                AUTH-SIG: 8942-TK-US-DEF-2026
              </span>
            </div>
          </div>

          {/* Operational SOC Performance Scorecard */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-200 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-400" />
                Analyst Operational KPIs
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">90-Day Telemetry</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <span className="text-[10px] text-slate-500 uppercase">Alerts Triaged</span>
                <p className="text-lg font-bold text-white mt-0.5">{user?.alertsTriageCount || 142}</p>
                <span className="text-[10px] text-cyan-400 font-semibold">+18 this week</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <span className="text-[10px] text-slate-500 uppercase">Incidents Solved</span>
                <p className="text-lg font-bold text-white mt-0.5">{user?.incidentsResolvedCount || 38}</p>
                <span className="text-[10px] text-emerald-400 font-semibold">100% contained</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <span className="text-[10px] text-slate-500 uppercase">Mean Time to Ack</span>
                <p className="text-lg font-bold text-white mt-0.5">{user?.avgResponseTimeMinutes || 3.4}m</p>
                <span className="text-[10px] text-emerald-400 font-semibold">Top 5% SLA</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                <span className="text-[10px] text-slate-500 uppercase">Quality Score</span>
                <p className="text-lg font-bold text-white mt-0.5">98.6%</p>
                <span className="text-[10px] text-cyan-400 font-semibold">SOC Lead Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Tabbed Profile & Security Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-800 font-mono text-xs">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 font-semibold transition-colors ${
                activeTab === 'info'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              Operational Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 font-semibold transition-colors ${
                activeTab === 'security'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="h-4 w-4" />
              Credentials &amp; MFA
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 font-semibold transition-colors ${
                activeTab === 'api'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="h-4 w-4" />
              Analyst API Key
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 font-semibold transition-colors ${
                activeTab === 'activity'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="h-4 w-4" />
              Session History
            </button>
          </div>

          {/* TAB 1: OPERATIONAL PROFILE FORM */}
          {activeTab === 'info' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase font-mono text-white">
                  Analyst Roster &amp; Dispatch Information
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Update your display name, clearance, and on-call operational shift assignment
                </p>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2 border-y border-slate-800/80 py-4 font-mono text-xs">
                <label className="block text-slate-400 font-semibold">CHOOSE ANALYST AVATAR</label>
                <div className="flex flex-wrap items-center gap-3">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(av.url)}
                      className={`relative h-12 w-12 rounded-full overflow-hidden border-2 transition-all ${
                        avatarUrl === av.url
                          ? 'border-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                          : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                      title={av.label}
                    >
                      <img src={av.url} alt={av.label} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="pt-2">
                  <input
                    type="text"
                    placeholder="Or enter custom image URL..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-[11px] text-slate-300 focus:border-cyan-500/70 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">CALL SIGN / FULL NAME</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500/70 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">ENTERPRISE EMAIL (READ-ONLY)</label>
                    <input
                      type="text"
                      disabled
                      value={user?.email || 'alex.vance@sentineldesk.internal'}
                      className="w-full rounded-lg border border-slate-800/60 bg-slate-950/40 p-2.5 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">DUTY ROLE / TIER</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500/70 focus:outline-none"
                    >
                      <option value="Tier 1 Junior SOC Analyst">Tier 1 Junior SOC Analyst</option>
                      <option value="Tier 2 Senior SOC Analyst">Tier 2 Senior SOC Analyst</option>
                      <option value="Tier 3 Threat Hunter & Forensics Lead">Tier 3 Threat Hunter &amp; Forensics Lead</option>
                      <option value="SOC Incident Commander">SOC Incident Commander</option>
                      <option value="Security Operations Manager">Security Operations Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">CLEARANCE LEVEL</label>
                    <select
                      value={clearanceLevel}
                      onChange={(e) => setClearanceLevel(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500/70 focus:outline-none"
                    >
                      <option value="TOP SECRET // SCI-TK">TOP SECRET // SCI-TK</option>
                      <option value="SECRET // NOFORN">SECRET // NOFORN</option>
                      <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                      <option value="PUBLIC TRUST // LEVEL 2">PUBLIC TRUST // LEVEL 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">DEPARTMENT / UNIT</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500/70 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">ASSIGNED SHIFT SCHEDULE</label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500/70 focus:outline-none"
                    >
                      <option value="Alpha Shift (08:00 - 16:00 UTC)">Alpha Shift (08:00 - 16:00 UTC)</option>
                      <option value="Bravo Shift (16:00 - 00:00 UTC)">Bravo Shift (16:00 - 00:00 UTC)</option>
                      <option value="Night Watch (00:00 - 08:00 UTC)">Night Watch (00:00 - 08:00 UTC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">SECURE PHONE / COMM LINK</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500/70 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">OPERATIONS TIMEZONE</label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500/70 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">WORKSTATION / CONSOLE LOCATION</label>
                  <input
                    type="text"
                    value={workstation}
                    onChange={(e) => setWorkstation(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500/70 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">SPECIALIZATION BIO &amp; FORENSICS FOCUS</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500/70 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Changes persist to backend database and synchronize instantly across the SOC platform.
                  </span>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer shadow"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: CREDENTIALS & MFA */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Master Password Rotation */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase font-mono text-white flex items-center gap-2">
                    <Key className="h-4 w-4 text-cyan-400" />
                    Rotate Master Password
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Password rotation re-issues cryptographic authorization certificates across SentinelDesk nodes
                  </p>
                </div>

                {passwordMsg && (
                  <div
                    className={`rounded-lg border p-3 font-mono text-xs ${
                      passwordMsg.type === 'success'
                        ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                        : 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">CURRENT PASSWORD</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500/70 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">NEW MASTER PASSWORD</label>
                      <input
                        type="password"
                        required
                        placeholder="At least 8 characters..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500/70 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">CONFIRM NEW PASSWORD</label>
                      <input
                        type="password"
                        required
                        placeholder="Repeat new password..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-slate-200 focus:border-cyan-500/70 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 font-semibold text-white transition-colors disabled:opacity-50"
                    >
                      <Lock className="h-4 w-4" />
                      {isChangingPassword ? 'Updating Password...' : 'Rotate Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Hardware Security Key / MFA */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase font-mono text-white flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-emerald-400" />
                      Multi-Factor Authentication (MFA)
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      FIDO2 WebAuthn Hardware Security Key and TOTP authenticator
                    </p>
                  </div>
                  <button
                    onClick={handleToggleMfa}
                    disabled={isTogglingMfa}
                    className={`rounded px-3 py-1 font-mono text-xs font-bold transition-colors ${
                      mfaEnabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {mfaEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registered Hardware Token:</span>
                    <span className="text-slate-200 font-semibold">{mfaType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Standard:</span>
                    <span className="text-emerald-400">NIST SP 800-63B AAL3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Backup Emergency Codes:</span>
                    <span className="text-cyan-400">8 / 10 Remaining</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIEM API KEY */}
          {activeTab === 'api' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg space-y-5 font-mono text-xs">
              <div>
                <h3 className="text-sm font-semibold uppercase text-white flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  Personal Analyst API Key
                </h3>
                <p className="text-slate-400 mt-0.5">
                  Authorize automation tools, SIEM ingestion scripts, and SentinelDesk CLI tools
                </p>
              </div>

              {apiToken ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={apiToken}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-cyan-400 font-mono tracking-wider focus:outline-none"
                    />
                    <button
                      onClick={copyToken}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-2.5 text-cyan-300 hover:bg-cyan-900/50 transition-colors shrink-0"
                    >
                      {tokenCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      <span>{tokenCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleRevokeToken}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2.5 text-rose-300 hover:bg-rose-900/50 transition-colors shrink-0"
                      title="Revoke Token"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Treat this token like a master cryptographic key. Do not commit it to version control.
                  </p>

                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
                    <span className="text-slate-400 font-semibold block">CLI / cURL Usage Example:</span>
                    <pre className="text-slate-300 overflow-x-auto text-[11px] select-all">
                      curl -H "Authorization: Bearer {apiToken}" http://localhost:3000/api/alerts
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-slate-400">No active analyst API token currently provisioned.</p>
                  <button
                    onClick={handleGenerateToken}
                    disabled={isGeneratingToken}
                    className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-white font-semibold"
                  >
                    <Key className="h-4 w-4" />
                    {isGeneratingToken ? 'Generating Token...' : 'Generate New API Token'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SESSION AUDIT HISTORY */}
          {activeTab === 'activity' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg space-y-4 font-mono text-xs">
              <div>
                <h3 className="text-sm font-semibold uppercase text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  Active Analyst Session &amp; Security Audits
                </h3>
                <p className="text-slate-400 mt-0.5">
                  Cryptographic session tokens and network connection checkpoints
                </p>
              </div>

              <div className="space-y-3">
                {/* Active Session */}
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-white">Current Active Workstation Session</span>
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
                      THIS CONSOLE
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500">Source IP:</span> {user?.activeIp || '10.0.4.18 (Encrypted WireGuard)'}
                    </div>
                    <div>
                      <span className="text-slate-500">Authenticated:</span> Today at 08:00:15 UTC
                    </div>
                    <div>
                      <span className="text-slate-500">Console Hardware:</span> Dell Precision 7920 / SentinelOS Hardened
                    </div>
                    <div>
                      <span className="text-slate-500">Session ID:</span> sess_sd_8492_prod_9921
                    </div>
                  </div>
                </div>

                {/* Past Sessions */}
                <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Previous Alpha Shift Session (Console #02)</span>
                    <span className="text-[10px] text-slate-500">Terminated (Shift Handoff)</span>
                  </div>
                  <p className="text-[11px]">
                    2026-09-23 08:00 UTC &rarr; 16:00 UTC | 10.0.4.16 | 28 triage actions signed
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
