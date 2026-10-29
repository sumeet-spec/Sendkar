import type { LanguageCode } from "./dictionaries";

/** The banner shown on every page when a workspace has no active plan. Pages stay open to look around; only sending is held. */
export type GateCopy = { trialEnded: string; noPlan: string; seePlans: string };

export const GATE_COPY: Record<LanguageCode, GateCopy> = {
  en: {
    trialEnded: "Your 7-day free trial has ended. Everything is still here. Choose a plan to send messages and connect your WhatsApp number.",
    noPlan: "You do not have an active plan yet. Look around freely. Choose a plan to send messages and connect your WhatsApp number.",
    seePlans: "See plans",
  },
  hi: {
    trialEnded: "आपका 7 दिन का मुफ़्त ट्रायल ख़त्म हो गया है। सब कुछ यहीं सुरक्षित है। संदेश भेजने और अपना WhatsApp नंबर जोड़ने के लिए प्लान चुनें।",
    noPlan: "अभी आपका कोई प्लान चालू नहीं है। आप आराम से सब देख सकते हैं। संदेश भेजने और अपना WhatsApp नंबर जोड़ने के लिए प्लान चुनें।",
    seePlans: "प्लान देखें",
  },
  mr: {
    trialEnded: "तुमचा 7 दिवसांचा मोफत ट्रायल संपला आहे. सर्व काही येथेच सुरक्षित आहे. संदेश पाठवण्यासाठी आणि तुमचा WhatsApp नंबर जोडण्यासाठी प्लॅन निवडा.",
    noPlan: "सध्या तुमचा कोणताही प्लॅन चालू नाही. तुम्ही निवांत सर्व काही पाहू शकता. संदेश पाठवण्यासाठी आणि तुमचा WhatsApp नंबर जोडण्यासाठी प्लॅन निवडा.",
    seePlans: "प्लॅन पाहा",
  },
  ta: {
    trialEnded: "உங்கள் 7 நாள் இலவச சோதனை முடிந்துவிட்டது. எல்லாம் இங்கேயே பாதுகாப்பாக உள்ளது. செய்திகளை அனுப்பவும் உங்கள் WhatsApp எண்ணை இணைக்கவும் ஒரு திட்டத்தைத் தேர்ந்தெடுங்கள்.",
    noPlan: "உங்களுக்கு இன்னும் செயலில் உள்ள திட்டம் இல்லை. தாராளமாக எல்லாவற்றையும் பாருங்கள். செய்திகளை அனுப்பவும் உங்கள் WhatsApp எண்ணை இணைக்கவும் ஒரு திட்டத்தைத் தேர்ந்தெடுங்கள்.",
    seePlans: "திட்டங்களைப் பார்",
  },
  te: {
    trialEnded: "మీ 7 రోజుల ఉచిత ట్రయల్ ముగిసింది. అన్నీ ఇక్కడే భద్రంగా ఉన్నాయి. సందేశాలు పంపడానికి, మీ WhatsApp నంబర్‌ను కలపడానికి ప్లాన్ ఎంచుకోండి.",
    noPlan: "మీకు ఇంకా యాక్టివ్ ప్లాన్ లేదు. హాయిగా అన్నీ చూడండి. సందేశాలు పంపడానికి, మీ WhatsApp నంబర్‌ను కలపడానికి ప్లాన్ ఎంచుకోండి.",
    seePlans: "ప్లాన్లు చూడండి",
  },
  kn: {
    trialEnded: "ನಿಮ್ಮ 7 ದಿನಗಳ ಉಚಿತ ಟ್ರಯಲ್ ಮುಗಿದಿದೆ. ಎಲ್ಲವೂ ಇಲ್ಲೇ ಸುರಕ್ಷಿತವಾಗಿದೆ. ಸಂದೇಶ ಕಳುಹಿಸಲು ಮತ್ತು ನಿಮ್ಮ WhatsApp ಸಂಖ್ಯೆ ಸೇರಿಸಲು ಒಂದು ಪ್ಲಾನ್ ಆರಿಸಿ.",
    noPlan: "ನಿಮಗೆ ಇನ್ನೂ ಸಕ್ರಿಯ ಪ್ಲಾನ್ ಇಲ್ಲ. ನಿಶ್ಚಿಂತೆಯಿಂದ ಎಲ್ಲವನ್ನೂ ನೋಡಿ. ಸಂದೇಶ ಕಳುಹಿಸಲು ಮತ್ತು ನಿಮ್ಮ WhatsApp ಸಂಖ್ಯೆ ಸೇರಿಸಲು ಒಂದು ಪ್ಲಾನ್ ಆರಿಸಿ.",
    seePlans: "ಪ್ಲಾನ್‌ಗಳನ್ನು ನೋಡಿ",
  },
  gu: {
    trialEnded: "તમારો 7 દિવસનો મફત ટ્રાયલ પૂરો થઈ ગયો છે. બધું અહીં જ સુરક્ષિત છે. મેસેજ મોકલવા અને તમારો WhatsApp નંબર જોડવા માટે પ્લાન પસંદ કરો.",
    noPlan: "હજી તમારો કોઈ પ્લાન ચાલુ નથી. તમે નિરાંતે બધું જોઈ શકો છો. મેસેજ મોકલવા અને તમારો WhatsApp નંબર જોડવા માટે પ્લાન પસંદ કરો.",
    seePlans: "પ્લાન જુઓ",
  },
};
