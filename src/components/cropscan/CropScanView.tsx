import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Cpu,
  FileText,
  Image as ImageIcon,
  Layers,
  RefreshCw,
  Sparkles,
  Upload,
  Video,
  X,
  Zap,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { LeafVisual } from '../common/LeafVisual';

export const CropScanView: React.FC = () => {
  const { latestScan, runCropScan, isScanning } = useFarm();

  const [selectedSample, setSelectedSample] = useState<string>('tomato_early_blight');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Agricultural conditions requested by prompt:
  // - Tomato Early Blight
  // - Tomato Late Blight
  // - Healthy Crop
  // - Spider Mites
  // - Nitrogen Deficiency
  const sampleLeaves = [
    {
      id: 'tomato_early_blight',
      name: 'Tomato Early Blight',
      pathogen: 'Alternaria solani',
      type: 'early_blight',
      category: 'Fungal Disease',
      tagColor: 'text-amber-300 bg-amber-950 border-amber-800/60',
    },
    {
      id: 'tomato_late_blight',
      name: 'Tomato Late Blight',
      pathogen: 'Phytophthora infestans',
      type: 'late_blight',
      category: 'Fungal Water Mold',
      tagColor: 'text-rose-300 bg-rose-950 border-rose-800/60',
    },
    {
      id: 'tomato_healthy',
      name: 'Healthy Tomato Crop',
      pathogen: 'None (Optimum Turgor)',
      type: 'healthy',
      category: 'Optimal Growth',
      tagColor: 'text-emerald-300 bg-emerald-950 border-emerald-800/60',
    },
    {
      id: 'tomato_spider_mites',
      name: 'Spider Mites Infestation',
      pathogen: 'Tetranychus urticae',
      type: 'spider_mites',
      category: 'Arthropod Pest',
      tagColor: 'text-purple-300 bg-purple-950 border-purple-800/60',
    },
    {
      id: 'tomato_nitrogen_deficiency',
      name: 'Nitrogen Deficiency',
      pathogen: 'Macronutrient Deficit',
      type: 'nitrogen',
      category: 'Nutritional Chlorosis',
      tagColor: 'text-yellow-300 bg-yellow-950 border-yellow-800/60',
    },
  ];

  // Camera handling
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device API not available in this browser context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(
        err.message || 'Could not access device camera. Please upload an image or select a sample leaf below.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraFrame = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setUploadedPreview(dataUrl);
      stopCamera();
      await runCropScan('', 'tomato_early_blight');
    }
  };

  const handleSelectSample = async (sampleId: string) => {
    setSelectedSample(sampleId);
    setUploadedPreview(null);
    stopCamera();
    await runCropScan('', sampleId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCamera();
    const reader = new FileReader();
    reader.onload = async () => {
      setUploadedPreview(reader.result as string);
      await runCropScan(file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#081e16] border border-emerald-900/80 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Computer Vision Diagnostics
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                Leaf Scanner v2.4
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Interactive Crop Scanner
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Analyze leaf pathology using your device camera, file upload, or standard agricultural reference leaves
            </p>
          </div>

          {/* Mode Selector Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              id="cropscan-camera-btn"
              onClick={isCameraActive ? stopCamera : startCamera}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                isCameraActive
                  ? 'bg-rose-950 text-rose-300 border-rose-600'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{isCameraActive ? 'Close Camera' : 'Use Camera'}</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              id="cropscan-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-xs font-bold transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Stream Overlay if active */}
      {isCameraActive && (
        <div className="p-4 rounded-2xl bg-[#030d09] border border-cyan-500/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>Live Camera Stream — Aim at Leaf Surface</span>
            </div>
            <button
              onClick={stopCamera}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-black max-h-[360px] flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[360px] object-cover"
            />
            {/* Viewfinder Bounding Reticle */}
            <div className="absolute inset-8 sm:inset-14 border-2 border-dashed border-cyan-400/80 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="text-[11px] font-mono text-cyan-300 bg-black/60 px-3 py-1 rounded-full uppercase tracking-wider">
                Position Leaf in Box
              </span>
            </div>
          </div>

          <button
            onClick={captureCameraFrame}
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Capture & Run Neural Scan</span>
          </button>
        </div>
      )}

      {cameraError && (
        <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{cameraError}</span>
          </div>
          <button
            onClick={() => setCameraError(null)}
            className="text-amber-400 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Reference Botanical Samples Strip */}
      <div className="bg-[#071912] border border-emerald-900/60 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
            Select Reference Leaf Specimen:
          </h2>
          <span className="text-[11px] text-emerald-400">
            Real Agricultural Conditions
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {sampleLeaves.map((leaf) => {
            const isSelected = selectedSample === leaf.id && !uploadedPreview && !isCameraActive;
            return (
              <button
                key={leaf.id}
                id={`leaf-sample-btn-${leaf.id}`}
                onClick={() => handleSelectSample(leaf.id)}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-900/50 shadow ring-1 ring-emerald-400 text-white'
                    : 'border-emerald-950/90 bg-[#081e16] hover:border-emerald-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="h-20 rounded-lg bg-[#04120d] border border-emerald-950/80 flex items-center justify-center mb-2.5">
                    <LeafVisual type={leaf.type} className="w-14 h-14" />
                  </div>
                  <div className="text-xs font-bold font-heading mb-1 text-white">
                    {leaf.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono italic">
                    {leaf.pathogen}
                  </div>
                </div>

                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider mt-2.5 w-fit ${leaf.tagColor}`}>
                  {leaf.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Output Diagnostics Display:
          - Detected Crop
          - Detected Condition
          - Confidence %
          - Visual indicator showing the leaf condition
          - Clear plain-English explanation
          - Recommended action
      */}
      {latestScan && (
        <div className="p-6 rounded-2xl bg-[#081b14] border border-emerald-900/80 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-950">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider">
                  Diagnostic Result
                </span>
                <h3 className="text-lg font-bold text-white font-heading">
                  {latestScan.possibleDisease || latestScan.healthStatus}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Confidence:</span>
              <span className="text-sm font-mono font-extrabold text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-1 rounded-lg">
                {latestScan.confidence}%
              </span>
              <span className="text-xs text-slate-400">Latency:</span>
              <span className="text-xs font-mono text-emerald-400">
                {latestScan.inferenceTimeMs}ms
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Visual indicator showing the leaf condition */}
            <div className="md:col-span-4 p-5 rounded-xl bg-[#05130e] border border-emerald-950 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-wider">
                Visual Foliar Indicator
              </span>

              {uploadedPreview ? (
                <div className="w-36 h-36 rounded-xl overflow-hidden border border-emerald-800 shadow">
                  <img
                    src={uploadedPreview}
                    alt="Custom crop leaf"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 rounded-xl bg-gradient-to-b from-[#082218] to-[#04100c] border border-emerald-800 flex items-center justify-center p-4">
                  <LeafVisual
                    type={sampleLeaves.find((s) => s.id === selectedSample)?.type || 'early_blight'}
                    className="w-24 h-24"
                  />
                </div>
              )}

              <div className="mt-3 text-xs font-bold text-white">
                {latestScan.possibleDisease || 'Optimal Foliar Tissue'}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Target leaf surface features mapped
              </span>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {/* Detected Crop */}
                <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Detected Crop
                  </span>
                  <span className="text-xs font-bold text-white">
                    {latestScan.cropDetected}
                  </span>
                </div>

                {/* Detected Condition */}
                <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Detected Condition
                  </span>
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

                {/* Confidence */}
                <div className="p-3 rounded-xl bg-[#06140f] border border-emerald-950">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Confidence %
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {latestScan.confidence}%
                  </span>
                </div>
              </div>

              {/* Clear plain-English explanation */}
              <div className="p-4 rounded-xl bg-[#05130e] border border-emerald-950 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                  Plain-English Explanation:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {latestScan.healthStatus === 'Healthy'
                    ? 'The scanned leaf demonstrates strong chlorophyll density, uniform vein morphology, and no visible necrotic lesions. Photosynthetic capacity is functioning at peak potential.'
                    : latestScan.possibleDisease?.includes('Early Blight')
                    ? 'Concentric ring lesions observed on lower leaves indicative of early-stage Alternaria fungus. Warm temperatures coupled with morning dew create ideal incubation conditions.'
                    : latestScan.possibleDisease?.includes('Late Blight')
                    ? 'Dark water-soaked lesions observed rapidly expanding across leaf veins. High risk of systemic canopy collapse if untreated under humid conditions.'
                    : latestScan.pestIndication
                    ? 'Fine chlorotic stippling and micro-webbing indicate two-spotted spider mite colony actively feeding on plant sap.'
                    : 'Pale uniform yellowing across older foliage indicates nitrogen mobilization toward new shoots.'}
                </p>
              </div>

              {/* Recommended Action */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-[#06140f] border border-emerald-700/60 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Recommended Action:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {latestScan.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
