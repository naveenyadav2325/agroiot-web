import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Download,
  Droplets,
  FileSpreadsheet,
  Sparkles,
  Thermometer,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFarm } from '../../context/FarmContext';
import {
  getDailyWaterConsumption,
  getHistoricalData,
} from '../../services/data/telemetryHistory';

export const AnalyticsView: React.FC = () => {
  const { crop, thresholds } = useFarm();
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  const historyData = getHistoricalData(timeframe);
  const waterData = getDailyWaterConsumption();

  // Calculate high-level summary metrics
  const avgMoisture = Math.round(
    historyData.reduce((acc, curr) => acc + curr.soilMoisture, 0) / historyData.length
  );
  const avgTemp = (
    historyData.reduce((acc, curr) => acc + curr.temperature, 0) / historyData.length
  ).toFixed(1);
  const totalWaterLitres = waterData.reduce((acc, curr) => acc + curr.litres, 0);
  const totalWaterSaved = waterData.reduce((acc, curr) => acc + curr.savedVsTimer, 0);

  const handleExportCSV = () => {
    const headers = ['Time', 'Soil Moisture (%)', 'Temperature (°C)', 'Humidity (%)', 'Crop Health (0-100)'];
    const rows = historyData.map((d) => [d.time, d.soilMoisture, d.temperature, d.humidity, d.cropHealth]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AGRO-IOT_Telemetry_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Timeframe Controls */}
      <div className="bg-[#081e16] border border-emerald-900/80 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Agronomic Time-Series
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                {crop.field}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Field Analytics & Trends
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Historical environmental telemetry, microclimate trends, and precision irrigation water conservation
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Timeframe selector */}
            <div className="flex items-center p-1 rounded-xl bg-[#05130e] border border-emerald-900/60">
              {(['24h', '7d', '30d'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    timeframe === tf
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf === '24h' ? '24 Hours' : tf === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-xs font-bold transition cursor-pointer"
              title="Export telemetry records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#081b14] border border-emerald-900/60">
          <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">
            Average Soil Moisture
          </span>
          <div className="text-2xl font-extrabold text-white font-heading">{avgMoisture}%</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Target window: 50-70%</span>
        </div>

        <div className="p-4 rounded-xl bg-[#081b14] border border-emerald-900/60">
          <span className="text-[10px] uppercase font-bold text-orange-400 block mb-1">
            Mean Temperature
          </span>
          <div className="text-2xl font-extrabold text-white font-heading">{avgTemp}°C</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Optimal vegetative range</span>
        </div>

        <div className="p-4 rounded-xl bg-[#081b14] border border-emerald-900/60">
          <span className="text-[10px] uppercase font-bold text-blue-400 block mb-1">
            Water Delivered (7d)
          </span>
          <div className="text-2xl font-extrabold text-white font-heading">
            {totalWaterLitres.toLocaleString()} L
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Precise root drip</span>
        </div>

        <div className="p-4 rounded-xl bg-[#081b14] border border-emerald-900/60">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
            Water Conserved vs Timer
          </span>
          <div className="text-2xl font-extrabold text-emerald-300 font-heading">
            +{totalWaterSaved} L (34%)
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">Rain-aware deferral</span>
        </div>
      </div>

      {/* Required Charts Grid:
          1. Soil moisture over time
          2. Temperature & Humidity trend
          3. Crop health trend
          4. Water consumption estimate
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Soil Moisture Over Time */}
        <div className="p-5 rounded-2xl bg-[#081b14] border border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                Soil Moisture Over Time (%)
              </h3>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">
              Min Threshold: {thresholds.minSoilMoisture}%
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#062e20" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[20, 80]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071912',
                    borderColor: '#064e3b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="soilMoisture"
                  name="Soil Moisture (%)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#moistureGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Temperature & Humidity Trend */}
        <div className="p-5 rounded-2xl bg-[#081b14] border border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                Temperature & Humidity Trend
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-orange-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> Temp (°C)
              </span>
              <span className="text-teal-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span> RH (%)
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#062e20" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#f97316" fontSize={11} domain={[15, 40]} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#14b8a6" fontSize={11} domain={[30, 95]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071912',
                    borderColor: '#064e3b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (%)"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Crop Health Trend */}
        <div className="p-5 rounded-2xl bg-[#081b14] border border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                Crop Health Trend Score (0-100)
              </h3>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">
              Heuristic Health Index
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#062e20" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[60, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071912',
                    borderColor: '#064e3b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cropHealth"
                  name="Crop Health Index"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#healthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Water Consumption Estimate */}
        <div className="p-5 rounded-2xl bg-[#081b14] border border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                Water Consumption Estimate (Liters)
              </h3>
            </div>
            <span className="text-[11px] text-emerald-300 font-mono">
              Smart Drip vs Scheduled Timer
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#062e20" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#071912',
                    borderColor: '#064e3b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Bar dataKey="litres" name="Actual AGRO-IOT (L)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savedVsTimer" name="Water Conserved (L)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
