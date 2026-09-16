import React from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bug,
  CheckCircle2,
  CloudRain,
  Cpu,
  Droplet,
  Flame,
  HelpCircle,
  Info,
  ShieldAlert,
  Thermometer,
  Waves,
  Wind,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { RiskLevel } from '../../types';

export const EnvironmentalRiskView: React.FC = () => {
  const { riskAssessment, sensorData, crop } = useFarm();

  const riskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'High':
        return 'bg-rose-950/80 text-rose-300 border-rose-600/70 font-extrabold';
      case 'Medium':
        return 'bg-amber-950/80 text-amber-300 border-amber-600/70 font-extrabold';
      case 'Low':
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70 font-bold';
    }
  };

  const riskCards = [
    {
      id: 'heat',
      name: 'Heat Stress Risk',
      status: riskAssessment.heatStress,
      explanation: riskAssessment.heatStressExplanation,
      icon: Flame,
      color: 'from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/40',
      telemetryContext: `Air Temperature: ${sensorData.temperature}°C (Threshold: 35°C)`,
      biologicalImpact: 'Canopy transpiration overload, stomatal closure, flower bud abortion in flowering tomatoes.',
      countermeasure: 'Deploy 40% reflective shade cloth or pulse short evaporative misting cycles.',
    },
    {
      id: 'water',
      name: 'Water Stress (Drought)',
      status: riskAssessment.waterStress,
      explanation: riskAssessment.waterStressExplanation,
      icon: Droplet,
      color: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/40',
      telemetryContext: `Soil Moisture: ${sensorData.soilMoisture}% (Critical Trigger: 42%)`,
      biologicalImpact: 'Loss of cell turgor pressure, reduced calcium translocation causing blossom end rot.',
      countermeasure: 'Initiate calibrated drip irrigation cycle (recommended dosing based on current deficit).',
    },
    {
      id: 'flood',
      name: 'Flood / Waterlogging Risk',
      status: riskAssessment.floodRisk,
      explanation: riskAssessment.floodRiskExplanation,
      icon: Waves,
      color: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/40',
      telemetryContext: `Field Water Level: ${sensorData.waterLevel}% · Rain Probability: ${sensorData.rainProbability}%`,
      biologicalImpact: 'Root zone hypoxia (oxygen depletion), root decay, anaerobic fermentation, damp-off death.',
      countermeasure: 'Clear primary and secondary drainage run-offs; immediately suspend drip automation.',
    },
    {
      id: 'disease',
      name: 'Foliar Disease Spore Risk',
      status: riskAssessment.diseaseRisk,
      explanation: riskAssessment.diseaseRiskExplanation,
      icon: ShieldAlert,
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/40',
      telemetryContext: `Relative Humidity: ${sensorData.humidity}% · Temp: ${sensorData.temperature}°C`,
      biologicalImpact: 'Accelerated Alternaria and Phytophthora spore germination due to extended leaf wetness hours.',
      countermeasure: 'Prune dense suckers to enhance row aerodynamics; spray protective copper hydroxide.',
    },
    {
      id: 'pest',
      name: 'Pest Infestation Risk',
      status: riskAssessment.pestRisk,
      explanation: riskAssessment.pestRiskExplanation,
      icon: Bug,
      color: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/40',
      telemetryContext: `Dry-Heat Vector: ${sensorData.temperature}°C with ${sensorData.humidity}% RH`,
      biologicalImpact: 'Rapid egg incubation for two-spotted spider mites, thrips, and Bemisia whiteflies.',
      countermeasure: 'Spot-check underside of leaf crowns; release beneficial predatory mites (Phytoseiulus).',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#081e16] border border-emerald-900/80 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                Microclimatic Early Warning
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                DecisionEngine Risk Matrix
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Environmental Risk Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Multi-factor risk evaluation combining sensor readings with botanical microclimate thresholds
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Composite Health:</span>
            <span className="text-lg font-bold text-white font-mono px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-800/60">
              {riskAssessment.overallCropHealth}/100
            </span>
          </div>
        </div>
      </div>

      {/* Explicit Scientific Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-[#081b14] border border-amber-600/40 text-amber-200 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 block font-bold mb-0.5 uppercase tracking-wider">
            Agronomic Advisory Notice
          </strong>
          <p className="text-slate-300 leading-relaxed">
            The levels below represent <strong>scientifically modeled risk indicators</strong> derived from microclimate sensor data (Vapor Pressure Deficit, leaf wetness duration, and threshold deviations). They are designed for proactive prevention and early intervention, not guaranteed future events.
          </p>
        </div>
      </div>

      {/* Required Risk Cards (Heat Stress, Water Stress, Flood/Waterlogging, Disease Risk, Pest Risk) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {riskCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="p-5 sm:p-6 rounded-2xl bg-[#081b14] border border-emerald-900/60 hover:border-emerald-700/60 transition shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-bold text-white font-heading">
                      {card.name}
                    </h2>
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full border uppercase tracking-wider ${riskBadge(card.status)}`}>
                    {card.status} Risk
                  </span>
                </div>

                {/* Explanation Box */}
                <div className="p-3.5 rounded-xl bg-[#05130e] border border-emerald-950/80 mb-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                    Risk Explanation:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    "{card.explanation}"
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                    <span>Telemetry Trigger:</span>
                    <span className="font-mono text-slate-200 font-semibold">{card.telemetryContext}</span>
                  </div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    <strong className="text-slate-400">Crop Impact:</strong> {card.biologicalImpact}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-950/80 text-xs">
                <span className="text-emerald-400 font-bold block mb-0.5">Recommended Countermeasure:</span>
                <span className="text-slate-300 text-[11px]">{card.countermeasure}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
