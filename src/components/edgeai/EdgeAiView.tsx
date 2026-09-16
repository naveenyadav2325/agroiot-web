import React, { useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Camera,
  CheckCircle2,
  Cpu,
  FileText,
  Image as ImageIcon,
  Layers,
  Microchip,
  RefreshCw,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { AIInferenceResult } from '../../types';
import { LeafVisual } from '../common/LeafVisual';

export const EdgeAiView: React.FC = () => {
  const { edgeSpecs, latestScan, runCropScan, isScanning } = useFarm();
  const [selectedPreset, setSelectedPreset] = useState<string>('tomato_early_blight');
  const [activeTabPipeline, setActiveTabPipeline] = useState<number>(2);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePresets = [
    { id: 'tomato_early_blight', name: 'Early Blight Foliage', type: 'early_blight', status: 'Disease' },
    { id: 'tomato_healthy', name: 'Healthy Leaf Canopy', type: 'healthy', status: 'Healthy' },
    { id: 'tomato_spider_mites', name: 'Spider Mite Damage', type: 'spider_mites', status: 'Pest' },
    { id: 'tomato_late_blight', name: 'Late Blight Lesions', type: 'late_blight', status: 'Disease' },
    { id: 'tomato_nitrogen_deficiency', name: 'Nitrogen Chlorosis', type: 'nitrogen', status: 'Nutrient' },
  ];

  const pipelineStages = [
    {
      id: 0,
      title: 'CAMERA CAPTURE',
      desc: 'High-res macro image taken via field camera or mobile scanner',
      details: 'Input resolution: 1080p RGB raw stream',
      icon: Camera,
    },
    {
      id: 1,
      title: 'IMAGE PREPROCESSING',
      desc: 'Bilinear crop, aspect-ratio scaling to 224x224, pixel normalization [-1.0, 1.0]',
      details: 'Zero allocation tensor buffer in Uint8Array',
      icon: Layers,
    },
    {
      id: 2,
      title: 'EDGE AI MODEL',
      desc: 'Quantized MobileNetV3-Agronomy running on embedded NPU / WebAssembly',
      details: '4.6 MB footprint · INT8 precision · Zero cloud latency',
      icon: Cpu,
    },
    {
      id: 3,
      title: 'CROP ANALYSIS',
      desc: 'Softmax probability distribution output across 38 crop pathology classes',
      details: 'Identifies pathogen vectors and leaf chlorosis',
      icon: Sparkles,
    },
    {
      id: 4,
      title: 'DECISION ENGINE',
      desc: 'Fusing visual pathology with soil moisture, temp & humidity microclimate data',
      details: 'Rules-based agronomic inference',
      icon: Activity,
    },
    {
      id: 5,
      title: 'FARMER ADVISORY',
      desc: 'Plain-language actionable treatment instructions delivered in seconds',
      details: 'Multilingual speech and printable guides',
      icon: CheckCircle2,
    },
  ];

  const handleRunPreset = async (presetId: string) => {
    setSelectedPreset(presetId);
    setCustomImagePreview(null);
    await runCropScan('', presetId);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setCustomImagePreview(dataUrl);
      await runCropScan(file);
    };
    reader.readAsDataURL(file);
  };

  // Fallback to initial early blight if no scan yet
  const displayResult: AIInferenceResult = latestScan || {
    id: 'default-edge',
    cropDetected: 'Tomato (Solanum lycopersicum)',
    healthStatus: 'Early Disease',
    possibleDisease: 'Early Blight (Alternaria solani)',
    pestIndication: null,
    nutrientStress: null,
    confidence: 91,
    inferenceTimeMs: 84,
    modelName: 'Edge AI Crop Health Model (INT8)',
    recommendation: 'Apply organic copper hydroxide bio-fungicide. Prune infected bottom leaves and avoid overhead canopy irrigation.',
    timestamp: 'Just now',
    diagnosticDetails: {
      symptomsObserved: ['Target-like concentric ring spots', 'Yellow halo chlorosis', 'Lower foliar senescence'],
      pathogenType: 'Fungal (Alternaria solani)',
      preventativeMeasures: ['Drip irrigation instead of overhead spray', 'Stake plants to promote air circulation'],
      curativeMeasures: ['Apply copper-based fungicide spray at 7-day intervals'],
    },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Edge AI Status */}
      <div className="bg-[#081e16] border border-emerald-900/80 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Local Neural Inference
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                AIInferenceAdapter
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Edge AI Crop Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              On-device computer vision analyzing leaf pathology without sending photos to cloud servers
            </p>
          </div>

          {/* Metric Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status */}
            <div className="px-3.5 py-2 rounded-xl bg-cyan-950/70 border border-cyan-700/60 text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Edge AI Status</span>
                <span className="text-xs font-extrabold text-white">🟢 ACTIVE</span>
              </div>
            </div>

            {/* Inference */}
            <div className="px-3.5 py-2 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-300">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Inference</span>
              <span className="text-xs font-extrabold text-white">LOCAL / ON-DEVICE</span>
            </div>

            {/* Latency */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Inference Time</span>
              <span className="text-xs font-mono font-extrabold text-cyan-300">
                {displayResult.inferenceTimeMs} ms
              </span>
            </div>

            {/* Confidence */}
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Confidence</span>
              <span className="text-xs font-mono font-extrabold text-emerald-400">
                {displayResult.confidence}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Required Pipeline Representation:
          CAMERA
          ↓
          IMAGE PREPROCESSING
          ↓
          EDGE AI MODEL
          ↓
          CROP ANALYSIS
          ↓
          DECISION ENGINE
          ↓
          FARMER ADVISORY
      */}
      <div className="bg-[#071912] border border-emerald-900/60 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-heading flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              On-Device Inference Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Click any stage below to inspect its operational mechanism
            </p>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800/40">
            Pipeline Latency: ~{displayResult.inferenceTimeMs + 45}ms Total
          </span>
        </div>

        {/* Pipeline Nodes Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {pipelineStages.map((stage) => {
            const Icon = stage.icon;
            const isCurrent = activeTabPipeline === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveTabPipeline(stage.id)}
                className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'border-cyan-400 bg-cyan-950/40 shadow ring-1 ring-cyan-400 text-white'
                    : 'border-emerald-950 bg-[#081e16] hover:border-emerald-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      0{stage.id + 1}
                    </span>
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-[11px] font-extrabold uppercase tracking-tight text-white mb-1">
                    {stage.title}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {stage.desc}
                  </p>
                </div>
                <span className="text-[9px] text-cyan-300/80 font-mono mt-2 pt-1 border-t border-emerald-950">
                  {stage.details}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Crop Image Upload & Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Sample Gallery or Upload */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#081b14] border border-emerald-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
                Input Image Source
              </h3>
              <span className="text-[11px] text-slate-400">
                1-Click Presets or Custom Upload
              </span>
            </div>

            {/* Presets Gallery */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Sample Botanical Specimens:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleRunPreset(preset.id)}
                    disabled={isScanning}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 transition cursor-pointer text-left ${
                      selectedPreset === preset.id && !customImagePreview
                        ? 'border-emerald-400 bg-emerald-900/40 text-white shadow-xs'
                        : 'border-emerald-950 bg-[#06140f] hover:border-emerald-800 text-slate-300'
                    }`}
                  >
                    <LeafVisual type={preset.type} className="w-8 h-8 shrink-0" />
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">
                        {preset.name}
                      </div>
                      <span className="text-[10px] text-emerald-400/80 uppercase font-semibold">
                        {preset.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Leaf Image File Upload */}
            <div className="pt-3 border-t border-emerald-950/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Or Upload Real Field Leaf:
              </span>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-emerald-800/80 hover:border-emerald-500 bg-[#06140f] text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Crop / Leaf Photo</span>
              </button>
            </div>

            {/* Active Preview */}
            <div className="p-4 rounded-xl bg-[#04100c] border border-emerald-950 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-emerald-950/40 border border-emerald-900 flex items-center justify-center shrink-0 overflow-hidden">
                {customImagePreview ? (
                  <img
                    src={customImagePreview}
                    alt="Uploaded leaf preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LeafVisual
                    type={samplePresets.find((p) => p.id === selectedPreset)?.type || 'healthy'}
                    className="w-12 h-12"
                  />
                )}
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block font-mono">
                  Input Preprocessed Tensor
                </span>
                <div className="text-xs font-bold text-white truncate">
                  {customImagePreview
                    ? 'Custom Uploaded Image'
                    : samplePresets.find((p) => p.id === selectedPreset)?.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Resized: 224 × 224 RGB · Normalized float32
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Edge AI Diagnostic Result */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-[#081b14] border border-emerald-900/60 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-heading">
                  Edge AI Diagnostic Report
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Model: <strong className="text-slate-200">{edgeSpecs.name}</strong>
              </span>
            </div>

            {/* Output items explicitly requested:
                - Crop detected
                - Health status
                - Possible disease
                - Pest indication
                - Nutrient stress indication
                - Confidence
                - Recommendation
            */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Crop Detected */}
              <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Crop Detected
                </span>
                <span className="text-xs font-bold text-white">
                  {displayResult.cropDetected}
                </span>
              </div>

              {/* Health Status */}
              <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Health Status
                </span>
                <span
                  className={`text-xs font-extrabold ${
                    displayResult.healthStatus === 'Healthy'
                      ? 'text-emerald-400'
                      : displayResult.healthStatus === 'Early Disease'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {displayResult.healthStatus}
                </span>
              </div>

              {/* Confidence */}
              <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Confidence Score
                </span>
                <span className="text-xs font-extrabold text-cyan-300 font-mono">
                  {displayResult.confidence}% ({displayResult.inferenceTimeMs}ms)
                </span>
              </div>

              {/* Possible Disease */}
              <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Possible Disease
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {displayResult.possibleDisease || 'None Detected'}
                </span>
              </div>

              {/* Pest Indication */}
              <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Pest Indication
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {displayResult.pestIndication || 'None Observed'}
                </span>
              </div>

              {/* Nutrient Stress Indication */}
              <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Nutrient Stress
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {displayResult.nutrientStress || 'Optimal Balance'}
                </span>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-transparent border border-emerald-700/50 space-y-1.5">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Actionable Edge Recommendation:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {displayResult.recommendation}
              </p>
            </div>

            {/* Diagnostic Details: Symptoms, Preventative & Curative */}
            {displayResult.diagnosticDetails && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Pathology & Botanical Protocol:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950/80">
                    <strong className="text-emerald-400 block mb-1">Symptoms Identified:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {displayResult.diagnosticDetails.symptomsObserved.map((sym, i) => (
                        <li key={i}>{sym}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950/80">
                    <strong className="text-cyan-400 block mb-1">Preventative Measures:</strong>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {displayResult.diagnosticDetails.preventativeMeasures.map((prev, i) => (
                        <li key={i}>{prev}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Engineering Note: AIInferenceAdapter & Model Interoperability */}
      <div className="p-5 rounded-2xl bg-[#06140f] border border-emerald-950 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-400 uppercase tracking-wider">
          <Microchip className="w-4 h-4" />
          <span>Architecture Notice: AIInferenceAdapter Abstraction</span>
        </div>
        <p className="leading-relaxed">
          This technology demonstration utilizes the <strong className="text-white">MockEdgeAIAdapter</strong> clearly labelled to emulate an on-device quantized neural net. In production, connect TensorFlow Lite (<code className="text-cyan-300 font-mono">@tensorflow/tfjs-tflite</code>) or ONNX Runtime Web (<code className="text-cyan-300 font-mono">onnxruntime-web</code>) by simply implementing the same <code className="text-emerald-300 font-mono">AIInferenceAdapter</code> interface. Zero claims are fabricated regarding model weights without actual local tensor execution.
        </p>
      </div>
    </div>
  );
};
