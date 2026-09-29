const router = require('express').Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

// Disease database for fallback
const diseaseDatabase = {
  // Apple diseases
  'apple scab': { crop: 'Apple', disease: 'Apple Scab', severity: 'high', cause: 'Fungal (Venturia inaequalis)', symptoms: 'Dark olive/brown spots on leaves, velvety texture, fruit cracking', treatment: ['Apply Mancozeb 75% WP @ 2g/L water', 'Spray Carbendazim 50% WP @ 1g/L', 'Remove infected leaves and burn them'], prevention: ['Avoid overhead irrigation', 'Ensure proper spacing for air circulation', 'Apply copper-based fungicide preventively'], organic: 'Spray neem oil (5ml/L) + garlic extract every 7 days' },
  'leaf blight': { crop: 'Multiple', disease: 'Leaf Blight', severity: 'medium', cause: 'Fungal/Bacterial', symptoms: 'Brown leaf edges, wilting, yellowing', treatment: ['Apply Copper oxychloride @ 2.5g/L', 'Spray Propiconazole 25% EC @ 1ml/L'], prevention: ['Avoid waterlogging', 'Apply balanced fertilizer'], organic: 'Spray Trichoderma-based bio-fungicide' },
  'powdery mildew': { crop: 'Multiple', disease: 'Powdery Mildew', severity: 'medium', cause: 'Fungal (Erysiphe spp.)', symptoms: 'White powdery coating on leaves, stunted growth', treatment: ['Spray Sulfur 80% WP @ 2.5g/L', 'Apply Tebuconazole 25.9% EC @ 1ml/L'], prevention: ['Reduce humidity', 'Avoid dense planting'], organic: 'Spray baking soda solution (5g/L) weekly' },
  'bacterial blight': { crop: 'Multiple', disease: 'Bacterial Blight', severity: 'high', cause: 'Bacterial (Xanthomonas spp.)', symptoms: 'Water-soaked lesions, yellowing, wilting', treatment: ['Apply Streptomycin 90% SP @ 1g/L', 'Spray Copper hydroxide @ 2g/L', 'Remove severely infected plants'], prevention: ['Use certified disease-free seeds', 'Avoid working in wet fields'], organic: 'Spray pseudomonas bio-control agent' },
  'leaf curl': { crop: 'Multiple', disease: 'Leaf Curl', severity: 'medium', cause: 'Viral/Pest (Whitefly transmitted)', symptoms: 'Curling and cupping of leaves, stunted growth, yellowing', treatment: ['Control whitefly with Imidacloprid 17.8% SL @ 0.3ml/L', 'Spray Thiamethoxam 25% WG @ 0.3g/L'], prevention: ['Use yellow sticky traps', 'Apply reflective mulch to repel whitefly'], organic: 'Spray neem oil @ 5ml/L every 5 days' },
  'anthracnose': { crop: 'Mango/Banana', disease: 'Anthracnose', severity: 'high', cause: 'Fungal (Colletotrichum gloeosporioides)', symptoms: 'Dark brown/black spots on fruit, flower/twig blight', treatment: ['Spray Carbendazim 50% WP @ 1g/L', 'Apply Mancozeb 75% WP @ 2g/L', 'Post-harvest hot water treatment (52°C for 5 min)'], prevention: ['Prune infected branches', 'Avoid excess nitrogen fertilizer', 'Harvest at proper maturity'], organic: 'Spray Trichoderma viride @ 10g/L weekly' },
  'fruit rot': { crop: 'Multiple', disease: 'Fruit Rot', severity: 'high', cause: 'Fungal (Phytophthora/Rhizopus)', symptoms: 'Soft, water-soaked, brown rot on fruits, foul smell', treatment: ['Apply Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L', 'Remove and destroy infected fruits'], prevention: ['Avoid wounding fruits', 'Proper storage ventilation', 'Harvest at right maturity'], organic: 'Apply wood ash around base of plants' },
  'yellow mosaic': { crop: 'Vegetables', disease: 'Yellow Mosaic Virus', severity: 'high', cause: 'Viral (Whitefly transmitted)', symptoms: 'Irregular yellow-green mosaic pattern, leaf distortion, stunting', treatment: ['No direct cure — control whitefly vector', 'Remove infected plants immediately', 'Spray Imidacloprid 17.8% SL @ 0.3ml/L'], prevention: ['Use virus-resistant varieties', 'Install insect-proof nets in nursery'], organic: 'Use reflective mulch and sticky traps' }
};

router.post('/detect', protect, async (req, res) => {
  try {
    const { imageBase64, cropType, symptoms } = req.body;

    let detectionResult;

    // Try ML service
    if (imageBase64) {
      try {
        const mlResponse = await axios.post(
          `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/predict/disease`,
          { image: imageBase64, cropType },
          { timeout: 10000 }
        );
        detectionResult = mlResponse.data;
      } catch {
        // Fallback: symptom-based detection
        detectionResult = symptomBasedDetection(symptoms, cropType);
      }
    } else if (symptoms) {
      detectionResult = symptomBasedDetection(symptoms, cropType);
    } else {
      return res.status(400).json({ message: 'Provide image or symptoms for detection' });
    }

    res.json(detectionResult);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

function symptomBasedDetection(symptoms, cropType) {
  if (!symptoms) {
    return {
      detected: false,
      message: 'No symptoms provided',
      suggestions: ['Provide symptoms or upload a clear leaf/fruit image']
    };
  }

  const symptomsLower = symptoms.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [key, disease] of Object.entries(diseaseDatabase)) {
    let score = 0;
    const keywords = key.split(' ');
    keywords.forEach(k => { if (symptomsLower.includes(k)) score += 3; });
    if (symptomsLower.includes('spot')) score += 1;
    if (symptomsLower.includes('yellow') && disease.symptoms.includes('yellow')) score += 2;
    if (symptomsLower.includes('rot') && key.includes('rot')) score += 3;
    if (symptomsLower.includes('curl') && key.includes('curl')) score += 3;
    if (symptomsLower.includes('mildew') && key.includes('mildew')) score += 4;
    if (cropType && disease.crop.toLowerCase().includes(cropType.toLowerCase())) score += 2;
    if (score > bestScore) { bestScore = score; bestMatch = disease; }
  }

  if (!bestMatch || bestScore < 2) {
    // Return common diseases for the crop type
    const common = Object.values(diseaseDatabase).find(d => cropType && d.crop.toLowerCase().includes(cropType.toLowerCase()));
    return {
      detected: true,
      confidence: 45,
      disease: common?.disease || 'General Fungal Infection',
      severity: 'medium',
      cause: common?.cause || 'Fungal pathogens',
      symptoms: common?.symptoms || symptoms,
      treatment: common?.treatment || ['Consult local agricultural extension officer', 'Apply broad-spectrum fungicide'],
      prevention: common?.prevention || ['Maintain field hygiene', 'Avoid waterlogging'],
      organic: common?.organic || 'Apply neem-based formulations',
      note: 'Low confidence — please upload a clear image for accurate diagnosis'
    };
  }

  return {
    detected: true,
    confidence: Math.min(92, 65 + bestScore * 3),
    ...bestMatch
  };
}

// Get disease list
router.get('/list', protect, async (req, res) => {
  const list = Object.entries(diseaseDatabase).map(([key, val]) => ({
    id: key,
    name: val.disease,
    crop: val.crop,
    severity: val.severity
  }));
  res.json({ diseases: list });
});

module.exports = router;
