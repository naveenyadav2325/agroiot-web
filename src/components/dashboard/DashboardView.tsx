import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Cpu,
  Droplets,
  Flame,
  Radio,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Thermometer,
  Volume2,
  Waves,
  Zap,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { DemoScenario } from '../../types';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenDemoControls: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenDemoControls,
}) => {
  const {
    sensorData,
    riskAssessment,
    irrigationDecision,
    advisory,
    crop,
    scenario,
    setScenario,
    hardwareStatus,
    latestScan,
    isOfflineSimulated,
  } = useFarm();

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Audio Speech Synthesis for Farmer Advisory
  const handleSpeakAdvisory = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const actions = (advisory.whatShouldIDo || []).join('. ');
    const speechText = `${advisory.title || ''}. ${advisory.summary || ''}. Why this alert? ${advisory.whyThisAlert || ''}. Action recommended: ${actions}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const riskBadgeClass = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'High':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60 font-bold';
      case 'Medium':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60 font-bold';
      case 'Low':
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 font-semibold';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 2. HEADER EXACT REQUIREMENT:
          AGRO-IOT
          Field: Demo Farm
          Crop: Tomato
          Growth Stage: Flowering
      */}
      <div className="bg-[#081e16] border border-emerald-900/80 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 font-mono">
                Command Center
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/40">
                {scenario} SCENARIO
              </span>
              {isOfflineSimulated && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/40">
                  OFFLINE EDGE MODE
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
              AGRO-IOT
            </h1>
            {/* Field, Crop, Growth Stage Header Details */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 mt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Field:</span>
                <strong className="text-white font-semibold">{crop.field}</strong>
              </div>
              <div className="h-3.5 w-px bg-emerald-800/60 hidden sm:block"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Crop:</span>
                <strong className="text-white font-semibold">{crop.name.split(' ')[0]}</strong>
              </div>
              <div className="h-3.5 w-px bg-emerald-800/60 hidden sm:block"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Growth Stage:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-900/70 border border-emerald-700/50 text-emerald-300 font-bold text-xs">
                  {crop.growthStage}
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions right */}
          <div className="flex items-center gap-2.5">
            <button
              id="dashboard-quick-scan-btn"
              onClick={() => onNavigate('cropscan')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Crop</span>
            </button>
            <button
              id="dashboard-scenario-control-btn"
              onClick={onOpenDemoControls}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/60 font-semibold text-xs transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scenarios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid (Crop Health, Moisture, Temp, Humidity, Rain, Irrigation, Risks) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. CROP HEALTH */}
        <div className="p-4 rounded-2xl bg-[#081b14] border border-emerald-800/60 shadow-xs hover:border-emerald-600/70 transition flex flex-col justify-between col-span-2 sm:col-span-1">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold tracking-wider uppercase text-[11px] text-emerald-400">
                Crop Health
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-white font-heading">
                {riskAssessment.overallCropHealth}
              </span>
              <span className="text-xs text-slate-400 font-bold">/100</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-950/80 flex items-center justify-between">
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full border ${
                riskAssessment.overallCropHealth >= 88
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 font-bold'
                  : riskAssessment.overallCropHealth >= 70
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700/60 font-bold'
                  : 'bg-rose-950/80 text-rose-300 border-rose-700/60 font-bold'
              }`}
            >
              {riskAssessment.healthStatusLabel}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Edge Scored</span>
          </div>
        </div>

        {/* 2. SOIL MOISTURE */}
        <div className="p-4 rounded-2xl bg-[#081b14] border border-emerald-800/60 shadow-xs hover:border-emerald-600/70 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold tracking-wider uppercase text-[11px] text-cyan-400">
                Soil Moisture
              </span>
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-heading mt-1">
              {sensorData.soilMoisture}%
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-950/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Target: 50-70%</span>
            <span className={sensorData.soilMoisture < 42 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
              {sensorData.soilMoisture < 42 ? 'Deficit' : 'Optimal'}
            </span>
          </div>
        </div>

        {/* 3. TEMPERATURE */}
        <div className="p-4 rounded-2xl bg-[#081b14] border border-emerald-800/60 shadow-xs hover:border-emerald-600/70 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold tracking-wider uppercase text-[11px] text-orange-400">
                Temperature
              </span>
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-heading mt-1">
              {sensorData.temperature}°C
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-950/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Range: 20-32°C</span>
            <span className={sensorData.temperature > 34 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {sensorData.temperature > 34 ? 'Heat Warning' : 'Normal'}
            </span>
          </div>
        </div>

        {/* 4. HUMIDITY */}
        <div className="p-4 rounded-2xl bg-[#081b14] border border-emerald-800/60 shadow-xs hover:border-emerald-600/70 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold tracking-wider uppercase text-[11px] text-teal-400">
                Humidity
              </span>
              <Activity className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-heading mt-1">
              {sensorData.humidity}%
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-950/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>RH Safe: &lt;80%</span>
            <span className={sensorData.humidity > 80 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
              {sensorData.humidity > 80 ? 'Spore Risk' : 'Normal'}
            </span>
          </div>
        </div>

        {/* 5. RAIN PROBABILITY */}
        <div className="p-4 rounded-2xl bg-[#081b14] border border-emerald-800/60 shadow-xs hover:border-emerald-600/70 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold tracking-wider uppercase text-[11px] text-blue-400">
                Rain Prob.
              </span>
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-heading mt-1">
              {sensorData.rainProbability}%
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-950/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Forecast</span>
            <span className="text-slate-300 font-medium">
              {sensorData.rainProbability > 50 ? 'Precipitation' : 'Dry'}
            </span>
          </div>
        </div>

        {/* 6. IRRIGATION */}
        <div className="p-4 rounded-2xl bg-[#081b14] border border-emerald-800/60 shadow-xs hover:border-emerald-600/70 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold tracking-wider uppercase text-[11px] text-emerald-400">
                Irrigation
              </span>
              <Droplets className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold text-white font-heading mt-1 truncate">
              {irrigationDecision.decision}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-950/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Valve 1:</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                irrigationDecision.valve1Status === 'OPEN'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 animate-pulse'
                  : 'bg-slate-900 text-slate-400'
              }`}
            >
              {irrigationDecision.valve1Status}
            </span>
          </div>
        </div>
      </div>

      {/* Environmental Risk Indicators Grid (Disease, Pest, Heat, Water, Flood) */}
      <div className="bg-[#071912] border border-emerald-900/60 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-heading">
              Environmental Risk Indicators
            </h2>
          </div>
          <button
            onClick={() => onNavigate('risks')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Risk Engine Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* DISEASE RISK */}
          <div className="p-3 rounded-xl bg-[#081e16] border border-emerald-950/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Disease Risk
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-extrabold text-white font-heading">
                {riskAssessment.diseaseRisk}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskBadgeClass(riskAssessment.diseaseRisk)}`}>
                {riskAssessment.diseaseRisk.toUpperCase()}
              </span>
            </div>
          </div>

          {/* PEST RISK */}
          <div className="p-3 rounded-xl bg-[#081e16] border border-emerald-950/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pest Risk
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-extrabold text-white font-heading">
                {riskAssessment.pestRisk}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskBadgeClass(riskAssessment.pestRisk)}`}>
                {riskAssessment.pestRisk.toUpperCase()}
              </span>
            </div>
          </div>

          {/* HEAT STRESS */}
          <div className="p-3 rounded-xl bg-[#081e16] border border-emerald-950/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Heat Stress
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-extrabold text-white font-heading">
                {riskAssessment.heatStress}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskBadgeClass(riskAssessment.heatStress)}`}>
                {riskAssessment.heatStress.toUpperCase()}
              </span>
            </div>
          </div>

          {/* WATER STRESS */}
          <div className="p-3 rounded-xl bg-[#081e16] border border-emerald-950/80 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Water Stress
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-extrabold text-white font-heading">
                {riskAssessment.waterStress}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskBadgeClass(riskAssessment.waterStress)}`}>
                {riskAssessment.waterStress.toUpperCase()}
              </span>
            </div>
          </div>

          {/* FLOOD / WATERLOGGING */}
          <div className="p-3 rounded-xl bg-[#081e16] border border-emerald-950/80 flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              Flood / Waterlogging
            </span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-extrabold text-white font-heading">
                {riskAssessment.floodRisk}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskBadgeClass(riskAssessment.floodRisk)}`}>
                {riskAssessment.floodRisk.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Farmer Advisory Spotlight & Edge AI Vision Quick Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Farmer Advisory Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-[#092218] to-[#06140f] border border-emerald-800/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    advisory.priority === 'Urgent'
                      ? 'bg-rose-950/70 border-rose-600/60 text-rose-300'
                      : advisory.priority === 'Moderate'
                      ? 'bg-amber-950/70 border-amber-600/60 text-amber-300'
                      : 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 font-mono">
                    Farmer Advisory
                  </span>
                  <h3 className="text-lg font-bold text-white font-heading">
                    {advisory.title}
                  </h3>
                </div>
              </div>

              {/* Speech Audio Button */}
              <button
                id="dashboard-speak-advisory-btn"
                onClick={handleSpeakAdvisory}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isSpeaking
                    ? 'bg-cyan-600 text-white border-cyan-400 animate-pulse'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60'
                }`}
                title="Listen to advisory audio"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSpeaking ? 'Reading aloud...' : 'Speak Advisory'}</span>
              </button>
            </div>

            {/* Why this alert? */}
            <div className="p-3.5 rounded-xl bg-[#04100c]/80 border border-emerald-950/80 mb-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Why this recommendation?
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {advisory.whyThisAlert}
              </p>
            </div>

            {/* What should I do? */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Recommended Action Plan:
              </span>
              <ul className="space-y-1.5">
                {(advisory.whatShouldIDo || []).map((act, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-emerald-950/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Priority: <strong className={advisory.priority === 'Urgent' ? 'text-rose-400' : 'text-emerald-400'}>{advisory.priority}</strong>
            </span>
            <button
              onClick={() => onNavigate('advisory')}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Multilingual Advisory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Col: Edge AI Diagnostic & Live Scanner Status */}
        <div className="p-5 rounded-2xl bg-[#081b14] border border-emerald-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                  Edge AI Vision Status
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                LOCAL INT8
              </span>
            </div>

            {latestScan ? (
              <div className="p-3.5 rounded-xl bg-[#06140f] border border-emerald-950/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Detected:</span>
                  <span className="text-xs font-bold text-white truncate max-w-[140px]">
                    {latestScan.cropDetected.split(' ')[0]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Health State:</span>
                  <span
                    className={`text-xs font-bold ${
                      latestScan.healthStatus === 'Healthy'
                        ? 'text-emerald-400'
                        : latestScan.healthStatus === 'Early Disease'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {latestScan.healthStatus}
                  </span>
                </div>
                {latestScan.possibleDisease && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Pathology:</span>
                    <span className="text-xs font-semibold text-rose-300">
                      {latestScan.possibleDisease.split(' ')[0]}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-950/60">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {latestScan.confidence}% ({latestScan.inferenceTimeMs}ms)
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#06140f] border border-dashed border-emerald-900/60 text-center text-xs text-slate-400">
                <Camera className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p>No leaf scan performed yet today.</p>
              </div>
            )}

            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              Edge vision model runs on-device without cloud network latency or API expense.
            </p>
          </div>

          <button
            onClick={() => onNavigate('cropscan')}
            className="mt-4 w-full py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-800/60 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Launch Interactive Crop Scan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
