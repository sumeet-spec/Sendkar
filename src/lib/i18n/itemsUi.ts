import type { LanguageCode } from "./dictionaries";

/** Words for "My items and services": what the shop sells, which its WhatsApp assistant then quotes to customers. */
export type ItemsUi = {
  nav: string; title: string; intro: string; add: string; kindItem: string; kindService: string;
  name: string; namePlaceholder: string; price: string; priceHint: string; unit: string; unitPlaceholder: string;
  description: string; photo: string; save: string; saving: string; empty: string; hide: string; show: string; remove: string;
  hidden: string; onRequest: string; assistantNote: string; confirmRemove: string; bad: string;
};

export const ITEMS_UI: Record<LanguageCode, ItemsUi> = {
  en: {
    nav: "My items", title: "My items and services", intro: "List what you sell. Your WhatsApp assistant uses this to answer customers with the right prices, and to take orders.",
    add: "Add an item or service", kindItem: "Item", kindService: "Service", name: "Name", namePlaceholder: "Basmati rice 5 kg", price: "Price (₹)", priceHint: "Leave empty to say 'price on request'",
    unit: "Per", unitPlaceholder: "per bag, per hour", description: "A line about it (optional)", photo: "Photo (optional)", save: "Add", saving: "Adding…",
    empty: "Nothing listed yet. Add your first item above.", hide: "Hide", show: "Show", remove: "Remove", hidden: "Hidden from customers", onRequest: "Price on request",
    assistantNote: "The assistant only quotes prices written here. Anything not listed, it passes to you.", confirmRemove: "Remove this item?", bad: "Enter a name for the item.",
  },
  hi: {
    nav: "मेरा सामान", title: "मेरा सामान और सेवाएँ", intro: "जो आप बेचते हैं, उसे लिखिए। आपका WhatsApp असिस्टेंट इससे ग्राहकों को सही दाम बताता है और ऑर्डर लेता है।",
    add: "सामान या सेवा जोड़ें", kindItem: "सामान", kindService: "सेवा", name: "नाम", namePlaceholder: "बासमती चावल 5 किलो", price: "दाम (₹)", priceHint: "खाली छोड़ें तो 'दाम पूछकर बताएँगे' लिखा जाएगा",
    unit: "प्रति", unitPlaceholder: "प्रति बोरी, प्रति घंटा", description: "इसके बारे में एक लाइन (ज़रूरी नहीं)", photo: "फ़ोटो (ज़रूरी नहीं)", save: "जोड़ें", saving: "जोड़ रहे हैं…",
    empty: "अभी कुछ नहीं जुड़ा। ऊपर पहला सामान जोड़िए।", hide: "छिपाएँ", show: "दिखाएँ", remove: "हटाएँ", hidden: "ग्राहकों से छिपा है", onRequest: "दाम पूछकर बताएँगे",
    assistantNote: "असिस्टेंट सिर्फ़ यहाँ लिखे दाम ही बताता है। जो यहाँ नहीं है, वह आपको भेज देता है।", confirmRemove: "इसे हटाएँ?", bad: "सामान का नाम लिखिए।",
  },
  mr: {
    nav: "माझा माल", title: "माझा माल आणि सेवा", intro: "तुम्ही जे विकता ते लिहा. तुमचा WhatsApp असिस्टंट याने ग्राहकांना योग्य किंमत सांगतो आणि ऑर्डर घेतो.",
    add: "माल किंवा सेवा जोडा", kindItem: "माल", kindService: "सेवा", name: "नाव", namePlaceholder: "बासमती तांदूळ 5 किलो", price: "किंमत (₹)", priceHint: "रिकामे ठेवल्यास 'किंमत विचारून सांगू' असे लिहिले जाईल",
    unit: "प्रति", unitPlaceholder: "प्रति पोते, प्रति तास", description: "याबद्दल एक ओळ (ऐच्छिक)", photo: "फोटो (ऐच्छिक)", save: "जोडा", saving: "जोडत आहे…",
    empty: "अजून काही जोडले नाही. वर पहिला माल जोडा.", hide: "लपवा", show: "दाखवा", remove: "काढा", hidden: "ग्राहकांपासून लपवले", onRequest: "किंमत विचारून सांगू",
    assistantNote: "असिस्टंट फक्त इथे लिहिलेल्याच किमती सांगतो. जे इथे नाही ते तुमच्याकडे पाठवतो.", confirmRemove: "हे काढायचे?", bad: "मालाचे नाव लिहा.",
  },
  gu: {
    nav: "મારો માલ", title: "મારો માલ અને સેવાઓ", intro: "તમે જે વેચો છો તે લખો. તમારો WhatsApp આસિસ્ટન્ટ તેનાથી ગ્રાહકોને સાચા ભાવ જણાવે છે અને ઑર્ડર લે છે.",
    add: "માલ કે સેવા ઉમેરો", kindItem: "માલ", kindService: "સેવા", name: "નામ", namePlaceholder: "બાસમતી ચોખા 5 કિલો", price: "ભાવ (₹)", priceHint: "ખાલી રાખશો તો 'ભાવ પૂછીને જણાવીશું' લખાશે",
    unit: "દીઠ", unitPlaceholder: "બોરી દીઠ, કલાક દીઠ", description: "તેના વિશે એક લીટી (જરૂરી નથી)", photo: "ફોટો (જરૂરી નથી)", save: "ઉમેરો", saving: "ઉમેરી રહ્યા છીએ…",
    empty: "હજી કંઈ ઉમેર્યું નથી. ઉપર પહેલો માલ ઉમેરો.", hide: "છુપાવો", show: "બતાવો", remove: "કાઢો", hidden: "ગ્રાહકોથી છુપાવેલ", onRequest: "ભાવ પૂછીને જણાવીશું",
    assistantNote: "આસિસ્ટન્ટ ફક્ત અહીં લખેલા ભાવ જ જણાવે છે. જે અહીં નથી તે તમને મોકલે છે.", confirmRemove: "આ કાઢી નાખીએ?", bad: "માલનું નામ લખો.",
  },
  ta: {
    nav: "என் பொருட்கள்", title: "என் பொருட்களும் சேவைகளும்", intro: "நீங்கள் விற்பதை எழுதுங்கள். உங்கள் WhatsApp உதவியாளர் இதைக் கொண்டு வாடிக்கையாளர்களுக்கு சரியான விலை சொல்லி ஆர்டர் எடுப்பார்.",
    add: "பொருள் அல்லது சேவையைச் சேர்க்கவும்", kindItem: "பொருள்", kindService: "சேவை", name: "பெயர்", namePlaceholder: "பாஸ்மதி அரிசி 5 கிலோ", price: "விலை (₹)", priceHint: "காலியாக விட்டால் 'விலை கேட்டு சொல்கிறோம்' என வரும்",
    unit: "ஒன்றுக்கு", unitPlaceholder: "மூட்டைக்கு, மணிக்கு", description: "இதைப் பற்றி ஒரு வரி (விருப்பம்)", photo: "புகைப்படம் (விருப்பம்)", save: "சேர்", saving: "சேர்க்கிறது…",
    empty: "இன்னும் எதுவும் சேர்க்கவில்லை. மேலே முதல் பொருளைச் சேர்க்கவும்.", hide: "மறை", show: "காட்டு", remove: "நீக்கு", hidden: "வாடிக்கையாளர்களிடமிருந்து மறைக்கப்பட்டது", onRequest: "விலை கேட்டு சொல்கிறோம்",
    assistantNote: "உதவியாளர் இங்கே எழுதிய விலைகளை மட்டுமே சொல்வார். இங்கு இல்லாததை உங்களுக்கு அனுப்புவார்.", confirmRemove: "இதை நீக்கவா?", bad: "பொருளின் பெயரை எழுதுங்கள்.",
  },
  te: {
    nav: "నా సరుకులు", title: "నా సరుకులు మరియు సేవలు", intro: "మీరు అమ్మేవాటిని రాయండి. మీ WhatsApp అసిస్టెంట్ వీటితో కస్టమర్లకు సరైన ధరలు చెప్పి ఆర్డర్లు తీసుకుంటుంది.",
    add: "సరుకు లేదా సేవ జోడించండి", kindItem: "సరుకు", kindService: "సేవ", name: "పేరు", namePlaceholder: "బాస్మతి బియ్యం 5 కిలోలు", price: "ధర (₹)", priceHint: "ఖాళీగా వదిలితే 'ధర అడిగి చెబుతాం' అని వస్తుంది",
    unit: "ఒక్కింటికి", unitPlaceholder: "బస్తాకు, గంటకు", description: "దీని గురించి ఒక లైన్ (ఐచ్ఛికం)", photo: "ఫోటో (ఐచ్ఛికం)", save: "జోడించు", saving: "జోడిస్తోంది…",
    empty: "ఇంకా ఏమీ జోడించలేదు. పైన మొదటి సరుకును జోడించండి.", hide: "దాచు", show: "చూపించు", remove: "తొలగించు", hidden: "కస్టమర్లకు కనిపించదు", onRequest: "ధర అడిగి చెబుతాం",
    assistantNote: "అసిస్టెంట్ ఇక్కడ రాసిన ధరలనే చెబుతుంది. ఇక్కడ లేనివి మీకు పంపుతుంది.", confirmRemove: "దీన్ని తొలగించాలా?", bad: "సరుకు పేరు రాయండి.",
  },
  kn: {
    nav: "ನನ್ನ ವಸ್ತುಗಳು", title: "ನನ್ನ ವಸ್ತುಗಳು ಮತ್ತು ಸೇವೆಗಳು", intro: "ನೀವು ಮಾರುವುದನ್ನು ಬರೆಯಿರಿ. ನಿಮ್ಮ WhatsApp ಸಹಾಯಕ ಇದರಿಂದ ಗ್ರಾಹಕರಿಗೆ ಸರಿಯಾದ ಬೆಲೆ ಹೇಳಿ ಆರ್ಡರ್ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ.",
    add: "ವಸ್ತು ಅಥವಾ ಸೇವೆ ಸೇರಿಸಿ", kindItem: "ವಸ್ತು", kindService: "ಸೇವೆ", name: "ಹೆಸರು", namePlaceholder: "ಬಾಸ್ಮತಿ ಅಕ್ಕಿ 5 ಕೆಜಿ", price: "ಬೆಲೆ (₹)", priceHint: "ಖಾಲಿ ಬಿಟ್ಟರೆ 'ಬೆಲೆ ಕೇಳಿ ಹೇಳುತ್ತೇವೆ' ಎಂದು ಬರುತ್ತದೆ",
    unit: "ಒಂದಕ್ಕೆ", unitPlaceholder: "ಚೀಲಕ್ಕೆ, ಗಂಟೆಗೆ", description: "ಇದರ ಬಗ್ಗೆ ಒಂದು ಸಾಲು (ಐಚ್ಛಿಕ)", photo: "ಫೋಟೋ (ಐಚ್ಛಿಕ)", save: "ಸೇರಿಸಿ", saving: "ಸೇರಿಸಲಾಗುತ್ತಿದೆ…",
    empty: "ಇನ್ನೂ ಏನನ್ನೂ ಸೇರಿಸಿಲ್ಲ. ಮೇಲೆ ಮೊದಲ ವಸ್ತು ಸೇರಿಸಿ.", hide: "ಮರೆಮಾಡಿ", show: "ತೋರಿಸಿ", remove: "ತೆಗೆಯಿರಿ", hidden: "ಗ್ರಾಹಕರಿಂದ ಮರೆಮಾಡಲಾಗಿದೆ", onRequest: "ಬೆಲೆ ಕೇಳಿ ಹೇಳುತ್ತೇವೆ",
    assistantNote: "ಸಹಾಯಕ ಇಲ್ಲಿ ಬರೆದ ಬೆಲೆಗಳನ್ನು ಮಾತ್ರ ಹೇಳುತ್ತದೆ. ಇಲ್ಲಿಲ್ಲದ್ದನ್ನು ನಿಮಗೆ ಕಳುಹಿಸುತ್ತದೆ.", confirmRemove: "ಇದನ್ನು ತೆಗೆಯಬೇಕೆ?", bad: "ವಸ್ತುವಿನ ಹೆಸರು ಬರೆಯಿರಿ.",
  },
};
