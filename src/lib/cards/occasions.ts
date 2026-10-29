import type { LanguageCode } from "@/lib/i18n/dictionaries";

/**
 * Occasions the card maker knows. Greetings are written out in every language
 * (never machine-translated at request time) so a Gujarati card always says it the
 * way Gujarati speakers say it. Order is the order shown to the shopkeeper.
 */
export type OccasionId =
  | "diwali" | "dhanteras" | "bhaidooj" | "newyear" | "holi" | "eid" | "navratri" | "ganesh" | "rakhi" | "pongal" | "christmas"
  | "sankranti" | "uttarayan" | "puthandu" | "ugadi" | "rajyotsava" | "chhath" | "akshaya" | "ramnavami" | "republic" | "independence"
  | "sale" | "thanks";

export type Occasion = {
  id: OccasionId;
  label: Record<LanguageCode, string>;
  /** Plain words the shopkeeper might type, in any language, to pick this occasion. */
  keywords: string[];
  /** What the background picture should show. Never includes text or people's faces. */
  scene: string;
};

const L = (en: string, hi: string, mr: string, gu: string, ta: string, te: string, kn: string): Record<LanguageCode, string> =>
  ({ en, hi, mr, gu, ta, te, kn });

export const OCCASIONS: Occasion[] = [
  {
    id: "diwali", label: L("Happy Diwali", "दिवाली की हार्दिक शुभकामनाएँ", "दिवाळीच्या हार्दिक शुभेच्छा", "દિવાળીની હાર્દિક શુભેચ્છાઓ", "தீபாவளி நல்வாழ்த்துகள்", "దీపావళి శుభాకాంక్షలు", "ದೀಪಾವಳಿಯ ಶುಭಾಶಯಗಳು"),
    keywords: ["diwali", "deepavali", "dipawali", "दिवाली", "दीपावली", "दिवाळी", "દિવાળી", "தீபாவளி", "దీపావళి", "ದೀಪಾವಳಿ"],
    scene: "glowing brass diyas, marigold flowers and soft golden light on a dark background",
  },
  {
    id: "dhanteras", label: L("Happy Dhanteras", "धनतेरस की हार्दिक शुभकामनाएँ", "धनत्रयोदशीच्या हार्दिक शुभेच्छा", "ધનતેરસની હાર્દિક શુભેચ્છાઓ", "தன்தேரஸ் நல்வாழ்த்துகள்", "ధన్‌తేరస్ శుభాకాంక్షలు", "ಧನತೇರಸ್ ಶುಭಾಶಯಗಳು"),
    keywords: ["dhanteras", "dhanatrayodashi", "धनतेरस", "धनत्रयोदशी", "ધનતેરસ", "தன்தேரஸ்", "ధన్‌తేరస్", "ಧನತೇರಸ್"],
    scene: "gold coins, a brass kalash and marigold flowers with soft golden light",
  },
  {
    id: "bhaidooj", label: L("Happy Bhai Dooj", "भाई दूज की हार्दिक शुभकामनाएँ", "भाऊबीजेच्या हार्दिक शुभेच्छा", "ભાઈ બીજની હાર્દિક શુભેચ્છાઓ", "பாய் தூஜ் வாழ்த்துகள்", "భాయ్ దూజ్ శుభాకాంక్షలు", "ಭಾಯಿ ದೂಜ್ ಶುಭಾಶಯಗಳು"),
    keywords: ["bhai dooj", "bhaidooj", "bhau beej", "bhai beej", "भाई दूज", "भाऊबीज", "ભાઈ બીજ", "பாய் தூஜ்", "భాయ్ దూజ్", "ಭಾಯಿ ದೂಜ್"],
    scene: "a decorated puja thali with a tilak, rose petals and sweets",
  },
  {
    id: "newyear", label: L("Happy New Year", "नववर्ष की हार्दिक शुभकामनाएँ", "नववर्षाच्या हार्दिक शुभेच्छा", "નવા વર્ષની હાર્દિક શુભેચ્છાઓ", "புத்தாண்டு நல்வாழ்த்துகள்", "నూతన సంవత్సర శుభాకాంక్షలు", "ಹೊಸ ವರ್ಷದ ಶುಭಾಶಯಗಳು"),
    keywords: ["new year", "newyear", "नववर्ष", "नया साल", "નવું વર્ષ", "નવા વર્ષ", "புத்தாண்டு", "నూతన సంవత్సర", "ಹೊಸ ವರ್ಷ"],
    scene: "soft golden sparkles and bokeh lights on a deep colour background",
  },
  {
    id: "holi", label: L("Happy Holi", "होली की हार्दिक शुभकामनाएँ", "होळीच्या हार्दिक शुभेच्छा", "હોળીની હાર્દિક શુભેચ્છાઓ", "ஹோலி நல்வாழ்த்துகள்", "హోలీ శుభాకాంక్షలు", "ಹೋಳಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು"),
    keywords: ["holi", "होली", "होळी", "હોળી", "ஹோலி", "హోలీ", "ಹೋಳಿ"],
    scene: "bursts of colourful gulal powder in pink, yellow, green and blue",
  },
  {
    id: "eid", label: L("Eid Mubarak", "ईद मुबारक", "ईद मुबारक", "ઈદ મુબારક", "ஈத் முபாரக்", "ఈద్ ముబారక్", "ಈದ್ ಮುಬಾರಕ್"),
    keywords: ["eid", "id mubarak", "ईद", "ઈદ", "ஈத்", "ఈద్", "ಈದ್"],
    scene: "a crescent moon, hanging lanterns and soft glowing stars on a deep green background",
  },
  {
    id: "navratri", label: L("Happy Navratri", "नवरात्रि की हार्दिक शुभकामनाएँ", "नवरात्रीच्या हार्दिक शुभेच्छा", "નવરાત્રિની હાર્દિક શુભેચ્છાઓ", "நவராத்திரி நல்வாழ்த்துகள்", "నవరాత్రి శుభాకాంక్షలు", "ನವರಾತ್ರಿಯ ಶುಭಾಶಯಗಳು"),
    keywords: ["navratri", "navaratri", "garba", "dandiya", "नवरात्रि", "नवरात्री", "નવરાત્રિ", "નવરાત્રી", "நவராத்திரி", "నవరాత్రి", "ನವರಾತ್ರಿ"],
    scene: "colourful dandiya sticks and festive mirror-work fabric patterns",
  },
  {
    id: "ganesh", label: L("Ganpati Bappa Morya", "गणपति बप्पा मोरया", "गणपती बाप्पा मोरया", "ગણપતિ બાપ્પા મોરિયા", "கணபதி பப்பா மோரியா", "గణపతి బప్పా మోరియా", "ಗಣಪತಿ ಬಪ್ಪಾ ಮೋರಯಾ"),
    keywords: ["ganesh", "ganpati", "ganesha", "chaturthi", "गणेश", "गणपति", "गणपती", "ગણેશ", "ગણપતિ", "விநாயகர்", "గణేశ", "ಗಣೇಶ"],
    scene: "red hibiscus flowers, modak sweets and marigold garlands",
  },
  {
    id: "rakhi", label: L("Happy Raksha Bandhan", "रक्षाबंधन की हार्दिक शुभकामनाएँ", "रक्षाबंधनाच्या हार्दिक शुभेच्छा", "રક્ષાબંધનની હાર્દિક શુભેચ્છાઓ", "ரக்ஷா பந்தன் நல்வாழ்த்துகள்", "రక్షాబంధన్ శుభాకాంక్షలు", "ರಕ್ಷಾ ಬಂಧನದ ಶುಭಾಶಯಗಳು"),
    keywords: ["rakhi", "raksha bandhan", "rakshabandhan", "राखी", "रक्षाबंधन", "રાખડી", "રક્ષાબંધન"],
    scene: "ornate rakhi threads with beads, a puja thali and rose petals",
  },
  {
    id: "pongal", label: L("Happy Pongal", "पोंगल की हार्दिक शुभकामनाएँ", "पोंगलच्या हार्दिक शुभेच्छा", "પોંગલની હાર્દિક શુભેચ્છાઓ", "பொங்கல் வாழ்த்துகள்", "పొంగల్ శుభాకాంక్షలు", "ಪೊಂಗಲ್ ಶುಭಾಶಯಗಳು"),
    keywords: ["pongal", "sankranti", "makar sankranti", "पोंगल", "संक्रांति", "પોંગલ", "பொங்கல்", "పొంగల్", "ಪೊಂಗಲ್"],
    scene: "a clay pot of pongal boiling over, sugarcane stalks and kolam patterns",
  },
  {
    id: "christmas", label: L("Merry Christmas", "क्रिसमस की हार्दिक शुभकामनाएँ", "नाताळच्या हार्दिक शुभेच्छा", "નાતાલની હાર્દિક શુભેચ્છાઓ", "கிறிஸ்துமஸ் நல்வாழ்த்துகள்", "క్రిస్మస్ శుభాకాంక్షలు", "ಕ್ರಿಸ್ಮಸ್ ಶುಭಾಶಯಗಳು"),
    keywords: ["christmas", "xmas", "क्रिसमस", "नाताळ", "નાતાલ", "கிறிஸ்துமஸ்", "క్రిస్మస్", "ಕ್ರಿಸ್ಮಸ್"],
    scene: "pine branches, red baubles and warm fairy lights",
  },
  {
    id: "sankranti", label: L("Happy Makar Sankranti", "मकर संक्रांति की हार्दिक शुभकामनाएँ", "मकर संक्रांतीच्या हार्दिक शुभेच्छा", "મકરસંક્રાંતિની હાર્દિક શુભેચ્છાઓ", "மகர சங்கராந்தி வாழ்த்துகள்", "మకర సంక్రాంతి శుభాకాంక్షలు", "ಮಕರ ಸಂಕ್ರಾಂತಿಯ ಶುಭಾಶಯಗಳು"),
    keywords: ["sankranti", "makar", "til gul", "संक्रांति", "संक्रांत", "સંક્રાંતિ", "சங்கராந்தி", "సంక్రాంతి", "ಸಂಕ್ರಾಂತಿ"],
    scene: "colourful kites in a clear sky, sesame sweets and sugarcane",
  },
  {
    id: "uttarayan", label: L("Happy Uttarayan", "उत्तरायण की हार्दिक शुभकामनाएँ", "उत्तरायणाच्या हार्दिक शुभेच्छा", "ઉત્તરાયણની હાર્દિક શુભેચ્છાઓ", "உத்தராயண வாழ்த்துகள்", "ఉత్తరాయణ శుభాకాంక్షలు", "ಉತ್ತರಾಯಣದ ಶುಭಾಶಯಗಳು"),
    keywords: ["uttarayan", "kite", "उत्तरायण", "પતંગ", "ઉત્તરાયણ"],
    scene: "many colourful kites flying in a bright blue sky",
  },
  {
    id: "puthandu", label: L("Happy Tamil New Year", "तमिल नववर्ष की हार्दिक शुभकामनाएँ", "तमिळ नववर्षाच्या हार्दिक शुभेच्छा", "તમિલ નવા વર્ષની હાર્દિક શુભેચ્છાઓ", "புத்தாண்டு நல்வாழ்த்துகள்", "తమిళ నూతన సంవత్సర శుభాకాంక్షలు", "ತಮಿಳು ಹೊಸ ವರ್ಷದ ಶುಭಾಶಯಗಳು"),
    keywords: ["puthandu", "tamil new year", "புத்தாண்டு", "வருடப்பிறப்பு"],
    scene: "a kolam pattern, mango leaves and fresh fruit on a banana leaf",
  },
  {
    id: "ugadi", label: L("Happy Ugadi / Gudi Padwa", "गुड़ी पड़वा की हार्दिक शुभकामनाएँ", "गुढीपाडव्याच्या हार्दिक शुभेच्छा", "ગુડી પડવાની હાર્દિક શુભેચ્છાઓ", "உகாதி வாழ்த்துகள்", "ఉగాది శుభాకాంక్షలు", "ಯುಗಾದಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು"),
    keywords: ["ugadi", "gudi padwa", "gudipadwa", "yugadi", "गुड़ी पड़वा", "गुढीपाडवा", "ગુડી પડવો", "ఉగాది", "ಯುಗಾದಿ"],
    scene: "mango leaf toran, neem flowers and a decorated pot on a pole",
  },
  {
    id: "rajyotsava", label: L("Happy Kannada Rajyotsava", "कर्नाटक राज्योत्सव की शुभकामनाएँ", "कर्नाटक राज्योत्सवाच्या शुभेच्छा", "કર્ણાટક રાજ્યોત્સવની શુભેચ્છાઓ", "கன்னட ராஜ்யோத்சவ வாழ்த்துகள்", "కన్నడ రాజ్యోత్సవ శుభాకాంక్షలు", "ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವದ ಶುಭಾಶಯಗಳು"),
    keywords: ["rajyotsava", "kannada rajyotsava", "राज्योत्सव", "ರಾಜ್ಯೋತ್ಸವ"],
    scene: "red and yellow flags and flowers",
  },
  {
    id: "chhath", label: L("Happy Chhath Puja", "छठ पूजा की हार्दिक शुभकामनाएँ", "छठ पूजेच्या हार्दिक शुभेच्छा", "છઠ પૂજાની હાર્દિક શુભેચ્છાઓ", "சத் பூஜை வாழ்த்துகள்", "ఛఠ్ పూజ శుభాకాంక్షలు", "ಛಠ್ ಪೂಜೆಯ ಶುಭಾಶಯಗಳು"),
    keywords: ["chhath", "chath", "छठ", "છઠ"],
    scene: "a glowing sun over a river with offerings in bamboo baskets",
  },
  {
    id: "akshaya", label: L("Happy Akshaya Tritiya", "अक्षय तृतीया की हार्दिक शुभकामनाएँ", "अक्षय्य तृतीयेच्या हार्दिक शुभेच्छा", "અક્ષય તૃતીયાની હાર્દિક શુભેચ્છાઓ", "அட்சய திருதியை வாழ்த்துகள்", "అక్షయ తృతీయ శుభాకాంక్షలు", "ಅಕ್ಷಯ ತೃತೀಯದ ಶುಭಾಶಯಗಳು"),
    keywords: ["akshaya", "akshay", "akha teej", "अक्षय", "અક્ષય", "அட்சய", "అక్షయ", "ಅಕ್ಷಯ"],
    scene: "gold coins, a kalash and soft golden light",
  },
  {
    id: "ramnavami", label: L("Happy Ram Navami", "रामनवमी की हार्दिक शुभकामनाएँ", "रामनवमीच्या हार्दिक शुभेच्छा", "રામનવમીની હાર્દિક શુભેચ્છાઓ", "ராம நவமி வாழ்த்துகள்", "శ్రీరామ నవమి శుభాకాంక్షలు", "ರಾಮನವಮಿಯ ಶುಭಾಶಯಗಳು"),
    keywords: ["ram navami", "ramnavami", "राम नवमी", "रामनवमी", "રામનવમી", "ராம நவமி", "రామ నవమి", "ರಾಮನವಮಿ"],
    scene: "a saffron flag, a bow and marigold flowers",
  },
  {
    id: "republic", label: L("Happy Republic Day", "गणतंत्र दिवस की हार्दिक शुभकामनाएँ", "प्रजासत्ताक दिनाच्या हार्दिक शुभेच्छा", "પ્રજાસત્તાક દિનની હાર્દિક શુભેચ્છાઓ", "குடியரசு தின வாழ்த்துகள்", "గణతంత్ర దినోత్సవ శుభాకాంక్షలు", "ಗಣರಾಜ್ಯೋತ್ಸವದ ಶುಭಾಶಯಗಳು"),
    keywords: ["republic day", "26 january", "गणतंत्र", "प्रजासत्ताक", "પ્રજાસત્તાક", "குடியரசு", "గణతంత్ర", "ಗಣರಾಜ್ಯ"],
    scene: "saffron, white and green bands with an Ashoka chakra",
  },
  {
    id: "independence", label: L("Happy Independence Day", "स्वतंत्रता दिवस की हार्दिक शुभकामनाएँ", "स्वातंत्र्य दिनाच्या हार्दिक शुभेच्छा", "સ્વતંત્રતા દિનની હાર્દિક શુભેચ્છાઓ", "சுதந்திர தின வாழ்த்துகள்", "స్వాతంత్ర్య దినోత్సవ శుభాకాంక్షలు", "ಸ್ವಾತಂತ್ರ್ಯ ದಿನದ ಶುಭಾಶಯಗಳು"),
    keywords: ["independence day", "15 august", "स्वतंत्रता", "स्वातंत्र्य", "સ્વતંત્રતા", "சுதந்திர", "స్వాతంత్ర్య", "ಸ್ವಾತಂತ್ರ್ಯ"],
    scene: "saffron, white and green bands with an Ashoka chakra",
  },
  {
    id: "sale", label: L("Special Offer", "खास ऑफ़र", "खास ऑफर", "ખાસ ઓફર", "சிறப்பு சலுகை", "ప్రత్యేక ఆఫర్", "ವಿಶೇಷ ಆಫರ್"),
    keywords: ["sale", "offer", "discount", "ऑफर", "ऑफ़र", "छूट", "सेल", "ઓફર", "છૂટ", "சலுகை", "ఆఫర్", "ಆಫರ್"],
    scene: "bold abstract shapes and confetti in bright festive colours",
  },
  {
    id: "thanks", label: L("Thank You", "आपका धन्यवाद", "आपले आभार", "આપનો આભાર", "நன்றி", "ధన్యవాదాలు", "ಧನ್ಯವಾದಗಳು"),
    keywords: ["thank", "thanks", "धन्यवाद", "आभार", "આભાર", "நன்றி", "ధన్యవాదాలు", "ಧನ್ಯವಾದಗಳು"],
    scene: "soft flowers and gentle warm colour gradients",
  },
];

export function occasionById(id: string): Occasion | undefined {
  return OCCASIONS.find((o) => o.id === id);
}

/** "create a card for diwali" -> the diwali occasion. First word match wins; null when none. */
export function matchOccasion(text: string): Occasion | null {
  const t = text.toLowerCase();
  return OCCASIONS.find((o) => o.keywords.some((k) => t.includes(k.toLowerCase()))) ?? null;
}
