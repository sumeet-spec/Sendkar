import type { LanguageCode } from "./dictionaries";

/** Words for Settings, Billing (what a shop pays Sendkar). The plan feature lists come from the homepage pricing text. */
export type BillingUi = {
  title: string; trialLeft: string; dayOne: string; dayMany: string; trialBody: string; trialEnded: string; noPlan: string; chooseBody: string;
  usage: string; ofLimit: string; whatsappNumbers: string; aiImages: string; resets: string; packExtra: string;
  packsTitle: string; packsHelp: string; imagesN: string; aboutEach: string; buy: string; redirecting: string; notAvailable: string;
  current: string; activePlan: string; upgrade: string; perMonth: string; free: string; wantLeave: string; deleteLink: string;
  plan: { trial: string; free: string };
};

export const BILLING_UI: Record<LanguageCode, BillingUi> = {
  en: {
    title: "Billing", trialLeft: "Free trial: {days} left.", dayOne: "1 day", dayMany: "{n} days", trialBody: "Everything is unlocked while you try Sendkar. Choose a plan any time and your setup carries straight over.",
    trialEnded: "Your free trial has ended.", noPlan: "You do not have an active plan.", chooseBody: "Choose a plan below to start sending again. Your contacts, templates and messages are safe.",
    usage: "Your usage: {plan}", ofLimit: "{used} of {limit}", whatsappNumbers: "WhatsApp numbers", aiImages: "AI images this month", resets: "Resets on {date}.", packExtra: " Plus {n} extra from image packs.",
    packsTitle: "Need more AI images?", packsHelp: "One-time packs. They are used after your monthly images run out, and they never expire.", imagesN: "{n} images", aboutEach: "about ₹{n} each", buy: "Buy", redirecting: "Redirecting…", notAvailable: "Not available yet",
    current: "Current", activePlan: "Active plan", upgrade: "Upgrade", perMonth: "/month", free: "Free", wantLeave: "Want to leave?", deleteLink: "Delete my account and data",
    plan: { trial: "free trial", free: "no active plan" },
  },
  hi: {
    title: "बिलिंग", trialLeft: "मुफ़्त ट्रायल: {days} बाकी।", dayOne: "1 दिन", dayMany: "{n} दिन", trialBody: "Sendkar आज़माते समय सब कुछ खुला है। जब चाहें प्लान चुनें, आपका सेटअप वैसा ही रहेगा।",
    trialEnded: "आपका मुफ़्त ट्रायल ख़त्म हो गया है।", noPlan: "आपके पास कोई चालू प्लान नहीं है।", chooseBody: "फिर से भेजना शुरू करने के लिए नीचे से प्लान चुनें। आपके संपर्क, टेम्पलेट और संदेश सुरक्षित हैं।",
    usage: "आपका उपयोग: {plan}", ofLimit: "{limit} में से {used}", whatsappNumbers: "WhatsApp नंबर", aiImages: "इस महीने की AI तस्वीरें", resets: "{date} को फिर से शुरू होगा।", packExtra: " साथ में इमेज पैक की {n} अतिरिक्त।",
    packsTitle: "और AI तस्वीरें चाहिए?", packsHelp: "एक बार के पैक। ये महीने की तस्वीरें ख़त्म होने के बाद इस्तेमाल होते हैं, और कभी ख़त्म नहीं होते।", imagesN: "{n} तस्वीरें", aboutEach: "लगभग ₹{n} प्रति तस्वीर", buy: "ख़रीदें", redirecting: "आगे ले जा रहे हैं…", notAvailable: "अभी उपलब्ध नहीं",
    current: "मौजूदा", activePlan: "चालू प्लान", upgrade: "अपग्रेड करें", perMonth: "/माह", free: "मुफ़्त", wantLeave: "छोड़ना चाहते हैं?", deleteLink: "मेरा खाता और डेटा मिटाएँ",
    plan: { trial: "मुफ़्त ट्रायल", free: "कोई चालू प्लान नहीं" },
  },
  mr: {
    title: "बिलिंग", trialLeft: "मोफत ट्रायल: {days} बाकी.", dayOne: "1 दिवस", dayMany: "{n} दिवस", trialBody: "Sendkar वापरून पाहताना सर्व काही खुले आहे. केव्हाही प्लॅन निवडा, तुमचे सेटअप तसेच राहील.",
    trialEnded: "तुमचा मोफत ट्रायल संपला आहे.", noPlan: "तुमच्याकडे कोणताही चालू प्लॅन नाही.", chooseBody: "पुन्हा पाठवणे सुरू करण्यासाठी खालून प्लॅन निवडा. तुमचे संपर्क, टेम्पलेट आणि संदेश सुरक्षित आहेत.",
    usage: "तुमचा वापर: {plan}", ofLimit: "{limit} पैकी {used}", whatsappNumbers: "WhatsApp नंबर", aiImages: "या महिन्यातील AI चित्रे", resets: "{date} रोजी पुन्हा सुरू होईल.", packExtra: " शिवाय इमेज पॅकची {n} अतिरिक्त.",
    packsTitle: "आणखी AI चित्रे हवीत?", packsHelp: "एकदाचे पॅक. महिन्याची चित्रे संपल्यावर ही वापरली जातात, आणि कधीच संपत नाहीत.", imagesN: "{n} चित्रे", aboutEach: "सुमारे ₹{n} प्रत्येकी", buy: "खरेदी करा", redirecting: "पुढे नेत आहे…", notAvailable: "अजून उपलब्ध नाही",
    current: "सध्याचा", activePlan: "चालू प्लॅन", upgrade: "अपग्रेड करा", perMonth: "/महिना", free: "मोफत", wantLeave: "सोडायचे आहे का?", deleteLink: "माझे खाते आणि डेटा काढून टाका",
    plan: { trial: "मोफत ट्रायल", free: "कोणताही चालू प्लॅन नाही" },
  },
  gu: {
    title: "બિલિંગ", trialLeft: "મફત ટ્રાયલ: {days} બાકી.", dayOne: "1 દિવસ", dayMany: "{n} દિવસ", trialBody: "Sendkar અજમાવતી વખતે બધું ખુલ્લું છે. ગમે ત્યારે પ્લાન પસંદ કરો, તમારું સેટઅપ એમ જ રહેશે.",
    trialEnded: "તમારો મફત ટ્રાયલ પૂરો થઈ ગયો છે.", noPlan: "તમારી પાસે કોઈ ચાલુ પ્લાન નથી.", chooseBody: "ફરી મોકલવાનું શરૂ કરવા નીચેથી પ્લાન પસંદ કરો. તમારા સંપર્કો, ટેમ્પ્લેટ અને સંદેશ સુરક્ષિત છે.",
    usage: "તમારો ઉપયોગ: {plan}", ofLimit: "{limit} માંથી {used}", whatsappNumbers: "WhatsApp નંબર", aiImages: "આ મહિનાના AI ચિત્રો", resets: "{date} એ ફરી શરૂ થશે.", packExtra: " ઉપરાંત ઇમેજ પેકના {n} વધારાના.",
    packsTitle: "વધુ AI ચિત્રો જોઈએ?", packsHelp: "એક વારના પેક. મહિનાના ચિત્રો પૂરા થયા પછી તે વપરાય છે, અને ક્યારેય પૂરા થતા નથી.", imagesN: "{n} ચિત્રો", aboutEach: "લગભગ ₹{n} પ્રતિ ચિત્ર", buy: "ખરીદો", redirecting: "આગળ લઈ જઈ રહ્યા છીએ…", notAvailable: "હજી ઉપલબ્ધ નથી",
    current: "હાલનો", activePlan: "ચાલુ પ્લાન", upgrade: "અપગ્રેડ કરો", perMonth: "/મહિનો", free: "મફત", wantLeave: "છોડવું છે?", deleteLink: "મારું ખાતું અને ડેટા કાઢી નાખો",
    plan: { trial: "મફત ટ્રાયલ", free: "કોઈ ચાલુ પ્લાન નથી" },
  },
  ta: {
    title: "பில்லிங்", trialLeft: "இலவச சோதனை: {days} மீதம்.", dayOne: "1 நாள்", dayMany: "{n} நாட்கள்", trialBody: "Sendkar-ஐ முயற்சிக்கும்போது எல்லாம் திறந்திருக்கும். எப்போது வேண்டுமானாலும் திட்டத்தைத் தேர்ந்தெடுங்கள், உங்கள் அமைப்பு அப்படியே இருக்கும்.",
    trialEnded: "உங்கள் இலவச சோதனை முடிந்துவிட்டது.", noPlan: "உங்களிடம் செயலில் உள்ள திட்டம் இல்லை.", chooseBody: "மீண்டும் அனுப்பத் தொடங்க கீழே ஒரு திட்டத்தைத் தேர்ந்தெடுங்கள். உங்கள் தொடர்புகள், டெம்ப்ளேட்டுகள், செய்திகள் பாதுகாப்பாக உள்ளன.",
    usage: "உங்கள் பயன்பாடு: {plan}", ofLimit: "{limit}-ல் {used}", whatsappNumbers: "WhatsApp எண்கள்", aiImages: "இந்த மாத AI படங்கள்", resets: "{date} அன்று மீண்டும் தொடங்கும்.", packExtra: " மேலும் பட பேக்குகளிலிருந்து {n} கூடுதல்.",
    packsTitle: "மேலும் AI படங்கள் வேண்டுமா?", packsHelp: "ஒருமுறை வாங்கும் பேக்குகள். மாத படங்கள் தீர்ந்த பிறகு இவை பயன்படுத்தப்படும், இவை காலாவதியாகாது.", imagesN: "{n} படங்கள்", aboutEach: "ஒன்றுக்கு சுமார் ₹{n}", buy: "வாங்கு", redirecting: "அனுப்புகிறது…", notAvailable: "இன்னும் கிடைக்கவில்லை",
    current: "தற்போதையது", activePlan: "செயலில் உள்ள திட்டம்", upgrade: "மேம்படுத்து", perMonth: "/மாதம்", free: "இலவசம்", wantLeave: "வெளியேற வேண்டுமா?", deleteLink: "என் கணக்கையும் தரவையும் நீக்கு",
    plan: { trial: "இலவச சோதனை", free: "செயலில் உள்ள திட்டம் இல்லை" },
  },
  te: {
    title: "బిల్లింగ్", trialLeft: "ఉచిత ట్రయల్: {days} మిగిలింది.", dayOne: "1 రోజు", dayMany: "{n} రోజులు", trialBody: "Sendkar ను ప్రయత్నిస్తున్నప్పుడు అన్నీ అన్‌లాక్ అయి ఉంటాయి. ఎప్పుడైనా ప్లాన్ ఎంచుకోండి, మీ సెటప్ అలాగే ఉంటుంది.",
    trialEnded: "మీ ఉచిత ట్రయల్ ముగిసింది.", noPlan: "మీకు యాక్టివ్ ప్లాన్ లేదు.", chooseBody: "మళ్ళీ పంపడం ప్రారంభించడానికి కింద ఒక ప్లాన్ ఎంచుకోండి. మీ కాంటాక్టులు, టెంప్లేట్లు, సందేశాలు సురక్షితంగా ఉన్నాయి.",
    usage: "మీ వినియోగం: {plan}", ofLimit: "{limit}లో {used}", whatsappNumbers: "WhatsApp నంబర్లు", aiImages: "ఈ నెల AI చిత్రాలు", resets: "{date} న మళ్ళీ మొదలవుతుంది.", packExtra: " అదనంగా ఇమేజ్ ప్యాక్‌ల నుండి {n}.",
    packsTitle: "మరిన్ని AI చిత్రాలు కావాలా?", packsHelp: "ఒకసారి కొనే ప్యాక్‌లు. నెలవారీ చిత్రాలు అయిపోయాక ఇవి వాడతారు, ఇవి ఎప్పటికీ ముగియవు.", imagesN: "{n} చిత్రాలు", aboutEach: "ఒక్కోదానికి సుమారు ₹{n}", buy: "కొనండి", redirecting: "తీసుకెళ్తోంది…", notAvailable: "ఇంకా అందుబాటులో లేదు",
    current: "ప్రస్తుతం", activePlan: "యాక్టివ్ ప్లాన్", upgrade: "అప్‌గ్రేడ్", perMonth: "/నెల", free: "ఉచితం", wantLeave: "వెళ్లిపోవాలనుకుంటున్నారా?", deleteLink: "నా ఖాతా మరియు డేటాను తొలగించండి",
    plan: { trial: "ఉచిత ట్రయల్", free: "యాక్టివ్ ప్లాన్ లేదు" },
  },
  kn: {
    title: "ಬಿಲ್ಲಿಂಗ್", trialLeft: "ಉಚಿತ ಟ್ರಯಲ್: {days} ಉಳಿದಿದೆ.", dayOne: "1 ದಿನ", dayMany: "{n} ದಿನಗಳು", trialBody: "Sendkar ಪ್ರಯತ್ನಿಸುವಾಗ ಎಲ್ಲವೂ ಅನ್‌ಲಾಕ್ ಆಗಿರುತ್ತದೆ. ಯಾವಾಗ ಬೇಕಾದರೂ ಪ್ಲಾನ್ ಆಯ್ಕೆಮಾಡಿ, ನಿಮ್ಮ ಸೆಟಪ್ ಹಾಗೆಯೇ ಇರುತ್ತದೆ.",
    trialEnded: "ನಿಮ್ಮ ಉಚಿತ ಟ್ರಯಲ್ ಮುಗಿದಿದೆ.", noPlan: "ನಿಮಗೆ ಸಕ್ರಿಯ ಪ್ಲಾನ್ ಇಲ್ಲ.", chooseBody: "ಮತ್ತೆ ಕಳುಹಿಸಲು ಕೆಳಗೆ ಒಂದು ಪ್ಲಾನ್ ಆಯ್ಕೆಮಾಡಿ. ನಿಮ್ಮ ಸಂಪರ್ಕಗಳು, ಟೆಂಪ್ಲೇಟ್‌ಗಳು ಮತ್ತು ಸಂದೇಶಗಳು ಸುರಕ್ಷಿತವಾಗಿವೆ.",
    usage: "ನಿಮ್ಮ ಬಳಕೆ: {plan}", ofLimit: "{limit} ರಲ್ಲಿ {used}", whatsappNumbers: "WhatsApp ಸಂಖ್ಯೆಗಳು", aiImages: "ಈ ತಿಂಗಳ AI ಚಿತ್ರಗಳು", resets: "{date} ರಂದು ಮತ್ತೆ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.", packExtra: " ಜೊತೆಗೆ ಚಿತ್ರ ಪ್ಯಾಕ್‌ಗಳಿಂದ {n} ಹೆಚ್ಚುವರಿ.",
    packsTitle: "ಇನ್ನಷ್ಟು AI ಚಿತ್ರಗಳು ಬೇಕೇ?", packsHelp: "ಒಂದು ಬಾರಿಯ ಪ್ಯಾಕ್‌ಗಳು. ತಿಂಗಳ ಚಿತ್ರಗಳು ಮುಗಿದ ನಂತರ ಇವನ್ನು ಬಳಸಲಾಗುತ್ತದೆ, ಇವು ಎಂದಿಗೂ ಮುಗಿಯುವುದಿಲ್ಲ.", imagesN: "{n} ಚಿತ್ರಗಳು", aboutEach: "ಒಂದಕ್ಕೆ ಸುಮಾರು ₹{n}", buy: "ಖರೀದಿಸಿ", redirecting: "ಮುಂದೆ ಕರೆದೊಯ್ಯಲಾಗುತ್ತಿದೆ…", notAvailable: "ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ",
    current: "ಪ್ರಸ್ತುತ", activePlan: "ಸಕ್ರಿಯ ಪ್ಲಾನ್", upgrade: "ಅಪ್‌ಗ್ರೇಡ್", perMonth: "/ತಿಂಗಳು", free: "ಉಚಿತ", wantLeave: "ಬಿಟ್ಟುಹೋಗಬೇಕೇ?", deleteLink: "ನನ್ನ ಖಾತೆ ಮತ್ತು ಡೇಟಾ ಅಳಿಸಿ",
    plan: { trial: "ಉಚಿತ ಟ್ರಯಲ್", free: "ಸಕ್ರಿಯ ಪ್ಲಾನ್ ಇಲ್ಲ" },
  },
};

/** The date a plan's allowance resets, written the way each language writes dates. */
export const DATE_LOCALE: Record<LanguageCode, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN", gu: "gu-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN" };
