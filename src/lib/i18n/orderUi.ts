import type { LanguageCode } from "./dictionaries";

/** Words for orders the WhatsApp assistant took, shown above the bill form. */
export type OrderUi = { title: string; hint: string; make: string; dismiss: string; fromWhatsApp: string };

export const ORDER_UI: Record<LanguageCode, OrderUi> = {
  en: { title: "Orders from WhatsApp", hint: "Customers confirmed these in chat. Make the bill and it goes straight to them.", make: "Make bill", dismiss: "Dismiss", fromWhatsApp: "Order from WhatsApp" },
  hi: { title: "WhatsApp से ऑर्डर", hint: "ग्राहकों ने चैट में इन्हें पक्का किया है। बिल बनाइए, वह सीधे उन्हें चला जाएगा।", make: "बिल बनाएँ", dismiss: "हटाएँ", fromWhatsApp: "WhatsApp से ऑर्डर" },
  mr: { title: "WhatsApp वरील ऑर्डर", hint: "ग्राहकांनी चॅटमध्ये हे पक्के केले आहेत. बिल बनवा, ते थेट त्यांना जाईल.", make: "बिल बनवा", dismiss: "काढा", fromWhatsApp: "WhatsApp वरील ऑर्डर" },
  gu: { title: "WhatsApp પરથી ઑર્ડર", hint: "ગ્રાહકોએ ચૅટમાં આ પાક્કા કર્યા છે. બિલ બનાવો, તે સીધું તેમને જશે.", make: "બિલ બનાવો", dismiss: "કાઢો", fromWhatsApp: "WhatsApp પરથી ઑર્ડર" },
  ta: { title: "WhatsApp-ல் வந்த ஆர்டர்கள்", hint: "வாடிக்கையாளர்கள் இவற்றை சாட்டில் உறுதி செய்தனர். பில் போடுங்கள், அது நேராக அவர்களுக்குச் செல்லும்.", make: "பில் போடு", dismiss: "நீக்கு", fromWhatsApp: "WhatsApp ஆர்டர்" },
  te: { title: "WhatsApp నుండి ఆర్డర్లు", hint: "కస్టమర్లు వీటిని చాట్‌లో ఖరారు చేశారు. బిల్లు వేయండి, అది నేరుగా వారికి వెళ్తుంది.", make: "బిల్లు వేయండి", dismiss: "తొలగించు", fromWhatsApp: "WhatsApp ఆర్డర్" },
  kn: { title: "WhatsApp ನಿಂದ ಆರ್ಡರ್‌ಗಳು", hint: "ಗ್ರಾಹಕರು ಇವನ್ನು ಚಾಟ್‌ನಲ್ಲಿ ಖಚಿತಪಡಿಸಿದ್ದಾರೆ. ಬಿಲ್ ಮಾಡಿ, ಅದು ನೇರವಾಗಿ ಅವರಿಗೆ ಹೋಗುತ್ತದೆ.", make: "ಬಿಲ್ ಮಾಡಿ", dismiss: "ತೆಗೆಯಿರಿ", fromWhatsApp: "WhatsApp ಆರ್ಡರ್" },
};
