import type { LanguageCode } from "./dictionaries";

/** Words on the Quick Bill screens. `{no}` and `{n}` are filled in by the page. */
export type BillUi = {
  nav: string; title: string; intro: string; newBill: string;
  phone: string; phoneHint: string; badPhone: string; name: string; optional: string;
  amount: string; addItems: string; itemName: string; qty: string; rate: string; addAnother: string;
  paidNow: string; payLater: string; dueOn: string; billLanguage: string;
  offersOk: string; offersNote: string; send: string; sending: string;
  sentOk: string; savedNotSent: string; makeAnother: string; allBills: string;
  empty: string; colBill: string; colCustomer: string; colAmount: string; colStatus: string;
  sent: string; waiting: string; failed: string; notSent: string; sendAgain: string; openBill: string; paidTag: string; dueTag: string;
  todayTotal: string; needNumber: string; unpaidNote: string; markPaid: string; overLimit: string;
};

export const BILL_UI: Record<LanguageCode, BillUi> = {
  en: {
    nav: "Quick bill", title: "Quick bill", intro: "Make a bill in 10 seconds. Your customer gets it on WhatsApp right away, and you can see every bill here.", newBill: "Make a bill",
    phone: "Customer's mobile number", phoneHint: "10 digits, like 98765 43210", badPhone: "Enter a 10-digit mobile number.", name: "Customer's name", optional: "optional",
    amount: "Bill amount (₹)", addItems: "Add items (optional)", itemName: "Item", qty: "Qty", rate: "Rate (₹)", addAnother: "+ Add another item",
    paidNow: "Paid", payLater: "To be paid later", dueOn: "Customer will pay by", billLanguage: "Language of the bill",
    offersOk: "Customer agreed to get offers and greetings on WhatsApp", offersNote: "Tick this only if they said yes at the counter. Then a thank-you goes out after the sale.", send: "Send bill on WhatsApp", sending: "Sending…",
    sentOk: "Bill {no} is on its way to the customer.", savedNotSent: "Bill {no} is saved, but not sent yet.", makeAnother: "Make another bill", allBills: "Recent bills",
    empty: "No bills yet. Make your first one above.", colBill: "Bill", colCustomer: "Customer", colAmount: "Amount", colStatus: "WhatsApp",
    sent: "Sent", waiting: "Waiting", failed: "Failed", notSent: "Not sent", sendAgain: "Send again", openBill: "View", paidTag: "Paid", dueTag: "Due",
    todayTotal: "Today: {n}", needNumber: "Connect your WhatsApp number first.", unpaidNote: "A payment reminder will go out before the due date.", markPaid: "Mark paid", overLimit: "This customer is now over their credit limit.",
  },
  hi: {
    nav: "झटपट बिल", title: "झटपट बिल", intro: "10 सेकंड में बिल बनाइए। ग्राहक को तुरंत WhatsApp पर मिल जाता है, और हर बिल आपको यहाँ दिखता है।", newBill: "बिल बनाएँ",
    phone: "ग्राहक का मोबाइल नंबर", phoneHint: "10 अंक, जैसे 98765 43210", badPhone: "10 अंकों का मोबाइल नंबर डालें।", name: "ग्राहक का नाम", optional: "ज़रूरी नहीं",
    amount: "बिल की रकम (₹)", addItems: "सामान जोड़ें (ज़रूरी नहीं)", itemName: "सामान", qty: "मात्रा", rate: "दर (₹)", addAnother: "+ एक और सामान जोड़ें",
    paidNow: "चुकता", payLater: "बाद में देंगे", dueOn: "ग्राहक इस तारीख़ तक देगा", billLanguage: "बिल की भाषा",
    offersOk: "ग्राहक ने WhatsApp पर ऑफ़र और शुभकामनाएँ पाने की हाँ कही है", offersNote: "इसे तभी चुनें जब ग्राहक ने काउंटर पर हाँ कहा हो। तब बिक्री के बाद धन्यवाद संदेश जाएगा।", send: "WhatsApp पर बिल भेजें", sending: "भेज रहे हैं…",
    sentOk: "बिल {no} ग्राहक को भेजा जा रहा है।", savedNotSent: "बिल {no} सेव हो गया, पर अभी भेजा नहीं गया।", makeAnother: "एक और बिल बनाएँ", allBills: "हाल के बिल",
    empty: "अभी कोई बिल नहीं। ऊपर अपना पहला बिल बनाइए।", colBill: "बिल", colCustomer: "ग्राहक", colAmount: "रकम", colStatus: "WhatsApp",
    sent: "भेजा गया", waiting: "इंतज़ार", failed: "विफल", notSent: "नहीं भेजा", sendAgain: "फिर भेजें", openBill: "देखें", paidTag: "चुकता", dueTag: "बाकी",
    todayTotal: "आज: {n}", needNumber: "पहले अपना WhatsApp नंबर जोड़ें।", unpaidNote: "देय तारीख़ से पहले भुगतान की याद दिलाई जाएगी।", markPaid: "चुकता करें", overLimit: "इस ग्राहक की उधार की सीमा पार हो गई है।",
  },
  mr: {
    nav: "झटपट बिल", title: "झटपट बिल", intro: "10 सेकंदात बिल बनवा. ग्राहकाला लगेच WhatsApp वर मिळते, आणि प्रत्येक बिल तुम्हाला इथे दिसते.", newBill: "बिल बनवा",
    phone: "ग्राहकाचा मोबाइल नंबर", phoneHint: "10 अंक, जसे 98765 43210", badPhone: "10 अंकी मोबाइल नंबर टाका.", name: "ग्राहकाचे नाव", optional: "ऐच्छिक",
    amount: "बिलाची रक्कम (₹)", addItems: "वस्तू जोडा (ऐच्छिक)", itemName: "वस्तू", qty: "संख्या", rate: "दर (₹)", addAnother: "+ आणखी वस्तू जोडा",
    paidNow: "भरले", payLater: "नंतर देतील", dueOn: "ग्राहक या तारखेपर्यंत देईल", billLanguage: "बिलाची भाषा",
    offersOk: "ग्राहकाने WhatsApp वर ऑफर आणि शुभेच्छा मिळवण्यास होकार दिला", offersNote: "काउंटरवर ग्राहकाने हो म्हटले तरच निवडा. मग विक्रीनंतर धन्यवाद संदेश जाईल.", send: "WhatsApp वर बिल पाठवा", sending: "पाठवत आहे…",
    sentOk: "बिल {no} ग्राहकाला पाठवले जात आहे.", savedNotSent: "बिल {no} सेव्ह झाले, पण अजून पाठवले नाही.", makeAnother: "आणखी एक बिल बनवा", allBills: "अलीकडील बिले",
    empty: "अजून बिले नाहीत. वर तुमचे पहिले बिल बनवा.", colBill: "बिल", colCustomer: "ग्राहक", colAmount: "रक्कम", colStatus: "WhatsApp",
    sent: "पाठवले", waiting: "प्रतीक्षा", failed: "अयशस्वी", notSent: "पाठवले नाही", sendAgain: "पुन्हा पाठवा", openBill: "पहा", paidTag: "भरले", dueTag: "बाकी",
    todayTotal: "आज: {n}", needNumber: "आधी तुमचा WhatsApp नंबर जोडा.", unpaidNote: "देय तारखेआधी पैशांची आठवण पाठवली जाईल.", markPaid: "भरले करा", overLimit: "या ग्राहकाची उधारीची मर्यादा ओलांडली आहे.",
  },
  gu: {
    nav: "ઝડપી બિલ", title: "ઝડપી બિલ", intro: "10 સેકન્ડમાં બિલ બનાવો. ગ્રાહકને તરત WhatsApp પર મળી જાય છે, અને દરેક બિલ તમને અહીં દેખાય છે.", newBill: "બિલ બનાવો",
    phone: "ગ્રાહકનો મોબાઇલ નંબર", phoneHint: "10 અંક, જેમ કે 98765 43210", badPhone: "10 અંકનો મોબાઇલ નંબર નાખો.", name: "ગ્રાહકનું નામ", optional: "જરૂરી નથી",
    amount: "બિલની રકમ (₹)", addItems: "વસ્તુઓ ઉમેરો (જરૂરી નથી)", itemName: "વસ્તુ", qty: "જથ્થો", rate: "ભાવ (₹)", addAnother: "+ બીજી વસ્તુ ઉમેરો",
    paidNow: "ચૂકવેલ", payLater: "પછી ચૂકવશે", dueOn: "ગ્રાહક આ તારીખ સુધીમાં ચૂકવશે", billLanguage: "બિલની ભાષા",
    offersOk: "ગ્રાહકે WhatsApp પર ઑફર અને શુભેચ્છાઓ મેળવવા હા કહી છે", offersNote: "ગ્રાહકે કાઉન્ટર પર હા કહી હોય તો જ પસંદ કરો. પછી ખરીદી બાદ આભાર સંદેશ જશે.", send: "WhatsApp પર બિલ મોકલો", sending: "મોકલી રહ્યા છીએ…",
    sentOk: "બિલ {no} ગ્રાહકને મોકલાઈ રહ્યું છે.", savedNotSent: "બિલ {no} સેવ થયું, પણ હજી મોકલ્યું નથી.", makeAnother: "બીજું બિલ બનાવો", allBills: "તાજેતરનાં બિલ",
    empty: "હજી કોઈ બિલ નથી. ઉપર તમારું પહેલું બિલ બનાવો.", colBill: "બિલ", colCustomer: "ગ્રાહક", colAmount: "રકમ", colStatus: "WhatsApp",
    sent: "મોકલ્યું", waiting: "રાહ", failed: "નિષ્ફળ", notSent: "મોકલ્યું નથી", sendAgain: "ફરી મોકલો", openBill: "જુઓ", paidTag: "ચૂકવેલ", dueTag: "બાકી",
    todayTotal: "આજે: {n}", needNumber: "પહેલા તમારો WhatsApp નંબર જોડો.", unpaidNote: "નિયત તારીખ પહેલાં ચુકવણીની યાદ મોકલાશે.", markPaid: "ચૂકવેલ કરો", overLimit: "આ ગ્રાહકની ઉધારની મર્યાદા વટાવાઈ ગઈ છે.",
  },
  ta: {
    nav: "விரைவு பில்", title: "விரைவு பில்", intro: "10 விநாடியில் பில் போடுங்கள். வாடிக்கையாளருக்கு உடனே WhatsApp-ல் கிடைக்கும், ஒவ்வொரு பில்லையும் இங்கே பார்க்கலாம்.", newBill: "பில் போடுங்கள்",
    phone: "வாடிக்கையாளர் மொபைல் எண்", phoneHint: "10 இலக்கம், எ.கா. 98765 43210", badPhone: "10 இலக்க மொபைல் எண்ணை உள்ளிடுங்கள்.", name: "வாடிக்கையாளர் பெயர்", optional: "விருப்பம்",
    amount: "பில் தொகை (₹)", addItems: "பொருட்களைச் சேர்க்கவும் (விருப்பம்)", itemName: "பொருள்", qty: "அளவு", rate: "விலை (₹)", addAnother: "+ மேலும் ஒரு பொருள்",
    paidNow: "செலுத்தப்பட்டது", payLater: "பிறகு செலுத்துவார்", dueOn: "இந்த தேதிக்குள் செலுத்துவார்", billLanguage: "பில் மொழி",
    offersOk: "WhatsApp-ல் சலுகைகள் மற்றும் வாழ்த்துகள் பெற வாடிக்கையாளர் ஒப்புக்கொண்டார்", offersNote: "கவுண்டரில் அவர் சம்மதித்திருந்தால் மட்டும் தேர்ந்தெடுங்கள். அப்போது வாங்கிய பின் நன்றி செய்தி செல்லும்.", send: "WhatsApp-ல் பில் அனுப்பு", sending: "அனுப்புகிறது…",
    sentOk: "பில் {no} வாடிக்கையாளருக்கு அனுப்பப்படுகிறது.", savedNotSent: "பில் {no} சேமிக்கப்பட்டது, ஆனால் இன்னும் அனுப்பப்படவில்லை.", makeAnother: "இன்னொரு பில் போடு", allBills: "சமீபத்திய பில்கள்",
    empty: "இன்னும் பில்கள் இல்லை. மேலே உங்கள் முதல் பில்லைப் போடுங்கள்.", colBill: "பில்", colCustomer: "வாடிக்கையாளர்", colAmount: "தொகை", colStatus: "WhatsApp",
    sent: "அனுப்பப்பட்டது", waiting: "காத்திருப்பு", failed: "தோல்வி", notSent: "அனுப்பவில்லை", sendAgain: "மீண்டும் அனுப்பு", openBill: "பார்", paidTag: "செலுத்தப்பட்டது", dueTag: "நிலுவை",
    todayTotal: "இன்று: {n}", needNumber: "முதலில் உங்கள் WhatsApp எண்ணை இணைக்கவும்.", unpaidNote: "கடைசி தேதிக்கு முன் பணம் செலுத்த நினைவூட்டல் செல்லும்.", markPaid: "செலுத்தப்பட்டது எனக் குறி", overLimit: "இந்த வாடிக்கையாளர் கடன் வரம்பைத் தாண்டிவிட்டார்.",
  },
  te: {
    nav: "క్విక్ బిల్లు", title: "క్విక్ బిల్లు", intro: "10 సెకన్లలో బిల్లు వేయండి. కస్టమర్‌కు వెంటనే WhatsApp‌లో వస్తుంది, ప్రతి బిల్లు ఇక్కడ కనిపిస్తుంది.", newBill: "బిల్లు వేయండి",
    phone: "కస్టమర్ మొబైల్ నంబర్", phoneHint: "10 అంకెలు, ఉదా. 98765 43210", badPhone: "10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.", name: "కస్టమర్ పేరు", optional: "ఐచ్ఛికం",
    amount: "బిల్లు మొత్తం (₹)", addItems: "వస్తువులు జోడించండి (ఐచ్ఛికం)", itemName: "వస్తువు", qty: "సంఖ్య", rate: "ధర (₹)", addAnother: "+ మరో వస్తువు జోడించండి",
    paidNow: "చెల్లించారు", payLater: "తర్వాత చెల్లిస్తారు", dueOn: "కస్టమర్ ఈ తేదీలోగా చెల్లిస్తారు", billLanguage: "బిల్లు భాష",
    offersOk: "WhatsApp‌లో ఆఫర్లు, శుభాకాంక్షలు పొందడానికి కస్టమర్ అంగీకరించారు", offersNote: "కౌంటర్ వద్ద వారు సరే అన్నప్పుడు మాత్రమే ఎంచుకోండి. అప్పుడు కొన్న తర్వాత ధన్యవాద సందేశం వెళ్తుంది.", send: "WhatsApp‌లో బిల్లు పంపండి", sending: "పంపుతున్నాం…",
    sentOk: "బిల్లు {no} కస్టమర్‌కు పంపబడుతోంది.", savedNotSent: "బిల్లు {no} సేవ్ అయింది, కానీ ఇంకా పంపలేదు.", makeAnother: "మరో బిల్లు వేయండి", allBills: "ఇటీవలి బిల్లులు",
    empty: "ఇంకా బిల్లులు లేవు. పైన మీ మొదటి బిల్లు వేయండి.", colBill: "బిల్లు", colCustomer: "కస్టమర్", colAmount: "మొత్తం", colStatus: "WhatsApp",
    sent: "పంపారు", waiting: "వేచి ఉంది", failed: "విఫలం", notSent: "పంపలేదు", sendAgain: "మళ్ళీ పంపండి", openBill: "చూడండి", paidTag: "చెల్లించారు", dueTag: "బాకీ",
    todayTotal: "ఈ రోజు: {n}", needNumber: "ముందుగా మీ WhatsApp నంబర్‌ను కనెక్ట్ చేయండి.", unpaidNote: "గడువు తేదీకి ముందు చెల్లింపు రిమైండర్ వెళ్తుంది.", markPaid: "చెల్లించినట్టు గుర్తించు", overLimit: "ఈ కస్టమర్ క్రెడిట్ పరిమితిని దాటారు.",
  },
  kn: {
    nav: "ಕ್ವಿಕ್ ಬಿಲ್", title: "ಕ್ವಿಕ್ ಬಿಲ್", intro: "10 ಸೆಕೆಂಡಿನಲ್ಲಿ ಬಿಲ್ ಮಾಡಿ. ಗ್ರಾಹಕರಿಗೆ ತಕ್ಷಣ WhatsApp‌ನಲ್ಲಿ ಸಿಗುತ್ತದೆ, ಪ್ರತಿ ಬಿಲ್ ಇಲ್ಲಿ ಕಾಣುತ್ತದೆ.", newBill: "ಬಿಲ್ ಮಾಡಿ",
    phone: "ಗ್ರಾಹಕರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", phoneHint: "10 ಅಂಕೆ, ಉದಾ. 98765 43210", badPhone: "10 ಅಂಕೆಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನೀಡಿ.", name: "ಗ್ರಾಹಕರ ಹೆಸರು", optional: "ಐಚ್ಛಿಕ",
    amount: "ಬಿಲ್ ಮೊತ್ತ (₹)", addItems: "ವಸ್ತುಗಳನ್ನು ಸೇರಿಸಿ (ಐಚ್ಛಿಕ)", itemName: "ವಸ್ತು", qty: "ಸಂಖ್ಯೆ", rate: "ದರ (₹)", addAnother: "+ ಇನ್ನೊಂದು ವಸ್ತು ಸೇರಿಸಿ",
    paidNow: "ಪಾವತಿಸಲಾಗಿದೆ", payLater: "ನಂತರ ಪಾವತಿಸುತ್ತಾರೆ", dueOn: "ಗ್ರಾಹಕರು ಈ ದಿನಾಂಕದೊಳಗೆ ಪಾವತಿಸುತ್ತಾರೆ", billLanguage: "ಬಿಲ್‌ನ ಭಾಷೆ",
    offersOk: "WhatsApp‌ನಲ್ಲಿ ಆಫರ್ ಮತ್ತು ಶುಭಾಶಯ ಪಡೆಯಲು ಗ್ರಾಹಕರು ಒಪ್ಪಿದ್ದಾರೆ", offersNote: "ಕೌಂಟರ್‌ನಲ್ಲಿ ಅವರು ಹೌದು ಎಂದಿದ್ದರೆ ಮಾತ್ರ ಆಯ್ಕೆ ಮಾಡಿ. ಆಗ ಖರೀದಿಯ ನಂತರ ಧನ್ಯವಾದ ಸಂದೇಶ ಹೋಗುತ್ತದೆ.", send: "WhatsApp‌ನಲ್ಲಿ ಬಿಲ್ ಕಳುಹಿಸಿ", sending: "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…",
    sentOk: "ಬಿಲ್ {no} ಗ್ರಾಹಕರಿಗೆ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ.", savedNotSent: "ಬಿಲ್ {no} ಉಳಿಸಲಾಗಿದೆ, ಆದರೆ ಇನ್ನೂ ಕಳುಹಿಸಿಲ್ಲ.", makeAnother: "ಇನ್ನೊಂದು ಬಿಲ್ ಮಾಡಿ", allBills: "ಇತ್ತೀಚಿನ ಬಿಲ್‌ಗಳು",
    empty: "ಇನ್ನೂ ಬಿಲ್‌ಗಳಿಲ್ಲ. ಮೇಲೆ ನಿಮ್ಮ ಮೊದಲ ಬಿಲ್ ಮಾಡಿ.", colBill: "ಬಿಲ್", colCustomer: "ಗ್ರಾಹಕ", colAmount: "ಮೊತ್ತ", colStatus: "WhatsApp",
    sent: "ಕಳುಹಿಸಿದೆ", waiting: "ಕಾಯುತ್ತಿದೆ", failed: "ವಿಫಲ", notSent: "ಕಳುಹಿಸಿಲ್ಲ", sendAgain: "ಮತ್ತೆ ಕಳುಹಿಸಿ", openBill: "ನೋಡಿ", paidTag: "ಪಾವತಿಸಲಾಗಿದೆ", dueTag: "ಬಾಕಿ",
    todayTotal: "ಇಂದು: {n}", needNumber: "ಮೊದಲು ನಿಮ್ಮ WhatsApp ಸಂಖ್ಯೆಯನ್ನು ಜೋಡಿಸಿ.", unpaidNote: "ಕೊನೆಯ ದಿನಾಂಕದ ಮೊದಲು ಪಾವತಿ ನೆನಪೋಲೆ ಹೋಗುತ್ತದೆ.", markPaid: "ಪಾವತಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ", overLimit: "ಈ ಗ್ರಾಹಕರು ಸಾಲದ ಮಿತಿಯನ್ನು ಮೀರಿದ್ದಾರೆ.",
  },
};
