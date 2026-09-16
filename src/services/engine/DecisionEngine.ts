import {
  AIInferenceResult,
  AlertItem,
  CropProfile,
  FarmAdvisory,
  IrrigationDecision,
  RiskAssessment,
  RiskLevel,
  SensorData,
  ThresholdConfig,
} from '../../types';

export class DecisionEngine {
  /**
   * Evaluates agronomic environmental risks based on sensor physics and botanical thresholds.
   */
  public static evaluateRisks(
    sensor: SensorData,
    crop: CropProfile,
    config: ThresholdConfig,
    latestAiScan?: AIInferenceResult | null
  ): RiskAssessment {
    // 1. Heat Stress Evaluation
    let heatStress: RiskLevel = 'Low';
    let heatStressExplanation = `Temperature of ${sensor.temperature}°C is within safe physiological bounds (optimal: 20-30°C).`;

    if (sensor.temperature >= config.maxTemperature) {
      heatStress = 'High';
      heatStressExplanation = `Critical temperature of ${sensor.temperature}°C with ${sensor.humidity}% humidity induces high Vapor Pressure Deficit (VPD). Pollen viability and blossom retention are at risk.`;
    } else if (sensor.temperature >= config.maxTemperature - 4) {
      heatStress = 'Medium';
      heatStressExplanation = `Elevated temperature (${sensor.temperature}°C). Monitor leaf transpiration rates and canopy cooling.`;
    } else if (sensor.temperature <= config.minTemperature) {
      heatStress = 'Medium';
      heatStressExplanation = `Low temperature (${sensor.temperature}°C) slowing vegetative metabolic activity.`;
    }

    // 2. Water Stress Evaluation
    let waterStress: RiskLevel = 'Low';
    let waterStressExplanation = `Soil moisture at ${sensor.soilMoisture}% provides adequate root zone turgidity for ${crop.growthStage} stage.`;

    if (sensor.soilMoisture < config.minSoilMoisture) {
      waterStress = 'High';
      waterStressExplanation = `Soil moisture (${sensor.soilMoisture}%) is below critical threshold (${config.minSoilMoisture}%). Root tension deficit detected; stomata closure likely occurring.`;
    } else if (sensor.soilMoisture < config.minSoilMoisture + 8) {
      waterStress = 'Medium';
      waterStressExplanation = `Soil moisture (${sensor.soilMoisture}%) approaching minimum replenishment margin (${config.minSoilMoisture}%).`;
    }

    // 3. Flood / Waterlogging Evaluation
    let floodRisk: RiskLevel = 'Low';
    let floodRiskExplanation = `Water level (${sensor.waterLevel}%) and soil percolation are within normal drainage capacity.`;

    if (sensor.soilMoisture >= config.maxSoilMoisture || sensor.waterLevel >= config.waterLevelWarning) {
      floodRisk = 'High';
      floodRiskExplanation = `Soil moisture saturated at ${sensor.soilMoisture}% and field water level at ${sensor.waterLevel}%. High probability of root zone hypoxia (oxygen starvation) and root rot.`;
    } else if (sensor.soilMoisture >= config.maxSoilMoisture - 10 && sensor.rainProbability > 60) {
      floodRisk = 'Medium';
      floodRiskExplanation = `High moisture (${sensor.soilMoisture}%) coupled with incoming rainfall (${sensor.rainProbability}% probability) may cause surface pooling.`;
    }

    // 4. Disease Risk Evaluation (Fungal / Bacterial Leaf Wetness Index)
    let diseaseRisk: RiskLevel = 'Low';
    let diseaseRiskExplanation = `Current microclimate (${sensor.temperature}°C, ${sensor.humidity}% RH) is unsupportive of rapid fungal spore germination.`;

    const highHumidity = sensor.humidity > config.maxHumidity;
    const diseaseTempWindow = sensor.temperature >= 20 && sensor.temperature <= 29;

    if (latestAiScan && (latestAiScan.healthStatus === 'Early Disease' || latestAiScan.healthStatus === 'Advanced Disease')) {
      diseaseRisk = 'High';
      diseaseRiskExplanation = `Active pathogen confirmed by Edge AI: ${latestAiScan.possibleDisease || 'Foliar infection'}. Environmental factors favor rapid secondary transmission.`;
    } else if (highHumidity && diseaseTempWindow) {
      diseaseRisk = 'High';
      diseaseRiskExplanation = `High humidity (${sensor.humidity}%) in ideal incubation temperature range (${sensor.temperature}°C) creates extended leaf wetness, high risk for Early/Late Blight spores.`;
    } else if (sensor.humidity > 75 || (latestAiScan && latestAiScan.nutrientStress)) {
      diseaseRisk = 'Medium';
      diseaseRiskExplanation = `Elevated relative humidity (${sensor.humidity}%). Maintain vigilant scouting for mildew and septoria spotting.`;
    }

    // 5. Pest Risk Evaluation
    let pestRisk: RiskLevel = 'Low';
    let pestRiskExplanation = `Pest pressure indicators are low based on current climate and crop scouting history.`;

    if (latestAiScan && latestAiScan.healthStatus === 'Pest Infestation') {
      pestRisk = 'High';
      pestRiskExplanation = `Active pest presence detected by camera: ${latestAiScan.pestIndication || 'Mite/Insect infestation'}.`;
    } else if (sensor.temperature > 30 && sensor.humidity < 55) {
      pestRisk = 'High';
      pestRiskExplanation = `Hot, dry ambient microclimate (${sensor.temperature}°C, ${sensor.humidity}% RH) exponentially accelerates two-spotted spider mite and thrips lifecycles.`;
    } else if (sensor.temperature > 28) {
      pestRisk = 'Medium';
      pestRiskExplanation = `Warm daytime temperatures favor insect vector motility. Check underside of leaves regularly.`;
    }

    // Calculate Overall Crop Health (0-100)
    let healthScore = 95;
    if (heatStress === 'High') healthScore -= 22;
    else if (heatStress === 'Medium') healthScore -= 10;

    if (waterStress === 'High') healthScore -= 28;
    else if (waterStress === 'Medium') healthScore -= 12;

    if (floodRisk === 'High') healthScore -= 25;
    else if (floodRisk === 'Medium') healthScore -= 8;

    if (diseaseRisk === 'High') healthScore -= 26;
    else if (diseaseRisk === 'Medium') healthScore -= 10;

    if (pestRisk === 'High') healthScore -= 20;
    else if (pestRisk === 'Medium') healthScore -= 8;

    healthScore = Math.max(20, Math.min(99, Math.round(healthScore)));

    let healthStatusLabel: 'Optimal' | 'Caution' | 'Action Needed' | 'Critical' = 'Optimal';
    if (healthScore < 50) healthStatusLabel = 'Critical';
    else if (healthScore < 70) healthStatusLabel = 'Action Needed';
    else if (healthScore < 88) healthStatusLabel = 'Caution';

    return {
      heatStress,
      heatStressExplanation,
      waterStress,
      waterStressExplanation,
      floodRisk,
      floodRiskExplanation,
      diseaseRisk,
      diseaseRiskExplanation,
      pestRisk,
      pestRiskExplanation,
      overallCropHealth: healthScore,
      healthStatusLabel,
    };
  }

  /**
   * Evaluates smart irrigation requirements dynamically based on multi-parameter environmental physics.
   */
  public static evaluateIrrigation(
    sensor: SensorData,
    crop: CropProfile,
    config: ThresholdConfig
  ): IrrigationDecision {
    const moistureDeficit = Math.max(0, Number((config.targetSoilMoisture - sensor.soilMoisture).toFixed(1)));
    const rainExpected = sensor.rainProbability >= config.rainThreshold;
    const isWaterlogged = sensor.soilMoisture >= config.maxSoilMoisture;

    let decision: 'Optimal' | 'Not Required' | 'Monitor' | 'Recommended' = 'Optimal';
    let why = '';
    let durationMinutes = 0;
    let litersPerSqM = 0;
    let valve1: 'OPEN' | 'CLOSED' = 'CLOSED';
    let valve2: 'OPEN' | 'CLOSED' = 'CLOSED';

    if (isWaterlogged) {
      decision = 'Not Required';
      why = `Soil moisture is at saturated capacity (${sensor.soilMoisture}% >= ${config.maxSoilMoisture}% max threshold). Irrigation suspended to prevent root rot.`;
      valve1 = 'CLOSED';
      valve2 = 'CLOSED';
    } else if (rainExpected) {
      decision = 'Not Required';
      why = `High precipitation probability (${sensor.rainProbability}% >= ${config.rainThreshold}% threshold). Irrigation paused to conserve water and energy.`;
      valve1 = 'CLOSED';
      valve2 = 'CLOSED';
    } else if (sensor.soilMoisture < config.minSoilMoisture) {
      decision = 'Recommended';
      why = `Soil moisture is below configured threshold (${sensor.soilMoisture}% < ${config.minSoilMoisture}%) and rain probability is low (${sensor.rainProbability}%). Active ${crop.growthStage} stage requires root hydration.`;
      durationMinutes = Math.round(moistureDeficit * 1.6);
      litersPerSqM = Number((moistureDeficit * 0.45).toFixed(1));
      valve1 = 'OPEN';
      valve2 = 'CLOSED';
    } else if (sensor.soilMoisture < config.minSoilMoisture + 8) {
      decision = 'Monitor';
      why = `Soil moisture (${sensor.soilMoisture}%) is approaching trigger point (${config.minSoilMoisture}%). Weather radar indicates ${sensor.rainProbability}% rain chance. Advise observing until next scheduled cycle.`;
      durationMinutes = 0;
      valve1 = 'CLOSED';
      valve2 = 'CLOSED';
    } else {
      decision = 'Optimal';
      why = `Soil moisture is within the optimal agronomic range (${sensor.soilMoisture}% vs target ${config.targetSoilMoisture}%). Evapotranspiration is stable.`;
      valve1 = 'CLOSED';
      valve2 = 'CLOSED';
    }

    return {
      decision,
      why,
      recommendedDurationMinutes: durationMinutes,
      recommendedLitersPerSqM: litersPerSqM,
      soilMoistureDeficit: moistureDeficit,
      lastIrrigationTime: 'Today at 06:30 AM',
      nextScheduledCheck: 'In 30 minutes',
      valve1Status: valve1,
      valve2Status: valve2,
      autoMode: true,
    };
  }

  /**
   * Generates actionable, plain-language farmer advisories from technical telemetry.
   */
  public static generateAdvisory(
    sensor: SensorData,
    risks: RiskAssessment,
    irrigation: IrrigationDecision,
    crop: CropProfile,
    latestAiScan?: AIInferenceResult | null
  ): FarmAdvisory {
    // Determine the most critical driver for the farmer
    if (risks.floodRisk === 'High') {
      return {
        id: 'adv-flood',
        title: 'Immediate Drainage & Flood Risk Warning',
        summary: 'Excess soil water and high field water levels detected. Risk of root asphyxiation.',
        whyThisAlert: `Soil moisture is at ${sensor.soilMoisture}% (extreme saturation) with water level at ${sensor.waterLevel}% and rain forecast of ${sensor.rainProbability}%.`,
        whatShouldIDo: [
          'Inspect and clear peripheral field drainage trenches immediately.',
          'Shut down any automated fertigation or irrigation bypass lines.',
          'Elevate low-lying fruit trusses away from pooled soil moisture to prevent fungal rotting.',
        ],
        priority: 'Urgent',
        category: 'soil',
        timestamp: 'Just now',
        expectedImpact: 'Prevents total crop loss from waterlogged root death and damp-off blight.',
        translations: {
          hi: {
            title: 'तत्काल जल निकासी और बाढ़ जोखिम चेतावनी',
            summary: 'खेत में अत्यधिक पानी जमा होने से जड़ सड़न का खतरा है।',
            whyThisAlert: `मिट्टी में नमी ${sensor.soilMoisture}% है और बारिश की संभावना ${sensor.rainProbability}% है।`,
            whatShouldIDo: [
              'खेत की सभी जल निकासी नालियों को तुरंत साफ करें।',
              'सिंचाई प्रणाली पूरी तरह बंद रखें।',
              'फलों को गीली मिट्टी के सीधे संपर्क से बचाएं।',
            ],
          },
          es: {
            title: 'Alerta Urgente de Drenaje y Encharcamiento',
            summary: 'Exceso de agua en el suelo detectado. Riesgo de asfixia radicular.',
            whyThisAlert: `Humedad del suelo al ${sensor.soilMoisture}% con nivel de agua al ${sensor.waterLevel}%.`,
            whatShouldIDo: [
              'Despeje zanjas de drenaje perimetrales inmediatamente.',
              'Suspenda cualquier sistema de riego automático.',
              'Eleve ramas bajas para evitar contacto con suelo inundado.',
            ],
          },
        },
      };
    }

    if (latestAiScan && latestAiScan.healthStatus === 'Advanced Disease') {
      return {
        id: 'adv-disease-crit',
        title: `Pathogen Outbreak Alert: ${latestAiScan.possibleDisease}`,
        summary: 'Aggressive foliar disease detected on sample foliage by Edge AI scanner.',
        whyThisAlert: `Edge AI identified ${latestAiScan.possibleDisease} with ${latestAiScan.confidence}% confidence on your tomato crop.`,
        whatShouldIDo: [
          'Carefully remove and bag severely infected leaves to prevent spore dispersion.',
          'Apply an approved bio-fungicide protective spray early tomorrow morning.',
          'Do NOT irrigate over the canopy; keep foliage completely dry.',
        ],
        priority: 'Urgent',
        category: 'disease',
        timestamp: 'Just now',
        expectedImpact: 'Limits fungal spread to adjacent healthy rows within 48 hours.',
        translations: {
          hi: {
            title: `रोग प्रकोप चेतावनी: ${latestAiScan.possibleDisease}`,
            summary: 'एज एआई ने फसल में गंभीर पत्ती रोग की पुष्टि की है।',
            whyThisAlert: `एआई मॉडल ने ${latestAiScan.confidence}% सटीकता के साथ रोग की पहचान की है।`,
            whatShouldIDo: [
              'संक्रमित पत्तियों को काटकर सुरक्षित रूप से नष्ट करें।',
              'अनुशंसित जैविक कवकनाशी का तुरंत छिड़काव करें।',
              'पौधों के ऊपर से पानी डालने से बचें।',
            ],
          },
          es: {
            title: `Alerta de Enfermedad Foliar: ${latestAiScan.possibleDisease}`,
            summary: 'Enfermedad agresiva confirmada por el análisis Edge AI.',
            whyThisAlert: `Identificado ${latestAiScan.possibleDisease} con ${latestAiScan.confidence}% de confianza.`,
            whatShouldIDo: [
              'Pode y retire con cuidado las hojas infectadas.',
              'Aplique fungicida biológico protector por la mañana.',
              'Evite mojar el follaje durante el riego.',
            ],
          },
        },
      };
    }

    if (risks.heatStress === 'High') {
      return {
        id: 'adv-heat',
        title: 'Critical Heat Stress & Transpiration Alert',
        summary: 'Canopy temperature exceeds safe limits for flowering tomatoes.',
        whyThisAlert: `Air temperature has reached ${sensor.temperature}°C with dry humidity (${sensor.humidity}%). High risk of flower abortion and yield reduction.`,
        whatShouldIDo: [
          'Deploy shade netting (35-50% shade factor) if available.',
          'Perform a brief morning micro-sprinkler misting pulse to lower ambient canopy temperature.',
          'Check soil moisture twice daily as evaporation rates are doubled.',
        ],
        priority: 'Urgent',
        category: 'climate',
        timestamp: 'Just now',
        expectedImpact: 'Protects delicate flower blossoms from drying out, securing fruit set.',
        translations: {
          hi: {
            title: 'अत्यधिक गर्मी और वाष्पोत्सर्जन तनाव चेतावनी',
            summary: 'फूल आने के दौरान अत्यधिक तापमान फसल को नुकसान पहुँचा सकता है।',
            whyThisAlert: `तापमान ${sensor.temperature}°C तक पहुँच चुका है और आर्द्रता बहुत कम (${sensor.humidity}%) है।`,
            whatShouldIDo: [
              'यदि उपलब्ध हो तो छायादार जाली (शेड नेट) का उपयोग करें।',
              'पौधों को ठंडक देने के लिए सुबह हल्की बौछार करें।',
              'नमी स्तर की दिन में दो बार जांच करें।',
            ],
          },
          es: {
            title: 'Alerta Crítica por Estrés Térmico',
            summary: 'La temperatura supera los límites seguros para la floración.',
            whyThisAlert: `Temperatura registrada de ${sensor.temperature}°C con baja humedad (${sensor.humidity}%).`,
            whatShouldIDo: [
              'Coloque malla de sombreo si dispone de ella.',
              'Realice microaspersión matutina para bajar la temperatura del dosel.',
              'Controle la humedad del suelo dos veces al día.',
            ],
          },
        },
      };
    }

    if (irrigation.decision === 'Recommended') {
      return {
        id: 'adv-irrigation',
        title: 'Irrigation Recommended — Soil Moisture Deficit',
        summary: 'Soil moisture is depleted below optimal threshold. Schedule watering.',
        whyThisAlert: `Your soil moisture is low (${sensor.soilMoisture}%) and no significant rainfall is expected (${sensor.rainProbability}% rain chance).`,
        whatShouldIDo: [
          `Activate Drip Zone 1 for approximately ${irrigation.recommendedDurationMinutes} minutes.`,
          `Target approximately ${irrigation.recommendedLitersPerSqM} L/m² to replenish root zone.`,
          'Verify emitter drippers are free of silt or algae clogging.',
        ],
        priority: 'Moderate',
        category: 'irrigation',
        timestamp: 'Just now',
        expectedImpact: 'Restores plant cellular turgor and supports nutrient uptake for flower development.',
        translations: {
          hi: {
            title: 'सिंचाई की सिफारिश — मिट्टी में नमी की कमी',
            summary: 'मिट्टी की नमी सीमा से कम है। सिंचाई शुरू करने की सलाह है।',
            whyThisAlert: `मिट्टी की नमी कम (${sensor.soilMoisture}%) है और बारिश की संभावना केवल ${sensor.rainProbability}% है।`,
            whatShouldIDo: [
              `ड्रिप लाइन को लगभग ${irrigation.recommendedDurationMinutes} मिनट तक चलाएं।`,
              'पौधों की जड़ों तक समान पानी पहुँचना सुनिश्चित करें।',
              'ड्रिप नोजल को साफ रखें।',
            ],
          },
          es: {
            title: 'Riego Recomendado — Déficit Hídrico',
            summary: 'La humedad del suelo está por debajo del umbral óptimo.',
            whyThisAlert: `Humedad baja (${sensor.soilMoisture}%) y baja probabilidad de lluvia (${sensor.rainProbability}%).`,
            whatShouldIDo: [
              `Encienda la Zona de Goteo 1 durante unos ${irrigation.recommendedDurationMinutes} minutos.`,
              `Suministre aprox. ${irrigation.recommendedLitersPerSqM} L/m² en la zona radicular.`,
              'Compruebe que los goteros no tengan obstrucciones.',
            ],
          },
        },
      };
    }

    if (risks.diseaseRisk === 'High') {
      return {
        id: 'adv-disease-env',
        title: 'High Fungal Spore Incubation Risk',
        summary: 'Prolonged leaf wetness and warm humidity detected in the crop canopy.',
        whyThisAlert: `Relative humidity at ${sensor.humidity}% with temperature ${sensor.temperature}°C provides the exact condition for Early Blight germination.`,
        whatShouldIDo: [
          'Prune dense interior sucker shoots to increase inter-canopy ventilation.',
          'Avoid handling wet foliage to prevent mechanical transfer of bacterial spots.',
          'Prepare biological protective copper soap spray if conditions persist tomorrow.',
        ],
        priority: 'Moderate',
        category: 'disease',
        timestamp: 'Just now',
        expectedImpact: 'Reduces micro-climatic humidity trap, suppressing fungal spore viability.',
        translations: {
          hi: {
            title: 'कवक रोग संक्रमण का उच्च जोखिम',
            summary: 'पौधों के पत्तों पर नमी और तापमान कवक के अनुकूल हैं।',
            whyThisAlert: `हवा में नमी ${sensor.humidity}% और तापमान ${sensor.temperature}°C होने से झुलसा रोग का खतरा बढ़ जाता है।`,
            whatShouldIDo: [
              'पौधों के बीच हवा के प्रवाह के लिए अतिरिक्त पत्तियों की छंटाई करें।',
              'गीली पत्तियों को छूने या हिलाने से बचें।',
              'जैविक कवकनाशी का छिड़काव तैयार रखें।',
            ],
          },
          es: {
            title: 'Riesgo Elevado de Esporas Fúngicas',
            summary: 'Condiciones prolongadas de humedad foliar en el cultivo.',
            whyThisAlert: `Humedad de ${sensor.humidity}% con ${sensor.temperature}°C propicia el desarrollo de tizón temprano.`,
            whatShouldIDo: [
              'Pode ramas densas para mejorar la ventilación interna.',
              'Evite manipular plantas con hojas húmedas.',
              'Tenga listo un tratamiento biológico preventivo.',
            ],
          },
        },
      };
    }

    // Default Optimal State
    return {
      id: 'adv-optimal',
      title: 'Optimal Field Growth Conditions',
      summary: 'All telemetry metrics are within target parameters for flowering tomatoes.',
      whyThisAlert: `Soil moisture (${sensor.soilMoisture}%), temperature (${sensor.temperature}°C), and humidity (${sensor.humidity}%) are well balanced.`,
      whatShouldIDo: [
        'Maintain routine daily scouting and automated sensor telemetry logging.',
        'Keep drip lines in auto-standby mode.',
        'Record any visual changes or flower counts via the Crop Scan tool.',
      ],
      priority: 'Informational',
      category: 'climate',
      timestamp: 'Just now',
      expectedImpact: 'Sustained photosynthetic efficiency and uniform flowering progression.',
      translations: {
        hi: {
          title: 'फसल के लिए आदर्श परिस्थितियाँ',
          summary: 'सभी सेंसर माप टमाटर की फसल के लिए बिल्कुल अनुकूल हैं।',
          whyThisAlert: `मिट्टी की नमी (${sensor.soilMoisture}%), तापमान (${sensor.temperature}°C) और आर्द्रता संतुलित हैं।`,
          whatShouldIDo: [
            'दैनिक खेत निरीक्षण जारी रखें।',
            'स्वचालित सिंचाई को स्टैंडबाय मोड पर रखें।',
            'फसल स्कैन टूल से पौधों की नियमित जांच करते रहें।',
          ],
        },
        es: {
          title: 'Condiciones Óptimas de Crecimiento',
          summary: 'Todos los sensores dentro de parámetros ideales para tomate en floración.',
          whyThisAlert: `Humedad del suelo (${sensor.soilMoisture}%), temperatura (${sensor.temperature}°C) y ambiente equilibrados.`,
          whatShouldIDo: [
            'Mantenga el monitoreo rutinario habitual.',
            'Conserve el sistema de riego en modo automático.',
            'Realice escaneos periódicos con la cámara Edge AI.',
          ],
        },
      },
    };
  }

  /**
   * Generates systemic alerts for the Alert Center.
   */
  public static generateAlerts(
    sensor: SensorData,
    risks: RiskAssessment,
    irrigation: IrrigationDecision,
    hardwareConnected: boolean,
    latestAiScan?: AIInferenceResult | null
  ): AlertItem[] {
    const alerts: AlertItem[] = [];

    // Hardware disconnected alert
    if (!hardwareConnected) {
      alerts.push({
        id: 'alt-hw-disconnect',
        type: 'hardware',
        severity: 'critical',
        title: 'Sensor Gateway Disconnected',
        reason: 'LoRa/Zigbee/WiFi telemetry heartbeat timed out. Real-time field telemetry is currently paused.',
        recommendedAction: 'Verify field solar battery, gateway power supply, and wireless antenna orientation.',
        timestamp: 'Just now',
        read: false,
      });
    }

    // Disease alert
    if (latestAiScan && (latestAiScan.healthStatus === 'Early Disease' || latestAiScan.healthStatus === 'Advanced Disease')) {
      alerts.push({
        id: `alt-ai-${latestAiScan.id}`,
        type: 'disease',
        severity: latestAiScan.healthStatus === 'Advanced Disease' ? 'critical' : 'warning',
        title: `Pathogen Detected: ${latestAiScan.possibleDisease}`,
        reason: `Camera Edge AI inference detected symptomatic leaf lesions with ${latestAiScan.confidence}% confidence.`,
        recommendedAction: latestAiScan.recommendation,
        timestamp: latestAiScan.timestamp,
        read: false,
      });
    } else if (risks.diseaseRisk === 'High') {
      alerts.push({
        id: 'alt-env-disease',
        type: 'disease',
        severity: 'warning',
        title: 'High Fungal Disease Incubation Risk',
        reason: `Canopy microclimate (${sensor.temperature}°C, ${sensor.humidity}% RH) creates high leaf wetness duration index.`,
        recommendedAction: 'Prune dense foliage to boost airflow and prepare organic preventative bio-fungicide.',
        timestamp: '10m ago',
        read: false,
      });
    }

    // Pest alert
    if (latestAiScan && latestAiScan.healthStatus === 'Pest Infestation') {
      alerts.push({
        id: 'alt-pest-ai',
        type: 'pest',
        severity: 'warning',
        title: `Pest Infestation: ${latestAiScan.pestIndication}`,
        reason: `Micro-webbing and chlorotic stippling identified via high-resolution crop inspection.`,
        recommendedAction: latestAiScan.recommendation,
        timestamp: latestAiScan.timestamp,
        read: false,
      });
    } else if (risks.pestRisk === 'High') {
      alerts.push({
        id: 'alt-env-pest',
        type: 'pest',
        severity: 'warning',
        title: 'High Pest Propagation Climate',
        reason: `Hot, dry ambient conditions (${sensor.temperature}°C, ${sensor.humidity}%) favor spider mite multiplication.`,
        recommendedAction: 'Inspect underside of crown leaves and consider introducing beneficial predatory mites.',
        timestamp: '15m ago',
        read: false,
      });
    }

    // Moisture alert
    if (risks.waterStress === 'High') {
      alerts.push({
        id: 'alt-moisture-low',
        type: 'moisture',
        severity: 'critical',
        title: 'Low Soil Moisture Alert',
        reason: `Soil moisture dropped to ${sensor.soilMoisture}%, violating the minimum configured threshold.`,
        recommendedAction: `Execute scheduled drip irrigation (${irrigation.recommendedDurationMinutes} mins recommended).`,
        timestamp: '5m ago',
        read: false,
      });
    }

    // Heat stress alert
    if (risks.heatStress === 'High') {
      alerts.push({
        id: 'alt-heat-high',
        type: 'heat',
        severity: 'critical',
        title: 'High Canopy Heat Stress',
        reason: `Ambient field temperature reached ${sensor.temperature}°C, triggering blossom drop danger.`,
        recommendedAction: 'Deploy shade mesh netting and run short cooling mist cycles.',
        timestamp: '12m ago',
        read: false,
      });
    }

    // Flood / waterlogging alert
    if (risks.floodRisk === 'High') {
      alerts.push({
        id: 'alt-flood-high',
        type: 'flood',
        severity: 'critical',
        title: 'Severe Waterlogging / Flood Warning',
        reason: `Soil moisture at ${sensor.soilMoisture}% with water level at ${sensor.waterLevel}%. Root asphyxiation risk.`,
        recommendedAction: 'Clear peripheral field drainage channels and verify furrow outflow immediately.',
        timestamp: '2m ago',
        read: false,
      });
    }

    return alerts;
  }
}
