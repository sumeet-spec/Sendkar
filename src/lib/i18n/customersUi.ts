import type { LanguageCode } from "./dictionaries";

/** Words for the "My customers" screen: who has bought, who is only on the list, and what each owes. */
export type CustomersUi = {
  nav: string; title: string; intro: string;
  customers: string; leads: string; owing: string; billedMonth: string;
  tabAll: string; tabCustomers: string; tabLeads: string; tabOwing: string;
  colName: string; colBills: string; colTotal: string; colLast: string; colOwes: string;
  never: string; noName: string; empty: string; billsOf: string; optedOut: string; leadHint: string; makeBill: string;
};

export const CUSTOMERS_UI: Record<LanguageCode, CustomersUi> = {
  en: {
    nav: "My customers", title: "My customers", intro: "Everyone you have billed, and everyone who is only on your list. Open a customer to see their bills.",
    customers: "Customers", leads: "On the list, not bought yet", owing: "Owe you", billedMonth: "Billed this month",
    tabAll: "All", tabCustomers: "Customers", tabLeads: "Not bought yet", tabOwing: "Owe money",
    colName: "Customer", colBills: "Bills", colTotal: "Total billed", colLast: "Last bill", colOwes: "Owes",
    never: "Never", noName: "No name", empty: "Nobody here yet.", billsOf: "Bills", optedOut: "Asked not to be messaged", leadHint: "Added to your list, no bill yet", makeBill: "Make a bill",
  },
  hi: {
    nav: "मेरे ग्राहक", title: "मेरे ग्राहक", intro: "जिन्हें आपने बिल दिया है, और जो सिर्फ़ आपकी सूची में हैं। किसी ग्राहक को खोलकर उसके बिल देखें।",
    customers: "ग्राहक", leads: "सूची में, अभी ख़रीदा नहीं", owing: "आपको देना है", billedMonth: "इस महीने का बिल",
    tabAll: "सभी", tabCustomers: "ग्राहक", tabLeads: "अभी ख़रीदा नहीं", tabOwing: "बाकी रकम",
    colName: "ग्राहक", colBills: "बिल", colTotal: "कुल बिल", colLast: "आख़िरी बिल", colOwes: "बाकी",
    never: "कभी नहीं", noName: "नाम नहीं", empty: "यहाँ अभी कोई नहीं।", billsOf: "बिल", optedOut: "संदेश न भेजने को कहा है", leadHint: "सूची में जुड़ा, अभी बिल नहीं", makeBill: "बिल बनाएँ",
  },
  mr: {
    nav: "माझे ग्राहक", title: "माझे ग्राहक", intro: "ज्यांना तुम्ही बिल दिले आणि जे फक्त तुमच्या यादीत आहेत. ग्राहक उघडून त्यांची बिले पहा.",
    customers: "ग्राहक", leads: "यादीत, अजून खरेदी नाही", owing: "तुम्हाला देणे", billedMonth: "या महिन्याचे बिल",
    tabAll: "सर्व", tabCustomers: "ग्राहक", tabLeads: "अजून खरेदी नाही", tabOwing: "बाकी रक्कम",
    colName: "ग्राहक", colBills: "बिले", colTotal: "एकूण बिल", colLast: "शेवटचे बिल", colOwes: "बाकी",
    never: "कधीच नाही", noName: "नाव नाही", empty: "इथे अजून कोणी नाही.", billsOf: "बिले", optedOut: "संदेश न पाठवण्यास सांगितले", leadHint: "यादीत जोडले, अजून बिल नाही", makeBill: "बिल बनवा",
  },
  gu: {
    nav: "મારા ગ્રાહકો", title: "મારા ગ્રાહકો", intro: "જેમને તમે બિલ આપ્યું છે અને જેઓ ફક્ત તમારી યાદીમાં છે. ગ્રાહક ખોલીને તેમનાં બિલ જુઓ.",
    customers: "ગ્રાહકો", leads: "યાદીમાં, હજી ખરીદ્યું નથી", owing: "તમને આપવાના", billedMonth: "આ મહિનાનું બિલ",
    tabAll: "બધા", tabCustomers: "ગ્રાહકો", tabLeads: "હજી ખરીદ્યું નથી", tabOwing: "બાકી રકમ",
    colName: "ગ્રાહક", colBills: "બિલ", colTotal: "કુલ બિલ", colLast: "છેલ્લું બિલ", colOwes: "બાકી",
    never: "ક્યારેય નહીં", noName: "નામ નથી", empty: "અહીં હજી કોઈ નથી.", billsOf: "બિલ", optedOut: "સંદેશ ન મોકલવા કહ્યું છે", leadHint: "યાદીમાં ઉમેર્યા, હજી બિલ નથી", makeBill: "બિલ બનાવો",
  },
  ta: {
    nav: "என் வாடிக்கையாளர்கள்", title: "என் வாடிக்கையாளர்கள்", intro: "நீங்கள் பில் கொடுத்தவர்கள், மற்றும் பட்டியலில் மட்டும் இருப்பவர்கள். ஒருவரைத் திறந்து அவர்களின் பில்களைப் பாருங்கள்.",
    customers: "வாடிக்கையாளர்கள்", leads: "பட்டியலில், இன்னும் வாங்கவில்லை", owing: "உங்களுக்குத் தர வேண்டியவர்கள்", billedMonth: "இந்த மாத பில்",
    tabAll: "அனைவரும்", tabCustomers: "வாடிக்கையாளர்கள்", tabLeads: "இன்னும் வாங்கவில்லை", tabOwing: "பணம் நிலுவை",
    colName: "வாடிக்கையாளர்", colBills: "பில்கள்", colTotal: "மொத்த பில்", colLast: "கடைசி பில்", colOwes: "நிலுவை",
    never: "இல்லை", noName: "பெயர் இல்லை", empty: "இங்கே இன்னும் யாரும் இல்லை.", billsOf: "பில்கள்", optedOut: "செய்தி அனுப்ப வேண்டாம் என்றார்", leadHint: "பட்டியலில் சேர்ந்தார், இன்னும் பில் இல்லை", makeBill: "பில் போடு",
  },
  te: {
    nav: "నా కస్టమర్లు", title: "నా కస్టమర్లు", intro: "మీరు బిల్లు ఇచ్చినవారు, మరియు జాబితాలో మాత్రమే ఉన్నవారు. కస్టమర్‌ను తెరిచి వారి బిల్లులు చూడండి.",
    customers: "కస్టమర్లు", leads: "జాబితాలో, ఇంకా కొనలేదు", owing: "మీకు ఇవ్వాల్సినవారు", billedMonth: "ఈ నెల బిల్లు",
    tabAll: "అందరూ", tabCustomers: "కస్టమర్లు", tabLeads: "ఇంకా కొనలేదు", tabOwing: "బాకీ మొత్తం",
    colName: "కస్టమర్", colBills: "బిల్లులు", colTotal: "మొత్తం బిల్లు", colLast: "చివరి బిల్లు", colOwes: "బాకీ",
    never: "ఎప్పుడూ లేదు", noName: "పేరు లేదు", empty: "ఇక్కడ ఇంకా ఎవరూ లేరు.", billsOf: "బిల్లులు", optedOut: "సందేశాలు వద్దన్నారు", leadHint: "జాబితాలో చేరారు, ఇంకా బిల్లు లేదు", makeBill: "బిల్లు వేయండి",
  },
  kn: {
    nav: "ನನ್ನ ಗ್ರಾಹಕರು", title: "ನನ್ನ ಗ್ರಾಹಕರು", intro: "ನೀವು ಬಿಲ್ ನೀಡಿದವರು, ಮತ್ತು ಪಟ್ಟಿಯಲ್ಲಿ ಮಾತ್ರ ಇರುವವರು. ಗ್ರಾಹಕರನ್ನು ತೆರೆದು ಅವರ ಬಿಲ್‌ಗಳನ್ನು ನೋಡಿ.",
    customers: "ಗ್ರಾಹಕರು", leads: "ಪಟ್ಟಿಯಲ್ಲಿ, ಇನ್ನೂ ಖರೀದಿಸಿಲ್ಲ", owing: "ನಿಮಗೆ ಕೊಡಬೇಕಾದವರು", billedMonth: "ಈ ತಿಂಗಳ ಬಿಲ್",
    tabAll: "ಎಲ್ಲರೂ", tabCustomers: "ಗ್ರಾಹಕರು", tabLeads: "ಇನ್ನೂ ಖರೀದಿಸಿಲ್ಲ", tabOwing: "ಬಾಕಿ ಮೊತ್ತ",
    colName: "ಗ್ರಾಹಕ", colBills: "ಬಿಲ್‌ಗಳು", colTotal: "ಒಟ್ಟು ಬಿಲ್", colLast: "ಕೊನೆಯ ಬಿಲ್", colOwes: "ಬಾಕಿ",
    never: "ಎಂದೂ ಇಲ್ಲ", noName: "ಹೆಸರಿಲ್ಲ", empty: "ಇಲ್ಲಿ ಇನ್ನೂ ಯಾರೂ ಇಲ್ಲ.", billsOf: "ಬಿಲ್‌ಗಳು", optedOut: "ಸಂದೇಶ ಕಳುಹಿಸಬೇಡಿ ಎಂದಿದ್ದಾರೆ", leadHint: "ಪಟ್ಟಿಗೆ ಸೇರಿದ್ದಾರೆ, ಇನ್ನೂ ಬಿಲ್ ಇಲ್ಲ", makeBill: "ಬಿಲ್ ಮಾಡಿ",
  },
};
