// ================= 1. IMPORTS =================
import { useState } from "react";
import { Pill, Leaf, AlertTriangle, Volume2, X } from "lucide-react";

// ================= 2. TYPES =================
type Language = "en" | "hi" | "hinglish" | "mr" | "gu" | "te" | "ta";

type Usage = {
  description: {
    medicine: string;
    fertilizer: string;
  };
  medicine: string[];
  fertilizer: string[];
};

type DiseaseInfo = {
  medicine: string[];
  fertilizer: string[];
  usage: Record<Language, Usage>;
};

// ================= 3. TRANSLATION DICTIONARY =================
// Add your chemical and fertilizer translations here. 
// If a translation is missing, it will automatically fall back to English.
// ================= 3. TRANSLATION DICTIONARY =================
// ================= 3. TRANSLATION DICTIONARY =================
const translationsMap: Record<string, Partial<Record<Language, string>>> = {
  // --- MEDICINES ---
  "Tricyclazole": { hi: "ट्राइसाइक्लाजोल", mr: "ट्रायसायक्लाझोल", gu: "ટ્રાયસાયક્લાઝોલ", te: "ట్రైసైక్లాజోల్", ta: "ட்ரைசைக்லாசோல்" },
  "Isoprothiolane": { hi: "आइसोप्रोथियोलेन", mr: "आयसोप्रोथिओलेन", gu: "આઇસોપ્રોથિઓલેન", te: "ఐసోప్రోథియోలేన్", ta: "ஐசோப்ரோதயோலேன்" },
  "Metalaxyl + Mancozeb": { hi: "मेटालेक्सिल + मैनकोजेब", mr: "मेटालॅक्सिल + मॅन्कोझेब", gu: "મેટાલેક્સિલ + મેન્કોઝેબ", te: "మెటలాక్సిల్ + మాంకోజెబ్", ta: "மெட்டாலாக்சில் + மாங்கோசெப்" },
  "Chlorothalonil": { hi: "क्लोरोथालोनिल", mr: "क्लोरोथालोनिल", gu: "ક્લોરોથાલોનિલ", te: "క్లోరోథలోనిల్", ta: "குளோரோதலோனில்" },
  "Imidacloprid": { hi: "इमिडाक्लोप्रिड", mr: "इमिडाक्लोप्रिड", gu: "ઇમિડાક્લોપ્રિડ", te: "ఇమిడాక్లోప్రిడ్", ta: "இமிடாக்ளோபிரிட்" },
  "Thiamethoxam": { hi: "थायमेथोक्सम", mr: "थायमेथोक्सम", gu: "થાયામેથોક્સમ", te: "థియామెథోక్సామ్", ta: "தியாமெதோக்ஸாம்" },
  "Propiconazole": { hi: "प्रोपिकोनाजोल", mr: "प्रोपिकोनाझोल", gu: "પ્રોપીકોનાઝોલ", te: "ప్రోపికోనజోల్", ta: "புரோபிகோனசோல்" },
  "Tebuconazole": { hi: "टेबुकोनाजोल", mr: "टेब्युकोनाझोल", gu: "ટેબ્યુકોનાઝોલ", te: "టెబుకోనజోల్", ta: "டெபுகோனசோல்" },
  "Azoxystrobin": { hi: "एजोक्सीस्ट्रोबिन", mr: "अझोक्सिस्ट्रोबिन", gu: "એઝોક્સીસ્ટ્રોબિન", te: "అజోక్సిస్ట్రోబిన్", ta: "அசோக்ஸிஸ்ட்ரோபின்" },
  "Neem oil spray": { hi: "नीम तेल स्प्रे", mr: "निंबोळी तेल फवारणी", gu: "લીમડાના તેલનો સ્પ્રે", te: "వేప నూనె స్ప్రే", ta: "வேப்ப எண்ணெய் ஸ்ப்ரே" },
  "Copper oxychloride": { hi: "कॉपर ऑक्सीक्लोराइड", mr: "कॉपर ऑक्सीक्लोराईड", gu: "કોપર ઓક્સિક્લોરાઇડ", te: "కాపర్ ఆక్సిక్లోరైడ్", ta: "காப்பர் ஆக்ஸிகுளோரைடு" },
  "Streptomycin sulfate": { hi: "स्ट्रेप्टोमाइसिन सल्फेट", mr: "स्ट्रेप्टोमायसिन सल्फेट", gu: "સ્ટ્રેપ્ટોમાસીન સલ્ફેટ", te: "స్ట్రెప్టోమైసిన్ సల్ఫేట్", ta: "ஸ்ட்ரெப்டோமைசின் சல்பேட்" },
  "Mancozeb": { hi: "मैनकोजेब", mr: "मॅन्कोझेब", gu: "મેન્કોઝેબ", te: "మాంకోజెబ్", ta: "மாங்கோசெப்" },
  "Carbendazim": { hi: "कार्बेंडाजिम", mr: "कार्बेंडाझिम", gu: "કાર્બેન્ડાઝિમ", te: "కార్బెండజిమ్", ta: "கார்பென்டாசிம்" },
  "Thiophanate methyl": { hi: "थियोफेनेट मिथाइल", mr: "थियोफेनेट मिथाइल", gu: "થિયોફેનેટ મિથાઇલ", te: "థియోఫానేట్ మిథైల్", ta: "தியோபனேட் மெத்தில்" },
  "Metalaxyl": { hi: "मेटालेक्सिल", mr: "मेटालॅक्सिल", gu: "મેટાલેક્સિલ", te: "మెటలాక్సిల్", ta: "மெட்டாலாக்சில்" },

  // --- FERTILIZERS & NPK ---
  "NPK 20-20-20": { hi: "एनपीके 20-20-20 खाद", mr: "एनपीके 20-20-20 खत", gu: "NPK 20-20-20 ખાતર", te: "NPK 20-20-20 ఎరువు", ta: "NPK 20-20-20 உரம்" },
  "NPK 19-19-19": { hi: "एनपीके 19-19-19 खाद", mr: "एनपीके 19-19-19 खत", gu: "NPK 19-19-19 ખાતર", te: "NPK 19-19-19 ఎరువు", ta: "NPK 19-19-19 உரம்" },
  "NPK 15-15-15": { hi: "एनपीके 15-15-15 खाद", mr: "एनपीके 15-15-15 खत", gu: "NPK 15-15-15 ખાતર", te: "NPK 15-15-15 ఎరువు", ta: "NPK 15-15-15 உரம்" },
  "Silicon fertilizer": { hi: "सिलिकॉन खाद", mr: "सिलिकॉन खत", gu: "સિલિકોન ખાતર", te: "సిలికాన్ ఎరువు", ta: "சிலிக்கான் உரம்" },
  "Potassium-rich fertilizer": { hi: "पोटेशियम युक्त खाद", mr: "पोटॅशियम युक्त खत", gu: "પોટેશિયમ ખાતર", te: "పొటాషియం ఎరువు", ta: "பொட்டாசியம் உரம்" },
  "Calcium nitrate": { hi: "कैल्शियम नाइट्रेट", mr: "कॅल्शियम नायट्रेट", gu: "કેલ્શિયમ નાઈટ્રેટ", te: "కాల్షియం నైట్రేట్", ta: "கால்சியம் நைட்ரேட்" },
  "Organic compost": { hi: "जैविक खाद", mr: "सेंद्रिय खत", gu: "સેન્દ્રીય ખાતર", te: "సేంద్రియ ఎరువు", ta: "கரிம உரம்" },
  "Potassium sulfate": { hi: "पोटेशियम सल्फेट", mr: "पोटॅशियम सल्फेट", gu: "પોટેશિયમ સલ્ફેટ", te: "పొటాషియం సల్ఫేట్", ta: "பொட்டாசியம் சல்பேட்" },
  "Nitrogen fertilizer": { hi: "नाइट्रोजन खाद", mr: "नायट्रोजन खत", gu: "નાઇટ્રોજન ખાતર", te: "నత్రజని ఎరువు", ta: "நைட்ரஜன் உரம்" },
  "Zinc sulfate": { hi: "जिंक सल्फेट", mr: "झिंक सल्फेट", gu: "ઝીંક સલ્ફેટ", te: "జింక్ సల్ఫేట్", ta: "துத்தநாக சல்பேட்" },
  "Sulfur fertilizer": { hi: "सल्फर (गंधक) खाद", mr: "गंधक खत", gu: "સલ્ફર ખાતર", te: "గంధకము ఎరువు", ta: "கந்தக உரம்" },
  "Compost manure": { hi: "कम्पोस्ट खाद", mr: "कंपोस्ट खत", gu: "કમ્પોસ્ટ ખાતર", te: "కంపోస్ట్ ఎరువు", ta: "கம்போஸ்ட் உரம்" },
  "Potassium fertilizer": { hi: "पोटेशियम खाद", mr: "पोटॅशियम खत", gu: "પોટેશિયમ ખાતર", te: "పొటాషియం ఎరువు", ta: "பொட்டாசியம் உரம்" },
  "Vermicompost": { hi: "वर्मीकम्पोस्ट खाद", mr: "गांडूळ खत", gu: "અળસિયાનું ખાતર", te: "వానపాముల ఎరువు", ta: "மண்புழு உரம்" },
  "Micronutrient mix": { hi: "सूक्ष्म पोषक तत्व मिश्रण", mr: "सूक्ष्म अन्नद्रव्ये मिश्रण", gu: "સૂક્ષ્મ પોષકતત્વો", te: "సూక్ష్మ పోషకాలు", ta: "நுண்ணூட்டச் சத்துக்கள்" },
  "Organic manure": { hi: "जैविक खाद", mr: "सेंद्रिय खत", gu: "સેન્દ્રીય ખાતર", te: "సేంద్రియ ఎరువు", ta: "கரிம உரம்" },
  "Zinc supplement": { hi: "जिंक सप्लीमेंट", mr: "झिंक सप्लीमेंट", gu: "ઝીંક સપ્લીમેન્ટ", te: "జింక్ సప్లిమెంట్", ta: "துத்தநாக சப்ளிமெண்ட்" },
  "Farmyard manure": { hi: "गोबर की खाद", mr: "शेणखत", gu: "છાણિયું ખાતર", te: "పశువుల ఎరువు", ta: "தொழு உரம்" },
  "Compost": { hi: "कम्पोस्ट", mr: "कंपोस्ट खत", gu: "કમ્પોસ્ટ", te: "కంపోస్ట్", ta: "கம்போஸ்ட்" },
  "Phosphorus-rich fertilizer": { hi: "फास्फोरस युक्त खाद", mr: "फॉस्फरस युक्त खत", gu: "ફોસ્ફરસ ખાતર", te: "భాస్వరం ఎరువు", ta: "பாஸ்பரஸ் உரம்" },
};
// ================= 4. COMPONENT =================
export function MarketplacePage() {

  // ================= 5. STATES =================
  const [selectedDisease, setSelectedDisease] = useState<string>(
    "Rice Leaf Blast (Magnaporthe grisea)"
  );
  const [language, setLanguage] = useState<Language>("en");
  const [showModal, setShowModal] = useState<string | null>(null);

  // Helper function to translate item names dynamically
  const t = (name: string, lang: Language) => {
    if (lang === "en") return name;
    return translationsMap[name]?.[lang] || name; // Falls back to English if no translation is found
  };

  // ================= 6. STATIC TEXT =================
  const text = {
    en: { title: "Marketplace", medicines: "Suggested Medicines", fertilizers: "Suggested Fertilizers", speak: "Speak Steps", buy: "Buy", warning: "Always consult an agricultural expert before applying chemicals." },
    hi: { title: "मार्केटप्लेस", medicines: "दवाइयाँ", fertilizers: "खाद", speak: "सुनें", buy: "खरीदें", warning: "विशेषज्ञ से सलाह लें" },
    hinglish: { title: "Marketplace", medicines: "Dawai", fertilizers: "Khad", speak: "Suno", buy: "Buy karo", warning: "Use se pehle expert se pucho" },
    mr: { title: "मार्केट", medicines: "औषधे", fertilizers: "खते", speak: "ऐका", buy: "खरेदी", warning: "तज्ञांचा सल्ला घ्या" },
    gu: { title: "માર્કેટ", medicines: "દવા", fertilizers: "ખાતર", speak: "સાંભળો", buy: "ખરીદો", warning: "સલાહ લો" },
    te: { title: "మార్కెట్", medicines: "మందులు", fertilizers: "ఎరువులు", speak: "వినండి", buy: "కొనండి", warning: "సలహా తీసుకోండి" },
    ta: { title: "மார்க்கெட்", medicines: "மருந்து", fertilizers: "உரம்", speak: "கேளுங்கள்", buy: "வாங்கவும்", warning: "ஆலோசனை பெறவும்" },
  };

  // ================= 7. USAGE FUNCTION =================
  const getUsage = (disease: string): Record<Language, Usage> => ({
    en: {
      description: { medicine: `Proper treatment of ${disease} requires correct spraying.`, fertilizer: `Balanced fertilizers help recovery from ${disease}.` },
      medicine: ["Step 1: Identify infected leaves or plant parts.", "Step 2: Mix medicine with water as per label instructions.", "Step 3: Fill spray pump and shake properly.", "Step 4: Spray on both upper and lower leaf surfaces.", "Step 5: Spray in morning or evening only.", "Step 6: Avoid spraying during rain or strong sunlight.", "Step 7: Repeat every 5–7 days.", "Step 8: Wear gloves and mask."],
      fertilizer: ["Step 1: Check soil moisture before applying fertilizer.", "Step 2: Apply fertilizer near root zone.", "Step 3: Keep 3–5 cm distance from stem.", "Step 4: Use balanced NPK fertilizer.", "Step 5: Add micronutrients if required.", "Step 6: Irrigate after application.", "Step 7: Repeat every 15–20 days."],
    },
    hi: {
      description: { medicine: `${disease} के लिए सही दवा का उपयोग करें`, fertilizer: `संतुलित खाद पौधे को ठीक करती है` },
      medicine: ["स्टेप 1: संक्रमित पत्तियों की पहचान करें", "स्टेप 2: दवा को पानी में मिलाएं", "स्टेप 3: स्प्रे पंप में भरें", "स्टेप 4: पत्तियों पर दोनों तरफ छिड़काव करें", "स्टेप 5: सुबह या शाम छिड़काव करें", "स्टेप 6: बारिश में स्प्रे न करें", "स्टेप 7: हर 5-7 दिन में दोहराएं"],
      fertilizer: ["स्टेप 1: मिट्टी की नमी जांचें", "स्टेप 2: जड़ों के पास खाद डालें", "स्टेप 3: तने से दूरी रखें", "स्टेप 4: NPK खाद का उपयोग करें", "स्टेप 5: पानी दें", "स्टेप 6: हर 15 दिन में दोहराएं"],
    },
    hinglish: {
      description: { medicine: `${disease} ke liye sahi dawai use karo`, fertilizer: `plant recovery ke liye khad zaroori hai` },
      medicine: ["Step 1: infected leaves identify karo", "Step 2: dawai pani me mix karo", "Step 3: spray pump me daalo", "Step 4: leaves ke dono side spray karo", "Step 5: subah ya shaam spray karo", "Step 6: rain me spray mat karo", "Step 7: 5-7 din me repeat karo"],
      fertilizer: ["Step 1: soil check karo", "Step 2: jad ke paas khad daalo", "Step 3: stem se distance rakho", "Step 4: NPK use karo", "Step 5: paani do", "Step 6: 15 din me repeat karo"],
    },
    mr: {
      description: { medicine: `${disease} साठी औषध वापरा`, fertilizer: `खते पिक सुधारतात` },
      medicine: ["स्टेप 1: संक्रमित पाने ओळखा", "स्टेप 2: औषध पाण्यात मिसळा", "स्टेप 3: फवारणी करा", "स्टेप 4: सकाळ/संध्याकाळ करा", "स्टेप 5: पाऊस टाळा", "स्टेप 6: 5-7 दिवसांनी पुन्हा करा"],
      fertilizer: ["स्टेप 1: माती तपासा", "स्टेप 2: मुळांजवळ खत टाका", "स्टेप 3: अंतर ठेवा", "स्टेप 4: NPK वापरा", "स्टेप 5: पाणी द्या"],
    },
    gu: {
      description: { medicine: `${disease} માટે દવા ઉપયોગ કરો`, fertilizer: `ખાતર ઉપયોગ કરો` },
      medicine: ["પગલું 1: પાંદડાં તપાસો", "પગલું 2: દવા પાણીમાં મિક્સ કરો", "પગલું 3: સ્પ્રે કરો", "પગલું 4: સવારે કે સાંજે કરો", "પગલું 5: વરસાદ ટાળો"],
      fertilizer: ["પગલું 1: જમીન તપાસો", "પગલું 2: ખાતર નાખો", "પગલું 3: પાણી આપો"],
    },
    te: {
      description: { medicine: `${disease} కోసం మందు వాడండి`, fertilizer: `ఎరువు ఉపయోగించండి` },
      medicine: ["దశ 1: ఆకులు పరిశీలించండి", "దశ 2: మందు కలపండి", "దశ 3: స్ప్రే చేయండి", "దశ 4: ఉదయం లేదా సాయంత్రం చేయండి"],
      fertilizer: ["దశ 1: నేల చూడండి", "దశ 2: ఎరువు వేయండి", "దశ 3: నీరు పోయండి"],
    },
    ta: {
      description: { medicine: `${disease} க்கு மருந்து பயன்படுத்தவும்`, fertilizer: `உரம் பயன்படுத்தவும்` },
      medicine: ["படி 1: இலைகளை சரிபார்க்கவும்", "படி 2: மருந்தை கலக்கவும்", "படி 3: தெளிக்கவும்", "படி 4: காலை அல்லது மாலை செய்யவும்"],
      fertilizer: ["படி 1: மண் பார்க்கவும்", "படி 2: உரம் போடவும்", "படி 3: நீர் ஊற்றவும்"],
    },
  });

  // ================= 8. DISEASE DATA =================
  const diseaseData: Record<string, DiseaseInfo> = {
    "Rice Leaf Blast (Magnaporthe grisea)": { medicine: ["Tricyclazole", "Isoprothiolane"], fertilizer: ["NPK 20-20-20", "Silicon fertilizer"], usage: getUsage("Rice Leaf Blast") },
    "Tomato Late Blight (Phytophthora infestans)": { medicine: ["Metalaxyl + Mancozeb", "Chlorothalonil"], fertilizer: ["Potassium-rich fertilizer", "Calcium nitrate"], usage: getUsage("Tomato Late Blight") },
    "Banana Bunchy Top Virus (BBTV)": { medicine: ["Imidacloprid", "Thiamethoxam"], fertilizer: ["Organic compost", "Potassium sulfate"], usage: getUsage("Banana Virus") },
    "Wheat Brown Rust": { medicine: ["Propiconazole", "Tebuconazole"], fertilizer: ["Nitrogen fertilizer", "Zinc sulfate"], usage: getUsage("Wheat Rust") },
    "Wheat Yellow Rust": { medicine: ["Azoxystrobin", "Tebuconazole"], fertilizer: ["NPK 19-19-19", "Sulfur fertilizer"], usage: getUsage("Wheat Yellow Rust") },
    "Potato Early Blight (Alternaria solani)": { medicine: ["Chlorothalonil", "Azoxystrobin"], fertilizer: ["Compost manure", "Potassium fertilizer"], usage: getUsage("Potato Blight") },
    "Tomato Yellow Leaf Curl Virus (ToLCNDV)": { medicine: ["Imidacloprid", "Neem oil spray"], fertilizer: ["Vermicompost", "Micronutrient mix"], usage: getUsage("Tomato Virus") },
    "Citrus Canker (Xanthomonas axonopodis)": { medicine: ["Copper oxychloride", "Streptomycin sulfate"], fertilizer: ["Organic manure", "NPK 15-15-15"], usage: getUsage("Citrus Canker") },
    "Corn/Maize Common Rust (Puccinia sorghi)": { medicine: ["Mancozeb", "Azoxystrobin"], fertilizer: ["Nitrogen fertilizer", "Zinc supplement"], usage: getUsage("Maize Rust") },
    "Sugarcane Red Rot (Colletotrichum falcatum)": { medicine: ["Carbendazim", "Thiophanate methyl"], fertilizer: ["Farmyard manure", "Potassium fertilizer"], usage: getUsage("Sugarcane Rot") },
    "Cucumber/Muskmelon Downy Mildew (Pseudoperonospora)": { medicine: ["Metalaxyl", "Mancozeb"], fertilizer: ["Compost", "Phosphorus-rich fertilizer"], usage: getUsage("Downy Mildew") },
  };

  const diseases = Object.keys(diseaseData);
  const current = diseaseData[selectedDisease];

  // ================= 9. FUNCTIONS =================
  const speak = (steps: string[]) => {
    const msg = new SpeechSynthesisUtterance(steps.join(". "));
    speechSynthesis.speak(msg);
  };

  // ================= 10. UI =================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          {text[language].title}
        </h1>

        {/* Dropdowns */}
        <div className="flex gap-4 mb-6">
          <select
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            {diseases.map((d) => <option key={d}>{d}</option>)}
          </select>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800"
          >
            <option value="en">English</option>
            <option value="hi">Hindi (हिंदी)</option>
            <option value="hinglish">Hinglish</option>
            <option value="mr">Marathi (मराठी)</option>
            <option value="gu">Gujarati (ગુજરાતી)</option>
            <option value="te">Telugu (తెలుగు)</option>
            <option value="ta">Tamil (தமிழ்)</option>
          </select>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Medicine */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center mb-3">
              <Pill className="text-red-500 mr-2" />
              <h2 className="text-xl font-semibold">{text[language].medicines}</h2>
            </div>

            {current.medicine.map((med, i) => {
              const translatedMed = t(med, language); // TRANSLATE HERE
              return (
                <div key={i} className="flex justify-between mb-2">
                  <span>{translatedMed}</span>
                  <button onClick={() => setShowModal(translatedMed)} className="text-blue-500">
                    {text[language].buy}
                  </button>
                </div>
              );
            })}

            <button onClick={() => speak(current.usage[language].medicine)} className="mt-3 flex items-center gap-2 text-green-600">
              <Volume2 /> {text[language].speak}
            </button>

            {current.usage[language].medicine.map((step, i) => (
              <p key={i} className="mt-2">👉 {step}</p>
            ))}
          </div>

          {/* Fertilizer */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <div className="flex items-center mb-3">
              <Leaf className="text-green-500 mr-2" />
              <h2 className="text-xl font-semibold">{text[language].fertilizers}</h2>
            </div>

            {current.fertilizer.map((fert, i) => {
              const translatedFert = t(fert, language); // TRANSLATE HERE
              return (
                <div key={i} className="flex justify-between mb-2">
                  <span>{translatedFert}</span>
                  <button onClick={() => setShowModal(translatedFert)} className="text-blue-500">
                    {text[language].buy}
                  </button>
                </div>
              );
            })}

            <button onClick={() => speak(current.usage[language].fertilizer)} className="mt-3 flex items-center gap-2 text-green-600">
              <Volume2 /> {text[language].speak}
            </button>

            {current.usage[language].fertilizer.map((step, i) => (
              <p key={i} className="mt-2">👉 {step}</p>
            ))}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-xl relative w-80">
              <button onClick={() => setShowModal(null)} className="absolute top-2 right-2">
                <X />
              </button>
              <p className="text-center font-bold">{showModal}</p>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="mt-6 p-4 bg-yellow-100 rounded-lg flex items-center text-black">
          <AlertTriangle className="mr-2" />
          {text[language].warning}
        </div>

      </div>
    </div>
  );
}