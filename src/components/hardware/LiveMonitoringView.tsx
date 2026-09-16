import React, { useState } from 'react';
import {
  Activity,
  Battery,
  CheckCircle2,
  Clock,
  CloudRain,
  Cpu,
  Droplets,
  Layers,
  Radio,
  RefreshCw,
  Sun,
  Thermometer,
  Waves,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { DemoScenario, HardwareProtocol } from '../../types';

export const LiveMonitoringView: React.FC = () => {
  const {
    sensorData,
    hardwareStatus,
    hardwareProtocol,
    setProtocol,
    mode,
    setMode,
    scenario,
    setScenario,
    reconnectHardware,
    disconnectHardware,
    pingMs,
    isOfflineSimulated,
  } = useFarm();

  const [isPinging, setIsPinging] = useState(false);
  const [currentPing, setCurrentPing] = useState(pingMs);

  const handlePing = async () => {
    setIsPinging(true);
    try {
      await new Promise((res) => setTimeout(res, 400));
      const jitter = Math.round((Math.random() - 0.5) * 8);
      setCurrentPing(Math.max(4, pingMs + jitter));
    } finally {
      setIsPinging(false);
    }
  };

  const scenarios: { key: DemoScenario; label: string; desc: string }[] = [
    { key: 'NORMAL', label: 'NORMAL', desc: 'Moisture 58.4%, Temp 26.8°C, optimal balance' },
    { key: 'LOW_MOISTURE', label: 'LOW SOIL MOISTURE', desc: 'Moisture drops to 28.5%, triggers irrigation engine' },
    { key: 'HEAT_STRESS', label: 'HEAT STRESS', desc: 'Temp spikes to 37.6°C, arid RH 29.5%' },
    { key: 'DISEASE_ALERT', label: 'DISEASE ALERT', desc: 'Humidity 88.5%, temp 24.5°C, spore incubation' },
    { key: 'PEST_ALERT', label: 'PEST ALERT', desc: 'Temp 31.8°C, RH 47.5%, spider mite surge' },
    { key: 'FLOOD', label: 'FLOOD / WATERLOGGING', desc: 'Moisture 94.8%, water level 95.5%, rain 90%' },
  ];

  const sensors = [
    {
      name: 'Soil Moisture Sensor',
      value: hardwareStatus === 'connected' ? `${sensorData.soilMoisture}` : '---',
      unit: '%',
      status:
        hardwareStatus !== 'connected'
          ? 'Offline'
          : sensorData.soilMoisture < 42
          ? 'Low (Deficit)'
          : sensorData.soilMoisture > 85
          ? 'Saturated'
          : 'Optimal',
      statusColor:
        hardwareStatus !== 'connected'
          ? 'text-slate-500 bg-slate-900 border-slate-700'
          : sensorData.soilMoisture < 42
          ? 'text-amber-400 bg-amber-950/80 border-amber-700/60'
          : sensorData.soilMoisture > 85
          ? 'text-rose-400 bg-rose-950/80 border-rose-700/60'
          : 'text-emerald-400 bg-emerald-950/80 border-emerald-700/60',
      icon: Droplets,
      specs: 'Capacitive Analog Sensor V2.0 · I2C Bus 0x48 (ADS1115)',
    },
    {
      name: 'Ambient Temperature',
      value: hardwareStatus === 'connected' ? `${sensorData.temperature}` : '---',
      unit: '°C',
      status:
        hardwareStatus !== 'connected'
          ? 'Offline'
          : sensorData.temperature > 35
          ? 'Critical Heat'
          : sensorData.temperature < 15
          ? 'Cold Stress'
          : 'Optimal Range',
      statusColor:
        hardwareStatus !== 'connected'
          ? 'text-slate-500 bg-slate-900 border-slate-700'
          : sensorData.temperature > 35
          ? 'text-rose-400 bg-rose-950/80 border-rose-700/60'
          : 'text-emerald-400 bg-emerald-950/80 border-emerald-700/60',
      icon: Thermometer,
      specs: 'Sensirion SHT31-D High-Precision Sensor · ±0.2°C Tolerance',
    },
    {
      name: 'Relative Humidity',
      value: hardwareStatus === 'connected' ? `${sensorData.humidity}` : '---',
      unit: '%',
      status:
        hardwareStatus !== 'connected'
          ? 'Offline'
          : sensorData.humidity > 80
          ? 'High (Spore Risk)'
          : sensorData.humidity < 35
          ? 'Arid (Transpiration Risk)'
          : 'Comfortable',
      statusColor:
        hardwareStatus !== 'connected'
          ? 'text-slate-500 bg-slate-900 border-slate-700'
          : sensorData.humidity > 80
          ? 'text-amber-400 bg-amber-950/80 border-amber-700/60'
          : 'text-emerald-400 bg-emerald-950/80 border-emerald-700/60',
      icon: Activity,
      specs: 'Sensirion SHT31-D Integrated Hygrometer · ±2% RH Tolerance',
    },
    {
      name: 'Rain Sensor (Precipitation)',
      value: hardwareStatus === 'connected' ? `${sensorData.rainProbability}` : '---',
      unit: '%',
      status:
        hardwareStatus !== 'connected'
          ? 'Offline'
          : sensorData.rainProbability > 60
          ? 'Active Rain Expected'
          : sensorData.rainProbability > 30
          ? 'Moderate Cloud Cover'
          : 'Dry / Clear Sky',
      statusColor:
        hardwareStatus !== 'connected'
          ? 'text-slate-500 bg-slate-900 border-slate-700'
          : sensorData.rainProbability > 60
          ? 'text-blue-400 bg-blue-950/80 border-blue-700/60'
          : 'text-slate-300 bg-slate-900 border-slate-700',
      icon: CloudRain,
      specs: 'Optical Tipping Bucket + Resistance Droplet Array',
    },
    {
      name: 'Field Water Level',
      value: hardwareStatus === 'connected' ? `${sensorData.waterLevel}` : '---',
      unit: '% (cm)',
      status:
        hardwareStatus !== 'connected'
          ? 'Offline'
          : sensorData.waterLevel > 80
          ? 'Flood Warning'
          : sensorData.waterLevel < 20
          ? 'Low Reservoir'
          : 'Normal Drainage',
      statusColor:
        hardwareStatus !== 'connected'
          ? 'text-slate-500 bg-slate-900 border-slate-700'
          : sensorData.waterLevel > 80
          ? 'text-rose-400 bg-rose-950/80 border-rose-700/60'
          : 'text-emerald-400 bg-emerald-950/80 border-emerald-700/60',
      icon: Waves,
      specs: 'Submersible Hydrostatic Pressure Probe · 0-2m Depth',
    },
    {
      name: 'Solar Radiation / Light Sensor',
      value: hardwareStatus === 'connected' ? `${sensorData.lightIntensity.toLocaleString()}` : '---',
      unit: 'Lux',
      status:
        hardwareStatus !== 'connected'
          ? 'Offline'
          : sensorData.lightIntensity > 65000
          ? 'Intense Solar Flux'
          : sensorData.lightIntensity < 20000
          ? 'Low Light / Overcast'
          : 'Full Photosynthetic Flux',
      statusColor:
        hardwareStatus !== 'connected'
          ? 'text-slate-500 bg-slate-900 border-slate-700'
          : 'text-emerald-400 bg-emerald-950/80 border-emerald-700/60',
      icon: Sun,
      specs: 'BH1750 Ambient Light Sensor · 1-65,535 Lux Spectral Range',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Hardware Status & Connection Controls */}
      <div className="bg-[#081e16] border border-emerald-900/80 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                Field Telemetry Gateway
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                Plot Alpha Station #1
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Live Field Monitoring
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Direct telemetry stream from field microcontroller edge nodes with SensorAdapter abstraction
            </p>
          </div>

          {/* Hardware Connection Card */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Indicator */}
            <div
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
                hardwareStatus === 'connected'
                  ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-600/70 text-rose-300'
              }`}
            >
              <span className="relative flex h-3 w-3">
                {hardwareStatus === 'connected' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    hardwareStatus === 'connected' ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider">
                  Hardware Status: {hardwareStatus === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {hardwareStatus === 'connected'
                    ? `${hardwareProtocol.toUpperCase()} · ${currentPing}ms ping · 94% Battery`
                    : 'Physical bus offline or sleeping'}
                </div>
              </div>
            </div>

            {/* Connect / Disconnect Toggle Button */}
            {hardwareStatus === 'connected' ? (
              <button
                onClick={disconnectHardware}
                className="px-3.5 py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700/60 text-rose-200 font-bold text-xs transition cursor-pointer"
                title="Disconnect simulated hardware"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={reconnectHardware}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow"
                title="Reconnect hardware gateway"
              >
                Connect Hardware
              </button>
            )}

            {/* Ping Test Button */}
            {hardwareStatus === 'connected' && (
              <button
                onClick={handlePing}
                disabled={isPinging}
                className="p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-semibold transition"
                title="Test Ping Latency"
              >
                <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Protocol Switcher Bar */}
        <div className="mt-5 pt-4 border-t border-emerald-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sensor Transport Protocol:</span>
            <div className="flex items-center gap-1.5 bg-[#05130e] p-1 rounded-lg border border-emerald-900/40">
              {(['wifi', 'bluetooth', 'serial', 'mqtt'] as HardwareProtocol[]).map((proto) => (
                <button
                  key={proto}
                  onClick={() => setProtocol(proto)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition ${
                    hardwareProtocol === proto
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {proto}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">Mode:</span>
            <div className="flex items-center gap-1 bg-[#05130e] p-1 rounded-lg border border-emerald-900/40">
              <button
                onClick={() => setMode('LIVE')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                  mode === 'LIVE' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                LIVE MODE
              </button>
              <button
                onClick={() => setMode('DEMO')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                  mode === 'DEMO' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                DEMO MODE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DEMO MODE Scenario Trigger Strip */}
      <div className="bg-[#071912] border border-emerald-900/60 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Demo Scenarios (Updates Entire Pipeline Consistently)
            </h2>
            <p className="text-xs text-slate-400">
              Selecting a scenario updates raw telemetry, recalculated risks, smart irrigation triggers, and farmer advisories.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800/40 self-start sm:self-auto">
            Current: {scenario}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {scenarios.map((sc) => {
            const isSelected = scenario === sc.key;
            return (
              <button
                key={sc.key}
                id={`monitoring-scenario-${sc.key}`}
                onClick={() => setScenario(sc.key)}
                className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-900/50 shadow ring-1 ring-emerald-400 text-white'
                    : 'border-emerald-950/90 bg-[#081e16] hover:border-emerald-800 text-slate-300'
                }`}
              >
                <div className="text-xs font-bold font-heading mb-1">{sc.label}</div>
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                  {sc.desc}
                </p>
                {isSelected && (
                  <span className="mt-2 text-[9px] font-extrabold uppercase bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded w-fit">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sensor Status Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-heading">
            Live Telemetry Channels
          </h2>
          <span className="text-xs text-slate-400">
            Last update: <strong className="text-slate-200">{sensorData.timestamp}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sens, idx) => {
            const Icon = sens.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#081b14] border border-emerald-900/60 flex flex-col justify-between hover:border-emerald-700/60 transition shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-900/50">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${sens.statusColor}`}>
                      {sens.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {sens.name}
                  </h3>

                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-3xl font-extrabold text-white font-heading">
                      {sens.value}
                    </span>
                    <span className="text-sm font-bold text-slate-400">{sens.unit}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-950/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Connection:</span>
                    <span className={hardwareStatus === 'connected' ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
                      {hardwareStatus === 'connected' ? 'Bus Active' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {sens.specs}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SensorAdapter Abstraction Architecture Box */}
      <div className="p-6 rounded-2xl bg-[#06140f] border border-emerald-950 text-xs space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          <span>SensorAdapter Hardware Abstraction Architecture</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          The AGRO-IOT dashboard accesses hardware solely via the generic <code className="text-cyan-300 font-mono">SensorAdapter</code> interface. Currently, the application is bonded to <code className="text-emerald-300 font-mono">MockSensorAdapter</code>. In production field deployments, swap in:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#081e16] border border-emerald-900/40">
            <strong className="text-white block mb-1">1. HttpSensorAdapter</strong>
            <p className="text-slate-400 text-[11px]">Polls REST endpoint / JSON payload from ESP32 WiFi gateway.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#081e16] border border-emerald-900/40">
            <strong className="text-white block mb-1">2. BleSensorAdapter</strong>
            <p className="text-slate-400 text-[11px]">Direct Web Bluetooth API connection to field BLE sensor beacon.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#081e16] border border-emerald-900/40">
            <strong className="text-white block mb-1">3. SerialSensorAdapter</strong>
            <p className="text-slate-400 text-[11px]">Web Serial API streaming NMEA / JSON telemetry over USB cable.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#081e16] border border-emerald-900/40">
            <strong className="text-white block mb-1">4. MqttSensorAdapter</strong>
            <p className="text-slate-400 text-[11px]">Subscribes to agro-iot/telemetry topic over local broker.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
