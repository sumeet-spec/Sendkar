import type { LanguageCode } from "./dictionaries";

/** Words for the "Yesterday" card on the dashboard. */
export type SummaryCopy = { title: string; sent: string; replies: string; read: string; newCustomers: string; quiet: string; whatsappOn: string; whatsappOff: string };

export const SUMMARY_COPY: Record<LanguageCode, SummaryCopy> = {
  en: { title: "Yesterday", sent: "Messages sent", replies: "Replies", read: "Read", newCustomers: "New customers", quiet: "A quiet day. Send an offer today.", whatsappOn: "Get this on WhatsApp every morning", whatsappOff: "Stop the morning WhatsApp" },
  hi: { title: "कल", sent: "भेजे गए संदेश", replies: "जवाब", read: "पढ़े गए", newCustomers: "नए ग्राहक", quiet: "कल शांत दिन रहा। आज कोई ऑफ़र भेजें।", whatsappOn: "रोज़ सुबह यह WhatsApp पर पाएँ", whatsappOff: "सुबह का WhatsApp बंद करें" },
  mr: { title: "काल", sent: "पाठवलेले संदेश", replies: "उत्तरे", read: "वाचले", newCustomers: "नवे ग्राहक", quiet: "काल शांत दिवस होता. आज एखादी ऑफर पाठवा.", whatsappOn: "रोज सकाळी हे WhatsApp वर मिळवा", whatsappOff: "सकाळचे WhatsApp बंद करा" },
  ta: { title: "நேற்று", sent: "அனுப்பிய செய்திகள்", replies: "பதில்கள்", read: "படித்தவை", newCustomers: "புதிய வாடிக்கையாளர்கள்", quiet: "நேற்று அமைதியான நாள். இன்று ஒரு சலுகை அனுப்புங்கள்.", whatsappOn: "தினமும் காலை இதை WhatsApp-இல் பெறுங்கள்", whatsappOff: "காலை WhatsApp-ஐ நிறுத்து" },
  te: { title: "నిన్న", sent: "పంపిన సందేశాలు", replies: "జవాబులు", read: "చదివినవి", newCustomers: "కొత్త కస్టమర్లు", quiet: "నిన్న ప్రశాంతమైన రోజు. ఈ రోజు ఒక ఆఫర్ పంపండి.", whatsappOn: "ప్రతి ఉదయం ఇది WhatsApp లో పొందండి", whatsappOff: "ఉదయం WhatsApp ఆపండి" },
  kn: { title: "ನಿನ್ನೆ", sent: "ಕಳುಹಿಸಿದ ಸಂದೇಶಗಳು", replies: "ಉತ್ತರಗಳು", read: "ಓದಿದವು", newCustomers: "ಹೊಸ ಗ್ರಾಹಕರು", quiet: "ನಿನ್ನೆ ಶಾಂತ ದಿನ. ಇಂದು ಒಂದು ಆಫರ್ ಕಳುಹಿಸಿ.", whatsappOn: "ಪ್ರತಿ ಬೆಳಿಗ್ಗೆ ಇದನ್ನು WhatsApp ನಲ್ಲಿ ಪಡೆಯಿರಿ", whatsappOff: "ಬೆಳಗಿನ WhatsApp ನಿಲ್ಲಿಸಿ" },
  gu: { title: "ગઈકાલે", sent: "મોકલેલા મેસેજ", replies: "જવાબ", read: "વાંચ્યા", newCustomers: "નવા ગ્રાહકો", quiet: "ગઈકાલે શાંત દિવસ રહ્યો. આજે કોઈ ઑફર મોકલો.", whatsappOn: "રોજ સવારે આ WhatsApp પર મેળવો", whatsappOff: "સવારનું WhatsApp બંધ કરો" },
};
