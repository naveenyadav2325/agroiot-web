import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  CloudRain,
  Cpu,
  Droplets,
  Gauge,
  HelpCircle,
  Power,
  RotateCcw,
  Sliders,
  Thermometer,
  Zap,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export const SmartIrrigationView: React.FC = () => {
  const {
    sensorData,
    crop,
    thresholds,
    updateThresholds,
    irrigationDecision,
    toggleValve,
  } = useFarm();

  const [minMoistureInput, setMinMoistureInput] = useState(thresholds.minSoilMoisture);
  const [targetMoistureInput, setTargetMoistureInput] = useState(thresholds.targetSoilMoisture);
  const [rainThresholdInput, setRainThresholdInput] = useState(thresholds.rainThreshold);
  const [maxTempInput, setMaxTempInput] = useState(thresholds.maxTemperature);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveThresholds = () => {
    updateThresholds({
      minSoilMoisture: Number(minMoistureInput),
      targetSoilMoisture: Number(targetMoistureInput),
      rainThreshold: Number(rainThresholdInput),
      maxTemperature: Number(maxTempInput),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetDefaults = () => {
    setMinMoistureInput(42);
    setTargetMoistureInput(60);
    setRainThresholdInput(50);
    setMaxTempInput(35);
    updateThresholds({
      minSoilMoisture: 42,
      targetSoilMoisture: 60,
      rainThreshold: 50,
      maxTemperature: 35,
    });
  };

  const decisionColor = (dec: string) => {
    switch (dec) {
      case 'Recommended':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/70';
      case 'Monitor':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/70';
      case 'Not Required':
      case 'Optimal':
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/70';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="bg-[#081e16] border border-emerald-900/80 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Precision Hydration Engine
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                Evapotranspiration Heuristic
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Smart Irrigation Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Automated deficit-based watering decision engine factoring real-time root moisture, microclimate, and precipitation radar
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Decision Status Pill */}
            <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-2.5 ${decisionColor(irrigationDecision.decision)}`}>
              <Droplets className="w-5 h-5 animate-pulse" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Decision State</span>
                <span className="text-sm font-extrabold">{irrigationDecision.decision}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs vs Output Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Inputs Grid & Output Explanation */}
        <div className="lg:col-span-7 space-y-6">
          {/* Decision Output Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#09241a] to-[#06140f] border border-emerald-700/60 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                Agronomic Engine Evaluation
              </span>
              <span className="text-xs text-slate-400">
                Crop Phenology: <strong className="text-white">{crop.growthStage}</strong>
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-xs text-slate-400 uppercase font-bold">
                IRRIGATION DECISION:
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                {irrigationDecision.decision}
              </span>
            </div>

            {/* WHY? Required Field */}
            <div className="p-4 rounded-xl bg-[#030d09] border border-emerald-900/80 space-y-1.5">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                WHY THIS DECISION?
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                "{irrigationDecision.why}"
              </p>
            </div>

            {/* Quantitative Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#081e16] border border-emerald-950">
                <span className="text-[10px] text-slate-400 block mb-0.5">Moisture Deficit</span>
                <span className="text-base font-bold text-white font-mono">
                  {irrigationDecision.soilMoistureDeficit}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#081e16] border border-emerald-950">
                <span className="text-[10px] text-slate-400 block mb-0.5">Target Run Duration</span>
                <span className="text-base font-bold text-cyan-300 font-mono">
                  {irrigationDecision.recommendedDurationMinutes} min
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#081e16] border border-emerald-950">
                <span className="text-[10px] text-slate-400 block mb-0.5">Recommended Dosing</span>
                <span className="text-base font-bold text-emerald-300 font-mono">
                  {irrigationDecision.recommendedLitersPerSqM} L/m²
                </span>
              </div>
            </div>
          </div>

          {/* Engine Inputs Grid (Explicitly required: Soil moisture, Temperature, Humidity, Rain probability, Crop, Growth stage) */}
          <div className="p-5 rounded-2xl bg-[#081b14] border border-emerald-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
                Multi-Parameter Engine Inputs
              </h3>
              <span className="text-[11px] text-slate-400">Live Dynamic Telemetry</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Soil Moisture */}
              <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Soil Moisture</span>
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-lg font-bold text-white">{sensorData.soilMoisture}%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Min trigger: {thresholds.minSoilMoisture}%</div>
              </div>

              {/* Temperature */}
              <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Temperature</span>
                  <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div className="text-lg font-bold text-white">{sensorData.temperature}°C</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Heat cutoff: {thresholds.maxTemperature}°C</div>
              </div>

              {/* Humidity */}
              <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Air Humidity</span>
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="text-lg font-bold text-white">{sensorData.humidity}%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">RH threshold: {thresholds.maxHumidity}%</div>
              </div>

              {/* Rain Probability */}
              <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Rain Probability</span>
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-lg font-bold text-white">{sensorData.rainProbability}%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Defer trigger: &gt;{thresholds.rainThreshold}%</div>
              </div>

              {/* Crop */}
              <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Target Crop</span>
                  <span className="text-emerald-400">🌱</span>
                </div>
                <div className="text-sm font-bold text-white truncate">{crop.name.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Roma cultivar</div>
              </div>

              {/* Growth Stage */}
              <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Growth Stage</span>
                  <span className="text-yellow-400">🌼</span>
                </div>
                <div className="text-sm font-bold text-white">{crop.growthStage}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sensitive to dry stress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Configurable Thresholds Editor & Valve Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Configurable Thresholds Editor */}
          <div className="p-5 rounded-2xl bg-[#081b14] border border-emerald-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
                  Configurable Thresholds
                </h3>
              </div>
              <button
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Customize trigger points to calibrate AGRO-IOT for your specific soil texture and field microclimate:
            </p>

            <div className="space-y-3.5">
              {/* Min Moisture Trigger */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Min Soil Moisture Trigger:</span>
                  <span className="font-mono text-cyan-300 font-bold">{minMoistureInput}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={minMoistureInput}
                  onChange={(e) => setMinMoistureInput(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Target Moisture */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Target Moisture Capacity:</span>
                  <span className="font-mono text-emerald-300 font-bold">{targetMoistureInput}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="85"
                  value={targetMoistureInput}
                  onChange={(e) => setTargetMoistureInput(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Rain Anticipation Threshold */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Rain Anticipation Cutoff:</span>
                  <span className="font-mono text-blue-300 font-bold">{rainThresholdInput}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={rainThresholdInput}
                  onChange={(e) => setRainThresholdInput(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Max Heat Threshold */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300">Max Temperature Stress Threshold:</span>
                  <span className="font-mono text-orange-300 font-bold">{maxTempInput}°C</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="42"
                  value={maxTempInput}
                  onChange={(e) => setMaxTempInput(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleSaveThresholds}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                isSaved
                  ? 'bg-emerald-500 text-slate-950 font-extrabold'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaved ? 'Thresholds Updated!' : 'Apply Threshold Changes'}</span>
            </button>
          </div>

          {/* Solenoid Valve Actuator Simulator */}
          <div className="p-5 rounded-2xl bg-[#081b14] border border-emerald-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
                Drip Line Solenoid Valves
              </span>
              <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-400 font-bold">
                12V DC Solid State
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Valve 1 */}
              <div className="p-3.5 rounded-xl bg-[#06140f] border border-emerald-950 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Zone 1 (Root Drip)
                  </span>
                  <span
                    className={`text-sm font-extrabold block ${
                      irrigationDecision.valve1Status === 'OPEN' ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  >
                    {irrigationDecision.valve1Status === 'OPEN' ? 'FLOWING (OPEN)' : 'SHUT (CLOSED)'}
                  </span>
                </div>
                <button
                  onClick={() => toggleValve(1)}
                  className="mt-3 py-1.5 px-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold border border-emerald-800/60 transition cursor-pointer"
                >
                  Manual Toggle
                </button>
              </div>

              {/* Valve 2 */}
              <div className="p-3.5 rounded-xl bg-[#06140f] border border-emerald-950 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Zone 2 (Canopy Mist)
                  </span>
                  <span
                    className={`text-sm font-extrabold block ${
                      irrigationDecision.valve2Status === 'OPEN' ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  >
                    {irrigationDecision.valve2Status === 'OPEN' ? 'MISTING (OPEN)' : 'SHUT (CLOSED)'}
                  </span>
                </div>
                <button
                  onClick={() => toggleValve(2)}
                  className="mt-3 py-1.5 px-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold border border-emerald-800/60 transition cursor-pointer"
                >
                  Manual Toggle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
