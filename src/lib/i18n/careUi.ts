import type { LanguageCode } from "./dictionaries";

/** Words for the customer profile, the follow-up list and the care switches. */
export type CareUi = {
  back: string; noName: string; language: string; source: string; consentYes: string; consentNo: string; optedOut: string;
  totalBilled: string; billCount: string; owes: string; creditLimit: string; noLimit: string; lastBill: string; never: string;
  details: string; birthday: string; anniversary: string; creditHint: string; birthdayHint: string; save: string; saving: string; saved: string;
  notes: string; notePlaceholder: string; addNote: string; followUp: string; followUpPlaceholder: string; dueOn: string; addFollowUp: string;
  markDone: string; noNotes: string; bills: string; messages: string; noBills: string; noMessages: string; tags: string; noTags: string;
  followUpsDue: string; sourcesTitle: string; shopSaid: string; customerSaid: string; overdue: string;
  careTitle: string; careIntro: string; birthdayOn: string; reorderOn: string; installTemplates: string; installing: string; installedNote: string; careNeedsNumber: string;
  tag: { new: string; regular: string; big_spender: string; lapsed: string; owes: string; over_limit: string };
  src: { counter_qr: string; manual: string; bill: string; whatsapp_inbound: string; reminder_import: string; csv_import: string; other: string };
};

export const CARE_UI: Record<LanguageCode, CareUi> = {
  en: {
    back: "All customers", noName: "No name", language: "Language", source: "Came from", consentYes: "Agreed to offers", consentNo: "Has not agreed to offers", optedOut: "Asked not to be messaged",
    totalBilled: "Total billed", billCount: "Bills", owes: "Owes", creditLimit: "Credit limit (₹)", noLimit: "No limit", lastBill: "Last bill", never: "Never",
    details: "Details", birthday: "Birthday", anniversary: "Anniversary", creditHint: "Leave empty for no limit. You are warned when a bill takes them past it.", birthdayHint: "Only the day and month are used. Wishes go out only if this customer agreed to offers and you have turned wishes on.", save: "Save", saving: "Saving…", saved: "Saved",
    notes: "Notes and follow-ups", notePlaceholder: "Wants the blue one, prefers morning delivery…", addNote: "Add note", followUp: "Follow up", followUpPlaceholder: "Call about the old balance", dueOn: "On", addFollowUp: "Add follow-up",
    markDone: "Done", noNotes: "Nothing here yet.", bills: "Bills", messages: "Recent messages", noBills: "No bills yet.", noMessages: "No messages yet.", tags: "Tags", noTags: "None yet",
    followUpsDue: "Follow-ups due", sourcesTitle: "Where your customers came from", shopSaid: "You", customerSaid: "Customer", overdue: "Overdue",
    careTitle: "Automatic customer care", careIntro: "Let Sendkar wish customers on their birthday and anniversary, and remind them when it is time to buy something again. Only customers who agreed to offers get these.", birthdayOn: "Send birthday and anniversary wishes", reorderOn: "Remind customers when it is time to restock", installTemplates: "Set up the messages with WhatsApp", installing: "Setting up…", installedNote: "The messages were sent to WhatsApp for approval. They start going out once approved, usually within hours.", careNeedsNumber: "Connect your WhatsApp number first.",
    tag: { new: "New", regular: "Regular", big_spender: "Big spender", lapsed: "Not seen in 2 months", owes: "Owes money", over_limit: "Over credit limit" },
    src: { counter_qr: "Counter QR", manual: "Added by you", bill: "First bill", whatsapp_inbound: "Wrote to you on WhatsApp", reminder_import: "Pending-payment list", csv_import: "File import", other: "Other" },
  },
  hi: {
    back: "सभी ग्राहक", noName: "नाम नहीं", language: "भाषा", source: "कहाँ से आए", consentYes: "ऑफ़र के लिए हाँ कही है", consentNo: "ऑफ़र के लिए हाँ नहीं कही", optedOut: "संदेश न भेजने को कहा है",
    totalBilled: "कुल बिल", billCount: "बिल", owes: "बाकी", creditLimit: "उधार की सीमा (₹)", noLimit: "कोई सीमा नहीं", lastBill: "आख़िरी बिल", never: "कभी नहीं",
    details: "जानकारी", birthday: "जन्मदिन", anniversary: "सालगिरह", creditHint: "सीमा नहीं रखनी तो ख़ाली छोड़ें। बिल से सीमा पार होने पर आपको बताया जाएगा।", birthdayHint: "सिर्फ़ दिन और महीना इस्तेमाल होता है। शुभकामनाएँ तभी जाती हैं जब ग्राहक ने ऑफ़र की हाँ कही हो और आपने शुभकामनाएँ चालू की हों।", save: "सेव करें", saving: "सेव हो रहा है…", saved: "सेव हो गया",
    notes: "नोट और फ़ॉलो-अप", notePlaceholder: "नीला वाला चाहिए, सुबह डिलीवरी पसंद है…", addNote: "नोट जोड़ें", followUp: "फ़ॉलो-अप", followUpPlaceholder: "पुराने बकाये के बारे में फ़ोन करना", dueOn: "तारीख़", addFollowUp: "फ़ॉलो-अप जोड़ें",
    markDone: "हो गया", noNotes: "अभी कुछ नहीं।", bills: "बिल", messages: "हाल के संदेश", noBills: "अभी कोई बिल नहीं।", noMessages: "अभी कोई संदेश नहीं।", tags: "टैग", noTags: "अभी कोई नहीं",
    followUpsDue: "आज के फ़ॉलो-अप", sourcesTitle: "आपके ग्राहक कहाँ से आए", shopSaid: "आप", customerSaid: "ग्राहक", overdue: "देर हो गई",
    careTitle: "अपने आप ग्राहक की देखभाल", careIntro: "Sendkar ग्राहकों को जन्मदिन और सालगिरह पर बधाई दे और जब दोबारा ख़रीदने का समय हो तो याद दिलाए। ये सिर्फ़ उन्हीं को जाते हैं जिन्होंने ऑफ़र की हाँ कही है।", birthdayOn: "जन्मदिन और सालगिरह की शुभकामनाएँ भेजें", reorderOn: "दोबारा ख़रीदने का समय होने पर याद दिलाएँ", installTemplates: "WhatsApp के साथ संदेश तैयार करें", installing: "तैयार हो रहा है…", installedNote: "संदेश WhatsApp की मंज़ूरी के लिए भेज दिए गए हैं। मंज़ूरी के बाद, आमतौर पर कुछ घंटों में, ये जाना शुरू हो जाएँगे।", careNeedsNumber: "पहले अपना WhatsApp नंबर जोड़ें।",
    tag: { new: "नया", regular: "नियमित", big_spender: "बड़ा ग्राहक", lapsed: "2 महीने से नहीं आए", owes: "बाकी रकम", over_limit: "उधार की सीमा पार" },
    src: { counter_qr: "काउंटर QR", manual: "आपने जोड़ा", bill: "पहला बिल", whatsapp_inbound: "WhatsApp पर लिखा", reminder_import: "बाकी भुगतान की सूची", csv_import: "फ़ाइल से", other: "अन्य" },
  },
  mr: {
    back: "सर्व ग्राहक", noName: "नाव नाही", language: "भाषा", source: "कुठून आले", consentYes: "ऑफरसाठी होकार दिला", consentNo: "ऑफरसाठी होकार दिला नाही", optedOut: "संदेश न पाठवण्यास सांगितले",
    totalBilled: "एकूण बिल", billCount: "बिले", owes: "बाकी", creditLimit: "उधारीची मर्यादा (₹)", noLimit: "मर्यादा नाही", lastBill: "शेवटचे बिल", never: "कधीच नाही",
    details: "माहिती", birthday: "वाढदिवस", anniversary: "वर्धापनदिन", creditHint: "मर्यादा नको असल्यास रिकामे ठेवा. बिलामुळे मर्यादा ओलांडली तर तुम्हाला सांगितले जाईल.", birthdayHint: "फक्त दिवस आणि महिना वापरला जातो. ग्राहकाने ऑफरला होकार दिला असेल आणि तुम्ही शुभेच्छा चालू केल्या असतील तरच त्या जातात.", save: "सेव्ह करा", saving: "सेव्ह होत आहे…", saved: "सेव्ह झाले",
    notes: "नोंदी आणि फॉलो-अप", notePlaceholder: "निळा हवा, सकाळी डिलिव्हरी आवडते…", addNote: "नोंद जोडा", followUp: "फॉलो-अप", followUpPlaceholder: "जुन्या बाकीबद्दल फोन करणे", dueOn: "तारीख", addFollowUp: "फॉलो-अप जोडा",
    markDone: "झाले", noNotes: "अजून काही नाही.", bills: "बिले", messages: "अलीकडील संदेश", noBills: "अजून बिले नाहीत.", noMessages: "अजून संदेश नाहीत.", tags: "टॅग", noTags: "अजून नाही",
    followUpsDue: "आजचे फॉलो-अप", sourcesTitle: "तुमचे ग्राहक कुठून आले", shopSaid: "तुम्ही", customerSaid: "ग्राहक", overdue: "उशीर झाला",
    careTitle: "आपोआप ग्राहकांची काळजी", careIntro: "Sendkar ने ग्राहकांना वाढदिवस आणि वर्धापनदिनी शुभेच्छा द्याव्यात आणि पुन्हा खरेदीची वेळ झाली की आठवण करून द्यावी. हे फक्त ऑफरला होकार दिलेल्यांनाच जाते.", birthdayOn: "वाढदिवस आणि वर्धापनदिनाच्या शुभेच्छा पाठवा", reorderOn: "पुन्हा खरेदीची वेळ झाल्यावर आठवण करा", installTemplates: "WhatsApp सोबत संदेश तयार करा", installing: "तयार होत आहे…", installedNote: "संदेश WhatsApp च्या मंजुरीसाठी पाठवले आहेत. मंजुरीनंतर, साधारणपणे काही तासांत, ते जाणे सुरू होईल.", careNeedsNumber: "आधी तुमचा WhatsApp नंबर जोडा.",
    tag: { new: "नवीन", regular: "नियमित", big_spender: "मोठा ग्राहक", lapsed: "2 महिने आला नाही", owes: "बाकी रक्कम", over_limit: "उधारीची मर्यादा ओलांडली" },
    src: { counter_qr: "काउंटर QR", manual: "तुम्ही जोडले", bill: "पहिले बिल", whatsapp_inbound: "WhatsApp वर लिहिले", reminder_import: "बाकी पेमेंट यादी", csv_import: "फाइलमधून", other: "इतर" },
  },
  gu: {
    back: "બધા ગ્રાહકો", noName: "નામ નથી", language: "ભાષા", source: "ક્યાંથી આવ્યા", consentYes: "ઑફર માટે હા કહી છે", consentNo: "ઑફર માટે હા કહી નથી", optedOut: "સંદેશ ન મોકલવા કહ્યું છે",
    totalBilled: "કુલ બિલ", billCount: "બિલ", owes: "બાકી", creditLimit: "ઉધારની મર્યાદા (₹)", noLimit: "કોઈ મર્યાદા નથી", lastBill: "છેલ્લું બિલ", never: "ક્યારેય નહીં",
    details: "માહિતી", birthday: "જન્મદિવસ", anniversary: "લગ્નતિથિ", creditHint: "મર્યાદા ન જોઈએ તો ખાલી રાખો. બિલથી મર્યાદા વટાવાય તો તમને જણાવાશે.", birthdayHint: "ફક્ત દિવસ અને મહિનો વપરાય છે. ગ્રાહકે ઑફર માટે હા કહી હોય અને તમે શુભેચ્છા ચાલુ કરી હોય તો જ તે જાય છે.", save: "સેવ કરો", saving: "સેવ થઈ રહ્યું છે…", saved: "સેવ થયું",
    notes: "નોંધ અને ફોલો-અપ", notePlaceholder: "વાદળી જોઈએ, સવારે ડિલિવરી ગમે છે…", addNote: "નોંધ ઉમેરો", followUp: "ફોલો-અપ", followUpPlaceholder: "જૂના બાકી અંગે ફોન કરવો", dueOn: "તારીખ", addFollowUp: "ફોલો-અપ ઉમેરો",
    markDone: "થઈ ગયું", noNotes: "હજી કંઈ નથી.", bills: "બિલ", messages: "તાજેતરના સંદેશ", noBills: "હજી કોઈ બિલ નથી.", noMessages: "હજી કોઈ સંદેશ નથી.", tags: "ટેગ", noTags: "હજી નથી",
    followUpsDue: "આજના ફોલો-અપ", sourcesTitle: "તમારા ગ્રાહકો ક્યાંથી આવ્યા", shopSaid: "તમે", customerSaid: "ગ્રાહક", overdue: "મોડું થયું",
    careTitle: "આપમેળે ગ્રાહકની સંભાળ", careIntro: "Sendkar ગ્રાહકોને જન્મદિવસ અને લગ્નતિથિએ શુભેચ્છા આપે અને ફરી ખરીદીનો સમય થાય ત્યારે યાદ અપાવે. આ ફક્ત ઑફર માટે હા કહેનારાને જ જાય છે.", birthdayOn: "જન્મદિવસ અને લગ્નતિથિની શુભેચ્છા મોકલો", reorderOn: "ફરી ખરીદીનો સમય થાય ત્યારે યાદ અપાવો", installTemplates: "WhatsApp સાથે સંદેશ તૈયાર કરો", installing: "તૈયાર થઈ રહ્યું છે…", installedNote: "સંદેશ WhatsApp ની મંજૂરી માટે મોકલ્યા છે. મંજૂરી પછી, સામાન્ય રીતે થોડા કલાકમાં, તે જવાનું શરૂ થશે.", careNeedsNumber: "પહેલા તમારો WhatsApp નંબર જોડો.",
    tag: { new: "નવા", regular: "નિયમિત", big_spender: "મોટા ગ્રાહક", lapsed: "2 મહિનાથી નથી આવ્યા", owes: "બાકી રકમ", over_limit: "ઉધારની મર્યાદા વટાવી" },
    src: { counter_qr: "કાઉન્ટર QR", manual: "તમે ઉમેર્યા", bill: "પહેલું બિલ", whatsapp_inbound: "WhatsApp પર લખ્યું", reminder_import: "બાકી ચુકવણી યાદી", csv_import: "ફાઇલમાંથી", other: "અન્ય" },
  },
  ta: {
    back: "அனைத்து வாடிக்கையாளர்கள்", noName: "பெயர் இல்லை", language: "மொழி", source: "எங்கிருந்து வந்தார்", consentYes: "சலுகைகளுக்கு சம்மதித்தார்", consentNo: "சலுகைகளுக்கு சம்மதிக்கவில்லை", optedOut: "செய்தி அனுப்ப வேண்டாம் என்றார்",
    totalBilled: "மொத்த பில்", billCount: "பில்கள்", owes: "நிலுவை", creditLimit: "கடன் வரம்பு (₹)", noLimit: "வரம்பு இல்லை", lastBill: "கடைசி பில்", never: "இல்லை",
    details: "விவரங்கள்", birthday: "பிறந்தநாள்", anniversary: "திருமண நாள்", creditHint: "வரம்பு வேண்டாம் என்றால் காலியாக விடுங்கள். பில்லால் வரம்பு தாண்டினால் உங்களுக்குத் தெரிவிக்கப்படும்.", birthdayHint: "நாளும் மாதமும் மட்டுமே பயன்படுத்தப்படும். வாடிக்கையாளர் சலுகைகளுக்கு சம்மதித்து, நீங்கள் வாழ்த்துகளை இயக்கியிருந்தால் மட்டுமே செல்லும்.", save: "சேமி", saving: "சேமிக்கிறது…", saved: "சேமிக்கப்பட்டது",
    notes: "குறிப்புகளும் பின்தொடர்தலும்", notePlaceholder: "நீல நிறம் வேண்டும், காலையில் டெலிவரி பிடிக்கும்…", addNote: "குறிப்பைச் சேர்", followUp: "பின்தொடர்தல்", followUpPlaceholder: "பழைய பாக்கி பற்றி அழைக்க", dueOn: "தேதி", addFollowUp: "பின்தொடர்தலைச் சேர்",
    markDone: "முடிந்தது", noNotes: "இன்னும் எதுவும் இல்லை.", bills: "பில்கள்", messages: "சமீபத்திய செய்திகள்", noBills: "இன்னும் பில்கள் இல்லை.", noMessages: "இன்னும் செய்திகள் இல்லை.", tags: "குறிச்சொற்கள்", noTags: "இன்னும் இல்லை",
    followUpsDue: "இன்றைய பின்தொடர்தல்கள்", sourcesTitle: "உங்கள் வாடிக்கையாளர்கள் எங்கிருந்து வந்தனர்", shopSaid: "நீங்கள்", customerSaid: "வாடிக்கையாளர்", overdue: "தாமதம்",
    careTitle: "தானாக வாடிக்கையாளர் கவனிப்பு", careIntro: "வாடிக்கையாளர்களுக்கு பிறந்தநாள், திருமண நாளில் வாழ்த்துச் சொல்லவும், மீண்டும் வாங்கும் நேரம் வந்தால் நினைவூட்டவும் Sendkar-ஐ அனுமதிக்கவும். சலுகைகளுக்கு சம்மதித்தவர்களுக்கு மட்டுமே இவை செல்லும்.", birthdayOn: "பிறந்தநாள், திருமண நாள் வாழ்த்துகள் அனுப்பு", reorderOn: "மீண்டும் வாங்கும் நேரத்தில் நினைவூட்டு", installTemplates: "WhatsApp உடன் செய்திகளை அமை", installing: "அமைக்கிறது…", installedNote: "செய்திகள் WhatsApp ஒப்புதலுக்கு அனுப்பப்பட்டன. ஒப்புதல் கிடைத்ததும், பொதுவாக சில மணி நேரத்தில், செல்லத் தொடங்கும்.", careNeedsNumber: "முதலில் உங்கள் WhatsApp எண்ணை இணைக்கவும்.",
    tag: { new: "புதியவர்", regular: "வழக்கமானவர்", big_spender: "பெரிய வாடிக்கையாளர்", lapsed: "2 மாதமாக வரவில்லை", owes: "பாக்கி உள்ளது", over_limit: "கடன் வரம்பு தாண்டியது" },
    src: { counter_qr: "கவுண்டர் QR", manual: "நீங்கள் சேர்த்தீர்கள்", bill: "முதல் பில்", whatsapp_inbound: "WhatsApp-ல் எழுதினார்", reminder_import: "நிலுவை பட்டியல்", csv_import: "கோப்பிலிருந்து", other: "மற்றவை" },
  },
  te: {
    back: "అందరు కస్టమర్లు", noName: "పేరు లేదు", language: "భాష", source: "ఎక్కడి నుండి వచ్చారు", consentYes: "ఆఫర్లకు అంగీకరించారు", consentNo: "ఆఫర్లకు అంగీకరించలేదు", optedOut: "సందేశాలు వద్దన్నారు",
    totalBilled: "మొత్తం బిల్లు", billCount: "బిల్లులు", owes: "బాకీ", creditLimit: "అప్పు పరిమితి (₹)", noLimit: "పరిమితి లేదు", lastBill: "చివరి బిల్లు", never: "ఎప్పుడూ లేదు",
    details: "వివరాలు", birthday: "పుట్టినరోజు", anniversary: "పెళ్లి రోజు", creditHint: "పరిమితి వద్దనుకుంటే ఖాళీగా వదలండి. బిల్లుతో పరిమితి దాటితే మీకు చెబుతాం.", birthdayHint: "రోజు, నెల మాత్రమే వాడతాం. కస్టమర్ ఆఫర్లకు అంగీకరించి, మీరు శుభాకాంక్షలను ఆన్ చేస్తేనే వెళ్తాయి.", save: "సేవ్", saving: "సేవ్ అవుతోంది…", saved: "సేవ్ అయింది",
    notes: "నోట్లు, ఫాలో-అప్‌లు", notePlaceholder: "నీలం కావాలి, ఉదయం డెలివరీ ఇష్టం…", addNote: "నోట్ జోడించు", followUp: "ఫాలో-అప్", followUpPlaceholder: "పాత బాకీ గురించి ఫోన్ చేయాలి", dueOn: "తేదీ", addFollowUp: "ఫాలో-అప్ జోడించు",
    markDone: "అయింది", noNotes: "ఇంకా ఏమీ లేదు.", bills: "బిల్లులు", messages: "ఇటీవలి సందేశాలు", noBills: "ఇంకా బిల్లులు లేవు.", noMessages: "ఇంకా సందేశాలు లేవు.", tags: "ట్యాగ్‌లు", noTags: "ఇంకా లేవు",
    followUpsDue: "నేటి ఫాలో-అప్‌లు", sourcesTitle: "మీ కస్టమర్లు ఎక్కడి నుండి వచ్చారు", shopSaid: "మీరు", customerSaid: "కస్టమర్", overdue: "ఆలస్యం",
    careTitle: "ఆటోమేటిక్ కస్టమర్ కేర్", careIntro: "కస్టమర్లకు పుట్టినరోజు, పెళ్లి రోజున శుభాకాంక్షలు చెప్పడానికి, మళ్లీ కొనే సమయం వచ్చినప్పుడు గుర్తు చేయడానికి Sendkarను అనుమతించండి. ఆఫర్లకు అంగీకరించినవారికే ఇవి వెళ్తాయి.", birthdayOn: "పుట్టినరోజు, పెళ్లి రోజు శుభాకాంక్షలు పంపండి", reorderOn: "మళ్లీ కొనే సమయం వచ్చినప్పుడు గుర్తు చేయండి", installTemplates: "WhatsAppతో సందేశాలు సిద్ధం చేయండి", installing: "సిద్ధం చేస్తోంది…", installedNote: "సందేశాలు WhatsApp ఆమోదానికి పంపబడ్డాయి. ఆమోదం రాగానే, సాధారణంగా కొన్ని గంటల్లో, వెళ్లడం మొదలవుతుంది.", careNeedsNumber: "ముందుగా మీ WhatsApp నంబర్‌ను కనెక్ట్ చేయండి.",
    tag: { new: "కొత్త", regular: "రెగ్యులర్", big_spender: "పెద్ద కస్టమర్", lapsed: "2 నెలలుగా రాలేదు", owes: "బాకీ ఉంది", over_limit: "అప్పు పరిమితి దాటింది" },
    src: { counter_qr: "కౌంటర్ QR", manual: "మీరు జోడించారు", bill: "మొదటి బిల్లు", whatsapp_inbound: "WhatsApp‌లో రాశారు", reminder_import: "బాకీ జాబితా", csv_import: "ఫైల్ నుండి", other: "ఇతరాలు" },
  },
  kn: {
    back: "ಎಲ್ಲ ಗ್ರಾಹಕರು", noName: "ಹೆಸರಿಲ್ಲ", language: "ಭಾಷೆ", source: "ಎಲ್ಲಿಂದ ಬಂದರು", consentYes: "ಆಫರ್‌ಗಳಿಗೆ ಒಪ್ಪಿದ್ದಾರೆ", consentNo: "ಆಫರ್‌ಗಳಿಗೆ ಒಪ್ಪಿಲ್ಲ", optedOut: "ಸಂದೇಶ ಕಳುಹಿಸಬೇಡಿ ಎಂದಿದ್ದಾರೆ",
    totalBilled: "ಒಟ್ಟು ಬಿಲ್", billCount: "ಬಿಲ್‌ಗಳು", owes: "ಬಾಕಿ", creditLimit: "ಸಾಲದ ಮಿತಿ (₹)", noLimit: "ಮಿತಿ ಇಲ್ಲ", lastBill: "ಕೊನೆಯ ಬಿಲ್", never: "ಎಂದೂ ಇಲ್ಲ",
    details: "ವಿವರಗಳು", birthday: "ಹುಟ್ಟುಹಬ್ಬ", anniversary: "ವಿವಾಹ ವಾರ್ಷಿಕೋತ್ಸವ", creditHint: "ಮಿತಿ ಬೇಡವಾದರೆ ಖಾಲಿ ಬಿಡಿ. ಬಿಲ್‌ನಿಂದ ಮಿತಿ ಮೀರಿದರೆ ನಿಮಗೆ ತಿಳಿಸಲಾಗುತ್ತದೆ.", birthdayHint: "ದಿನ ಮತ್ತು ತಿಂಗಳು ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ. ಗ್ರಾಹಕರು ಆಫರ್‌ಗಳಿಗೆ ಒಪ್ಪಿ, ನೀವು ಶುಭಾಶಯಗಳನ್ನು ಆನ್ ಮಾಡಿದ್ದರೆ ಮಾತ್ರ ಹೋಗುತ್ತವೆ.", save: "ಉಳಿಸಿ", saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ…", saved: "ಉಳಿಸಲಾಗಿದೆ",
    notes: "ಟಿಪ್ಪಣಿಗಳು ಮತ್ತು ಫಾಲೋ-ಅಪ್‌ಗಳು", notePlaceholder: "ನೀಲಿ ಬೇಕು, ಬೆಳಿಗ್ಗೆ ಡೆಲಿವರಿ ಇಷ್ಟ…", addNote: "ಟಿಪ್ಪಣಿ ಸೇರಿಸಿ", followUp: "ಫಾಲೋ-ಅಪ್", followUpPlaceholder: "ಹಳೆಯ ಬಾಕಿ ಬಗ್ಗೆ ಕರೆ ಮಾಡಬೇಕು", dueOn: "ದಿನಾಂಕ", addFollowUp: "ಫಾಲೋ-ಅಪ್ ಸೇರಿಸಿ",
    markDone: "ಆಯಿತು", noNotes: "ಇನ್ನೂ ಏನೂ ಇಲ್ಲ.", bills: "ಬಿಲ್‌ಗಳು", messages: "ಇತ್ತೀಚಿನ ಸಂದೇಶಗಳು", noBills: "ಇನ್ನೂ ಬಿಲ್‌ಗಳಿಲ್ಲ.", noMessages: "ಇನ್ನೂ ಸಂದೇಶಗಳಿಲ್ಲ.", tags: "ಟ್ಯಾಗ್‌ಗಳು", noTags: "ಇನ್ನೂ ಇಲ್ಲ",
    followUpsDue: "ಇಂದಿನ ಫಾಲೋ-ಅಪ್‌ಗಳು", sourcesTitle: "ನಿಮ್ಮ ಗ್ರಾಹಕರು ಎಲ್ಲಿಂದ ಬಂದರು", shopSaid: "ನೀವು", customerSaid: "ಗ್ರಾಹಕ", overdue: "ತಡವಾಗಿದೆ",
    careTitle: "ಸ್ವಯಂಚಾಲಿತ ಗ್ರಾಹಕ ಆರೈಕೆ", careIntro: "ಗ್ರಾಹಕರಿಗೆ ಹುಟ್ಟುಹಬ್ಬ ಮತ್ತು ವಾರ್ಷಿಕೋತ್ಸವದಂದು ಶುಭಾಶಯ ಹೇಳಲು, ಮತ್ತೆ ಖರೀದಿಸುವ ಸಮಯ ಬಂದಾಗ ನೆನಪಿಸಲು Sendkar ಗೆ ಅವಕಾಶ ನೀಡಿ. ಆಫರ್‌ಗಳಿಗೆ ಒಪ್ಪಿದವರಿಗೆ ಮಾತ್ರ ಇವು ಹೋಗುತ್ತವೆ.", birthdayOn: "ಹುಟ್ಟುಹಬ್ಬ, ವಾರ್ಷಿಕೋತ್ಸವ ಶುಭಾಶಯ ಕಳುಹಿಸಿ", reorderOn: "ಮತ್ತೆ ಖರೀದಿಸುವ ಸಮಯದಲ್ಲಿ ನೆನಪಿಸಿ", installTemplates: "WhatsApp ಜೊತೆ ಸಂದೇಶಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ", installing: "ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ…", installedNote: "ಸಂದೇಶಗಳನ್ನು WhatsApp ಅನುಮೋದನೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ. ಅನುಮೋದನೆ ಸಿಕ್ಕ ಮೇಲೆ, ಸಾಮಾನ್ಯವಾಗಿ ಕೆಲವು ಗಂಟೆಗಳಲ್ಲಿ, ಹೋಗಲು ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.", careNeedsNumber: "ಮೊದಲು ನಿಮ್ಮ WhatsApp ಸಂಖ್ಯೆಯನ್ನು ಜೋಡಿಸಿ.",
    tag: { new: "ಹೊಸಬರು", regular: "ನಿಯಮಿತ", big_spender: "ದೊಡ್ಡ ಗ್ರಾಹಕ", lapsed: "2 ತಿಂಗಳಿಂದ ಬಂದಿಲ್ಲ", owes: "ಬಾಕಿ ಇದೆ", over_limit: "ಸಾಲದ ಮಿತಿ ಮೀರಿದೆ" },
    src: { counter_qr: "ಕೌಂಟರ್ QR", manual: "ನೀವು ಸೇರಿಸಿದ್ದು", bill: "ಮೊದಲ ಬಿಲ್", whatsapp_inbound: "WhatsApp‌ನಲ್ಲಿ ಬರೆದರು", reminder_import: "ಬಾಕಿ ಪಟ್ಟಿ", csv_import: "ಫೈಲ್‌ನಿಂದ", other: "ಇತರೆ" },
  },
};
