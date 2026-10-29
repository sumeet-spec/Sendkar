import type { LanguageCode } from "./dictionaries";

/** Words for the festival library screen. `{n}` and `{date}` are filled in by the page. */
export type LibraryCopy = {
  title: string; intro: string; festivalsFor: string; anyTime: string; today: string; tomorrow: string; inDays: string;
  comingSoon: string; confirmDay: string; pick: string; cardLanguage: string; offerLabel: string; offerPlaceholder: string;
  colours: string; festivalColours: string; myColours: string; everyLanguage: string; send: string; sending: string;
  free: string; fresh: string; none: string; brandEmpty: string; brandLink: string; designsLive: string;
};

export const LIBRARY_COPY: Record<LanguageCode, LibraryCopy> = {
  en: {
    title: "Festival library",
    intro: "Free, ready-made designs for every festival, added well before the festival so you can send early. Pick one, add your offer, and send it to your customers with your own name and logo.",
    festivalsFor: "Festivals for", anyTime: "Any time", today: "Today", tomorrow: "Tomorrow", inDays: "in {n} days",
    comingSoon: "Designs arrive on {date}", confirmDay: "confirm the day with your calendar", pick: "Pick a design to see it with your name and logo.",
    cardLanguage: "Language of the card", offerLabel: "Offer or message (optional)", offerPlaceholder: "15% off till Sunday",
    colours: "Colours", festivalColours: "Festival colours", myColours: "My brand colours",
    everyLanguage: "Make it for every language my customers speak", send: "Send this to my customers", sending: "Getting it ready…",
    free: "Free", fresh: "New", none: "No designs for this festival yet.",
    brandEmpty: "Your brand kit is empty, so the designs show a stand-in name. Fill it in once to send.", brandLink: "Fill in brand kit →", designsLive: "{n} designs",
  },
  hi: {
    title: "त्योहार लाइब्रेरी",
    intro: "हर त्योहार के लिए मुफ़्त, बने-बनाए डिज़ाइन, त्योहार से काफ़ी पहले जोड़े गए ताकि आप जल्दी भेज सकें। एक चुनें, अपना ऑफ़र लिखें, और अपने नाम और लोगो के साथ ग्राहकों को भेजें।",
    festivalsFor: "इन भाषा वालों के त्योहार", anyTime: "कभी भी", today: "आज", tomorrow: "कल", inDays: "{n} दिन में",
    comingSoon: "डिज़ाइन {date} को आएँगे", confirmDay: "तारीख़ अपने कैलेंडर से पक्की कर लें", pick: "कोई डिज़ाइन चुनें, उस पर आपका नाम और लोगो दिखेगा।",
    cardLanguage: "कार्ड की भाषा", offerLabel: "ऑफ़र या संदेश (ज़रूरी नहीं)", offerPlaceholder: "रविवार तक 15% छूट",
    colours: "रंग", festivalColours: "त्योहार के रंग", myColours: "मेरे ब्रांड के रंग",
    everyLanguage: "मेरे ग्राहकों की हर भाषा में बनाएँ", send: "मेरे ग्राहकों को भेजें", sending: "तैयार हो रहा है…",
    free: "मुफ़्त", fresh: "नया", none: "इस त्योहार के डिज़ाइन अभी नहीं हैं।",
    brandEmpty: "आपका ब्रांड किट ख़ाली है, इसलिए डिज़ाइन में एक नमूना नाम दिख रहा है। भेजने के लिए इसे एक बार भरें।", brandLink: "ब्रांड किट भरें →", designsLive: "{n} डिज़ाइन",
  },
  mr: {
    title: "सण लायब्ररी",
    intro: "प्रत्येक सणासाठी मोफत, तयार डिझाइन, सणाच्या खूप आधी जोडलेले म्हणजे तुम्ही लवकर पाठवू शकता. एक निवडा, तुमची ऑफर लिहा आणि तुमचे नाव व लोगोसह ग्राहकांना पाठवा.",
    festivalsFor: "या भाषेच्या लोकांचे सण", anyTime: "केव्हाही", today: "आज", tomorrow: "उद्या", inDays: "{n} दिवसांत",
    comingSoon: "डिझाइन {date} ला येतील", confirmDay: "तारीख तुमच्या कॅलेंडरमध्ये पक्की करा", pick: "एखादे डिझाइन निवडा, त्यावर तुमचे नाव आणि लोगो दिसेल.",
    cardLanguage: "कार्डची भाषा", offerLabel: "ऑफर किंवा संदेश (ऐच्छिक)", offerPlaceholder: "रविवारपर्यंत १५% सूट",
    colours: "रंग", festivalColours: "सणाचे रंग", myColours: "माझ्या ब्रँडचे रंग",
    everyLanguage: "माझ्या ग्राहकांच्या प्रत्येक भाषेत बनवा", send: "माझ्या ग्राहकांना पाठवा", sending: "तयार होत आहे…",
    free: "मोफत", fresh: "नवीन", none: "या सणाचे डिझाइन अजून नाहीत.",
    brandEmpty: "तुमचा ब्रँड किट रिकामा आहे, म्हणून डिझाइनमध्ये नमुना नाव दिसत आहे. पाठवण्यासाठी तो एकदा भरा.", brandLink: "ब्रँड किट भरा →", designsLive: "{n} डिझाइन",
  },
  ta: {
    title: "பண்டிகை நூலகம்",
    intro: "ஒவ்வொரு பண்டிகைக்கும் இலவச, தயாரான வடிவமைப்புகள், பண்டிகைக்கு நீண்ட நாட்களுக்கு முன்பே சேர்க்கப்படும், அதனால் முன்கூட்டியே அனுப்பலாம். ஒன்றைத் தேர்ந்தெடுத்து, உங்கள் சலுகையைச் சேர்த்து, உங்கள் பெயர், லோகோவுடன் வாடிக்கையாளர்களுக்கு அனுப்புங்கள்.",
    festivalsFor: "இந்த மொழி பேசுவோரின் பண்டிகைகள்", anyTime: "எப்போதும்", today: "இன்று", tomorrow: "நாளை", inDays: "{n} நாட்களில்",
    comingSoon: "வடிவமைப்புகள் {date} அன்று வரும்", confirmDay: "நாளை உங்கள் நாட்காட்டியில் உறுதி செய்யவும்", pick: "ஒரு வடிவமைப்பைத் தேர்ந்தெடுங்கள், அதில் உங்கள் பெயர், லோகோ தெரியும்.",
    cardLanguage: "கார்டின் மொழி", offerLabel: "சலுகை அல்லது செய்தி (விருப்பம்)", offerPlaceholder: "ஞாயிறு வரை 15% தள்ளுபடி",
    colours: "நிறங்கள்", festivalColours: "பண்டிகை நிறங்கள்", myColours: "என் பிராண்ட் நிறங்கள்",
    everyLanguage: "என் வாடிக்கையாளர்கள் பேசும் ஒவ்வொரு மொழியிலும் உருவாக்கு", send: "என் வாடிக்கையாளர்களுக்கு அனுப்பு", sending: "தயாராகிறது…",
    free: "இலவசம்", fresh: "புதியது", none: "இந்தப் பண்டிகைக்கு இன்னும் வடிவமைப்புகள் இல்லை.",
    brandEmpty: "உங்கள் பிராண்ட் கிட் காலியாக உள்ளது, அதனால் வடிவமைப்புகளில் மாதிரிப் பெயர் தெரிகிறது. அனுப்ப ஒருமுறை நிரப்புங்கள்.", brandLink: "பிராண்ட் கிட் நிரப்பு →", designsLive: "{n} வடிவமைப்புகள்",
  },
  te: {
    title: "పండుగల లైబ్రరీ",
    intro: "ప్రతి పండుగకు ఉచిత, సిద్ధమైన డిజైన్లు, పండుగకు చాలా ముందే చేర్చబడతాయి, కాబట్టి మీరు ముందుగానే పంపవచ్చు. ఒకటి ఎంచుకుని, మీ ఆఫర్ రాసి, మీ పేరు, లోగోతో కస్టమర్లకు పంపండి.",
    festivalsFor: "ఈ భాష మాట్లాడేవారి పండుగలు", anyTime: "ఎప్పుడైనా", today: "ఈ రోజు", tomorrow: "రేపు", inDays: "{n} రోజుల్లో",
    comingSoon: "డిజైన్లు {date} న వస్తాయి", confirmDay: "తేదీని మీ క్యాలెండర్‌లో సరిచూసుకోండి", pick: "ఒక డిజైన్ ఎంచుకోండి, దానిపై మీ పేరు, లోగో కనిపిస్తాయి.",
    cardLanguage: "కార్డ్ భాష", offerLabel: "ఆఫర్ లేదా సందేశం (ఐచ్ఛికం)", offerPlaceholder: "ఆదివారం వరకు 15% తగ్గింపు",
    colours: "రంగులు", festivalColours: "పండుగ రంగులు", myColours: "నా బ్రాండ్ రంగులు",
    everyLanguage: "నా కస్టమర్లు మాట్లాడే ప్రతి భాషలో తయారు చేయి", send: "నా కస్టమర్లకు పంపండి", sending: "సిద్ధమవుతోంది…",
    free: "ఉచితం", fresh: "కొత్తది", none: "ఈ పండుగకు ఇంకా డిజైన్లు లేవు.",
    brandEmpty: "మీ బ్రాండ్ కిట్ ఖాళీగా ఉంది, అందుకే డిజైన్లలో నమూనా పేరు కనిపిస్తోంది. పంపడానికి ఒకసారి నింపండి.", brandLink: "బ్రాండ్ కిట్ నింపండి →", designsLive: "{n} డిజైన్లు",
  },
  kn: {
    title: "ಹಬ್ಬದ ಲೈಬ್ರರಿ",
    intro: "ಪ್ರತಿ ಹಬ್ಬಕ್ಕೂ ಉಚಿತ, ಸಿದ್ಧ ವಿನ್ಯಾಸಗಳು, ಹಬ್ಬಕ್ಕೆ ತುಂಬಾ ಮೊದಲೇ ಸೇರಿಸಲಾಗುತ್ತದೆ, ಆದ್ದರಿಂದ ನೀವು ಬೇಗ ಕಳುಹಿಸಬಹುದು. ಒಂದನ್ನು ಆರಿಸಿ, ನಿಮ್ಮ ಆಫರ್ ಸೇರಿಸಿ, ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಲೋಗೋದೊಂದಿಗೆ ಗ್ರಾಹಕರಿಗೆ ಕಳುಹಿಸಿ.",
    festivalsFor: "ಈ ಭಾಷೆ ಮಾತನಾಡುವವರ ಹಬ್ಬಗಳು", anyTime: "ಯಾವಾಗಲೂ", today: "ಇಂದು", tomorrow: "ನಾಳೆ", inDays: "{n} ದಿನಗಳಲ್ಲಿ",
    comingSoon: "ವಿನ್ಯಾಸಗಳು {date} ರಂದು ಬರುತ್ತವೆ", confirmDay: "ದಿನಾಂಕವನ್ನು ನಿಮ್ಮ ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ", pick: "ಒಂದು ವಿನ್ಯಾಸ ಆರಿಸಿ, ಅದರಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಲೋಗೋ ಕಾಣಿಸುತ್ತದೆ.",
    cardLanguage: "ಕಾರ್ಡ್‌ನ ಭಾಷೆ", offerLabel: "ಆಫರ್ ಅಥವಾ ಸಂದೇಶ (ಐಚ್ಛಿಕ)", offerPlaceholder: "ಭಾನುವಾರದವರೆಗೆ 15% ರಿಯಾಯಿತಿ",
    colours: "ಬಣ್ಣಗಳು", festivalColours: "ಹಬ್ಬದ ಬಣ್ಣಗಳು", myColours: "ನನ್ನ ಬ್ರ್ಯಾಂಡ್ ಬಣ್ಣಗಳು",
    everyLanguage: "ನನ್ನ ಗ್ರಾಹಕರು ಮಾತನಾಡುವ ಪ್ರತಿ ಭಾಷೆಯಲ್ಲೂ ಮಾಡಿ", send: "ನನ್ನ ಗ್ರಾಹಕರಿಗೆ ಕಳುಹಿಸಿ", sending: "ಸಿದ್ಧವಾಗುತ್ತಿದೆ…",
    free: "ಉಚಿತ", fresh: "ಹೊಸದು", none: "ಈ ಹಬ್ಬಕ್ಕೆ ಇನ್ನೂ ವಿನ್ಯಾಸಗಳಿಲ್ಲ.",
    brandEmpty: "ನಿಮ್ಮ ಬ್ರ್ಯಾಂಡ್ ಕಿಟ್ ಖಾಲಿ ಇದೆ, ಆದ್ದರಿಂದ ವಿನ್ಯಾಸಗಳಲ್ಲಿ ಮಾದರಿ ಹೆಸರು ಕಾಣಿಸುತ್ತಿದೆ. ಕಳುಹಿಸಲು ಒಮ್ಮೆ ತುಂಬಿ.", brandLink: "ಬ್ರ್ಯಾಂಡ್ ಕಿಟ್ ತುಂಬಿ →", designsLive: "{n} ವಿನ್ಯಾಸಗಳು",
  },
  gu: {
    title: "તહેવાર લાઇબ્રેરી",
    intro: "દરેક તહેવાર માટે મફત, તૈયાર ડિઝાઇન, તહેવારથી ઘણા પહેલા ઉમેરાયેલી, જેથી તમે વહેલા મોકલી શકો. એક પસંદ કરો, તમારી ઑફર લખો અને તમારા નામ અને લોગો સાથે ગ્રાહકોને મોકલો.",
    festivalsFor: "આ ભાષા બોલનારાના તહેવારો", anyTime: "ગમે ત્યારે", today: "આજે", tomorrow: "કાલે", inDays: "{n} દિવસમાં",
    comingSoon: "ડિઝાઇન {date} એ આવશે", confirmDay: "તારીખ તમારા કૅલેન્ડરમાં પાકી કરી લો", pick: "કોઈ ડિઝાઇન પસંદ કરો, તેના પર તમારું નામ અને લોગો દેખાશે.",
    cardLanguage: "કાર્ડની ભાષા", offerLabel: "ઑફર અથવા સંદેશ (વૈકલ્પિક)", offerPlaceholder: "રવિવાર સુધી 15% છૂટ",
    colours: "રંગ", festivalColours: "તહેવારના રંગ", myColours: "મારી બ્રાન્ડના રંગ",
    everyLanguage: "મારા ગ્રાહકો બોલે છે તે દરેક ભાષામાં બનાવો", send: "મારા ગ્રાહકોને મોકલો", sending: "તૈયાર થઈ રહ્યું છે…",
    free: "મફત", fresh: "નવું", none: "આ તહેવારની ડિઝાઇન હજી નથી.",
    brandEmpty: "તમારી બ્રાન્ડ કિટ ખાલી છે, એટલે ડિઝાઇનમાં નમૂનારૂપ નામ દેખાય છે. મોકલવા માટે એક વાર ભરો.", brandLink: "બ્રાન્ડ કિટ ભરો →", designsLive: "{n} ડિઝાઇન",
  },
};
