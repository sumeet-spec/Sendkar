import type { LanguageCode } from "./dictionaries";

/**
 * Words printed on the bill picture. The picture is drawn by our own renderer, so these are always
 * spelled correctly in the customer's script. The shop chooses the language per bill.
 */
export type BillLabels = {
  bill: string;
  no: string;
  date: string;
  billedTo: string;
  item: string;
  qty: string;
  rate: string;
  amount: string;
  total: string;
  paid: string;
  due: string;
  dueBy: string;
  thanks: string;
  gstin: string;
};

export const BILL_LABELS: Record<LanguageCode, BillLabels> = {
  en: { bill: "BILL", no: "Bill no.", date: "Date", billedTo: "Billed to", item: "Item", qty: "Qty", rate: "Rate", amount: "Amount", total: "Total", paid: "PAID", due: "PAYMENT DUE", dueBy: "Please pay by", thanks: "Thank you. Visit again!", gstin: "GSTIN" },
  hi: { bill: "बिल", no: "बिल नं.", date: "तारीख़", billedTo: "ग्राहक", item: "सामान", qty: "मात्रा", rate: "दर", amount: "रकम", total: "कुल", paid: "चुकता", due: "भुगतान बाकी", dueBy: "कृपया इस तारीख़ तक दें", thanks: "धन्यवाद। फिर पधारिए!", gstin: "GSTIN" },
  mr: { bill: "बिल", no: "बिल क्र.", date: "तारीख", billedTo: "ग्राहक", item: "वस्तू", qty: "संख्या", rate: "दर", amount: "रक्कम", total: "एकूण", paid: "भरले", due: "पैसे बाकी", dueBy: "कृपया या तारखेपर्यंत द्या", thanks: "धन्यवाद. पुन्हा या!", gstin: "GSTIN" },
  gu: { bill: "બિલ", no: "બિલ નં.", date: "તારીખ", billedTo: "ગ્રાહક", item: "વસ્તુ", qty: "જથ્થો", rate: "ભાવ", amount: "રકમ", total: "કુલ", paid: "ચૂકવેલ", due: "ચુકવણી બાકી", dueBy: "કૃપા કરી આ તારીખ સુધીમાં આપો", thanks: "આભાર. ફરી પધારજો!", gstin: "GSTIN" },
  ta: { bill: "பில்", no: "பில் எண்", date: "தேதி", billedTo: "வாடிக்கையாளர்", item: "பொருள்", qty: "அளவு", rate: "விலை", amount: "தொகை", total: "மொத்தம்", paid: "செலுத்தப்பட்டது", due: "பணம் நிலுவை", dueBy: "இந்த தேதிக்குள் செலுத்தவும்", thanks: "நன்றி. மீண்டும் வாருங்கள்!", gstin: "GSTIN" },
  te: { bill: "బిల్లు", no: "బిల్లు నం.", date: "తేదీ", billedTo: "కస్టమర్", item: "వస్తువు", qty: "సంఖ్య", rate: "ధర", amount: "మొత్తం", total: "మొత్తం", paid: "చెల్లించారు", due: "చెల్లింపు బాకీ", dueBy: "దయచేసి ఈ తేదీలోగా చెల్లించండి", thanks: "ధన్యవాదాలు. మళ్ళీ రండి!", gstin: "GSTIN" },
  kn: { bill: "ಬಿಲ್", no: "ಬಿಲ್ ಸಂ.", date: "ದಿನಾಂಕ", billedTo: "ಗ್ರಾಹಕ", item: "ವಸ್ತು", qty: "ಸಂಖ್ಯೆ", rate: "ದರ", amount: "ಮೊತ್ತ", total: "ಒಟ್ಟು", paid: "ಪಾವತಿಸಲಾಗಿದೆ", due: "ಪಾವತಿ ಬಾಕಿ", dueBy: "ದಯವಿಟ್ಟು ಈ ದಿನಾಂಕದೊಳಗೆ ಪಾವತಿಸಿ", thanks: "ಧನ್ಯವಾದಗಳು. ಮತ್ತೆ ಬನ್ನಿ!", gstin: "GSTIN" },
};
