import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  HelpCircle,
  PhoneCall,
  Sparkles,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export const FarmerAdvisoryView: React.FC = () => {
  const { advisory, crop, sensorData, scenario } = useFarm();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'es'>('en');

  // Translations / Localized summaries for accessibility
  const localizedContent = {
    en: {
      langName: 'English',
      headline: advisory.title,
      summary: advisory.summary,
      why: advisory.whyThisAlert,
      whatToDo: advisory.whatShouldIDo,
      whatNotToDo: advisory.whatNotToDo,
      next48: advisory.next24To48Hours,
    },
    hi: {
      langName: 'हिंदी (Hindi)',
      headline:
        scenario === 'LOW_MOISTURE'
          ? 'मिट्टी में नमी कम है — तुरंत सिंचाई करें'
          : scenario === 'HEAT_STRESS'
          ? 'अत्यधिक गर्मी की चेतावनी — फसल को सुरक्षित रखें'
          : scenario === 'DISEASE_ALERT'
          ? 'फफूंद रोग का खतरा — जैविक छिड़काव करें'
          : 'खेत की स्थिति अनुकूल है — सामान्य देखभाल रखें',
      summary:
        'सेंसर और एआई ने खेत की सूक्ष्म जलवायु की जांच की है। नीचे दी गई सिफारिशों का पालन करें।',
      why: 'मिट्टी की नमी और तापमान की रीडिंग निर्धारित सीमा से बाहर पाई गई है।',
      whatToDo: [
        'ड्रिप वाल्व खोलें और पौधे की जड़ों में पानी दें।',
        'तेज धूप में पत्तियों पर पानी का छिड़काव न करें।',
        'खेत की जल निकासी और मेड़ों की जांच करें।',
      ],
      whatNotToDo: [
        'दोपहर 12 से 3 बजे के बीच यूरिया या रासायनिक खाद न डालें।',
        'फसल पर अत्यधिक कीटनाशक का प्रयोग न करें।',
      ],
      next48: 'अगले 24-48 घंटों में तापमान स्थिर रहने का अनुमान है। शाम के समय दोबारा नमी जांचें।',
    },
    es: {
      langName: 'Español',
      headline:
        scenario === 'LOW_MOISTURE'
          ? 'Humedad Baja en el Suelo — Riego Recomendado'
          : scenario === 'HEAT_STRESS'
          ? 'Alerta de Estrés Térmico — Proteger Cultivo'
          : scenario === 'DISEASE_ALERT'
          ? 'Alerta de Hongo Foliar — Aplicar Fungicida'
          : 'Condiciones de Campo Óptimas',
      summary:
        'Los sensores de campo y la IA local recomiendan las siguientes acciones preventivas.',
      why: 'Humedad radicular por debajo del límite seguro combinado con pronóstico de evaporación.',
      whatToDo: [
        'Activar línea de goteo durante 35 minutos.',
        'Verificar la turgencia foliar durante las primeras horas de la mañana.',
        'Inspeccionar drenajes de la parcela.',
      ],
      whatNotToDo: [
        'No aplicar fertilizantes sintéticos bajo sol directo.',
        'No regar por aspersión aérea para evitar moho foliar.',
      ],
      next48: 'Vigilar la recuperación de humedad en las próximas 24 horas y reevaluar.',
    },
  };

  const current = localizedContent[selectedLanguage];

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser/device.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `${current.headline}. ${current.summary}. Por qué: ${current.why}. Qué hacer: ${current.whatToDo.join(
      '. '
    )}. Qué no hacer: ${current.whatNotToDo.join('. ')}. Próximas 48 horas: ${current.next48}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'es' ? 'es-ES' : 'en-US';
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-[#081e16] border border-emerald-900/80 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                Actionable Field Guidance
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                Priority: {advisory.priority}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Farmer Advisory Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Plain-language agronomic instructions built for direct field execution without technical jargon
            </p>
          </div>

          {/* Language Selector & Audio Speech Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Switch */}
            <div className="flex items-center gap-1 bg-[#05130e] p-1 rounded-xl border border-emerald-900/60">
              {(['en', 'hi', 'es'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setSelectedLanguage(lang);
                    if (isSpeaking) {
                      window.speechSynthesis?.cancel();
                      setIsSpeaking(false);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition ${
                    selectedLanguage === lang
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'ES'}
                </button>
              ))}
            </div>

            {/* Audio Speech Button */}
            <button
              id="advisory-speak-audio-btn"
              onClick={handleToggleSpeak}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer shadow ${
                isSpeaking
                  ? 'bg-cyan-600 text-white border-cyan-400 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Listen Aloud (Speech)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advisory Card Structured in 5 Required Sections:
          1. WHAT IS HAPPENING?
          2. WHY THIS ALERT?
          3. WHAT SHOULD I DO?
          4. WHAT NOT TO DO?
          5. NEXT 24-48 HOUR FORECAST / ACTION
      */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#082218] via-[#071912] to-[#05140f] border border-emerald-800/80 shadow-xl space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-emerald-950/80">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Field Status Broadcast
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
              {current.headline}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Crop: <strong className="text-white">{crop.name.split(' ')[0]}</strong></span>
            <span className="text-slate-500">·</span>
            <span>Plot: <strong className="text-white">{crop.field}</strong></span>
          </div>
        </div>

        {/* 1. WHAT IS HAPPENING? */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 font-heading">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700 text-[10px] font-mono">
              1
            </span>
            <span>WHAT IS HAPPENING IN YOUR FIELD?</span>
          </div>
          <div className="p-4 rounded-xl bg-[#04120d] border border-emerald-950/80">
            <p className="text-sm text-slate-200 leading-relaxed">
              {current.summary}
            </p>
          </div>
        </div>

        {/* 2. WHY THIS ALERT? */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-heading">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-950 border border-amber-700 text-[10px] font-mono">
              2
            </span>
            <span>WHY THIS ALERT? (ROOT CAUSE)</span>
          </div>
          <div className="p-4 rounded-xl bg-[#04120d] border border-emerald-950/80">
            <p className="text-sm text-slate-200 leading-relaxed">
              {current.why}
            </p>
          </div>
        </div>

        {/* 3. WHAT SHOULD I DO? */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 font-heading">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 text-[10px] font-mono">
              3
            </span>
            <span>WHAT SHOULD I DO? (IMMEDIATE ACTIONS)</span>
          </div>
          <div className="p-4 rounded-xl bg-[#04120d] border border-emerald-950/80">
            <ul className="space-y-2.5">
              {current.whatToDo.map((action: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. WHAT NOT TO DO? */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 font-heading">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-950 border border-rose-700 text-[10px] font-mono">
              4
            </span>
            <span>WHAT NOT TO DO? (COMMON MISTAKES TO AVOID)</span>
          </div>
          <div className="p-4 rounded-xl bg-[#04120d] border border-emerald-950/80">
            <ul className="space-y-2.5">
              {current.whatNotToDo.map((caution: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{caution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5. NEXT 24-48 HOUR FORECAST / ACTION */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 font-heading">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-950 border border-purple-700 text-[10px] font-mono">
              5
            </span>
            <span>NEXT 24-48 HOUR FORECAST & PLANNED ACTIONS</span>
          </div>
          <div className="p-4 rounded-xl bg-[#04120d] border border-emerald-950/80">
            <p className="text-sm text-slate-200 leading-relaxed">
              {current.next48}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
