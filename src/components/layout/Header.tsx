import React from 'react';
import {
  Activity,
  AlertTriangle,
  Cpu,
  HelpCircle,
  Menu,
  Radio,
  Sliders,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { DemoScenario } from '../../types';
import { AgroIotLogo } from '../common/AgroIotLogo';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenDemoControls: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenDemoControls,
  activeTab,
  setActiveTab,
}) => {
  const {
    hardwareStatus,
    hardwareProtocol,
    mode,
    scenario,
    setScenario,
    setMode,
    unreadAlertsCount,
    isOfflineSimulated,
    toggleOfflineSimulated,
    pingMs,
    edgeSpecs,
  } = useFarm();

  const scenarios: { key: DemoScenario; label: string }[] = [
    { key: 'NORMAL', label: 'Normal' },
    { key: 'LOW_MOISTURE', label: 'Low Moisture' },
    { key: 'HEAT_STRESS', label: 'Heat Stress' },
    { key: 'DISEASE_ALERT', label: 'Disease' },
    { key: 'PEST_ALERT', label: 'Pest' },
    { key: 'FLOOD', label: 'Flood' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#091b14]/90 backdrop-blur-md border-b border-emerald-950/80 px-3 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-2 max-w-[1700px] mx-auto">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/60 transition"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('landing')}
            className="text-left group cursor-pointer"
            title="Go to AGRO-IOT Home"
          >
            <AgroIotLogo size="md" showTagline={true} />
          </button>
        </div>

        {/* Center: Real-time Telemetry & Edge Intelligence Indicators */}
        <div className="hidden xl:flex items-center gap-3">
          {/* Hardware status pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              hardwareStatus === 'connected'
                ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
                : hardwareStatus === 'connecting'
                ? 'bg-amber-950/50 border-amber-700/60 text-amber-300'
                : 'bg-rose-950/50 border-rose-700/60 text-rose-300'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {hardwareStatus === 'connected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  hardwareStatus === 'connected'
                    ? 'bg-emerald-500'
                    : hardwareStatus === 'connecting'
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              ></span>
            </span>
            <span className="font-semibold uppercase tracking-wider">
              {hardwareStatus === 'connected'
                ? `Hardware: Connected`
                : hardwareStatus === 'connecting'
                ? 'Connecting...'
                : 'Hardware: Disconnected'}
            </span>
            {hardwareStatus === 'connected' && (
              <span className="text-[10px] text-emerald-400/80 font-mono bg-emerald-900/60 px-1.5 py-0.5 rounded">
                {hardwareProtocol.toUpperCase()} · {pingMs}ms
              </span>
            )}
          </div>

          {/* Edge AI Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-cyan-950/40 border border-cyan-700/50 text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="font-semibold">Edge AI: ACTIVE</span>
            <span className="text-[10px] text-cyan-400/80 font-mono bg-cyan-900/50 px-1.5 py-0.5 rounded">
              Local On-Device · {edgeSpecs.averageLatencyMs}ms
            </span>
          </div>

          {/* Decision Engine Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-950/40 border border-emerald-800/40 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Decision Engine: Synchronized</span>
          </div>

          {/* Offline indicator badge */}
          <button
            onClick={toggleOfflineSimulated}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
              isOfflineSimulated
                ? 'bg-amber-950/70 border-amber-500/80 text-amber-200'
                : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle simulated network disconnection to demonstrate offline edge operation"
          >
            {isOfflineSimulated ? (
              <>
                <WifiOff className="w-3 h-3 text-amber-400" />
                <span className="text-[11px] font-semibold">Offline Mode Active</span>
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px]">Online Sync</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Mode Switcher, Scenario Quick Picker, Demo Control Launcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Scenario Selector Dropdown */}
          <div className="relative hidden md:flex items-center">
            <label htmlFor="quick-scenario-select" className="sr-only">
              Demo Scenario
            </label>
            <div className="flex items-center bg-[#071711] border border-emerald-800/50 rounded-lg p-0.5">
              <span className="text-[10px] uppercase font-bold text-emerald-500/80 px-2 tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                Scenario:
              </span>
              <select
                id="quick-scenario-select"
                value={scenario}
                onChange={(e) => setScenario(e.target.value as DemoScenario)}
                className="bg-transparent text-xs font-semibold text-emerald-200 py-1 pr-7 pl-1 focus:outline-none cursor-pointer"
              >
                {scenarios.map((sc) => (
                  <option key={sc.key} value={sc.key} className="bg-[#071711] text-slate-100">
                    {sc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LIVE / DEMO Mode Toggle */}
          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-700/60">
            <button
              id="header-mode-live-btn"
              onClick={() => setMode('LIVE')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                mode === 'LIVE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LIVE
            </button>
            <button
              id="header-mode-demo-btn"
              onClick={() => setMode('DEMO')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                mode === 'DEMO'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DEMO
            </button>
          </div>

          {/* Alerts Notification Bell */}
          <button
            id="header-alerts-btn"
            onClick={() => setActiveTab('alerts')}
            className={`relative p-2 rounded-lg border transition ${
              unreadAlertsCount > 0
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 hover:bg-amber-900/50'
                : 'bg-emerald-950/40 border-emerald-800/40 text-slate-300 hover:bg-emerald-900/40'
            }`}
            title={`${unreadAlertsCount} Unread Alerts`}
          >
            <AlertTriangle className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-rose-600 rounded-full animate-pulse shadow">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Demo Control Center Trigger */}
          <button
            id="header-demo-controls-btn"
            onClick={onOpenDemoControls}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold tracking-wide shadow-md shadow-emerald-950/40 transition cursor-pointer"
            title="Open Demo Control Center"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Controls</span>
          </button>
        </div>
      </div>
    </header>
  );
};
