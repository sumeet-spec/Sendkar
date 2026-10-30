import type { LanguageCode } from "./dictionaries";

/** Dashboard words that were still English: the 30-day chart, recent campaigns, template counts and the sending limit note. */
export type DashboardMoreUi = {
  last30: string; chartTitle: string; total: string; chartEmpty: string; recent: string; viewAll: string;
  templates: string; approved: string; pending: string; rejected: string; tierNote: string;
  noCampaigns: string; needTemplate: string; startCampaign: string; sent: string; delivery: string;
};

export const DASHBOARD_MORE_UI: Record<LanguageCode, DashboardMoreUi> = {
  en: {
    last30: "{n} in the last 30 days", chartTitle: "Messages sent — last 30 days", total: "{n} in all", chartEmpty: "No messages sent in the last 30 days — start a campaign to see them here.",
    recent: "Recent campaigns", viewAll: "See all →", templates: "Templates", approved: "Approved", pending: "Waiting for Meta", rejected: "Rejected",
    tierNote: "Meta raises this limit as your messages keep getting delivered well. Sendkar cannot change it.",
    noCampaigns: "No campaigns yet", needTemplate: "A campaign needs an approved template. Make one first, then start a campaign.", startCampaign: "Start a campaign", sent: "sent", delivery: "delivered",
  },
  hi: {
    last30: "पिछले 30 दिनों में {n}", chartTitle: "भेजे गए संदेश — पिछले 30 दिन", total: "कुल {n}", chartEmpty: "पिछले 30 दिनों में कोई संदेश नहीं गया — यहाँ देखने के लिए कैंपेन शुरू करें।",
    recent: "हाल के कैंपेन", viewAll: "सभी देखें →", templates: "टेम्पलेट", approved: "मंज़ूर", pending: "Meta की मंज़ूरी बाकी", rejected: "नामंज़ूर",
    tierNote: "आपके संदेश अच्छे से पहुँचते रहें तो Meta यह सीमा खुद बढ़ाता है। Sendkar इसे नहीं बदल सकता।",
    noCampaigns: "अभी कोई कैंपेन नहीं", needTemplate: "कैंपेन के लिए मंज़ूर टेम्पलेट चाहिए। पहले एक बनाएँ, फिर कैंपेन शुरू करें।", startCampaign: "कैंपेन शुरू करें", sent: "भेजे", delivery: "पहुँचे",
  },
  mr: {
    last30: "गेल्या 30 दिवसांत {n}", chartTitle: "पाठवलेले संदेश — गेले 30 दिवस", total: "एकूण {n}", chartEmpty: "गेल्या 30 दिवसांत एकही संदेश गेला नाही — इथे पाहण्यासाठी कॅम्पेन सुरू करा.",
    recent: "अलीकडील कॅम्पेन", viewAll: "सर्व पहा →", templates: "टेम्पलेट", approved: "मंजूर", pending: "Meta च्या मंजुरीची वाट",  rejected: "नामंजूर",
    tierNote: "तुमचे संदेश चांगले पोहोचत राहिले की Meta ही मर्यादा वाढवतो. Sendkar ती बदलू शकत नाही.",
    noCampaigns: "अजून कॅम्पेन नाहीत", needTemplate: "कॅम्पेनसाठी मंजूर टेम्पलेट हवे. आधी एक बनवा, मग कॅम्पेन सुरू करा.", startCampaign: "कॅम्पेन सुरू करा", sent: "पाठवले", delivery: "पोहोचले",
  },
  gu: {
    last30: "છેલ્લા 30 દિવસમાં {n}", chartTitle: "મોકલેલા સંદેશ — છેલ્લા 30 દિવસ", total: "કુલ {n}", chartEmpty: "છેલ્લા 30 દિવસમાં કોઈ સંદેશ ગયો નથી — અહીં જોવા માટે કૅમ્પેન શરૂ કરો.",
    recent: "તાજેતરના કૅમ્પેન", viewAll: "બધા જુઓ →", templates: "ટેમ્પ્લેટ", approved: "મંજૂર", pending: "Metaની મંજૂરીની રાહ", rejected: "નામંજૂર",
    tierNote: "તમારા સંદેશ સારી રીતે પહોંચતા રહે તો Meta આ મર્યાદા વધારે છે. Sendkar તેને બદલી શકતું નથી.",
    noCampaigns: "હજી કોઈ કૅમ્પેન નથી", needTemplate: "કૅમ્પેન માટે મંજૂર ટેમ્પ્લેટ જોઈએ. પહેલા એક બનાવો, પછી કૅમ્પેન શરૂ કરો.", startCampaign: "કૅમ્પેન શરૂ કરો", sent: "મોકલ્યા", delivery: "પહોંચ્યા",
  },
  ta: {
    last30: "கடந்த 30 நாட்களில் {n}", chartTitle: "அனுப்பிய செய்திகள் — கடந்த 30 நாட்கள்", total: "மொத்தம் {n}", chartEmpty: "கடந்த 30 நாட்களில் செய்தி எதுவும் அனுப்பப்படவில்லை — இங்கே காண ஒரு பிரச்சாரத்தைத் தொடங்குங்கள்.",
    recent: "சமீபத்திய பிரச்சாரங்கள்", viewAll: "அனைத்தும் பார் →", templates: "டெம்ப்ளேட்கள்", approved: "அங்கீகரிக்கப்பட்டவை", pending: "Meta ஒப்புதலுக்குக் காத்திருப்பவை", rejected: "நிராகரிக்கப்பட்டவை",
    tierNote: "உங்கள் செய்திகள் நன்றாகச் சேர்ந்துகொண்டிருந்தால் Meta இந்த வரம்பை உயர்த்தும். Sendkar-ஆல் இதை மாற்ற முடியாது.",
    noCampaigns: "இன்னும் பிரச்சாரங்கள் இல்லை", needTemplate: "பிரச்சாரத்துக்கு அங்கீகரிக்கப்பட்ட டெம்ப்ளேட் வேண்டும். முதலில் ஒன்றை உருவாக்கி, பிறகு பிரச்சாரத்தைத் தொடங்குங்கள்.", startCampaign: "பிரச்சாரம் தொடங்கு", sent: "அனுப்பியவை", delivery: "சேர்ந்தவை",
  },
  te: {
    last30: "గత 30 రోజుల్లో {n}", chartTitle: "పంపిన మెసేజ్‌లు — గత 30 రోజులు", total: "మొత్తం {n}", chartEmpty: "గత 30 రోజుల్లో ఏ మెసేజ్ పంపలేదు — ఇక్కడ చూడటానికి క్యాంపెయిన్ మొదలుపెట్టండి.",
    recent: "ఇటీవలి క్యాంపెయిన్లు", viewAll: "అన్నీ చూడండి →", templates: "టెంప్లేట్లు", approved: "ఆమోదించినవి", pending: "Meta ఆమోదం కోసం వేచి ఉన్నవి", rejected: "తిరస్కరించినవి",
    tierNote: "మీ మెసేజ్‌లు బాగా చేరుతూ ఉంటే Meta ఈ పరిమితిని పెంచుతుంది. Sendkar దీన్ని మార్చలేదు.",
    noCampaigns: "ఇంకా క్యాంపెయిన్లు లేవు", needTemplate: "క్యాంపెయిన్‌కు ఆమోదించిన టెంప్లేట్ కావాలి. ముందు ఒకటి చేయండి, తర్వాత క్యాంపెయిన్ మొదలుపెట్టండి.", startCampaign: "క్యాంపెయిన్ మొదలుపెట్టండి", sent: "పంపినవి", delivery: "చేరినవి",
  },
  kn: {
    last30: "ಕಳೆದ 30 ದಿನಗಳಲ್ಲಿ {n}", chartTitle: "ಕಳುಹಿಸಿದ ಸಂದೇಶಗಳು — ಕಳೆದ 30 ದಿನ", total: "ಒಟ್ಟು {n}", chartEmpty: "ಕಳೆದ 30 ದಿನಗಳಲ್ಲಿ ಯಾವ ಸಂದೇಶವೂ ಹೋಗಿಲ್ಲ — ಇಲ್ಲಿ ನೋಡಲು ಅಭಿಯಾನ ಆರಂಭಿಸಿ.",
    recent: "ಇತ್ತೀಚಿನ ಅಭಿಯಾನಗಳು", viewAll: "ಎಲ್ಲಾ ನೋಡಿ →", templates: "ಟೆಂಪ್ಲೇಟ್‌ಗಳು", approved: "ಅನುಮೋದಿತ", pending: "Meta ಅನುಮೋದನೆಗೆ ಕಾಯುತ್ತಿವೆ", rejected: "ತಿರಸ್ಕೃತ",
    tierNote: "ನಿಮ್ಮ ಸಂದೇಶಗಳು ಚೆನ್ನಾಗಿ ತಲುಪುತ್ತಿದ್ದರೆ Meta ಈ ಮಿತಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ. Sendkar ಇದನ್ನು ಬದಲಿಸಲಾಗದು.",
    noCampaigns: "ಇನ್ನೂ ಅಭಿಯಾನಗಳಿಲ್ಲ", needTemplate: "ಅಭಿಯಾನಕ್ಕೆ ಅನುಮೋದಿತ ಟೆಂಪ್ಲೇಟ್ ಬೇಕು. ಮೊದಲು ಒಂದನ್ನು ಮಾಡಿ, ನಂತರ ಅಭಿಯಾನ ಆರಂಭಿಸಿ.", startCampaign: "ಅಭಿಯಾನ ಆರಂಭಿಸಿ", sent: "ಕಳುಹಿಸಿದ್ದು", delivery: "ತಲುಪಿದ್ದು",
  },
};
