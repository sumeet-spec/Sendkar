import type { LanguageCode } from "@/lib/i18n/dictionaries";

/**
 * Festival names as people write them in each language, so a Gujarati shopkeeper sees "દિવાળી" and not "Diwali".
 * Keyed by the festival's id without its year ("diwali-2026" -> "diwali"). English falls back to the festival's own name.
 */
type Names = Record<Exclude<LanguageCode, "en">, string>;
const N = (hi: string, mr: string, gu: string, ta: string, te: string, kn: string): Names => ({ hi, mr, gu, ta, te, kn });

export const FESTIVAL_NAMES: Record<string, Names> = {
  rajyotsava: N("कर्नाटक राज्योत्सव", "कर्नाटक राज्योत्सव", "કર્ણાટક રાજ્યોત્સવ", "கன்னட ராஜ்யோத்சவம்", "కన్నడ రాజ్యోత్సవం", "ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ"),
  dhanteras: N("धनतेरस", "धनत्रयोदशी", "ધનતેરસ", "தன்தேரஸ்", "ధన్‌తేరస్", "ಧನತೇರಸ್"),
  diwali: N("दिवाली", "दिवाळी", "દિવાળી", "தீபாவளி", "దీపావళి", "ದೀಪಾವಳಿ"),
  bestu: N("गुजराती नववर्ष (बेस्तु वरस)", "गुजराती नववर्ष (बेस्तु वर्ष)", "નવું વર્ષ (બેસતું વર્ષ)", "குஜராத்தி புத்தாண்டு", "గుజరాతీ నూతన సంవత్సరం", "ಗುಜರಾತಿ ಹೊಸ ವರ್ಷ"),
  bhaidooj: N("भाई दूज", "भाऊबीज", "ભાઈ બીજ", "பாய் தூஜ்", "భాయ్ దూజ్", "ಭಾಯಿ ದೂಜ್"),
  chhath: N("छठ पूजा", "छठ पूजा", "છઠ પૂજા", "சத் பூஜை", "ఛఠ్ పూజ", "ಛಠ್ ಪೂಜೆ"),
  christmas: N("क्रिसमस", "नाताळ", "નાતાલ", "கிறிஸ்துமஸ்", "క్రిస్మస్", "ಕ್ರಿಸ್ಮಸ್"),
  newyear: N("नव वर्ष", "नववर्ष", "નવું વર્ષ", "புத்தாண்டு", "నూతన సంవత్సరం", "ಹೊಸ ವರ್ಷ"),
  uttarayan: N("उत्तरायण", "उत्तरायण", "ઉત્તરાયણ", "உத்தராயணம்", "ఉత్తరాయణం", "ಉತ್ತರಾಯಣ"),
  pongal: N("पोंगल", "पोंगल", "પોંગલ", "பொங்கல்", "పొంగల్", "ಪೊಂಗಲ್"),
  sankranti: N("मकर संक्रांति", "मकर संक्रांत", "મકરસંક્રાંતિ", "மகர சங்கராந்தி", "మకర సంక్రాంతి", "ಮಕರ ಸಂಕ್ರಾಂತಿ"),
  republic: N("गणतंत्र दिवस", "प्रजासत्ताक दिन", "પ્રજાસત્તાક દિન", "குடியரசு தினம்", "గణతంత్ర దినోత్సవం", "ಗಣರಾಜ್ಯೋತ್ಸವ"),
  eid: N("ईद-उल-फ़ित्र", "ईद-उल-फित्र", "ઈદ-ઉલ-ફિત્ર", "ஈத் அல்-பித்ர்", "ఈద్ అల్-ఫిత్ర్", "ಈದ್ ಅಲ್-ಫಿತ್ರ್"),
  holi: N("होली", "होळी", "હોળી", "ஹோலி", "హోలీ", "ಹೋಳಿ"),
  ugadi: N("गुड़ी पड़वा / उगादी", "गुढीपाडवा / उगादी", "ગુડી પડવો / ઉગાદી", "உகாதி / குடி பாடவா", "ఉగాది", "ಯುಗಾದಿ"),
  puthandu: N("तमिल नववर्ष (पुथांडु)", "तमिळ नववर्ष (पुथांडु)", "તમિલ નવું વર્ષ (પુથાંડુ)", "தமிழ்ப் புத்தாண்டு", "తమిళ నూతన సంవత్సరం (పుత్తాండు)", "ತಮಿಳು ಹೊಸ ವರ್ಷ (ಪುತ್ತಾಂಡು)"),
  ramnavami: N("रामनवमी", "रामनवमी", "રામનવમી", "ராம நவமி", "శ్రీరామ నవమి", "ರಾಮನವಮಿ"),
  akshaya: N("अक्षय तृतीया", "अक्षय्य तृतीया", "અક્ષય તૃતીયા", "அட்சய திருதியை", "అక్షయ తృతీయ", "ಅಕ್ಷಯ ತೃತೀಯ"),
  independence: N("स्वतंत्रता दिवस", "स्वातंत्र्य दिन", "સ્વતંત્રતા દિન", "சுதந்திர தினம்", "స్వాతంత్ర్య దినోత్సవం", "ಸ್ವಾತಂತ್ರ್ಯ ದಿನ"),
  rakhi: N("रक्षाबंधन", "रक्षाबंधन", "રક્ષાબંધન", "ரக்ஷா பந்தன்", "రక్షాబంధన్", "ರಕ್ಷಾ ಬಂಧನ"),
  ganesh: N("गणेश चतुर्थी", "गणेश चतुर्थी", "ગણેશ ચતુર્થી", "விநாயகர் சதுர்த்தி", "వినాయక చవితి", "ಗಣೇಶ ಚತುರ್ಥಿ"),
  navratri: N("नवरात्रि", "नवरात्री", "નવરાત્રિ", "நவராத்திரி", "నవరాత్రి", "ನವರಾತ್ರಿ"),
};

const baseId = (festivalId: string) => festivalId.replace(/-\d{4}$/, "");

/** The festival's name in the chosen language, or its English name when there is none. */
export function festivalName(festivalId: string, englishName: string, lang: LanguageCode): string {
  if (lang === "en") return englishName;
  return FESTIVAL_NAMES[baseId(festivalId)]?.[lang] ?? englishName;
}

/** A date such as "8 Nov" written the way the language writes it (नवं., નવે., நவ. ...). */
export function localDate(iso: string, lang: LanguageCode): string {
  const d = new Date(`${iso}T12:00:00Z`);
  try {
    return new Intl.DateTimeFormat(`${lang}-IN`, { day: "numeric", month: "short", timeZone: "UTC" }).format(d);
  } catch {
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(d);
  }
}
