import type { LanguageCode } from "./dictionaries";

/** Words for the public free card page. `{shop}` and `{url}` are filled in by the page. Plain, friendly, no jargon. */
export type FreeCardCopy = {
  title: string; sub: string; festival: string; shopName: string; shopPlaceholder: string; offer: string; offerPlaceholder: string;
  colours: string; make: string; pick: string; download: string; share: string; shareText: string;
  leadTitle: string; leadPhone: string; leadConsent: string; leadButton: string; leadDone: string; badNumber: string; needConsent: string; error: string;
  ctaTitle: string; ctaSub: string; ctaButton: string; needName: string; sampleName: string;
};

export const FREE_CARD_COPY: Record<LanguageCode, FreeCardCopy> = {
  en: {
    title: "Make a free festival card with your shop name", sub: "No signup needed. Pick a festival, type your shop name, and share it on WhatsApp.",
    festival: "Festival", shopName: "Your shop name", shopPlaceholder: "Sharma Traders", offer: "Offer or message (optional)", offerPlaceholder: "15% off till Sunday",
    colours: "Colours", make: "Make my card", pick: "Pick the one you like", download: "Download", share: "Share on WhatsApp", shareText: "Warm festival wishes from {shop}! Make your own free card: {url}",
    leadTitle: "Want new festival designs on WhatsApp?", leadPhone: "Your WhatsApp number", leadConsent: "Yes, send me new festival designs and tips on WhatsApp. I can say STOP any time.",
    leadButton: "Send me new designs", leadDone: "Done! We will send you new designs before each festival.", badNumber: "Please check the number", needConsent: "Please tick the box to agree", error: "Something went wrong. Please try again.",
    ctaTitle: "Send this card to all your customers on WhatsApp", ctaSub: "Free for 7 days. Your name and logo, in your customers' own language.", ctaButton: "Start free", needName: "Type your shop name first", sampleName: "Sharma Traders",
  },
  hi: {
    title: "अपनी दुकान के नाम के साथ मुफ़्त त्योहार कार्ड बनाएँ", sub: "साइन-अप की ज़रूरत नहीं। त्योहार चुनें, दुकान का नाम लिखें और WhatsApp पर शेयर करें।",
    festival: "त्योहार", shopName: "आपकी दुकान का नाम", shopPlaceholder: "शर्मा ट्रेडर्स", offer: "ऑफ़र या संदेश (ज़रूरी नहीं)", offerPlaceholder: "रविवार तक 15% छूट",
    colours: "रंग", make: "मेरा कार्ड बनाएँ", pick: "जो पसंद आए वह चुनें", download: "डाउनलोड करें", share: "WhatsApp पर शेयर करें", shareText: "{shop} की ओर से त्योहार की हार्दिक शुभकामनाएँ! अपना मुफ़्त कार्ड बनाएँ: {url}",
    leadTitle: "नए त्योहार डिज़ाइन WhatsApp पर चाहिए?", leadPhone: "आपका WhatsApp नंबर", leadConsent: "हाँ, मुझे नए त्योहार डिज़ाइन और सुझाव WhatsApp पर भेजें। मैं कभी भी STOP लिख सकता/सकती हूँ।",
    leadButton: "मुझे नए डिज़ाइन भेजें", leadDone: "हो गया! हर त्योहार से पहले हम आपको नए डिज़ाइन भेजेंगे।", badNumber: "कृपया नंबर जाँचें", needConsent: "सहमति के लिए बॉक्स पर टिक करें", error: "कुछ गड़बड़ हुई। कृपया फिर से कोशिश करें।",
    ctaTitle: "यह कार्ड अपने सभी ग्राहकों को WhatsApp पर भेजें", ctaSub: "7 दिन मुफ़्त। आपका नाम और लोगो, आपके ग्राहकों की अपनी भाषा में।", ctaButton: "मुफ़्त शुरू करें", needName: "पहले दुकान का नाम लिखें", sampleName: "शर्मा ट्रेडर्स",
  },
  mr: {
    title: "तुमच्या दुकानाच्या नावासह मोफत सण कार्ड बनवा", sub: "साइन-अप नको. सण निवडा, दुकानाचे नाव लिहा आणि WhatsApp वर शेअर करा.",
    festival: "सण", shopName: "तुमच्या दुकानाचे नाव", shopPlaceholder: "शर्मा ट्रेडर्स", offer: "ऑफर किंवा संदेश (ऐच्छिक)", offerPlaceholder: "रविवारपर्यंत १५% सूट",
    colours: "रंग", make: "माझे कार्ड बनवा", pick: "तुम्हाला आवडेल ते निवडा", download: "डाउनलोड करा", share: "WhatsApp वर शेअर करा", shareText: "{shop} कडून सणाच्या हार्दिक शुभेच्छा! तुमचे स्वतःचे मोफत कार्ड बनवा: {url}",
    leadTitle: "नवीन सण डिझाइन WhatsApp वर हवेत?", leadPhone: "तुमचा WhatsApp नंबर", leadConsent: "हो, मला नवीन सण डिझाइन आणि टिप्स WhatsApp वर पाठवा. मी केव्हाही STOP लिहू शकतो/शकते.",
    leadButton: "मला नवीन डिझाइन पाठवा", leadDone: "झाले! प्रत्येक सणाआधी आम्ही तुम्हाला नवीन डिझाइन पाठवू.", badNumber: "कृपया नंबर तपासा", needConsent: "सहमतीसाठी बॉक्सवर टिक करा", error: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
    ctaTitle: "हे कार्ड तुमच्या सर्व ग्राहकांना WhatsApp वर पाठवा", ctaSub: "7 दिवस मोफत. तुमचे नाव आणि लोगो, तुमच्या ग्राहकांच्या स्वतःच्या भाषेत.", ctaButton: "मोफत सुरू करा", needName: "आधी दुकानाचे नाव लिहा", sampleName: "शर्मा ट्रेडर्स",
  },
  ta: {
    title: "உங்கள் கடை பெயருடன் இலவசப் பண்டிகை கார்டு உருவாக்குங்கள்", sub: "பதிவு தேவையில்லை. பண்டிகையைத் தேர்ந்தெடுத்து, கடை பெயரை எழுதி, WhatsApp-இல் பகிருங்கள்.",
    festival: "பண்டிகை", shopName: "உங்கள் கடையின் பெயர்", shopPlaceholder: "சர்மா டிரேடர்ஸ்", offer: "சலுகை அல்லது செய்தி (விருப்பம்)", offerPlaceholder: "ஞாயிறு வரை 15% தள்ளுபடி",
    colours: "நிறங்கள்", make: "என் கார்டை உருவாக்கு", pick: "பிடித்ததைத் தேர்ந்தெடுங்கள்", download: "பதிவிறக்கு", share: "WhatsApp-இல் பகிர்", shareText: "{shop} சார்பாக பண்டிகை நல்வாழ்த்துகள்! உங்கள் சொந்த இலவச கார்டை உருவாக்குங்கள்: {url}",
    leadTitle: "புதிய பண்டிகை வடிவமைப்புகள் WhatsApp-இல் வேண்டுமா?", leadPhone: "உங்கள் WhatsApp எண்", leadConsent: "ஆம், புதிய பண்டிகை வடிவமைப்புகளையும் குறிப்புகளையும் WhatsApp-இல் அனுப்புங்கள். எப்போது வேண்டுமானாலும் STOP என்று சொல்லலாம்.",
    leadButton: "புதிய வடிவமைப்புகளை அனுப்புங்கள்", leadDone: "முடிந்தது! ஒவ்வொரு பண்டிகைக்கும் முன் புதிய வடிவமைப்புகளை அனுப்புவோம்.", badNumber: "எண்ணைச் சரிபார்க்கவும்", needConsent: "சம்மதிக்க பெட்டியில் டிக் செய்யவும்", error: "ஏதோ தவறு நடந்தது. மீண்டும் முயலவும்.",
    ctaTitle: "இந்தக் கார்டை உங்கள் எல்லா வாடிக்கையாளர்களுக்கும் WhatsApp-இல் அனுப்புங்கள்", ctaSub: "7 நாள் இலவசம். உங்கள் பெயர், லோகோ, உங்கள் வாடிக்கையாளர்களின் சொந்த மொழியில்.", ctaButton: "இலவசமாகத் தொடங்கு", needName: "முதலில் கடை பெயரை எழுதுங்கள்", sampleName: "சர்மா டிரேடர்ஸ்",
  },
  te: {
    title: "మీ షాపు పేరుతో ఉచిత పండుగ కార్డ్ తయారు చేయండి", sub: "సైన్-అప్ అవసరం లేదు. పండుగను ఎంచుకుని, షాపు పేరు రాసి, WhatsApp లో షేర్ చేయండి.",
    festival: "పండుగ", shopName: "మీ షాపు పేరు", shopPlaceholder: "శర్మ ట్రేడర్స్", offer: "ఆఫర్ లేదా సందేశం (ఐచ్ఛికం)", offerPlaceholder: "ఆదివారం వరకు 15% తగ్గింపు",
    colours: "రంగులు", make: "నా కార్డ్ తయారు చేయండి", pick: "మీకు నచ్చినది ఎంచుకోండి", download: "డౌన్‌లోడ్", share: "WhatsApp లో షేర్ చేయండి", shareText: "{shop} నుండి పండుగ శుభాకాంక్షలు! మీ స్వంత ఉచిత కార్డ్ తయారు చేయండి: {url}",
    leadTitle: "కొత్త పండుగ డిజైన్లు WhatsApp లో కావాలా?", leadPhone: "మీ WhatsApp నంబర్", leadConsent: "అవును, కొత్త పండుగ డిజైన్లు, చిట్కాలు WhatsApp లో పంపండి. నేను ఎప్పుడైనా STOP అని చెప్పవచ్చు.",
    leadButton: "కొత్త డిజైన్లు పంపండి", leadDone: "అయింది! ప్రతి పండుగకు ముందు కొత్త డిజైన్లు పంపుతాం.", badNumber: "దయచేసి నంబర్‌ను సరిచూడండి", needConsent: "అంగీకరించడానికి బాక్స్‌ను టిక్ చేయండి", error: "ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    ctaTitle: "ఈ కార్డ్‌ను మీ కస్టమర్లందరికీ WhatsApp లో పంపండి", ctaSub: "7 రోజులు ఉచితం. మీ పేరు, లోగో, మీ కస్టమర్ల స్వంత భాషలో.", ctaButton: "ఉచితంగా మొదలుపెట్టండి", needName: "ముందుగా షాపు పేరు రాయండి", sampleName: "శర్మ ట్రేడర్స్",
  },
  kn: {
    title: "ನಿಮ್ಮ ಅಂಗಡಿ ಹೆಸರಿನೊಂದಿಗೆ ಉಚಿತ ಹಬ್ಬದ ಕಾರ್ಡ್ ಮಾಡಿ", sub: "ಸೈನ್-ಅಪ್ ಬೇಡ. ಹಬ್ಬವನ್ನು ಆರಿಸಿ, ಅಂಗಡಿ ಹೆಸರು ಬರೆಯಿರಿ, WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ.",
    festival: "ಹಬ್ಬ", shopName: "ನಿಮ್ಮ ಅಂಗಡಿಯ ಹೆಸರು", shopPlaceholder: "ಶರ್ಮಾ ಟ್ರೇಡರ್ಸ್", offer: "ಆಫರ್ ಅಥವಾ ಸಂದೇಶ (ಐಚ್ಛಿಕ)", offerPlaceholder: "ಭಾನುವಾರದವರೆಗೆ 15% ರಿಯಾಯಿತಿ",
    colours: "ಬಣ್ಣಗಳು", make: "ನನ್ನ ಕಾರ್ಡ್ ಮಾಡಿ", pick: "ನಿಮಗೆ ಇಷ್ಟವಾದದ್ದನ್ನು ಆರಿಸಿ", download: "ಡೌನ್‌ಲೋಡ್", share: "WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ", shareText: "{shop} ಅವರಿಂದ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ನಿಮ್ಮದೇ ಉಚಿತ ಕಾರ್ಡ್ ಮಾಡಿ: {url}",
    leadTitle: "ಹೊಸ ಹಬ್ಬದ ವಿನ್ಯಾಸಗಳು WhatsApp ನಲ್ಲಿ ಬೇಕೇ?", leadPhone: "ನಿಮ್ಮ WhatsApp ಸಂಖ್ಯೆ", leadConsent: "ಹೌದು, ಹೊಸ ಹಬ್ಬದ ವಿನ್ಯಾಸಗಳು ಮತ್ತು ಸಲಹೆಗಳನ್ನು WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿ. ನಾನು ಯಾವಾಗ ಬೇಕಾದರೂ STOP ಎಂದು ಹೇಳಬಹುದು.",
    leadButton: "ಹೊಸ ವಿನ್ಯಾಸಗಳನ್ನು ಕಳುಹಿಸಿ", leadDone: "ಆಯಿತು! ಪ್ರತಿ ಹಬ್ಬದ ಮೊದಲು ಹೊಸ ವಿನ್ಯಾಸಗಳನ್ನು ಕಳುಹಿಸುತ್ತೇವೆ.", badNumber: "ದಯವಿಟ್ಟು ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ", needConsent: "ಒಪ್ಪಿಗೆಗಾಗಿ ಬಾಕ್ಸ್ ಮೇಲೆ ಟಿಕ್ ಮಾಡಿ", error: "ಏನೋ ತಪ್ಪಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    ctaTitle: "ಈ ಕಾರ್ಡ್ ಅನ್ನು ನಿಮ್ಮ ಎಲ್ಲಾ ಗ್ರಾಹಕರಿಗೆ WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿ", ctaSub: "7 ದಿನ ಉಚಿತ. ನಿಮ್ಮ ಹೆಸರು, ಲೋಗೋ, ನಿಮ್ಮ ಗ್ರಾಹಕರ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ.", ctaButton: "ಉಚಿತವಾಗಿ ಶುರುಮಾಡಿ", needName: "ಮೊದಲು ಅಂಗಡಿ ಹೆಸರು ಬರೆಯಿರಿ", sampleName: "ಶರ್ಮಾ ಟ್ರೇಡರ್ಸ್",
  },
  gu: {
    title: "તમારી દુકાનના નામ સાથે મફત તહેવાર કાર્ડ બનાવો", sub: "સાઇન-અપ જરૂરી નથી. તહેવાર પસંદ કરો, દુકાનનું નામ લખો અને WhatsApp પર શેર કરો.",
    festival: "તહેવાર", shopName: "તમારી દુકાનનું નામ", shopPlaceholder: "શર્મા ટ્રેડર્સ", offer: "ઑફર અથવા સંદેશ (વૈકલ્પિક)", offerPlaceholder: "રવિવાર સુધી 15% છૂટ",
    colours: "રંગ", make: "મારું કાર્ડ બનાવો", pick: "જે ગમે તે પસંદ કરો", download: "ડાઉનલોડ કરો", share: "WhatsApp પર શેર કરો", shareText: "{shop} તરફથી તહેવારની હાર્દિક શુભેચ્છાઓ! તમારું પોતાનું મફત કાર્ડ બનાવો: {url}",
    leadTitle: "નવી તહેવાર ડિઝાઇન WhatsApp પર જોઈએ છે?", leadPhone: "તમારો WhatsApp નંબર", leadConsent: "હા, મને નવી તહેવાર ડિઝાઇન અને ટિપ્સ WhatsApp પર મોકલો. હું ગમે ત્યારે STOP લખી શકું છું.",
    leadButton: "મને નવી ડિઝાઇન મોકલો", leadDone: "થઈ ગયું! દરેક તહેવાર પહેલા અમે તમને નવી ડિઝાઇન મોકલીશું.", badNumber: "કૃપા કરીને નંબર તપાસો", needConsent: "સંમતિ માટે બોક્સ પર ટિક કરો", error: "કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.",
    ctaTitle: "આ કાર્ડ તમારા બધા ગ્રાહકોને WhatsApp પર મોકલો", ctaSub: "7 દિવસ મફત. તમારું નામ અને લોગો, તમારા ગ્રાહકોની પોતાની ભાષામાં.", ctaButton: "મફત શરૂ કરો", needName: "પહેલા દુકાનનું નામ લખો", sampleName: "શર્મા ટ્રેડર્સ",
  },
};
