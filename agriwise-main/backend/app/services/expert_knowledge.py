# AgriWise Clinical Agronomic Intelligence Database
# Adhering to ICAR, PAU, TNAU, and Central Insecticide Board (CIBRC) standards

CLINICAL_SOLUTIONS = [
    # --- TOMATO ---
    {
        "keywords": ["tomato", "tamatar", "black spot", "early blight", "late blight", "septoria", "leaf spot", "kaale dhabbe"],
        "crop": "Tomato (Tamatar)",
        "condition": "Fungal Blight & Leaf Spot Complex (Early Blight / Late Blight / Septoria)",
        "symptoms": "Dark brown/black concentric ring lesions on leaves, progressive yellowing from lower foliage, water-soaked dark patches on stems and fruits.",
        "chemical_medicines": [
            "Mancozeb 75% WP (Dithane M-45) @ 2.5 g / Liter water (Contact protective spray).",
            "Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top) @ 1 ml / Liter water (Rapid systemic curative).",
            "Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold) @ 2.5 g / Liter water (For water-soaked late blight lesions)."
        ],
        "organic_remedy": [
            "Prune and destroy infected lower foliage up to 12 inches from ground level (do not compost).",
            "Spray Copper Oxychloride 50% WP (Blitox) @ 3 g / L or Bordeaux mixture (1%).",
            "Spray bio-fungicide Trichoderma viride @ 5 g / L with 5% Neem Seed Kernel Extract (NSKE)."
        ],
        "precautions": "Avoid overhead sprinkler watering to prevent spore splash. Spray in dry morning hours with an adjuvant sticker (0.5 ml/L)."
    },
    {
        "keywords": ["tomato", "tamatar", "leaf curl", "patti mudna", "murda", "whitefly", "curl"],
        "crop": "Tomato (Tamatar)",
        "condition": "Tomato Leaf Curl Virus (ToLCV) transmitted by Whiteflies",
        "symptoms": "Upward curling, puckering, thickening and crinkling of leaves, severe plant stunting and flower drop.",
        "chemical_medicines": [
            "Diafenthiuron 50% WP (Pegasus) @ 1.25 g / Liter water to eradicate whitefly vectors.",
            "Cyantraniliprole 10.26% OD (Benevia) @ 1.8 ml / Liter water at vegetative stage.",
            "Acetamiprid 20% SP @ 0.5 g / Liter water or Thiamethoxam 25% WG @ 0.5 g / Liter."
        ],
        "organic_remedy": [
            "Erect 15-20 Yellow Sticky Traps per acre at canopy level.",
            "Foliar spray Neem Oil 10,000 ppm formulation @ 2.5 ml / Liter water every 7 days.",
            "Rogue out and bury severely stunted viral plants immediately to stop field spread."
        ],
        "precautions": "Virus cannot be cured chemically once inside the plant; focus strictly on killing the whitefly vector."
    },
    {
        "keywords": ["tomato", "tamatar", "fruit borer", "caterpillar", "keeda", "hole in fruit"],
        "crop": "Tomato (Tamatar)",
        "condition": "Tomato Fruit Borer (Helicoverpa armigera)",
        "symptoms": "Circular bore holes in developing green and ripe fruits, entry holes surrounded by larval excreta (frass).",
        "chemical_medicines": [
            "Chlorantraniliprole 18.5% SC (Coragen) @ 0.3 ml / Liter water (60 ml in 200 L water / acre).",
            "Spinosad 45% SC (Tracer) @ 0.3 ml / Liter water (High safety profile, 3-day PHI).",
            "Emamectin Benzoate 5% SG (Proclaim) @ 0.5 g / Liter water."
        ],
        "organic_remedy": [
            "Install 5 Helilure pheromone traps per acre for moth catch monitoring.",
            "Plant African tall marigold as border trap crop (1 marigold row every 16 tomato rows).",
            "Spray Bacillus thuringiensis (Bt var. kurstaki) @ 2 g / Liter or HaNPV 250 LE / acre in evening."
        ],
        "precautions": "Spray at dusk/evening when caterpillars are actively feeding on fruit surfaces."
    },

    # --- WHEAT ---
    {
        "keywords": ["wheat", "gehun", "yellow leaves", "peeli patti", "khaira", "chlorosis", "yellow"],
        "crop": "Wheat (Gehun)",
        "condition": "Wheat Foliar Yellowing: Nitrogen Deficiency, Zinc Deficiency or Yellow Stripe Rust",
        "symptoms": "1) Lower leaf V-shaped yellowing = Nitrogen deficiency. 2) Interveinal chlorosis with bronze spots = Zinc deficiency. 3) Yellow powdery pustule stripes along leaf veins = Yellow Rust.",
        "chemical_medicines": [
            "If Yellow/Stripe Rust (Puccinia striiformis): Immediately spray Propiconazole 25% EC (Tilt) @ 1 ml / L (200 ml in 200 L water / acre) or Tebuconazole 25.9% EC @ 1.25 ml / L.",
            "If Nitrogen Deficiency: Top-dress Urea @ 30-35 kg / acre before irrigation, or foliar spray 2% Urea (20 g / L).",
            "If Zinc Deficiency: Foliar spray Zinc Sulphate heptahydrate (21%) @ 5 g / L + 2.5 g / L unslaked lime (or 2% Urea)."
        ],
        "organic_remedy": [
            "Foliar spray Cow Urine (Gomutra) diluted 1:10 with water + 2% fermented buttermilk for fungal yellow rust suppression.",
            "Broadcast enriched vermicompost @ 2 quintals / acre with Azotobacter biofertilizer."
        ],
        "precautions": "Drain standing water immediately if yellowing is caused by waterlogging after first irrigation."
    },
    {
        "keywords": ["wheat", "gehun", "irrigation", "water", "sinchai", "critical stage", "cri"],
        "crop": "Wheat (Gehun)",
        "condition": "Critical Irrigation Timing and Water Schedule for Wheat",
        "symptoms": "Moisture stress during grain formation reduces yield by 25-40%.",
        "chemical_medicines": [
            "1. Crown Root Initiation (CRI) Stage: 20-25 Days After Sowing (DAS) - MOST CRITICAL.",
            "2. Tillering Stage: 40-45 DAS.",
            "3. Late Jointing / Stem Elongation: 65-70 DAS.",
            "4. Flowering / Booting Stage: 85-90 DAS.",
            "5. Milking / Grain Filling: 105-115 DAS.",
            "6. Dough Stage: 120-125 DAS (Light watering, avoid if winds are high)."
        ],
        "organic_remedy": [
            "Apply paddy straw or biomass mulch between rows to conserve 25-30% soil moisture in sandy loam soils.",
            "Conduct light evening irrigation when frost warnings (< 4°C) are issued."
        ],
        "precautions": "Never apply heavy flood irrigation during grain filling under strong winds, as it triggers catastrophic crop lodging."
    },
    {
        "keywords": ["wheat", "gehun", "fertilizer", "dap", "urea", "khad", "npk", "dose", "bigha", "acre"],
        "crop": "Wheat (Gehun)",
        "condition": "Balanced Fertilizer & Nutrient Split for High-Yield Wheat",
        "symptoms": "Poor tillering, weak culms, thin ears caused by unadjusted nutrient ratios.",
        "chemical_medicines": [
            "Per Acre Recommendation (120:60:40 kg N:P:K):",
            "• Basal (At Sowing): 1 bag DAP (50 kg) + 25 kg MOP (Potash) + 25 kg Urea + 10 kg Zinc Sulphate (33%).",
            "• 1st Top Dressing (At CRI Stage / 21-25 DAS): 45 kg Urea (1 bag).",
            "• 2nd Top Dressing (At Tillering / 45 DAS): 45 kg Urea.",
            "• Per Bigha (Standard 0.4 acre): 20 kg DAP + 10 kg MOP + 40 kg total Urea split in 3 doses."
        ],
        "organic_remedy": [
            "Incorporate 4-5 tons well-decomposed FYM or 1.5 tons Vermicompost per acre at land preparation.",
            "Seed treatment with Azotobacter and PSB (Phosphate Solubilizing Bacteria) @ 250 g per 10 kg seed."
        ],
        "precautions": "Always apply 100% Phosphorus (DAP) and Potash (MOP) as basal at sowing; do not broadcast DAP as top dressing."
    },

    # --- PADDY / RICE ---
    {
        "keywords": ["rice", "paddy", "dhan", "fertilizer", "khad", "urea", "dap", "zinc"],
        "crop": "Rice / Paddy (Dhan)",
        "condition": "Fertilizer Schedule and Khaira Disease (Zinc) Prevention in Rice",
        "symptoms": "Stunted seedlings, reddish-brown blotches on lower third leaves, poor root anchorage.",
        "chemical_medicines": [
            "Per Acre Dosage (120:60:40 N:P:K):",
            "• Basal (Before Transplanting): 1 bag DAP (50 kg) + 30 kg MOP + 25 kg Zinc Sulphate (21%) + 25 kg Urea.",
            "• 1st Top Dressing (Active Tillering / 20-25 DAT): 40 kg Urea.",
            "• 2nd Top Dressing (Panicle Initiation / 40-45 DAT): 35 kg Urea.",
            "• For Acute Khaira Disease: Foliar spray Zinc Sulphate (21%) @ 5 g + Urea @ 20 g / L water twice at 10-day intervals."
        ],
        "organic_remedy": [
            "Incorporate green manure crop (Dhaincha / Sesbania or Sunn hemp) 45-50 days before puddling.",
            "Apply Blue Green Algae (BGA) @ 10 kg / acre 7 days after transplanting to supply 25-30 kg N/ha biologically."
        ],
        "precautions": "Never mix Zinc Sulphate directly with DAP in the fertilizer hopper; apply them separately to avoid zinc phosphate fixation."
    },
    {
        "keywords": ["rice", "paddy", "dhan", "stem borer", "tana chedaka", "dead heart", "white ear"],
        "crop": "Rice / Paddy (Dhan)",
        "condition": "Yellow Stem Borer (Scirpophaga incertulas) in Rice",
        "symptoms": "Central shoot dries up in vegetative stage ('Dead Heart'); empty, erect white chaffy panicles at heading ('White Earhead').",
        "chemical_medicines": [
            "Chlorantraniliprole 18.5% SC (Coragen) @ 60 ml / acre in 200 L water, OR",
            "Cartap Hydrochloride 4G granules @ 10 kg / acre broadcast into standing water (2-3 cm water level), OR",
            "Fipronil 0.3% G @ 8-10 kg / acre broadcast at early tiller initiation."
        ],
        "organic_remedy": [
            "Release egg parasitoid Trichogramma japonicum @ 40,000 / acre 3 times at weekly intervals.",
            "Install 8 Pheromone traps (Scirpo-lure) per acre for monitoring and mass trapping.",
            "Clip seedling leaf tips before transplanting to eliminate stem borer egg masses."
        ],
        "precautions": "Maintain standing water of 2-3 cm for 48 hours after broadcasting granular insecticides."
    },
    {
        "keywords": ["rice", "paddy", "dhan", "blast", "sheath blight", "brown spot", "jhulsa"],
        "crop": "Rice / Paddy (Dhan)",
        "condition": "Rice Blast (Pyricularia oryzae) & Sheath Blight (Rhizoctonia solani)",
        "symptoms": "Spindle/diamond-shaped lesions with grey center and brown border on leaves; brown rot at neck node causing panicle breaking.",
        "chemical_medicines": [
            "For Blast: Tricyclazole 75% WP (Baan) @ 0.6 g / L (120 g / acre in 200 L water).",
            "For Sheath Blight: Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml / L or Validamycin 3% L @ 2 ml / L.",
            "For Combination Outbreaks: Trifloxystrobin 25% + Tebuconazole 50% WG (Nativo) @ 0.4 g / L."
        ],
        "organic_remedy": [
            "Seed treatment with Pseudomonas fluorescens @ 10 g / kg seed followed by foliar spray @ 5 g / L.",
            "Avoid excessive split applications of Nitrogen beyond recommended limits."
        ],
        "precautions": "Spray at boot leaf stage and early heading stage to safeguard against devastating neck blast."
    },

    # --- COTTON ---
    {
        "keywords": ["cotton", "kapas", "whitefly", "safed makkhi", "clcuv", "leaf curl", "pegasus"],
        "crop": "Cotton (Kapas / Narma)",
        "condition": "Cotton Whitefly (Bemisia tabaci) and Leaf Curl Virus Complex",
        "symptoms": "Clouds of tiny white flies under leaf surface, sticky honeydew excretions followed by black sooty mold, upward cupped leaves.",
        "chemical_medicines": [
            "Diafenthiuron 50% WP (Pegasus / Polo) @ 250 g / acre (1.25 g / L water).",
            "Afidopyropen 50 g/L DC (Sefina) @ 400 ml / acre (2 ml / L water) - Exceptional knockdown for nymphs & adults.",
            "Pyriproxyfen 10% + Bifenthrin 10% EC @ 400 ml / acre for multi-stage nymphal control."
        ],
        "organic_remedy": [
            "Install 20 yellow sticky traps per acre at upper canopy level.",
            "Spray Neem oil formulation (Azadirachtin 10,000 ppm) @ 2.5 ml / L water.",
            "Avoid spraying synthetic pyrethroids (Cypermethrin, Deltamethrin) which cause whitefly resurgence."
        ],
        "precautions": "Ensure nozzle is angled upwards towards leaf undersides where whitefly colonies dwell."
    },
    {
        "keywords": ["cotton", "kapas", "pink bollworm", "gulabi sundi", "bollworm"],
        "crop": "Cotton (Kapas)",
        "condition": "Pink Bollworm (Pectinophora gossypiella) Infestation",
        "symptoms": "Rosetted flowers ('rosetted bloom' unable to open), premature boll opening with stained, damaged lint.",
        "chemical_medicines": [
            "Emamectin Benzoate 5% SG (Proclaim) @ 100 g / acre (0.5 g / L).",
            "Profenofos 50% EC @ 400 ml / acre (2 ml / L) or Chlorpyrifos 50% + Cypermethrin 5% EC @ 350 ml / acre.",
            "Spinetoram 11.7% SC (Delegate) @ 170 ml / acre (0.8 ml / L)."
        ],
        "organic_remedy": [
            "Install 8 Pheromone traps (Pectino-lure) per acre from 45 DAS.",
            "Release egg-parasitoid Trichogramma bactrae @ 60,000 / acre at 7-day intervals.",
            "Pick and destroy rosetted flowers manually twice weekly."
        ],
        "precautions": "Rotate chemistries every 15 days to delay insecticide resistance build-up."
    },

    # --- POTATO ---
    {
        "keywords": ["potato", "aalu", "dap", "urea", "fertilizer", "khad", "dose", "bigha", "acre"],
        "crop": "Potato (Aalu)",
        "condition": "Fertilizer Dosages and Nutrient Management for Potato",
        "symptoms": "Low tuber bulking, small potato sizes caused by unbalanced potash and phosphorus.",
        "chemical_medicines": [
            "Per Acre Dosages (150:100:120 kg N:P:K):",
            "• Basal (At Planting): 2 bags DAP (100 kg) + 80 kg MOP (Muriate of Potash) + 50 kg Urea + 10 kg Zinc Sulphate (21%).",
            "• Top Dressing (At Earthing Up / 30-35 DAP): 65 kg Urea broadcast followed by ridging.",
            "• Foliar Booster (45 & 60 DAP): Spray 13-0-45 (Potassium Nitrate) @ 10 g / L for rapid tuber size enlargement.",
            "• Per Bigha (0.4 acre): 40 kg DAP + 32 kg MOP + 45 kg total Urea + 4 kg Zinc."
        ],
        "organic_remedy": [
            "Apply 8-10 tons well-rotted FYM per acre 3 weeks before planting.",
            "Treat seed tubers with bio-fungicide Trichoderma harzianum @ 5 g / kg tuber."
        ],
        "precautions": "High Potash (MOP) is critical for potato skin toughness, disease resistance, and cold storage longevity."
    },
    {
        "keywords": ["potato", "aalu", "late blight", "jhulsa", "black leaf", "rotten tuber"],
        "crop": "Potato (Aalu)",
        "condition": "Potato Late Blight (Phytophthora infestans)",
        "symptoms": "Water-soaked dark lesions on leaf tips turning purplish-black with white cottony mildew under high humidity (>85%).",
        "chemical_medicines": [
            "Preventive (Mandatory before canopy closes): Mancozeb 75% WP @ 2.5 g / L or Chlorothalonil 75% WP @ 2 g / L.",
            "Curative (At first disease appearance): Cymoxanil 8% + Mancozeb 64% WP (Curzate / Sectotin) @ 3 g / L.",
            "Severe Outbreak Rescue: Dimethomorph 50% WP @ 1 g / L or Fenamidone 10% + Mancozeb 50% WG @ 2.5 g / L."
        ],
        "organic_remedy": [
            "Spray Copper Hydroxide 53.8% DF (Kocide) @ 2 g / L.",
            "De-haulm (cut foliage) 10-12 days prior to harvest to prevent tuber contamination during digging."
        ],
        "precautions": "Spray immediately when foggy, cloudy weather with night temperatures 10-18°C persists."
    },

    # --- CHILLI ---
    {
        "keywords": ["chilli", "mirch", "leaf curl", "murda", "thrips", "mites", "peeli"],
        "crop": "Chilli (Mirch)",
        "condition": "Chilli Leaf Curl & Murda Complex (Thrips & Yellow Mites)",
        "symptoms": "Upward curling (boat-shaped) = Thrips. Downward curling (inverted cup) = Mites. Brittle leaves, flower dropping.",
        "chemical_medicines": [
            "For Thrips (Upward curl): Fipronil 5% SC (Regent) @ 1.5 ml / L or Spinetoram 11.7% SC (Delegate) @ 0.8 ml / L.",
            "For Yellow Mites (Downward curl): Spiromesifen 22.9% SC (Oberon) @ 1 ml / L or Fenpyroximate 5% EC @ 1.5 ml / L.",
            "Combined Combo: Diafenthiuron 50% WP (Pegasus) @ 1.25 g / L (Controls both thrips & mites simultaneously)."
        ],
        "organic_remedy": [
            "Install Blue sticky traps for thrips and Yellow sticky traps for whiteflies (15 each / acre).",
            "Spray Neem Seed Kernel Extract (NSKE 5%) or Pongamia (Karanj) oil @ 3 ml / L.",
            "Foliar spray sour buttermilk (fermented for 5 days) @ 30 ml / L for systemic plant vigor."
        ],
        "precautions": "Thrips hide inside floral buds; ensure deep droplet penetration with a hollow cone nozzle."
    },

    # --- MUSTARD ---
    {
        "keywords": ["mustard", "sarson", "aphid", "maho", "chepa", "tela", "green insect"],
        "crop": "Mustard (Sarson / Raya)",
        "condition": "Mustard Aphid (Lipaphis erysimi) Infestation",
        "symptoms": "Dense colonies of green aphids clustering on terminal flower buds, inflorescence curving and failing to set pods.",
        "chemical_medicines": [
            "Thiamethoxam 25% WG (Actara) @ 80 g / acre (0.4 g / L water).",
            "Dimethoate 30% EC (Rogor) @ 1.5 ml / L water.",
            "Imidacloprid 17.8% SL (Confidor) @ 0.5 ml / L water."
        ],
        "organic_remedy": [
            "Spray 5% Neem Seed Kernel Extract (NSKE) or Neem oil 3000 ppm @ 3 ml / L at initial sighting.",
            "Conserve beneficial predators: Ladybird beetles (Coccinella septempunctata) which devour 50 aphids/day."
        ],
        "precautions": "Spray in late afternoon (after 3 PM) to avoid harming foraging honeybee pollinators."
    },

    # --- DROUGHT & SANDY SOIL ---
    {
        "keywords": ["sandy soil", "low water", "drought", "sukha", "kam paani", "retili mitti", "what crop"],
        "crop": "Arid / Sandy Soils (Retili Mitti)",
        "condition": "Best High-Return Crops for Sandy Soils and Low Water Availability",
        "symptoms": "Low water retention, high percolation, rapid surface drying.",
        "chemical_medicines": [
            "1. Pearl Millet (Bajra / Hybrid): Matures in 75-85 days with just 250-350 mm rain. Excellent fodder + grain.",
            "2. Cluster Bean (Guar): Deep taproot penetrates 2 meters, fixes atmospheric nitrogen, commands strong industrial gum price.",
            "3. Moth Bean & Moong: Extremely drought-hardy legumes, matures in 60 days, enriches soil nitrogen.",
            "4. Castor (Arandi): High economic return in sandy loam soils with minimal supplementary drip watering.",
            "5. Mustard / Taramira (Rabi): Requires only 1-2 irrigations throughout entire lifecycle.",
            "6. Horticulture options: Pomegranate (Anar), Ber, and Date Palm."
        ],
        "organic_remedy": [
            "Incorporate Hydrogel @ 2.5 kg / acre or farmyard manure (FYM) to increase soil water holding capacity by 40%.",
            "Mulch with straw or crop residues to prevent soil moisture evaporation."
        ],
        "precautions": "Adopt drip irrigation to avoid 60% water loss through deep percolation in sandy terrain."
    },

    # --- GOVERNMENT SCHEMES ---
    {
        "keywords": ["kisan samman nidhi", "pm kisan", "samman nidhi", "status", "installment", "kist", "paisa"],
        "crop": "Government Support (PM-KISAN)",
        "condition": "PM-KISAN Samman Nidhi Status & Installment Verification",
        "symptoms": "Farmers inquiring about pending Rs 2,000 installment, registration status, or rejection reasons.",
        "chemical_medicines": [
            "How to Check PM-KISAN Status Step-by-Step:",
            "1. Visit the official portal: https://pmkisan.gov.in",
            "2. Click on 'Know Your Status' in the Farmer's Corner.",
            "3. Enter your Registration Number and Captcha code (Click 'Know your registration no.' if forgotten using Aadhaar/Mobile).",
            "4. Verify the 3 Essential Eligibility Checks:",
            "   • Land Seeding: Must show 'YES' (If 'NO', visit District Tehsil/Agriculture office with Khatauni land deed).",
            "   • e-KYC Done: Must show 'YES' (Complete OTP e-KYC on portal or biometric at nearest CSC centre).",
            "   • Aadhaar Bank Account-Seeding: Must show 'YES' (Ensure bank account is NPCI/DBT enabled).",
            "Helpline: Call PM-KISAN Toll-Free 155261 or 011-24300606 for direct resolution."
        ],
        "organic_remedy": [
            "Kisan Credit Card (KCC): Contact your local rural bank branch for concessional 4% crop loan facility."
        ],
        "precautions": "Beware of fraudulent SMS links asking for banking OTPs; only use the official pmkisan.gov.in portal."
    }
]
