import type { LanguageCode } from "./dictionaries";

/** Words for the "chat with us" counter poster and its settings section. */
export type ChatPosterCopy = { scan: string; title: string; help: string; needNumber: string };

export const CHAT_POSTER_COPY: Record<LanguageCode, ChatPosterCopy> = {
  en: { scan: "Scan to chat with us on WhatsApp", title: "Chat poster", help: "A customer scans it and a chat with your shop opens with a greeting ready. Your assistant answers straight away: items, prices, orders and bills.", needNumber: "Connect your WhatsApp number first to make this poster." },
  hi: { scan: "WhatsApp पर हमसे बात करने के लिए स्कैन करें", title: "चैट पोस्टर", help: "ग्राहक स्कैन करता है तो आपकी दुकान के साथ चैट खुल जाती है और नमस्ते लिखा तैयार मिलता है। आपका असिस्टेंट तुरंत जवाब देता है: सामान, दाम, ऑर्डर और बिल।", needNumber: "यह पोस्टर बनाने के लिए पहले अपना WhatsApp नंबर जोड़ें।" },
  mr: { scan: "WhatsApp वर आमच्याशी बोलण्यासाठी स्कॅन करा", title: "चॅट पोस्टर", help: "ग्राहक स्कॅन करतो तेव्हा तुमच्या दुकानाशी चॅट उघडते आणि नमस्कार लिहिलेला तयार असतो. तुमचा असिस्टंट लगेच उत्तर देतो: माल, किमती, ऑर्डर आणि बिले.", needNumber: "हे पोस्टर बनवण्यासाठी आधी तुमचा WhatsApp नंबर जोडा." },
  gu: { scan: "WhatsApp પર અમારી સાથે વાત કરવા સ્કૅન કરો", title: "ચૅટ પોસ્ટર", help: "ગ્રાહક સ્કૅન કરે ત્યારે તમારી દુકાન સાથે ચૅટ ખુલે છે અને નમસ્તે લખેલું તૈયાર મળે છે. તમારો આસિસ્ટન્ટ તરત જવાબ આપે છે: માલ, ભાવ, ઑર્ડર અને બિલ.", needNumber: "આ પોસ્ટર બનાવવા પહેલા તમારો WhatsApp નંબર જોડો." },
  ta: { scan: "WhatsApp-ல் எங்களுடன் பேச ஸ்கேன் செய்யுங்கள்", title: "சாட் போஸ்டர்", help: "வாடிக்கையாளர் ஸ்கேன் செய்தால் உங்கள் கடையுடன் சாட் திறந்து, வணக்கம் என்ற செய்தி தயாராக இருக்கும். உங்கள் உதவியாளர் உடனே பதில் சொல்வார்: பொருட்கள், விலைகள், ஆர்டர், பில்.", needNumber: "இந்த போஸ்டரை உருவாக்க முதலில் உங்கள் WhatsApp எண்ணை இணைக்கவும்." },
  te: { scan: "WhatsApp‌లో మాతో మాట్లాడటానికి స్కాన్ చేయండి", title: "చాట్ పోస్టర్", help: "కస్టమర్ స్కాన్ చేస్తే మీ దుకాణంతో చాట్ తెరుచుకుని నమస్తే సందేశం సిద్ధంగా ఉంటుంది. మీ అసిస్టెంట్ వెంటనే సమాధానం ఇస్తుంది: సరుకులు, ధరలు, ఆర్డర్లు, బిల్లులు.", needNumber: "ఈ పోస్టర్ చేయడానికి ముందుగా మీ WhatsApp నంబర్‌ను కనెక్ట్ చేయండి." },
  kn: { scan: "WhatsApp‌ನಲ್ಲಿ ನಮ್ಮೊಂದಿಗೆ ಮಾತನಾಡಲು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ", title: "ಚಾಟ್ ಪೋಸ್ಟರ್", help: "ಗ್ರಾಹಕರು ಸ್ಕ್ಯಾನ್ ಮಾಡಿದರೆ ನಿಮ್ಮ ಅಂಗಡಿಯೊಂದಿಗೆ ಚಾಟ್ ತೆರೆದು ನಮಸ್ಕಾರ ಎಂಬ ಸಂದೇಶ ಸಿದ್ಧವಾಗಿರುತ್ತದೆ. ನಿಮ್ಮ ಸಹಾಯಕ ತಕ್ಷಣ ಉತ್ತರಿಸುತ್ತದೆ: ವಸ್ತುಗಳು, ಬೆಲೆಗಳು, ಆರ್ಡರ್, ಬಿಲ್.", needNumber: "ಈ ಪೋಸ್ಟರ್ ಮಾಡಲು ಮೊದಲು ನಿಮ್ಮ WhatsApp ಸಂಖ್ಯೆಯನ್ನು ಜೋಡಿಸಿ." },
};
