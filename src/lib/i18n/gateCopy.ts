import type { LanguageCode } from "./dictionaries";

/** The banner shown on every page when a workspace has no active plan. Pages stay open to look around; only sending is held. */
export type GateCopy = { trialEnded: string; noPlan: string; seePlans: string; refusedNoPlan: string; refusedNoNumber: string };

export const GATE_COPY: Record<LanguageCode, GateCopy> = {
  en: {
    trialEnded: "Your 7-day free trial has ended. Everything is still here. Choose a plan to send messages and connect your WhatsApp number.",
    noPlan: "You do not have an active plan yet. Look around freely. Choose a plan to send messages and connect your WhatsApp number.",
    seePlans: "See plans",
    refusedNoPlan: "Your plan has ended. Choose a plan in Billing to keep sending messages.",
    refusedNoNumber: "Connect your WhatsApp number first. Open Settings, then Channels, connect your number, and try again.",
  },
  hi: {
    trialEnded: "आपका 7 दिन का मुफ़्त ट्रायल ख़त्म हो गया है। सब कुछ यहीं सुरक्षित है। संदेश भेजने और अपना WhatsApp नंबर जोड़ने के लिए प्लान चुनें।",
    noPlan: "अभी आपका कोई प्लान चालू नहीं है। आप आराम से सब देख सकते हैं। संदेश भेजने और अपना WhatsApp नंबर जोड़ने के लिए प्लान चुनें।",
    seePlans: "प्लान देखें",
    refusedNoPlan: "आपका प्लान ख़त्म हो गया है। संदेश भेजते रहने के लिए बिलिंग में प्लान चुनें।",
    refusedNoNumber: "पहले अपना WhatsApp नंबर जोड़ें। सेटिंग्स, फिर चैनल्स में जाकर नंबर जोड़ें और दोबारा कोशिश करें।",
  },
  mr: {
    trialEnded: "तुमचा 7 दिवसांचा मोफत ट्रायल संपला आहे. सर्व काही येथेच सुरक्षित आहे. संदेश पाठवण्यासाठी आणि तुमचा WhatsApp नंबर जोडण्यासाठी प्लॅन निवडा.",
    noPlan: "सध्या तुमचा कोणताही प्लॅन चालू नाही. तुम्ही निवांत सर्व काही पाहू शकता. संदेश पाठवण्यासाठी आणि तुमचा WhatsApp नंबर जोडण्यासाठी प्लॅन निवडा.",
    seePlans: "प्लॅन पाहा",
    refusedNoPlan: "तुमचा प्लॅन संपला आहे. संदेश पाठवत राहण्यासाठी बिलिंगमध्ये प्लॅन निवडा.",
    refusedNoNumber: "आधी तुमचा WhatsApp नंबर जोडा. सेटिंग्ज, मग चॅनल्समध्ये जाऊन नंबर जोडा आणि पुन्हा प्रयत्न करा.",
  },
  ta: {
    trialEnded: "உங்கள் 7 நாள் இலவச சோதனை முடிந்துவிட்டது. எல்லாம் இங்கேயே பாதுகாப்பாக உள்ளது. செய்திகளை அனுப்பவும் உங்கள் WhatsApp எண்ணை இணைக்கவும் ஒரு திட்டத்தைத் தேர்ந்தெடுங்கள்.",
    noPlan: "உங்களுக்கு இன்னும் செயலில் உள்ள திட்டம் இல்லை. தாராளமாக எல்லாவற்றையும் பாருங்கள். செய்திகளை அனுப்பவும் உங்கள் WhatsApp எண்ணை இணைக்கவும் ஒரு திட்டத்தைத் தேர்ந்தெடுங்கள்.",
    seePlans: "திட்டங்களைப் பார்",
    refusedNoPlan: "உங்கள் திட்டம் முடிந்துவிட்டது. செய்திகளை தொடர்ந்து அனுப்ப பில்லிங்கில் ஒரு திட்டத்தைத் தேர்ந்தெடுங்கள்.",
    refusedNoNumber: "முதலில் உங்கள் WhatsApp எண்ணை இணையுங்கள். அமைப்புகள், பிறகு சேனல்கள் சென்று எண்ணை இணைத்து மீண்டும் முயலுங்கள்.",
  },
  te: {
    trialEnded: "మీ 7 రోజుల ఉచిత ట్రయల్ ముగిసింది. అన్నీ ఇక్కడే భద్రంగా ఉన్నాయి. సందేశాలు పంపడానికి, మీ WhatsApp నంబర్‌ను కలపడానికి ప్లాన్ ఎంచుకోండి.",
    noPlan: "మీకు ఇంకా యాక్టివ్ ప్లాన్ లేదు. హాయిగా అన్నీ చూడండి. సందేశాలు పంపడానికి, మీ WhatsApp నంబర్‌ను కలపడానికి ప్లాన్ ఎంచుకోండి.",
    seePlans: "ప్లాన్లు చూడండి",
    refusedNoPlan: "మీ ప్లాన్ ముగిసింది. సందేశాలు పంపడం కొనసాగించడానికి బిల్లింగ్‌లో ప్లాన్ ఎంచుకోండి.",
    refusedNoNumber: "ముందుగా మీ WhatsApp నంబర్‌ను కలపండి. సెట్టింగ్స్, తర్వాత ఛానెల్స్‌లో నంబర్ కలిపి మళ్ళీ ప్రయత్నించండి.",
  },
  kn: {
    trialEnded: "ನಿಮ್ಮ 7 ದಿನಗಳ ಉಚಿತ ಟ್ರಯಲ್ ಮುಗಿದಿದೆ. ಎಲ್ಲವೂ ಇಲ್ಲೇ ಸುರಕ್ಷಿತವಾಗಿದೆ. ಸಂದೇಶ ಕಳುಹಿಸಲು ಮತ್ತು ನಿಮ್ಮ WhatsApp ಸಂಖ್ಯೆ ಸೇರಿಸಲು ಒಂದು ಪ್ಲಾನ್ ಆರಿಸಿ.",
    noPlan: "ನಿಮಗೆ ಇನ್ನೂ ಸಕ್ರಿಯ ಪ್ಲಾನ್ ಇಲ್ಲ. ನಿಶ್ಚಿಂತೆಯಿಂದ ಎಲ್ಲವನ್ನೂ ನೋಡಿ. ಸಂದೇಶ ಕಳುಹಿಸಲು ಮತ್ತು ನಿಮ್ಮ WhatsApp ಸಂಖ್ಯೆ ಸೇರಿಸಲು ಒಂದು ಪ್ಲಾನ್ ಆರಿಸಿ.",
    seePlans: "ಪ್ಲಾನ್‌ಗಳನ್ನು ನೋಡಿ",
    refusedNoPlan: "ನಿಮ್ಮ ಪ್ಲಾನ್ ಮುಗಿದಿದೆ. ಸಂದೇಶ ಕಳುಹಿಸುತ್ತಲೇ ಇರಲು ಬಿಲ್ಲಿಂಗ್‌ನಲ್ಲಿ ಪ್ಲಾನ್ ಆರಿಸಿ.",
    refusedNoNumber: "ಮೊದಲು ನಿಮ್ಮ WhatsApp ಸಂಖ್ಯೆ ಸೇರಿಸಿ. ಸೆಟ್ಟಿಂಗ್ಸ್, ನಂತರ ಚಾನೆಲ್ಸ್‌ಗೆ ಹೋಗಿ ಸಂಖ್ಯೆ ಸೇರಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  },
  gu: {
    trialEnded: "તમારો 7 દિવસનો મફત ટ્રાયલ પૂરો થઈ ગયો છે. બધું અહીં જ સુરક્ષિત છે. મેસેજ મોકલવા અને તમારો WhatsApp નંબર જોડવા માટે પ્લાન પસંદ કરો.",
    noPlan: "હજી તમારો કોઈ પ્લાન ચાલુ નથી. તમે નિરાંતે બધું જોઈ શકો છો. મેસેજ મોકલવા અને તમારો WhatsApp નંબર જોડવા માટે પ્લાન પસંદ કરો.",
    seePlans: "પ્લાન જુઓ",
    refusedNoPlan: "તમારો પ્લાન પૂરો થઈ ગયો છે. મેસેજ મોકલતા રહેવા માટે બિલિંગમાં પ્લાન પસંદ કરો.",
    refusedNoNumber: "પહેલા તમારો WhatsApp નંબર જોડો. સેટિંગ્સ, પછી ચેનલ્સમાં જઈને નંબર જોડો અને ફરી પ્રયાસ કરો.",
  },
};
