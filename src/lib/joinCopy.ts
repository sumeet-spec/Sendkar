import type { LanguageCode } from "@/lib/i18n/dictionaries";

/**
 * Words on the page a shop's customer sees after scanning the counter QR. Written out in every language;
 * `{shop}` is replaced with the shop's own name. The consent sentence is the one a customer agrees to.
 */
export type JoinCopy = {
  title: string;
  name: string;
  phone: string;
  language: string;
  consent: string;
  button: string;
  done: string;
  badNumber: string;
  needConsent: string;
  error: string;
  scan: string;
};

export const JOIN_COPY: Record<LanguageCode, JoinCopy> = {
  en: {
    title: "Get offers and updates from {shop} on WhatsApp",
    name: "Your name", phone: "WhatsApp number", language: "Language for messages",
    consent: "I agree to receive offers and updates from {shop} on WhatsApp. I can stop any time by replying STOP.",
    button: "Yes, send me offers", done: "Thank you! You will get offers from {shop} on WhatsApp.",
    badNumber: "Please check the number", needConsent: "Please tick the box to agree", error: "Something went wrong. Please try again.",
    scan: "Scan to get offers on WhatsApp",
  },
  hi: {
    title: "{shop} के ऑफ़र और अपडेट WhatsApp पर पाएँ",
    name: "आपका नाम", phone: "WhatsApp नंबर", language: "संदेशों की भाषा",
    consent: "मैं {shop} से WhatsApp पर ऑफ़र और अपडेट पाने के लिए सहमत हूँ। मैं कभी भी STOP लिखकर इन्हें बंद कर सकता/सकती हूँ।",
    button: "हाँ, मुझे ऑफ़र भेजें", done: "धन्यवाद! आपको {shop} के ऑफ़र WhatsApp पर मिलेंगे।",
    badNumber: "कृपया नंबर जाँचें", needConsent: "सहमति के लिए बॉक्स पर टिक करें", error: "कुछ गड़बड़ हुई। कृपया फिर से कोशिश करें।",
    scan: "स्कैन करें, WhatsApp पर ऑफ़र पाएँ",
  },
  mr: {
    title: "{shop} च्या ऑफर्स आणि अपडेट्स WhatsApp वर मिळवा",
    name: "तुमचे नाव", phone: "WhatsApp नंबर", language: "संदेशांची भाषा",
    consent: "मी {shop} कडून WhatsApp वर ऑफर्स आणि अपडेट्स मिळवण्यास सहमत आहे. मी केव्हाही STOP लिहून हे बंद करू शकतो/शकते.",
    button: "हो, मला ऑफर्स पाठवा", done: "धन्यवाद! तुम्हाला {shop} च्या ऑफर्स WhatsApp वर मिळतील.",
    badNumber: "कृपया नंबर तपासा", needConsent: "सहमतीसाठी बॉक्सवर टिक करा", error: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
    scan: "स्कॅन करा, WhatsApp वर ऑफर्स मिळवा",
  },
  ta: {
    title: "{shop} சலுகைகள் மற்றும் தகவல்களை WhatsApp-இல் பெறுங்கள்",
    name: "உங்கள் பெயர்", phone: "WhatsApp எண்", language: "செய்திகளின் மொழி",
    consent: "{shop} இடமிருந்து WhatsApp-இல் சலுகைகள் மற்றும் தகவல்களைப் பெற நான் சம்மதிக்கிறேன். எப்போது வேண்டுமானாலும் STOP என்று பதிலளித்து நிறுத்தலாம்.",
    button: "ஆம், சலுகைகளை அனுப்புங்கள்", done: "நன்றி! {shop} சலுகைகள் WhatsApp-இல் உங்களுக்கு வரும்.",
    badNumber: "எண்ணைச் சரிபார்க்கவும்", needConsent: "சம்மதிக்க பெட்டியில் டிக் செய்யவும்", error: "ஏதோ தவறு நடந்தது. மீண்டும் முயலவும்.",
    scan: "ஸ்கேன் செய்து WhatsApp-இல் சலுகைகளைப் பெறுங்கள்",
  },
  te: {
    title: "{shop} ఆఫర్లు, అప్‌డేట్లను WhatsApp లో పొందండి",
    name: "మీ పేరు", phone: "WhatsApp నంబర్", language: "సందేశాల భాష",
    consent: "{shop} నుండి WhatsApp లో ఆఫర్లు, అప్‌డేట్లు అందుకోవడానికి నేను అంగీకరిస్తున్నాను. ఎప్పుడైనా STOP అని పంపి ఆపవచ్చు.",
    button: "అవును, ఆఫర్లు పంపండి", done: "ధన్యవాదాలు! {shop} ఆఫర్లు WhatsApp లో మీకు వస్తాయి.",
    badNumber: "దయచేసి నంబర్‌ను సరిచూడండి", needConsent: "అంగీకరించడానికి బాక్స్‌ను టిక్ చేయండి", error: "ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    scan: "స్కాన్ చేసి WhatsApp లో ఆఫర్లు పొందండి",
  },
  kn: {
    title: "{shop} ಆಫರ್‌ಗಳು ಮತ್ತು ಅಪ್‌ಡೇಟ್‌ಗಳನ್ನು WhatsApp ನಲ್ಲಿ ಪಡೆಯಿರಿ",
    name: "ನಿಮ್ಮ ಹೆಸರು", phone: "WhatsApp ಸಂಖ್ಯೆ", language: "ಸಂದೇಶಗಳ ಭಾಷೆ",
    consent: "{shop} ಅವರಿಂದ WhatsApp ನಲ್ಲಿ ಆಫರ್‌ಗಳು ಮತ್ತು ಅಪ್‌ಡೇಟ್‌ಗಳನ್ನು ಪಡೆಯಲು ನಾನು ಒಪ್ಪುತ್ತೇನೆ. ನಾನು ಯಾವಾಗ ಬೇಕಾದರೂ STOP ಎಂದು ಕಳುಹಿಸಿ ನಿಲ್ಲಿಸಬಹುದು.",
    button: "ಹೌದು, ಆಫರ್‌ಗಳನ್ನು ಕಳುಹಿಸಿ", done: "ಧನ್ಯವಾದಗಳು! {shop} ಆಫರ್‌ಗಳು WhatsApp ನಲ್ಲಿ ನಿಮಗೆ ಬರುತ್ತವೆ.",
    badNumber: "ದಯವಿಟ್ಟು ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ", needConsent: "ಒಪ್ಪಿಗೆಗಾಗಿ ಬಾಕ್ಸ್ ಮೇಲೆ ಟಿಕ್ ಮಾಡಿ", error: "ಏನೋ ತಪ್ಪಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    scan: "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ, WhatsApp ನಲ್ಲಿ ಆಫರ್‌ಗಳನ್ನು ಪಡೆಯಿರಿ",
  },
  gu: {
    title: "{shop} ની ઑફર અને અપડેટ WhatsApp પર મેળવો",
    name: "તમારું નામ", phone: "WhatsApp નંબર", language: "સંદેશની ભાષા",
    consent: "હું {shop} તરફથી WhatsApp પર ઑફર અને અપડેટ મેળવવા સંમત છું. હું ગમે ત્યારે STOP લખીને તે બંધ કરી શકું છું.",
    button: "હા, મને ઑફર મોકલો", done: "આભાર! તમને {shop} ની ઑફર WhatsApp પર મળશે.",
    badNumber: "કૃપા કરીને નંબર તપાસો", needConsent: "સંમતિ માટે બોક્સ પર ટિક કરો", error: "કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.",
    scan: "સ્કેન કરો, WhatsApp પર ઑફર મેળવો",
  },
};

export const withShop = (text: string, shop: string) => text.replaceAll("{shop}", shop);
