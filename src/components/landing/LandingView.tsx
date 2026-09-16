import React from 'react';
import {
  Activity,
  ArrowRight,
  Camera,
  CheckCircle2,
  Cpu,
  Droplets,
  Layers,
  Radio,
  ShieldAlert,
  Sparkles,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { AgroIotLogo } from '../common/AgroIotLogo';

interface LandingViewProps {
  onLaunchDashboard: () => void;
  onExploreTech: () => void;
  onNavigate: (tab: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onLaunchDashboard,
  onExploreTech,
  onNavigate,
}) => {
  const { isOfflineSimulated, hardwareStatus, scenario } = useFarm();

  const pipelineSteps = [
    {
      step: '01',
      title: 'Sensors + Camera',
      subtitle: 'Field Telemetry & Vision',
      desc: 'Soil moisture, temperature, humidity, water level, and high-res leaf imagery.',
      icon: Radio,
      badge: 'Hardware Node',
    },
    {
      step: '02',
      title: 'Edge Device',
      subtitle: 'Local Data Processing',
      desc: 'Microcontroller / embedded gateway filtering analog jitter and buffering records.',
      icon: Cpu,
      badge: 'ESP32 / Linux',
    },
    {
      step: '03',
      title: 'Edge AI',
      subtitle: 'On-Device Inference',
      desc: 'Quantized neural net classifying foliar pathology and pest signs in under 85ms.',
      icon: Sparkles,
      badge: 'INT8 Quantized',
    },
    {
      step: '04',
      title: 'Decision Engine',
      subtitle: 'Agronomic Heuristics',
      desc: 'Fusing soil moisture deficit, VPD, rainfall radar, and plant phenology.',
      icon: Activity,
      badge: 'Real-time Rules',
    },
    {
      step: '05',
      title: 'Farmer Advisory',
      subtitle: 'Actionable Intelligence',
      desc: 'Clear, plain-language recommendations delivered to mobile and web dashboards.',
      icon: CheckCircle2,
      badge: 'Multilingual Audio',
    },
  ];

  const features = [
    {
      id: 'edgeai',
      title: 'Edge AI',
      desc: 'Sub-100ms on-device crop diagnostic inference running locally without cloud round-trips.',
      icon: Cpu,
      tag: 'Local On-Device',
      color: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30',
    },
    {
      id: 'monitoring',
      title: 'Live Sensor Monitoring',
      desc: 'Real-time soil moisture, air temperature, relative humidity, rain probability, and water levels.',
      icon: Radio,
      tag: 'Telemetry Bus',
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'cropscan',
      title: 'Crop Disease Detection',
      desc: 'Instant visual leaf diagnosis identifying early blight, late blight, spider mites, and nutrient chlorosis.',
      icon: Camera,
      tag: 'Vision Diagnostics',
      color: 'from-teal-500/20 to-teal-500/5 text-teal-400 border-teal-500/30',
    },
    {
      id: 'irrigation',
      title: 'Smart Irrigation',
      desc: 'Precision watering engine evaluating soil moisture deficits against upcoming rainfall probabilities.',
      icon: Droplets,
      tag: 'Water Conservation',
      color: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30',
    },
    {
      id: 'risks',
      title: 'Environmental Risk Detection',
      desc: 'Continuous risk assessment for heat stress, water stress, waterlogging hypoxia, and pest surges.',
      icon: ShieldAlert,
      tag: 'Early Warning',
      color: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30',
    },
    {
      id: 'architecture',
      title: 'Offline Intelligence',
      desc: 'Full edge resilience: operates seamlessly in remote fields without cellular reception or internet.',
      icon: WifiOff,
      tag: 'Zero Cloud Required',
      color: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Offline notice bar if offline */}
      {isOfflineSimulated && (
        <div className="p-3 bg-amber-950/70 border border-amber-600/60 rounded-xl text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">
              Offline Mode — Edge Intelligence Active: System is functioning entirely on local compute.
            </span>
          </div>
          <span className="text-[11px] bg-amber-900/60 px-2 py-0.5 rounded font-mono">
            Zero Internet Needed
          </span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#092218] via-[#071912] to-[#05130e] border border-emerald-900/60 p-8 sm:p-12 lg:p-16 text-center">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Autonomous Agricultural Telemetry & Edge AI</span>
          </div>

          {/* Main Title & Brand */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-heading">
              AGRO<span className="text-emerald-500">-</span><span className="text-cyan-400">IOT</span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-heading tracking-wide">
              Smart Farming. Smarter Decisions.
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            AI-powered field intelligence combining real-time sensors, Edge AI and intelligent agricultural recommendations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              id="landing-launch-dashboard-btn"
              onClick={onLaunchDashboard}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 transition cursor-pointer"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="landing-explore-tech-btn"
              onClick={onExploreTech}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 font-bold text-sm transition cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Explore Technology</span>
            </button>
          </div>

          {/* Active Field Quick Status Strip */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <strong className="text-slate-200">Field:</strong> Demo Farm (Plot Alpha)
            </span>
            <span className="flex items-center gap-1.5">
              <strong className="text-slate-200">Crop:</strong> Tomato (Roma Hybrid)
            </span>
            <span className="flex items-center gap-1.5">
              <strong className="text-slate-200">Growth Stage:</strong> Flowering
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <strong className="text-slate-200">Scenario:</strong> {scenario}
            </span>
          </div>
        </div>
      </section>

      {/* Visual Pipeline Representation */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            The Autonomous Edge Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            How data flows from microclimate soil sensors to instant, actionable farmer advisories
          </p>
        </div>

        {/* Step Flow Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 relative">
          {pipelineSteps.map((node, index) => {
            const Icon = node.icon;
            return (
              <div
                key={node.step}
                className="relative p-5 rounded-2xl bg-[#081b14] border border-emerald-900/60 flex flex-col justify-between group hover:border-emerald-700/60 transition shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-emerald-500">
                      {node.step}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      {node.badge}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 w-fit text-emerald-400 mb-3 group-hover:scale-105 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white font-heading mb-0.5">
                    {node.title}
                  </h3>
                  <div className="text-xs text-emerald-400 font-medium mb-2">
                    {node.subtitle}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {node.desc}
                  </p>
                </div>

                {/* Arrow indicator for desktop */}
                {index < pipelineSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-emerald-600 bg-[#071912] p-1 rounded-full border border-emerald-900">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Core Platform Capabilities
            </h2>
            <p className="text-xs text-slate-400">
              Complete offline-capable intelligence engineered for agricultural edge deployments
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onNavigate(feat.id)}
                className="p-6 rounded-2xl bg-[#081b14] border border-emerald-900/50 hover:border-emerald-600/60 transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl border bg-gradient-to-br ${feat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-heading mb-2 group-hover:text-emerald-300 transition">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-emerald-950/60 flex items-center justify-between text-xs text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Open {feat.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
