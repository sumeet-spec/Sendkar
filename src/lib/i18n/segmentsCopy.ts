import type { LanguageCode } from "./dictionaries";

/** Words for Segments: saved groups of customers to message together. */
export type SegmentsUi = {
  title: string; intro: string; everyone: string; newSegment: string; name: string; namePh: string; conditions: string; valuePh: string; pickOne: string;
  addCondition: string; create: string; creating: string; remove: string; contactsOne: string; contactsMany: string; delete: string; confirmDelete: string; empty: string;
  field: { tag: string; auto_tag: string; language: string; source: string; sentiment: string };
};

export const SEGMENTS_UI: Record<LanguageCode, SegmentsUi> = {
  en: {
    title: "Segments", intro: "Saved groups of customers, such as \"regulars who have not been in for 2 months\". Pick one when you make a campaign. Every condition has to match.", everyone: "Everyone",
    newSegment: "New segment", name: "Name", namePh: "Regular customers who speak Gujarati", conditions: "Conditions (all must match)", valuePh: "value", pickOne: "Pick one",
    addCondition: "+ Add condition", create: "Create", creating: "Creating…", remove: "Remove", contactsOne: "1 contact", contactsMany: "{n} contacts", delete: "Delete", confirmDelete: "Delete the segment \"{name}\"? This cannot be undone.",
    empty: "No segments yet. Make one to message the same group again and again.",
    field: { tag: "Tag", auto_tag: "Customer type", language: "Language", source: "Source", sentiment: "Last mood" },
  },
  hi: {
    title: "समूह", intro: "ग्राहकों के सेव किए हुए समूह, जैसे \"नियमित ग्राहक जो 2 महीने से नहीं आए\"। कैंपेन बनाते समय एक चुनें। हर शर्त मिलनी चाहिए।", everyone: "सभी",
    newSegment: "नया समूह", name: "नाम", namePh: "गुजराती बोलने वाले नियमित ग्राहक", conditions: "शर्तें (सब मिलनी चाहिए)", valuePh: "मान", pickOne: "एक चुनें",
    addCondition: "+ शर्त जोड़ें", create: "बनाएँ", creating: "बन रहा है…", remove: "हटाएँ", contactsOne: "1 संपर्क", contactsMany: "{n} संपर्क", delete: "मिटाएँ", confirmDelete: "समूह \"{name}\" मिटाएँ? यह वापस नहीं होगा।",
    empty: "अभी कोई समूह नहीं। एक ही समूह को बार-बार संदेश भेजने के लिए एक बनाएँ।",
    field: { tag: "टैग", auto_tag: "ग्राहक का प्रकार", language: "भाषा", source: "कहाँ से", sentiment: "आख़िरी मिज़ाज" },
  },
  mr: {
    title: "गट", intro: "ग्राहकांचे सेव्ह केलेले गट, जसे \"नियमित ग्राहक जे 2 महिने आले नाहीत\". कॅम्पेन बनवताना एक निवडा. प्रत्येक अट जुळायला हवी.", everyone: "सर्व",
    newSegment: "नवीन गट", name: "नाव", namePh: "गुजराती बोलणारे नियमित ग्राहक", conditions: "अटी (सर्व जुळाव्यात)", valuePh: "मूल्य", pickOne: "एक निवडा",
    addCondition: "+ अट जोडा", create: "बनवा", creating: "बनत आहे…", remove: "काढा", contactsOne: "1 संपर्क", contactsMany: "{n} संपर्क", delete: "काढून टाका", confirmDelete: "गट \"{name}\" काढून टाकायचा? हे परत करता येणार नाही.",
    empty: "अजून गट नाहीत. त्याच गटाला पुन्हा पुन्हा संदेश पाठवण्यासाठी एक बनवा.",
    field: { tag: "टॅग", auto_tag: "ग्राहकाचा प्रकार", language: "भाषा", source: "कुठून", sentiment: "शेवटचा मूड" },
  },
  gu: {
    title: "જૂથો", intro: "ગ્રાહકોના સેવ કરેલા જૂથ, જેમ કે \"નિયમિત ગ્રાહકો જે 2 મહિનાથી આવ્યા નથી\". કૅમ્પેન બનાવતી વખતે એક પસંદ કરો. દરેક શરત મળવી જોઈએ.", everyone: "બધા",
    newSegment: "નવું જૂથ", name: "નામ", namePh: "ગુજરાતી બોલતા નિયમિત ગ્રાહકો", conditions: "શરતો (બધી મળવી જોઈએ)", valuePh: "કિંમત", pickOne: "એક પસંદ કરો",
    addCondition: "+ શરત ઉમેરો", create: "બનાવો", creating: "બની રહ્યું છે…", remove: "કાઢો", contactsOne: "1 સંપર્ક", contactsMany: "{n} સંપર્કો", delete: "કાઢી નાખો", confirmDelete: "જૂથ \"{name}\" કાઢી નાખીએ? આ પાછું નહીં આવે.",
    empty: "હજી કોઈ જૂથ નથી. એ જ જૂથને વારંવાર સંદેશ મોકલવા એક બનાવો.",
    field: { tag: "ટેગ", auto_tag: "ગ્રાહકનો પ્રકાર", language: "ભાષા", source: "ક્યાંથી", sentiment: "છેલ્લો મૂડ" },
  },
  ta: {
    title: "குழுக்கள்", intro: "வாடிக்கையாளர்களின் சேமித்த குழுக்கள், எ.கா. \"2 மாதமாக வராத வழக்கமான வாடிக்கையாளர்கள்\". பிரச்சாரம் உருவாக்கும்போது ஒன்றைத் தேர்ந்தெடுங்கள். ஒவ்வொரு நிபந்தனையும் பொருந்த வேண்டும்.", everyone: "அனைவரும்",
    newSegment: "புதிய குழு", name: "பெயர்", namePh: "குஜராத்தி பேசும் வழக்கமான வாடிக்கையாளர்கள்", conditions: "நிபந்தனைகள் (அனைத்தும் பொருந்த வேண்டும்)", valuePh: "மதிப்பு", pickOne: "ஒன்றைத் தேர்ந்தெடுங்கள்",
    addCondition: "+ நிபந்தனை சேர்", create: "உருவாக்கு", creating: "உருவாக்குகிறது…", remove: "நீக்கு", contactsOne: "1 தொடர்பு", contactsMany: "{n} தொடர்புகள்", delete: "அழி", confirmDelete: "\"{name}\" குழுவை அழிக்கவா? இதை மீட்க முடியாது.",
    empty: "இன்னும் குழுக்கள் இல்லை. அதே குழுவுக்கு மீண்டும் மீண்டும் செய்தி அனுப்ப ஒன்றை உருவாக்குங்கள்.",
    field: { tag: "குறிச்சொல்", auto_tag: "வாடிக்கையாளர் வகை", language: "மொழி", source: "எங்கிருந்து", sentiment: "கடைசி மனநிலை" },
  },
  te: {
    title: "గ్రూపులు", intro: "కస్టమర్ల సేవ్ చేసిన గ్రూపులు, ఉదా. \"2 నెలలుగా రాని రెగ్యులర్ కస్టమర్లు\". క్యాంపెయిన్ చేసేటప్పుడు ఒకటి ఎంచుకోండి. ప్రతి షరతు సరిపోవాలి.", everyone: "అందరూ",
    newSegment: "కొత్త గ్రూప్", name: "పేరు", namePh: "గుజరాతీ మాట్లాడే రెగ్యులర్ కస్టమర్లు", conditions: "షరతులు (అన్నీ సరిపోవాలి)", valuePh: "విలువ", pickOne: "ఒకటి ఎంచుకోండి",
    addCondition: "+ షరతు జోడించు", create: "సృష్టించు", creating: "సృష్టిస్తోంది…", remove: "తొలగించు", contactsOne: "1 కాంటాక్ట్", contactsMany: "{n} కాంటాక్టులు", delete: "తొలగించు", confirmDelete: "\"{name}\" గ్రూప్‌ను తొలగించాలా? ఇది వెనక్కి రాదు.",
    empty: "ఇంకా గ్రూపులు లేవు. అదే గ్రూప్‌కు మళ్ళీ మళ్ళీ సందేశం పంపడానికి ఒకటి సృష్టించండి.",
    field: { tag: "ట్యాగ్", auto_tag: "కస్టమర్ రకం", language: "భాష", source: "ఎక్కడి నుండి", sentiment: "చివరి మూడ్" },
  },
  kn: {
    title: "ಗುಂಪುಗಳು", intro: "ಗ್ರಾಹಕರ ಉಳಿಸಿದ ಗುಂಪುಗಳು, ಉದಾ. \"2 ತಿಂಗಳಿಂದ ಬಾರದ ನಿಯಮಿತ ಗ್ರಾಹಕರು\". ಅಭಿಯಾನ ಮಾಡುವಾಗ ಒಂದನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಪ್ರತಿ ಷರತ್ತೂ ಹೊಂದಬೇಕು.", everyone: "ಎಲ್ಲರೂ",
    newSegment: "ಹೊಸ ಗುಂಪು", name: "ಹೆಸರು", namePh: "ಗುಜರಾತಿ ಮಾತನಾಡುವ ನಿಯಮಿತ ಗ್ರಾಹಕರು", conditions: "ಷರತ್ತುಗಳು (ಎಲ್ಲವೂ ಹೊಂದಬೇಕು)", valuePh: "ಮೌಲ್ಯ", pickOne: "ಒಂದನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    addCondition: "+ ಷರತ್ತು ಸೇರಿಸಿ", create: "ರಚಿಸಿ", creating: "ರಚಿಸಲಾಗುತ್ತಿದೆ…", remove: "ತೆಗೆಯಿರಿ", contactsOne: "1 ಸಂಪರ್ಕ", contactsMany: "{n} ಸಂಪರ್ಕಗಳು", delete: "ಅಳಿಸಿ", confirmDelete: "\"{name}\" ಗುಂಪನ್ನು ಅಳಿಸಬೇಕೆ? ಇದನ್ನು ಹಿಂತಿರುಗಿಸಲಾಗದು.",
    empty: "ಇನ್ನೂ ಗುಂಪುಗಳಿಲ್ಲ. ಅದೇ ಗುಂಪಿಗೆ ಮತ್ತೆ ಮತ್ತೆ ಸಂದೇಶ ಕಳುಹಿಸಲು ಒಂದನ್ನು ರಚಿಸಿ.",
    field: { tag: "ಟ್ಯಾಗ್", auto_tag: "ಗ್ರಾಹಕರ ವಿಧ", language: "ಭಾಷೆ", source: "ಎಲ್ಲಿಂದ", sentiment: "ಕೊನೆಯ ಮನಸ್ಥಿತಿ" },
  },
};
