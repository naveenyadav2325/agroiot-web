import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Droplet,
  Flame,
  Radio,
  RefreshCw,
  Sliders,
  Sparkles,
  Waves,
  Wifi,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { DemoScenario, HardwareProtocol } from '../../types';

interface DemoControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoControlModal: React.FC<DemoControlModalProps> = ({ isOpen, onClose }) => {
  const {
    scenario,
    setScenario,
    mode,
    setMode,
    hardwareStatus,
    setHardwareStatus,
    hardwareProtocol,
    setProtocol,
    isOfflineSimulated,
    toggleOfflineSimulated,
    reconnectHardware,
    disconnectHardware,
    pingMs,
  } = useFarm();

  if (!isOpen) return null;

  const scenariosList: {
    key: DemoScenario;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    expectedOutcome: string;
  }[] = [
    {
      key: 'NORMAL',
      title: 'Normal (Optimal Field)',
      description: 'Ideal soil moisture (58%), moderate temp (26.8°C), and healthy canopy.',
      icon: CheckCircle2,
      color: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300',
      expectedOutcome: 'Crop health 92/100, irrigation not required, low risks across all factors.',
    },
    {
      key: 'LOW_MOISTURE',
      title: 'Low Soil Moisture Stress',
      description: 'Soil moisture drops below 30% with no rainfall anticipated.',
      icon: Droplet,
      color: 'border-amber-500/60 bg-amber-950/40 text-amber-300',
      expectedOutcome: 'Triggers Smart Irrigation "Recommended", opens Solenoid Valve 1, flags Water Stress.',
    },
    {
      key: 'HEAT_STRESS',
      title: 'Critical Heat Stress',
      description: 'Ambient temp spikes to 37.6°C with arid humidity (29.5%).',
      icon: Flame,
      color: 'border-orange-500/60 bg-orange-950/40 text-orange-300',
      expectedOutcome: 'High Heat Stress warning, canopy transpiration alert, shade netting advisory.',
    },
    {
      key: 'DISEASE_ALERT',
      title: 'Fungal Disease Outbreak',
      description: 'Prolonged high humidity (88.5%) + Early Blight pathogen symptoms detected.',
      icon: AlertTriangle,
      color: 'border-rose-500/60 bg-rose-950/40 text-rose-300',
      expectedOutcome: 'High Disease Risk alert, bio-fungicide spray recommendation, sanitation protocol.',
    },
    {
      key: 'PEST_ALERT',
      title: 'Pest Infestation Threat',
      description: 'Warm dry conditions trigger spider mite reproduction & canopy stippling.',
      icon: Zap,
      color: 'border-purple-500/60 bg-purple-950/40 text-purple-300',
      expectedOutcome: 'High Pest Risk indicator, predatory mite release advisory, neem oil application.',
    },
    {
      key: 'FLOOD',
      title: 'Flood / Waterlogging',
      description: 'Torrential rain forecast, saturated soil (94.8%), drainage overflow.',
      icon: Waves,
      color: 'border-cyan-500/60 bg-cyan-950/40 text-cyan-300',
      expectedOutcome: 'Immediate drainage alert, irrigation suspended, hypoxia warning.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#081b14] border border-emerald-800/80 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-900/60 text-emerald-400 border border-emerald-700/50">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-white">
                Demo Control Center
              </h2>
              <p className="text-xs text-slate-400">
                Instantly simulate agronomic events across the entire AGRO-IOT pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-emerald-950 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Operating Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          {/* Operating Mode */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Operating Mode
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('DEMO')}
                className={`py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition ${
                  mode === 'DEMO'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-[#06140f] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                DEMO MODE
              </button>
              <button
                onClick={() => setMode('LIVE')}
                className={`py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition ${
                  mode === 'LIVE'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-[#06140f] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                LIVE MODE
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {mode === 'DEMO'
                ? 'Deterministic scenarios with synthetic sensor jitter'
                : 'Free-running telemetry cycle with sensor variance'}
            </p>
          </div>

          {/* Hardware Connection State */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Hardware Sensor State
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={reconnectHardware}
                className={`py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition flex items-center justify-center gap-1.5 ${
                  hardwareStatus === 'connected'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-[#06140f] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                Connected
              </button>
              <button
                onClick={disconnectHardware}
                className={`py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition flex items-center justify-center gap-1.5 ${
                  hardwareStatus === 'disconnected'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-[#06140f] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Disconnected
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Status: <span className="font-semibold text-emerald-300">{hardwareStatus.toUpperCase()}</span>
              {hardwareStatus === 'connected' && ` (${hardwareProtocol.toUpperCase()} · ${pingMs}ms latency)`}
            </p>
          </div>
        </div>

        {/* Telemetry Transport Protocol */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Sensor Transport Adapter Protocol
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              SensorAdapter Interface
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(['wifi', 'bluetooth', 'serial', 'mqtt'] as HardwareProtocol[]).map((proto) => (
              <button
                key={proto}
                onClick={() => setProtocol(proto)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold uppercase transition ${
                  hardwareProtocol === proto
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-[#06140f] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {proto}
              </button>
            ))}
          </div>
        </div>

        {/* Offline Intelligence Simulator Switch */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              {isOfflineSimulated ? (
                <WifiOff className="w-4 h-4 text-amber-400" />
              ) : (
                <Wifi className="w-4 h-4 text-emerald-400" />
              )}
              <span>Simulated Internet Outage (Offline-First Verification)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Proves Edge AI and local decision rules operate with 100% autonomy without cloud calls
            </p>
          </div>
          <button
            onClick={toggleOfflineSimulated}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              isOfflineSimulated
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isOfflineSimulated ? 'Offline: ACTIVE' : 'Online'}
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Select Demo Scenario
            </span>
            <span className="text-[11px] text-slate-400">
              Active: <strong className="text-white">{scenario}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {scenariosList.map((sc) => {
              const Icon = sc.icon;
              const isSelected = scenario === sc.key;
              return (
                <button
                  key={sc.key}
                  id={`demo-scenario-btn-${sc.key}`}
                  onClick={() => {
                    setScenario(sc.key);
                  }}
                  className={`p-3 rounded-xl text-left border transition cursor-pointer relative ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-900/40 shadow-md ring-1 ring-emerald-400'
                      : 'border-emerald-950/80 bg-[#06140f] hover:border-emerald-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`p-1.5 rounded-lg border ${sc.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-white">
                      {sc.title}
                    </span>
                    {isSelected && (
                      <span className="ml-auto text-[10px] uppercase font-extrabold bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-1.5 leading-relaxed">
                    {sc.description}
                  </p>
                  <div className="text-[10px] text-emerald-300/80 font-medium bg-[#04100c] px-2 py-1 rounded border border-emerald-950/60">
                    <strong>Effect:</strong> {sc.expectedOutcome}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-4 border-t border-emerald-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Data immediately propagates across all tabs & services.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
