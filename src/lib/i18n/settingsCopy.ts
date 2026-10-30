import type { LanguageCode } from "./dictionaries";

/** Words for the Payments and AI agent settings pages. */
export type PaySettingsUi = {
  title: string; intro: string; modeTitle: string; modeIntro: string;
  upiTitle: string; upiBody: string; upiIdPh: string; upiNamePh: string;
  gatewayTitle: string; gatewayBody: string; gatewayFirst: string;
  linkTitle: string; linkBody: string; linkPh: string; noneTitle: string; noneBody: string;
  save: string; saved: string; connected: string; disconnect: string; disconnecting: string; confirmDisconnect: string;
  razorpayDesc: string; payuDesc: string; keyIdSet: string; keyId: string; keySecret: string; merchantKeySet: string; merchantKey: string; salt: string;
};

export type AiAgentUi = {
  title: string; intro: string; more1: string; moreLink: string; more2: string; planNote1: string; planLink: string; planNote2: string;
  toggleTitle: string; toggleBody: string; knowTitle: string; charsLeft: string; knowHelp: string; knowPh: string; tip: string;
  save: string; saving: string; saved: string;
};

export const PAY_SETTINGS_UI: Record<LanguageCode, PaySettingsUi> = {
  en: {
    title: "Payments", intro: "Choose how customers pay a bill. Connect a payment company if you want payment to be confirmed by itself. Sendkar never sees card or UPI details: customers pay in their own app or on the payment company's page.",
    modeTitle: "How customers pay you", modeIntro: "Bills that are not paid yet carry a \"Pay now\" button on WhatsApp. Pick the way that suits your shop.",
    upiTitle: "My UPI ID", upiBody: "Nothing to connect. The customer's UPI app opens with the amount filled in. You mark the bill paid when the money arrives.", upiIdPh: "your UPI ID, like sharma@okhdfcbank", upiNamePh: "Name customers see, like Sharma Traders",
    gatewayTitle: "Razorpay or PayU", gatewayBody: "Connect your account below. Payment is confirmed automatically and the bill is marked paid.", gatewayFirst: "Connect Razorpay or PayU below first.",
    linkTitle: "A payment link I paste", linkBody: "Use any payment link you already have. You mark the bill paid when the money arrives.", linkPh: "https://rzp.io/l/your-link", noneTitle: "No payment button", noneBody: "Bills go out without a way to pay.",
    save: "Save", saved: "Saved", connected: "Connected", disconnect: "Disconnect", disconnecting: "Disconnecting…", confirmDisconnect: "Disconnect {name}? Payment links already sent may stop working.",
    razorpayDesc: "From the Razorpay dashboard: Settings, API Keys. Makes a payment link for each bill.", payuDesc: "From the PayU dashboard: My Account, Merchant Key and Salt. New: send yourself a test payment before relying on it.",
    keyIdSet: "Key ID (already set)", keyId: "Key ID", keySecret: "Key secret", merchantKeySet: "Merchant key (already set)", merchantKey: "Merchant key", salt: "Salt",
  },
  hi: {
    title: "भुगतान", intro: "चुनें कि ग्राहक बिल का भुगतान कैसे करें। अगर चाहते हैं कि भुगतान अपने आप पक्का हो, तो पेमेंट कंपनी जोड़ें। Sendkar को कार्ड या UPI की जानकारी कभी नहीं दिखती: ग्राहक अपने ऐप या पेमेंट कंपनी के पेज पर भुगतान करते हैं।",
    modeTitle: "ग्राहक आपको कैसे भुगतान करें", modeIntro: "जिन बिलों का भुगतान बाकी है, उन पर WhatsApp में \"अभी भुगतान करें\" का बटन होता है। अपनी दुकान के हिसाब से तरीका चुनें।",
    upiTitle: "मेरी UPI ID", upiBody: "कुछ जोड़ना नहीं है। ग्राहक का UPI ऐप रकम भरी हुई खुलता है। पैसे आने पर आप बिल चुकता कर देते हैं।", upiIdPh: "आपकी UPI ID, जैसे sharma@okhdfcbank", upiNamePh: "ग्राहक को दिखने वाला नाम, जैसे शर्मा ट्रेडर्स",
    gatewayTitle: "Razorpay या PayU", gatewayBody: "नीचे अपना खाता जोड़ें। भुगतान अपने आप पक्का होता है और बिल चुकता हो जाता है।", gatewayFirst: "पहले नीचे Razorpay या PayU जोड़ें।",
    linkTitle: "मेरा पेस्ट किया हुआ पेमेंट लिंक", linkBody: "आपके पास जो भी पेमेंट लिंक है, वही इस्तेमाल करें। पैसे आने पर आप बिल चुकता कर देते हैं।", linkPh: "https://rzp.io/l/aapka-link", noneTitle: "भुगतान का बटन नहीं", noneBody: "बिल बिना भुगतान के तरीके के जाते हैं।",
    save: "सेव करें", saved: "सेव हो गया", connected: "जुड़ा हुआ", disconnect: "हटाएँ", disconnecting: "हटा रहे हैं…", confirmDisconnect: "{name} हटाएँ? पहले भेजे गए पेमेंट लिंक काम करना बंद कर सकते हैं।",
    razorpayDesc: "Razorpay डैशबोर्ड में: Settings, API Keys। हर बिल के लिए एक पेमेंट लिंक बनता है।", payuDesc: "PayU डैशबोर्ड में: My Account, Merchant Key और Salt। नया: भरोसा करने से पहले ख़ुद को एक टेस्ट पेमेंट भेजें।",
    keyIdSet: "Key ID (पहले से भरी है)", keyId: "Key ID", keySecret: "Key secret", merchantKeySet: "Merchant key (पहले से भरी है)", merchantKey: "Merchant key", salt: "Salt",
  },
  mr: {
    title: "पेमेंट", intro: "ग्राहकांनी बिलाचे पैसे कसे द्यावेत ते निवडा. पेमेंट आपोआप पक्के व्हावे असे वाटत असेल तर पेमेंट कंपनी जोडा. Sendkar ला कार्ड किंवा UPI ची माहिती कधीच दिसत नाही: ग्राहक त्यांच्या ॲपवर किंवा पेमेंट कंपनीच्या पानावर पैसे देतात.",
    modeTitle: "ग्राहकांनी तुम्हाला पैसे कसे द्यावेत", modeIntro: "न भरलेल्या बिलांवर WhatsApp मध्ये \"आता पैसे द्या\" बटन असते. तुमच्या दुकानाला साजेसा मार्ग निवडा.",
    upiTitle: "माझा UPI ID", upiBody: "काही जोडायचे नाही. ग्राहकाचे UPI ॲप रक्कम भरलेले उघडते. पैसे आल्यावर तुम्ही बिल भरले म्हणून नोंदवता.", upiIdPh: "तुमचा UPI ID, जसे sharma@okhdfcbank", upiNamePh: "ग्राहकाला दिसणारे नाव, जसे शर्मा ट्रेडर्स",
    gatewayTitle: "Razorpay किंवा PayU", gatewayBody: "खाली तुमचे खाते जोडा. पेमेंट आपोआप पक्के होते आणि बिल भरले म्हणून नोंदले जाते.", gatewayFirst: "आधी खाली Razorpay किंवा PayU जोडा.",
    linkTitle: "मी पेस्ट केलेली पेमेंट लिंक", linkBody: "तुमच्याकडे असलेली कोणतीही पेमेंट लिंक वापरा. पैसे आल्यावर तुम्ही बिल भरले म्हणून नोंदवता.", linkPh: "https://rzp.io/l/tumchi-link", noneTitle: "पेमेंट बटन नको", noneBody: "बिले पैसे देण्याच्या मार्गाशिवाय जातात.",
    save: "सेव्ह करा", saved: "सेव्ह झाले", connected: "जोडलेले", disconnect: "काढा", disconnecting: "काढत आहे…", confirmDisconnect: "{name} काढायचे? आधी पाठवलेल्या पेमेंट लिंक चालणे थांबू शकते.",
    razorpayDesc: "Razorpay डॅशबोर्डमध्ये: Settings, API Keys. प्रत्येक बिलासाठी पेमेंट लिंक बनते.", payuDesc: "PayU डॅशबोर्डमध्ये: My Account, Merchant Key आणि Salt. नवीन: भरवसा ठेवण्यापूर्वी स्वतःला एक टेस्ट पेमेंट पाठवा.",
    keyIdSet: "Key ID (आधीच भरले आहे)", keyId: "Key ID", keySecret: "Key secret", merchantKeySet: "Merchant key (आधीच भरले आहे)", merchantKey: "Merchant key", salt: "Salt",
  },
  gu: {
    title: "ચુકવણી", intro: "ગ્રાહકો બિલની ચુકવણી કેવી રીતે કરે તે પસંદ કરો. ચુકવણી આપમેળે પાક્કી થાય તે માટે પેમેન્ટ કંપની જોડો. Sendkar ને કાર્ડ કે UPI ની માહિતી ક્યારેય દેખાતી નથી: ગ્રાહકો પોતાની એપ કે પેમેન્ટ કંપનીના પેજ પર ચૂકવે છે.",
    modeTitle: "ગ્રાહકો તમને કેવી રીતે ચૂકવે", modeIntro: "ન ચૂકવેલ બિલ પર WhatsApp માં \"હમણાં ચૂકવો\" બટન હોય છે. તમારી દુકાનને અનુકૂળ રીત પસંદ કરો.",
    upiTitle: "મારો UPI ID", upiBody: "કંઈ જોડવાનું નથી. ગ્રાહકની UPI એપ રકમ ભરેલી ખુલે છે. પૈસા આવે ત્યારે તમે બિલ ચૂકવેલ નોંધો છો.", upiIdPh: "તમારો UPI ID, જેમ કે sharma@okhdfcbank", upiNamePh: "ગ્રાહકને દેખાતું નામ, જેમ કે શર્મા ટ્રેડર્સ",
    gatewayTitle: "Razorpay કે PayU", gatewayBody: "નીચે તમારું ખાતું જોડો. ચુકવણી આપમેળે પાક્કી થાય છે અને બિલ ચૂકવેલ નોંધાય છે.", gatewayFirst: "પહેલા નીચે Razorpay કે PayU જોડો.",
    linkTitle: "મેં પેસ્ટ કરેલી પેમેન્ટ લિંક", linkBody: "તમારી પાસે જે પેમેન્ટ લિંક હોય તે વાપરો. પૈસા આવે ત્યારે તમે બિલ ચૂકવેલ નોંધો છો.", linkPh: "https://rzp.io/l/tamari-link", noneTitle: "ચુકવણીનું બટન નહીં", noneBody: "બિલ ચુકવણીની રીત વિના જાય છે.",
    save: "સેવ કરો", saved: "સેવ થયું", connected: "જોડાયેલ", disconnect: "કાઢો", disconnecting: "કાઢી રહ્યા છીએ…", confirmDisconnect: "{name} કાઢી નાખીએ? પહેલાં મોકલેલી પેમેન્ટ લિંક ચાલવાનું બંધ થઈ શકે છે.",
    razorpayDesc: "Razorpay ડેશબોર્ડમાં: Settings, API Keys. દરેક બિલ માટે પેમેન્ટ લિંક બને છે.", payuDesc: "PayU ડેશબોર્ડમાં: My Account, Merchant Key અને Salt. નવું: ભરોસો કરતા પહેલાં જાતને એક ટેસ્ટ પેમેન્ટ મોકલો.",
    keyIdSet: "Key ID (પહેલેથી ભરેલું છે)", keyId: "Key ID", keySecret: "Key secret", merchantKeySet: "Merchant key (પહેલેથી ભરેલું છે)", merchantKey: "Merchant key", salt: "Salt",
  },
  ta: {
    title: "பணம் செலுத்துதல்", intro: "வாடிக்கையாளர்கள் பில்லுக்கு எப்படி பணம் செலுத்த வேண்டும் என்பதைத் தேர்ந்தெடுங்கள். பணம் தானாக உறுதியாக வேண்டும் என்றால் ஒரு பணம் செலுத்தும் நிறுவனத்தை இணையுங்கள். கார்டு அல்லது UPI விவரங்களை Sendkar பார்ப்பதே இல்லை: வாடிக்கையாளர்கள் தங்கள் செயலியிலோ நிறுவனத்தின் பக்கத்திலோ செலுத்துகிறார்கள்.",
    modeTitle: "வாடிக்கையாளர்கள் உங்களுக்கு எப்படி செலுத்த வேண்டும்", modeIntro: "செலுத்தப்படாத பில்களில் WhatsApp-ல் \"இப்போது செலுத்து\" பட்டன் இருக்கும். உங்கள் கடைக்குப் பொருத்தமான வழியைத் தேர்ந்தெடுங்கள்.",
    upiTitle: "என் UPI ID", upiBody: "எதையும் இணைக்க வேண்டாம். வாடிக்கையாளரின் UPI செயலி தொகையுடன் திறக்கும். பணம் வந்ததும் நீங்கள் பில்லை செலுத்தப்பட்டதாகக் குறிக்கிறீர்கள்.", upiIdPh: "உங்கள் UPI ID, எ.கா. sharma@okhdfcbank", upiNamePh: "வாடிக்கையாளர் பார்க்கும் பெயர், எ.கா. சர்மா டிரேடர்ஸ்",
    gatewayTitle: "Razorpay அல்லது PayU", gatewayBody: "கீழே உங்கள் கணக்கை இணையுங்கள். பணம் தானாக உறுதியாகி பில் செலுத்தப்பட்டதாகக் குறிக்கப்படும்.", gatewayFirst: "முதலில் கீழே Razorpay அல்லது PayU-ஐ இணையுங்கள்.",
    linkTitle: "நான் ஒட்டும் பணம் செலுத்தும் இணைப்பு", linkBody: "உங்களிடம் உள்ள எந்த பணம் செலுத்தும் இணைப்பையும் பயன்படுத்துங்கள். பணம் வந்ததும் நீங்கள் பில்லை செலுத்தப்பட்டதாகக் குறிக்கிறீர்கள்.", linkPh: "https://rzp.io/l/ungal-link", noneTitle: "பணம் செலுத்தும் பட்டன் வேண்டாம்", noneBody: "பில்கள் பணம் செலுத்தும் வழி இல்லாமல் செல்லும்.",
    save: "சேமி", saved: "சேமிக்கப்பட்டது", connected: "இணைக்கப்பட்டது", disconnect: "நீக்கு", disconnecting: "நீக்குகிறது…", confirmDisconnect: "{name}-ஐ நீக்கவா? ஏற்கனவே அனுப்பிய பணம் செலுத்தும் இணைப்புகள் வேலை செய்யாமல் போகலாம்.",
    razorpayDesc: "Razorpay டாஷ்போர்டில்: Settings, API Keys. ஒவ்வொரு பில்லுக்கும் ஒரு பணம் செலுத்தும் இணைப்பு உருவாகும்.", payuDesc: "PayU டாஷ்போர்டில்: My Account, Merchant Key மற்றும் Salt. புதியது: நம்புவதற்கு முன் உங்களுக்கே ஒரு சோதனை பணம் செலுத்திப் பாருங்கள்.",
    keyIdSet: "Key ID (ஏற்கனவே உள்ளது)", keyId: "Key ID", keySecret: "Key secret", merchantKeySet: "Merchant key (ஏற்கனவே உள்ளது)", merchantKey: "Merchant key", salt: "Salt",
  },
  te: {
    title: "చెల్లింపులు", intro: "కస్టమర్లు బిల్లుకు ఎలా చెల్లించాలో ఎంచుకోండి. చెల్లింపు ఆటోమేటిక్‌గా ధృవీకరించబడాలంటే ఒక పేమెంట్ కంపెనీని కలపండి. కార్డ్ లేదా UPI వివరాలు Sendkarకు ఎప్పుడూ కనిపించవు: కస్టమర్లు తమ యాప్‌లో లేదా పేమెంట్ కంపెనీ పేజీలో చెల్లిస్తారు.",
    modeTitle: "కస్టమర్లు మీకు ఎలా చెల్లించాలి", modeIntro: "చెల్లించని బిల్లులపై WhatsApp‌లో \"ఇప్పుడే చెల్లించండి\" బటన్ ఉంటుంది. మీ షాప్‌కు సరిపోయే పద్ధతిని ఎంచుకోండి.",
    upiTitle: "నా UPI ID", upiBody: "ఏమీ కలపక్కర్లేదు. కస్టమర్ UPI యాప్ మొత్తంతో తెరుచుకుంటుంది. డబ్బు వచ్చాక మీరు బిల్లును చెల్లించినట్టు గుర్తిస్తారు.", upiIdPh: "మీ UPI ID, ఉదా. sharma@okhdfcbank", upiNamePh: "కస్టమర్లకు కనిపించే పేరు, ఉదా. శర్మ ట్రేడర్స్",
    gatewayTitle: "Razorpay లేదా PayU", gatewayBody: "కింద మీ ఖాతాను కలపండి. చెల్లింపు ఆటోమేటిక్‌గా ధృవీకరించబడి బిల్లు చెల్లించినట్టు నమోదవుతుంది.", gatewayFirst: "ముందుగా కింద Razorpay లేదా PayU కలపండి.",
    linkTitle: "నేను పేస్ట్ చేసే చెల్లింపు లింక్", linkBody: "మీ దగ్గర ఉన్న ఏ చెల్లింపు లింక్ అయినా వాడండి. డబ్బు వచ్చాక మీరు బిల్లును చెల్లించినట్టు గుర్తిస్తారు.", linkPh: "https://rzp.io/l/mee-link", noneTitle: "చెల్లింపు బటన్ వద్దు", noneBody: "బిల్లులు చెల్లించే మార్గం లేకుండా వెళ్తాయి.",
    save: "సేవ్", saved: "సేవ్ అయింది", connected: "కలిపారు", disconnect: "తొలగించు", disconnecting: "తొలగిస్తోంది…", confirmDisconnect: "{name}ను తొలగించాలా? ఇప్పటికే పంపిన చెల్లింపు లింక్‌లు పని చేయకపోవచ్చు.",
    razorpayDesc: "Razorpay డ్యాష్‌బోర్డ్‌లో: Settings, API Keys. ప్రతి బిల్లుకు ఒక చెల్లింపు లింక్ తయారవుతుంది.", payuDesc: "PayU డ్యాష్‌బోర్డ్‌లో: My Account, Merchant Key, Salt. కొత్తది: నమ్మే ముందు మీకే ఒక టెస్ట్ చెల్లింపు పంపుకోండి.",
    keyIdSet: "Key ID (ఇప్పటికే ఉంది)", keyId: "Key ID", keySecret: "Key secret", merchantKeySet: "Merchant key (ఇప్పటికే ఉంది)", merchantKey: "Merchant key", salt: "Salt",
  },
  kn: {
    title: "ಪಾವತಿಗಳು", intro: "ಗ್ರಾಹಕರು ಬಿಲ್‌ಗೆ ಹೇಗೆ ಪಾವತಿಸಬೇಕೆಂದು ಆಯ್ಕೆಮಾಡಿ. ಪಾವತಿ ತಾನಾಗಿ ದೃಢವಾಗಬೇಕಾದರೆ ಒಂದು ಪಾವತಿ ಕಂಪನಿಯನ್ನು ಜೋಡಿಸಿ. ಕಾರ್ಡ್ ಅಥವಾ UPI ವಿವರಗಳು Sendkar ಗೆ ಎಂದೂ ಕಾಣುವುದಿಲ್ಲ: ಗ್ರಾಹಕರು ತಮ್ಮ ಆ್ಯಪ್‌ನಲ್ಲಿ ಅಥವಾ ಪಾವತಿ ಕಂಪನಿಯ ಪುಟದಲ್ಲಿ ಪಾವತಿಸುತ್ತಾರೆ.",
    modeTitle: "ಗ್ರಾಹಕರು ನಿಮಗೆ ಹೇಗೆ ಪಾವತಿಸಬೇಕು", modeIntro: "ಪಾವತಿಯಾಗದ ಬಿಲ್‌ಗಳಲ್ಲಿ WhatsApp‌ನಲ್ಲಿ \"ಈಗ ಪಾವತಿಸಿ\" ಬಟನ್ ಇರುತ್ತದೆ. ನಿಮ್ಮ ಅಂಗಡಿಗೆ ಸರಿಹೊಂದುವ ವಿಧಾನ ಆಯ್ಕೆಮಾಡಿ.",
    upiTitle: "ನನ್ನ UPI ID", upiBody: "ಏನನ್ನೂ ಜೋಡಿಸಬೇಕಿಲ್ಲ. ಗ್ರಾಹಕರ UPI ಆ್ಯಪ್ ಮೊತ್ತದೊಂದಿಗೆ ತೆರೆಯುತ್ತದೆ. ಹಣ ಬಂದ ಮೇಲೆ ನೀವು ಬಿಲ್ ಪಾವತಿಯಾಗಿದೆ ಎಂದು ಗುರುತಿಸುತ್ತೀರಿ.", upiIdPh: "ನಿಮ್ಮ UPI ID, ಉದಾ. sharma@okhdfcbank", upiNamePh: "ಗ್ರಾಹಕರಿಗೆ ಕಾಣುವ ಹೆಸರು, ಉದಾ. ಶರ್ಮಾ ಟ್ರೇಡರ್ಸ್",
    gatewayTitle: "Razorpay ಅಥವಾ PayU", gatewayBody: "ಕೆಳಗೆ ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಜೋಡಿಸಿ. ಪಾವತಿ ತಾನಾಗಿ ದೃಢವಾಗಿ ಬಿಲ್ ಪಾವತಿಯಾಗಿದೆ ಎಂದು ಗುರುತಾಗುತ್ತದೆ.", gatewayFirst: "ಮೊದಲು ಕೆಳಗೆ Razorpay ಅಥವಾ PayU ಜೋಡಿಸಿ.",
    linkTitle: "ನಾನು ಅಂಟಿಸುವ ಪಾವತಿ ಲಿಂಕ್", linkBody: "ನಿಮ್ಮ ಬಳಿ ಇರುವ ಯಾವುದೇ ಪಾವತಿ ಲಿಂಕ್ ಬಳಸಿ. ಹಣ ಬಂದ ಮೇಲೆ ನೀವು ಬಿಲ್ ಪಾವತಿಯಾಗಿದೆ ಎಂದು ಗುರುತಿಸುತ್ತೀರಿ.", linkPh: "https://rzp.io/l/nimma-link", noneTitle: "ಪಾವತಿ ಬಟನ್ ಬೇಡ", noneBody: "ಬಿಲ್‌ಗಳು ಪಾವತಿಸುವ ವಿಧಾನವಿಲ್ಲದೆ ಹೋಗುತ್ತವೆ.",
    save: "ಉಳಿಸಿ", saved: "ಉಳಿಸಲಾಗಿದೆ", connected: "ಜೋಡಿಸಲಾಗಿದೆ", disconnect: "ತೆಗೆಯಿರಿ", disconnecting: "ತೆಗೆಯಲಾಗುತ್ತಿದೆ…", confirmDisconnect: "{name} ತೆಗೆಯಬೇಕೆ? ಈಗಾಗಲೇ ಕಳುಹಿಸಿದ ಪಾವತಿ ಲಿಂಕ್‌ಗಳು ಕೆಲಸ ಮಾಡದಿರಬಹುದು.",
    razorpayDesc: "Razorpay ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ: Settings, API Keys. ಪ್ರತಿ ಬಿಲ್‌ಗೂ ಪಾವತಿ ಲಿಂಕ್ ಆಗುತ್ತದೆ.", payuDesc: "PayU ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ: My Account, Merchant Key ಮತ್ತು Salt. ಹೊಸದು: ನಂಬುವ ಮೊದಲು ನಿಮಗೇ ಒಂದು ಪರೀಕ್ಷಾ ಪಾವತಿ ಕಳುಹಿಸಿ.",
    keyIdSet: "Key ID (ಈಗಾಗಲೇ ಇದೆ)", keyId: "Key ID", keySecret: "Key secret", merchantKeySet: "Merchant key (ಈಗಾಗಲೇ ಇದೆ)", merchantKey: "Merchant key", salt: "Salt",
  },
};

export const AI_AGENT_UI: Record<LanguageCode, AiAgentUi> = {
  en: {
    title: "AI agent", intro: "Your shop's WhatsApp assistant. When a customer says \"hi\" it greets them in their own language, and can answer questions, quote prices, take an order and show what they owe and how to pay. Replies go out on their own, any time of day.",
    more1: "It already knows what you list under ", moreLink: "My items", more2: ", your opening hours, your brand kit details, how customers pay you, and each customer's unpaid bills. It only uses prices written there and passes anything else to you. Use the box below for anything extra, such as delivery areas or your return policy. Orders it takes show up on the Quick bill page, ready to turn into a bill.",
    planNote1: "The AI agent needs the ", planLink: "Growth plan or above", planNote2: ": every reply it sends is a real AI request.",
    toggleTitle: "Auto-reply agent", toggleBody: "Replies to customers on its own, any time of day. It runs when no flow or keyword automation has answered first.",
    knowTitle: "Extra notes about your business", charsLeft: "{n} characters left", knowHelp: "Anything the assistant should know that is not in your items, hours or brand details: delivery areas, return policy, common questions. It never guesses. If something is not covered, it tells the customer a person will reply.",
    knowPh: "Delivery within the city is free above ₹500. Returns accepted within 7 days if unused. Closed on Sundays.", tip: "Tip: add 5 to 10 questions your team answers every day.",
    save: "Save settings", saving: "Saving…", saved: "Settings saved.",
  },
  hi: {
    title: "AI एजेंट", intro: "आपकी दुकान का WhatsApp असिस्टेंट। जब कोई ग्राहक \"हाय\" लिखता है तो वह उसे उसकी अपनी भाषा में नमस्ते कहता है, सवालों के जवाब देता है, दाम बताता है, ऑर्डर लेता है और बताता है कि उस पर कितना बाकी है और कैसे भुगतान करें। जवाब अपने आप, दिन के किसी भी समय जाते हैं।",
    more1: "यह पहले से जानता है कि आपने ", moreLink: "मेरा सामान", more2: " में क्या लिखा है, आपके खुलने का समय, ब्रांड किट की जानकारी, ग्राहक आपको कैसे भुगतान करें, और हर ग्राहक के बाकी बिल। यह सिर्फ़ वहाँ लिखे दाम ही बताता है और बाकी सब आपको भेज देता है। कुछ और बताना हो, जैसे डिलीवरी का इलाक़ा या वापसी की नीति, तो नीचे के डिब्बे में लिखें। यह जो ऑर्डर लेता है वे झटपट बिल पेज पर दिखते हैं, बिल बनाने के लिए तैयार।",
    planNote1: "AI एजेंट के लिए ", planLink: "ग्रोथ प्लान या उससे ऊपर", planNote2: " चाहिए: इसका हर जवाब एक असली AI अनुरोध है।",
    toggleTitle: "अपने आप जवाब देने वाला एजेंट", toggleBody: "ग्राहकों को अपने आप, दिन के किसी भी समय जवाब देता है। यह तब चलता है जब किसी फ़्लो या कीवर्ड ऑटोमेशन ने पहले जवाब न दिया हो।",
    knowTitle: "आपके कारोबार के बारे में अतिरिक्त नोट", charsLeft: "{n} अक्षर बाकी", knowHelp: "असिस्टेंट को जो पता होना चाहिए पर आपके सामान, समय या ब्रांड की जानकारी में नहीं है: डिलीवरी का इलाक़ा, वापसी की नीति, आम सवाल। यह अंदाज़ा नहीं लगाता। कुछ न लिखा हो तो ग्राहक को बताता है कि कोई व्यक्ति जवाब देगा।",
    knowPh: "शहर में 500 रुपये से ऊपर पर डिलीवरी मुफ़्त है। इस्तेमाल न किया हो तो 7 दिन में वापसी। रविवार को बंद।", tip: "सुझाव: 5 से 10 ऐसे सवाल लिखें जिनका जवाब आपकी टीम रोज़ देती है।",
    save: "सेटिंग सेव करें", saving: "सेव हो रहा है…", saved: "सेटिंग सेव हो गईं।",
  },
  mr: {
    title: "AI एजंट", intro: "तुमच्या दुकानाचा WhatsApp असिस्टंट. ग्राहकाने \"हाय\" म्हटले की तो त्याला त्याच्या स्वतःच्या भाषेत नमस्कार करतो, प्रश्नांची उत्तरे देतो, किमती सांगतो, ऑर्डर घेतो आणि त्याच्याकडे किती बाकी आहे व पैसे कसे द्यायचे ते दाखवतो. उत्तरे आपोआप, दिवसाच्या कोणत्याही वेळी जातात.",
    more1: "तुम्ही ", moreLink: "माझा माल", more2: " मध्ये काय लिहिले आहे, दुकानाच्या वेळा, ब्रँड किटमधील माहिती, ग्राहक तुम्हाला कसे पैसे देतात आणि प्रत्येक ग्राहकाची बाकी बिले हे त्याला आधीच माहीत असते. तो फक्त तिथे लिहिलेल्या किमतीच सांगतो आणि बाकी सर्व तुमच्याकडे पाठवतो. आणखी काही सांगायचे असेल, जसे डिलिव्हरीचे क्षेत्र किंवा परतीचे धोरण, तर खालील पेटीत लिहा. तो घेतलेल्या ऑर्डर झटपट बिल पानावर दिसतात, बिल बनवायला तयार.",
    planNote1: "AI एजंटसाठी ", planLink: "ग्रोथ प्लॅन किंवा त्यापुढील", planNote2: " लागतो: त्याचे प्रत्येक उत्तर खरी AI विनंती असते.",
    toggleTitle: "आपोआप उत्तर देणारा एजंट", toggleBody: "ग्राहकांना आपोआप, दिवसाच्या कोणत्याही वेळी उत्तर देतो. कोणत्याही फ्लो किंवा कीवर्ड ऑटोमेशनने आधी उत्तर दिले नसेल तेव्हा चालतो.",
    knowTitle: "तुमच्या व्यवसायाबद्दल अतिरिक्त नोंदी", charsLeft: "{n} अक्षरे शिल्लक", knowHelp: "तुमचा माल, वेळा किंवा ब्रँडच्या माहितीत नसलेले पण असिस्टंटला माहीत असावे असे काही: डिलिव्हरीचे क्षेत्र, परतीचे धोरण, नेहमीचे प्रश्न. तो अंदाज लावत नाही. काही लिहिले नसेल तर ग्राहकाला सांगतो की कोणीतरी उत्तर देईल.",
    knowPh: "शहरात 500 रुपयांवर डिलिव्हरी मोफत. न वापरलेले 7 दिवसांत परत. रविवारी बंद.", tip: "सूचना: तुमची टीम रोज उत्तर देते असे 5 ते 10 प्रश्न लिहा.",
    save: "सेटिंग्ज सेव्ह करा", saving: "सेव्ह होत आहे…", saved: "सेटिंग्ज सेव्ह झाल्या.",
  },
  gu: {
    title: "AI એજન્ટ", intro: "તમારી દુકાનનો WhatsApp આસિસ્ટન્ટ. ગ્રાહક \"હાય\" લખે ત્યારે તે તેને તેની પોતાની ભાષામાં નમસ્તે કહે છે, સવાલોના જવાબ આપે છે, ભાવ જણાવે છે, ઑર્ડર લે છે અને તેની પાસે કેટલું બાકી છે અને કેવી રીતે ચૂકવવું તે બતાવે છે. જવાબ આપમેળે, દિવસના કોઈ પણ સમયે જાય છે.",
    more1: "તમે ", moreLink: "મારો માલ", more2: " માં શું લખ્યું છે, દુકાનનો સમય, બ્રાન્ડ કિટની માહિતી, ગ્રાહકો તમને કેવી રીતે ચૂકવે છે અને દરેક ગ્રાહકનાં બાકી બિલ તે પહેલેથી જાણે છે. તે ફક્ત ત્યાં લખેલા ભાવ જ જણાવે છે અને બાકી બધું તમને મોકલે છે. બીજું કંઈ ઉમેરવું હોય, જેમ કે ડિલિવરીનો વિસ્તાર કે પરત લેવાની નીતિ, તો નીચેના ખાનામાં લખો. તે લીધેલા ઑર્ડર ઝડપી બિલ પેજ પર દેખાય છે, બિલ બનાવવા તૈયાર.",
    planNote1: "AI એજન્ટ માટે ", planLink: "ગ્રોથ પ્લાન કે તેથી ઉપરનો", planNote2: " જોઈએ: તેનો દરેક જવાબ સાચી AI વિનંતી છે.",
    toggleTitle: "આપમેળે જવાબ આપતો એજન્ટ", toggleBody: "ગ્રાહકોને આપમેળે, દિવસના કોઈ પણ સમયે જવાબ આપે છે. કોઈ ફ્લો કે કીવર્ડ ઑટોમેશને પહેલા જવાબ ન આપ્યો હોય ત્યારે ચાલે છે.",
    knowTitle: "તમારા ધંધા વિશે વધારાની નોંધ", charsLeft: "{n} અક્ષર બાકી", knowHelp: "તમારા માલ, સમય કે બ્રાન્ડની માહિતીમાં ન હોય પણ આસિસ્ટન્ટને ખબર હોવી જોઈએ તેવું: ડિલિવરીનો વિસ્તાર, પરત લેવાની નીતિ, સામાન્ય સવાલો. તે અંદાજ લગાવતો નથી. કંઈ લખ્યું ન હોય તો ગ્રાહકને કહે છે કે કોઈ વ્યક્તિ જવાબ આપશે.",
    knowPh: "શહેરમાં 500 રૂપિયાથી ઉપર ડિલિવરી મફત. વાપર્યા વગરનું 7 દિવસમાં પરત. રવિવારે બંધ.", tip: "સૂચન: તમારી ટીમ રોજ જવાબ આપે છે તેવા 5 થી 10 સવાલ લખો.",
    save: "સેટિંગ્સ સેવ કરો", saving: "સેવ થઈ રહ્યું છે…", saved: "સેટિંગ્સ સેવ થઈ.",
  },
  ta: {
    title: "AI முகவர்", intro: "உங்கள் கடையின் WhatsApp உதவியாளர். வாடிக்கையாளர் \"ஹாய்\" என்றால் அவர்கள் சொந்த மொழியில் வணக்கம் சொல்லி, கேள்விகளுக்கு பதில் சொல்லி, விலைகளைச் சொல்லி, ஆர்டர் எடுத்து, அவர்களிடம் எவ்வளவு பாக்கி மற்றும் எப்படி செலுத்துவது என்பதைக் காட்டும். பதில்கள் தானாக, நாளின் எந்த நேரத்திலும் செல்லும்.",
    more1: "நீங்கள் ", moreLink: "என் பொருட்கள்", more2: "-ல் எழுதியவை, உங்கள் திறந்திருக்கும் நேரம், பிராண்ட் கிட் விவரங்கள், வாடிக்கையாளர்கள் உங்களுக்கு எப்படி செலுத்துகிறார்கள், ஒவ்வொரு வாடிக்கையாளரின் செலுத்தப்படாத பில்கள் ஆகியவை இதற்கு ஏற்கனவே தெரியும். அங்கே எழுதிய விலைகளை மட்டுமே சொல்லும், மற்றவற்றை உங்களுக்கு அனுப்பும். டெலிவரி பகுதி, திருப்பிக் கொடுக்கும் கொள்கை போன்ற கூடுதல் தகவலுக்கு கீழே உள்ள பெட்டியைப் பயன்படுத்துங்கள். இது எடுக்கும் ஆர்டர்கள் விரைவு பில் பக்கத்தில் தெரியும், பில் போடத் தயாராக.",
    planNote1: "AI முகவருக்கு ", planLink: "க்ரோத் திட்டம் அல்லது அதற்கு மேல்", planNote2: " தேவை: இது அனுப்பும் ஒவ்வொரு பதிலும் உண்மையான AI கோரிக்கை.",
    toggleTitle: "தானாக பதில் சொல்லும் முகவர்", toggleBody: "வாடிக்கையாளர்களுக்கு தானாக, நாளின் எந்த நேரத்திலும் பதில் சொல்லும். எந்த ஃப்ளோவும் கீவேர்ட் தானியக்கமும் முதலில் பதிலளிக்காதபோது இது செயல்படும்.",
    knowTitle: "உங்கள் தொழிலைப் பற்றிய கூடுதல் குறிப்புகள்", charsLeft: "{n} எழுத்துகள் மீதம்", knowHelp: "உங்கள் பொருட்கள், நேரம், பிராண்ட் விவரங்களில் இல்லாத, ஆனால் உதவியாளருக்குத் தெரிய வேண்டியவை: டெலிவரி பகுதிகள், திருப்பிக் கொடுக்கும் கொள்கை, அடிக்கடி கேட்கும் கேள்விகள். இது ஊகிக்காது. எதுவும் இல்லையென்றால் ஒருவர் பதில் சொல்வார் என்று வாடிக்கையாளருக்குச் சொல்லும்.",
    knowPh: "நகருக்குள் ₹500-க்கு மேல் டெலிவரி இலவசம். பயன்படுத்தாததை 7 நாட்களில் திருப்பலாம். ஞாயிறு விடுமுறை.", tip: "குறிப்பு: உங்கள் குழு தினமும் பதில் சொல்லும் 5 முதல் 10 கேள்விகளைச் சேருங்கள்.",
    save: "அமைப்புகளைச் சேமி", saving: "சேமிக்கிறது…", saved: "அமைப்புகள் சேமிக்கப்பட்டன.",
  },
  te: {
    title: "AI ఏజెంట్", intro: "మీ దుకాణం WhatsApp అసిస్టెంట్. కస్టమర్ \"హాయ్\" అంటే వారి సొంత భాషలో నమస్తే చెప్పి, ప్రశ్నలకు సమాధానం ఇచ్చి, ధరలు చెప్పి, ఆర్డర్ తీసుకుని, వారికి ఎంత బాకీ ఉందో, ఎలా చెల్లించాలో చూపిస్తుంది. సమాధానాలు రోజులో ఏ సమయంలోనైనా ఆటోమేటిక్‌గా వెళ్తాయి.",
    more1: "మీరు ", moreLink: "నా సరుకులు", more2: "లో రాసినవి, మీ దుకాణం సమయాలు, బ్రాండ్ కిట్ వివరాలు, కస్టమర్లు మీకు ఎలా చెల్లిస్తారు, ప్రతి కస్టమర్ చెల్లించని బిల్లులు దీనికి ముందే తెలుసు. అక్కడ రాసిన ధరలనే చెబుతుంది, మిగతావన్నీ మీకు పంపుతుంది. డెలివరీ ప్రాంతాలు, రిటర్న్ పాలసీ లాంటివి చెప్పాలంటే కింది బాక్స్‌లో రాయండి. అది తీసుకున్న ఆర్డర్లు క్విక్ బిల్లు పేజీలో కనిపిస్తాయి, బిల్లు వేయడానికి సిద్ధంగా.",
    planNote1: "AI ఏజెంట్‌కు ", planLink: "గ్రోత్ ప్లాన్ లేదా అంతకంటే పైది", planNote2: " కావాలి: అది పంపే ప్రతి సమాధానం నిజమైన AI అభ్యర్థన.",
    toggleTitle: "ఆటో-రిప్లై ఏజెంట్", toggleBody: "కస్టమర్లకు రోజులో ఏ సమయంలోనైనా ఆటోమేటిక్‌గా సమాధానం ఇస్తుంది. ఏ ఫ్లో లేదా కీవర్డ్ ఆటోమేషన్ ముందు సమాధానం ఇవ్వనప్పుడు ఇది పనిచేస్తుంది.",
    knowTitle: "మీ వ్యాపారం గురించి అదనపు నోట్లు", charsLeft: "{n} అక్షరాలు మిగిలాయి", knowHelp: "మీ సరుకులు, సమయాలు, బ్రాండ్ వివరాల్లో లేనివి కానీ అసిస్టెంట్‌కు తెలియాల్సినవి: డెలివరీ ప్రాంతాలు, రిటర్న్ పాలసీ, తరచూ అడిగే ప్రశ్నలు. ఇది ఊహించదు. ఏమీ లేకపోతే ఒక వ్యక్తి సమాధానం ఇస్తారని కస్టమర్‌కు చెబుతుంది.",
    knowPh: "నగరంలో ₹500 పైన డెలివరీ ఉచితం. వాడనివి 7 రోజుల్లో తిరిగి తీసుకుంటాం. ఆదివారం సెలవు.", tip: "చిట్కా: మీ బృందం రోజూ సమాధానం చెప్పే 5 నుండి 10 ప్రశ్నలు చేర్చండి.",
    save: "సెట్టింగ్‌లను సేవ్ చేయండి", saving: "సేవ్ అవుతోంది…", saved: "సెట్టింగ్‌లు సేవ్ అయ్యాయి.",
  },
  kn: {
    title: "AI ಏಜೆಂಟ್", intro: "ನಿಮ್ಮ ಅಂಗಡಿಯ WhatsApp ಸಹಾಯಕ. ಗ್ರಾಹಕರು \"ಹಾಯ್\" ಎಂದರೆ ಅವರ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ ನಮಸ್ಕಾರ ಹೇಳಿ, ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ, ಬೆಲೆ ಹೇಳಿ, ಆರ್ಡರ್ ತೆಗೆದುಕೊಂಡು, ಅವರಿಗೆ ಎಷ್ಟು ಬಾಕಿ ಇದೆ ಮತ್ತು ಹೇಗೆ ಪಾವತಿಸಬೇಕು ಎಂದು ತೋರಿಸುತ್ತದೆ. ಉತ್ತರಗಳು ದಿನದ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ತಾನಾಗಿ ಹೋಗುತ್ತವೆ.",
    more1: "ನೀವು ", moreLink: "ನನ್ನ ವಸ್ತುಗಳು", more2: " ನಲ್ಲಿ ಬರೆದಿದ್ದು, ನಿಮ್ಮ ತೆರೆಯುವ ಸಮಯ, ಬ್ರಾಂಡ್ ಕಿಟ್ ವಿವರಗಳು, ಗ್ರಾಹಕರು ನಿಮಗೆ ಹೇಗೆ ಪಾವತಿಸುತ್ತಾರೆ ಮತ್ತು ಪ್ರತಿ ಗ್ರಾಹಕರ ಪಾವತಿಯಾಗದ ಬಿಲ್‌ಗಳು ಇದಕ್ಕೆ ಈಗಾಗಲೇ ಗೊತ್ತು. ಅಲ್ಲಿ ಬರೆದ ಬೆಲೆಗಳನ್ನು ಮಾತ್ರ ಹೇಳುತ್ತದೆ, ಉಳಿದದ್ದನ್ನು ನಿಮಗೆ ಕಳುಹಿಸುತ್ತದೆ. ಡೆಲಿವರಿ ಪ್ರದೇಶ, ಹಿಂತಿರುಗಿಸುವ ನೀತಿಯಂತಹ ಹೆಚ್ಚುವರಿ ವಿಷಯಕ್ಕೆ ಕೆಳಗಿನ ಪೆಟ್ಟಿಗೆ ಬಳಸಿ. ಅದು ತೆಗೆದುಕೊಂಡ ಆರ್ಡರ್‌ಗಳು ಕ್ವಿಕ್ ಬಿಲ್ ಪುಟದಲ್ಲಿ ಕಾಣುತ್ತವೆ, ಬಿಲ್ ಮಾಡಲು ಸಿದ್ಧವಾಗಿ.",
    planNote1: "AI ಏಜೆಂಟ್‌ಗೆ ", planLink: "ಗ್ರೋತ್ ಪ್ಲಾನ್ ಅಥವಾ ಅದಕ್ಕಿಂತ ಮೇಲಿನದು", planNote2: " ಬೇಕು: ಅದು ಕಳುಹಿಸುವ ಪ್ರತಿ ಉತ್ತರ ನಿಜವಾದ AI ವಿನಂತಿ.",
    toggleTitle: "ತಾನಾಗಿ ಉತ್ತರಿಸುವ ಏಜೆಂಟ್", toggleBody: "ಗ್ರಾಹಕರಿಗೆ ದಿನದ ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ತಾನಾಗಿ ಉತ್ತರಿಸುತ್ತದೆ. ಯಾವುದೇ ಫ್ಲೋ ಅಥವಾ ಕೀವರ್ಡ್ ಆಟೋಮೇಷನ್ ಮೊದಲು ಉತ್ತರಿಸದಿದ್ದಾಗ ಇದು ಕೆಲಸ ಮಾಡುತ್ತದೆ.",
    knowTitle: "ನಿಮ್ಮ ವ್ಯಾಪಾರದ ಬಗ್ಗೆ ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು", charsLeft: "{n} ಅಕ್ಷರಗಳು ಉಳಿದಿವೆ", knowHelp: "ನಿಮ್ಮ ವಸ್ತುಗಳು, ಸಮಯ ಅಥವಾ ಬ್ರಾಂಡ್ ವಿವರಗಳಲ್ಲಿ ಇಲ್ಲದ ಆದರೆ ಸಹಾಯಕನಿಗೆ ತಿಳಿಯಬೇಕಾದದ್ದು: ಡೆಲಿವರಿ ಪ್ರದೇಶ, ಹಿಂತಿರುಗಿಸುವ ನೀತಿ, ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು. ಇದು ಊಹಿಸುವುದಿಲ್ಲ. ಏನೂ ಇಲ್ಲದಿದ್ದರೆ ಒಬ್ಬ ವ್ಯಕ್ತಿ ಉತ್ತರಿಸುತ್ತಾರೆ ಎಂದು ಗ್ರಾಹಕರಿಗೆ ಹೇಳುತ್ತದೆ.",
    knowPh: "ನಗರದೊಳಗೆ ₹500 ಮೇಲೆ ಡೆಲಿವರಿ ಉಚಿತ. ಬಳಸದಿದ್ದರೆ 7 ದಿನಗಳಲ್ಲಿ ಹಿಂತಿರುಗಿಸಬಹುದು. ಭಾನುವಾರ ರಜೆ.", tip: "ಸಲಹೆ: ನಿಮ್ಮ ತಂಡ ಪ್ರತಿದಿನ ಉತ್ತರಿಸುವ 5 ರಿಂದ 10 ಪ್ರಶ್ನೆಗಳನ್ನು ಸೇರಿಸಿ.",
    save: "ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಉಳಿಸಿ", saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ…", saved: "ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ.",
  },
};
