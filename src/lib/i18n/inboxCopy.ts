import type { LanguageCode } from "./dictionaries";

/** Words for the Inbox: the conversation list, a chat, the reply box and the side panels. `{n}` is filled in. */
export type InboxUi = {
  fAll: string; fAttention: string; fMine: string; fUnassigned: string; fOpen: string;
  title: string; convOne: string; convMany: string; awaiting: string; exportBackup: string; searchPh: string; searchBtn: string;
  optedOut: string; windowOpen: string; windowClosed: string; you: string; templateMsg: string; replyArrow: string; noMatch: string; none: string;
  justNow: string; minAgo: string; hrAgo: string; yesterday: string; dayAgo: string; negative: string; urgent: string;
  noMessages: string; assignedTo: string; unassignedOpt: string;
  closedWarn: string; replyPh: string; draftAi: string; drafting: string; insertCanned: string; sendProduct: string; sending: string; buttons: string; sendForm: string; send: string;
  buttonsTitle: string; buttonsBodyPh: string; buttonN: string; sendButtons: string;
  contactInfo: string; edit: string; nameL: string; emailL: string; namePh: string; save: string; saving: string; cancel: string; languageL: string; sourceL: string; adL: string; sinceL: string; optedOutLabel: string; optedIn: string;
  privateNotes: string; someone: string; noNotes: string; notePh: string; add: string;
  sales: string; noSales: string; fromCampaign: string; amount: string; billNo: string; buyPh: string; logSale: string;
  paymentLinks: string; noLinks: string; paid: string; failed: string; pending: string;
  catchUp: string; summarizing: string; refresh: string; summarize: string; summaryHint: string;
  calling: string; requestPerm: string; sentOk: string; react: string;
};

export const INBOX_UI: Record<LanguageCode, InboxUi> = {
  en: {
    fAll: "All", fAttention: "Needs attention", fMine: "Mine", fUnassigned: "Unassigned", fOpen: "Can reply freely",
    title: "Inbox", convOne: "1 conversation", convMany: "{n} conversations", awaiting: "{n} awaiting reply", exportBackup: "Export backup", searchPh: "Search by phone or name…", searchBtn: "Search",
    optedOut: "opted out", windowOpen: "24h window open", windowClosed: "24h window closed", you: "You: ", templateMsg: "[template message]", replyArrow: "Reply ↗", noMatch: "No conversations match this filter.", none: "No conversations yet.",
    justNow: "just now", minAgo: "{n}m ago", hrAgo: "{n}h ago", yesterday: "yesterday", dayAgo: "{n}d ago", negative: "unhappy", urgent: "urgent",
    noMessages: "No messages yet.", assignedTo: "Assigned to", unassignedOpt: "Unassigned",
    closedWarn: "The 24-hour reply window is closed, so a typed reply will fail. Send an approved message from Campaigns instead, or wait for the customer to write again.",
    replyPh: "Reply (Ctrl+Enter to send)", draftAi: "✳ Draft with AI", drafting: "Drafting…", insertCanned: "Insert a saved reply…", sendProduct: "Send item…", sending: "Sending…", buttons: "▭ Buttons", sendForm: "Send form…", send: "Send",
    buttonsTitle: "Send up to 3 tappable buttons", buttonsBodyPh: "Message, for example \"Shall we keep your order ready?\"", buttonN: "Button {n}", sendButtons: "Send buttons",
    contactInfo: "Customer details", edit: "Edit", nameL: "Name", emailL: "Email", namePh: "Customer name", save: "Save", saving: "Saving…", cancel: "Cancel", languageL: "Language", sourceL: "Source", adL: "Ad", sinceL: "Since", optedOutLabel: "Opted out: no offers", optedIn: "Opted in",
    privateNotes: "Private notes", someone: "Someone", noNotes: "No notes yet. Only your team sees them, they are never sent to the customer.", notePh: "Add a note for your team…", add: "Add",
    sales: "Sales", noSales: "No sales logged for this customer yet.", fromCampaign: "from a campaign", amount: "Amount", billNo: "Bill no.", buyPh: "What did they buy? (optional)", logSale: "Log a sale",
    paymentLinks: "Payment links", noLinks: "No payment links yet.", paid: "Paid", failed: "Failed", pending: "Pending ↗",
    catchUp: "Catch-up summary", summarizing: "Summarising…", refresh: "Refresh", summarize: "✳ Summarise", summaryHint: "Get a quick recap before replying, useful when you take over from a teammate.",
    calling: "Calling", requestPerm: "📞 Request call permission", sentOk: "Sent.", react: "React",
  },
  hi: {
    fAll: "सभी", fAttention: "ध्यान चाहिए", fMine: "मेरे", fUnassigned: "किसी को नहीं सौंपे", fOpen: "खुलकर जवाब दे सकते हैं",
    title: "इनबॉक्स", convOne: "1 बातचीत", convMany: "{n} बातचीत", awaiting: "{n} जवाब का इंतज़ार", exportBackup: "बैकअप निकालें", searchPh: "फ़ोन या नाम से खोजें…", searchBtn: "खोजें",
    optedOut: "संदेश बंद", windowOpen: "24 घंटे की खिड़की खुली", windowClosed: "24 घंटे की खिड़की बंद", you: "आप: ", templateMsg: "[टेम्पलेट संदेश]", replyArrow: "जवाब दें ↗", noMatch: "इस फ़िल्टर से कोई बातचीत नहीं मिली।", none: "अभी कोई बातचीत नहीं।",
    justNow: "अभी", minAgo: "{n} मिनट पहले", hrAgo: "{n} घंटे पहले", yesterday: "कल", dayAgo: "{n} दिन पहले", negative: "नाराज़", urgent: "ज़रूरी",
    noMessages: "अभी कोई संदेश नहीं।", assignedTo: "किसे सौंपा", unassignedOpt: "किसी को नहीं",
    closedWarn: "24 घंटे की जवाब देने की खिड़की बंद है, इसलिए लिखा हुआ जवाब नहीं जाएगा। कैंपेन से मंज़ूर संदेश भेजें, या ग्राहक के फिर से लिखने का इंतज़ार करें।",
    replyPh: "जवाब लिखें (भेजने के लिए Ctrl+Enter)", draftAi: "✳ AI से ड्राफ़्ट", drafting: "ड्राफ़्ट बन रहा है…", insertCanned: "सेव किया जवाब डालें…", sendProduct: "सामान भेजें…", sending: "भेज रहे हैं…", buttons: "▭ बटन", sendForm: "फ़ॉर्म भेजें…", send: "भेजें",
    buttonsTitle: "3 तक टैप करने वाले बटन भेजें", buttonsBodyPh: "संदेश, जैसे \"आपका ऑर्डर तैयार रखें?\"", buttonN: "बटन {n}", sendButtons: "बटन भेजें",
    contactInfo: "ग्राहक की जानकारी", edit: "बदलें", nameL: "नाम", emailL: "ईमेल", namePh: "ग्राहक का नाम", save: "सेव करें", saving: "सेव हो रहा है…", cancel: "रद्द करें", languageL: "भाषा", sourceL: "कहाँ से", adL: "विज्ञापन", sinceL: "से", optedOutLabel: "संदेश बंद: कोई ऑफ़र नहीं", optedIn: "संदेश चालू",
    privateNotes: "निजी नोट", someone: "कोई", noNotes: "अभी कोई नोट नहीं। सिर्फ़ आपकी टीम देखती है, ग्राहक को कभी नहीं जाते।", notePh: "अपनी टीम के लिए नोट लिखें…", add: "जोड़ें",
    sales: "बिक्री", noSales: "इस ग्राहक की कोई बिक्री अभी दर्ज नहीं।", fromCampaign: "कैंपेन से", amount: "रकम", billNo: "बिल नं.", buyPh: "क्या ख़रीदा? (ज़रूरी नहीं)", logSale: "बिक्री दर्ज करें",
    paymentLinks: "पेमेंट लिंक", noLinks: "अभी कोई पेमेंट लिंक नहीं।", paid: "चुकता", failed: "विफल", pending: "बाकी ↗",
    catchUp: "अब तक का सार", summarizing: "सार बन रहा है…", refresh: "फिर से बनाएँ", summarize: "✳ सार बनाएँ", summaryHint: "जवाब देने से पहले छोटा सार पाएँ, साथी से काम लेते समय काम आता है।",
    calling: "कॉल", requestPerm: "📞 कॉल की अनुमति माँगें", sentOk: "भेज दिया।", react: "प्रतिक्रिया",
  },
  mr: {
    fAll: "सर्व", fAttention: "लक्ष द्यावे", fMine: "माझे", fUnassigned: "कोणालाही नाही", fOpen: "मोकळेपणाने उत्तर देता येते",
    title: "इनबॉक्स", convOne: "1 संभाषण", convMany: "{n} संभाषणे", awaiting: "{n} उत्तराच्या प्रतीक्षेत", exportBackup: "बॅकअप काढा", searchPh: "फोन किंवा नावाने शोधा…", searchBtn: "शोधा",
    optedOut: "संदेश बंद", windowOpen: "24 तासांची खिडकी उघडी", windowClosed: "24 तासांची खिडकी बंद", you: "तुम्ही: ", templateMsg: "[टेम्पलेट संदेश]", replyArrow: "उत्तर द्या ↗", noMatch: "या फिल्टरशी जुळणारे संभाषण नाही.", none: "अजून संभाषणे नाहीत.",
    justNow: "आत्ताच", minAgo: "{n} मिनिटांपूर्वी", hrAgo: "{n} तासांपूर्वी", yesterday: "काल", dayAgo: "{n} दिवसांपूर्वी", negative: "नाराज", urgent: "तातडीचे",
    noMessages: "अजून संदेश नाहीत.", assignedTo: "कोणाकडे सोपवले", unassignedOpt: "कोणालाही नाही",
    closedWarn: "24 तासांची उत्तर देण्याची खिडकी बंद आहे, म्हणून टाइप केलेले उत्तर जाणार नाही. कॅम्पेनमधून मंजूर संदेश पाठवा, किंवा ग्राहकाने पुन्हा लिहिण्याची वाट पहा.",
    replyPh: "उत्तर लिहा (पाठवण्यासाठी Ctrl+Enter)", draftAi: "✳ AI कडून मसुदा", drafting: "मसुदा बनत आहे…", insertCanned: "सेव्ह केलेले उत्तर घाला…", sendProduct: "माल पाठवा…", sending: "पाठवत आहे…", buttons: "▭ बटणे", sendForm: "फॉर्म पाठवा…", send: "पाठवा",
    buttonsTitle: "3 पर्यंत टॅप करता येणारी बटणे पाठवा", buttonsBodyPh: "संदेश, जसे \"तुमची ऑर्डर तयार ठेवू का?\"", buttonN: "बटण {n}", sendButtons: "बटणे पाठवा",
    contactInfo: "ग्राहकाची माहिती", edit: "बदला", nameL: "नाव", emailL: "ईमेल", namePh: "ग्राहकाचे नाव", save: "सेव्ह करा", saving: "सेव्ह होत आहे…", cancel: "रद्द करा", languageL: "भाषा", sourceL: "कुठून", adL: "जाहिरात", sinceL: "पासून", optedOutLabel: "संदेश बंद: ऑफर नाहीत", optedIn: "संदेश चालू",
    privateNotes: "खाजगी नोंदी", someone: "कोणीतरी", noNotes: "अजून नोंदी नाहीत. फक्त तुमची टीम पाहते, ग्राहकाला कधीच जात नाहीत.", notePh: "तुमच्या टीमसाठी नोंद लिहा…", add: "जोडा",
    sales: "विक्री", noSales: "या ग्राहकाची अजून विक्री नोंदलेली नाही.", fromCampaign: "कॅम्पेनमधून", amount: "रक्कम", billNo: "बिल क्र.", buyPh: "काय घेतले? (ऐच्छिक)", logSale: "विक्री नोंदवा",
    paymentLinks: "पेमेंट लिंक", noLinks: "अजून पेमेंट लिंक नाहीत.", paid: "भरले", failed: "अयशस्वी", pending: "बाकी ↗",
    catchUp: "आतापर्यंतचा सारांश", summarizing: "सारांश बनत आहे…", refresh: "पुन्हा बनवा", summarize: "✳ सारांश बनवा", summaryHint: "उत्तर देण्यापूर्वी छोटा सारांश मिळवा, सहकाऱ्याकडून काम घेताना उपयोगी.",
    calling: "कॉल", requestPerm: "📞 कॉलची परवानगी मागा", sentOk: "पाठवले.", react: "प्रतिक्रिया",
  },
  gu: {
    fAll: "બધા", fAttention: "ધ્યાન જોઈએ", fMine: "મારા", fUnassigned: "કોઈને સોંપ્યા નથી", fOpen: "છૂટથી જવાબ આપી શકાય",
    title: "ઇનબૉક્સ", convOne: "1 વાતચીત", convMany: "{n} વાતચીત", awaiting: "{n} જવાબની રાહ", exportBackup: "બેકઅપ કાઢો", searchPh: "ફોન કે નામથી શોધો…", searchBtn: "શોધો",
    optedOut: "સંદેશ બંધ", windowOpen: "24 કલાકની બારી ખુલ્લી", windowClosed: "24 કલાકની બારી બંધ", you: "તમે: ", templateMsg: "[ટેમ્પ્લેટ સંદેશ]", replyArrow: "જવાબ આપો ↗", noMatch: "આ ફિલ્ટર સાથે મેળ ખાતી કોઈ વાતચીત નથી.", none: "હજી કોઈ વાતચીત નથી.",
    justNow: "હમણાં જ", minAgo: "{n} મિનિટ પહેલા", hrAgo: "{n} કલાક પહેલા", yesterday: "ગઈકાલે", dayAgo: "{n} દિવસ પહેલા", negative: "નારાજ", urgent: "તાત્કાલિક",
    noMessages: "હજી કોઈ સંદેશ નથી.", assignedTo: "કોને સોંપ્યું", unassignedOpt: "કોઈને નહીં",
    closedWarn: "24 કલાકની જવાબ આપવાની બારી બંધ છે, એટલે લખેલો જવાબ જશે નહીં. કૅમ્પેનમાંથી મંજૂર સંદેશ મોકલો, અથવા ગ્રાહક ફરી લખે તેની રાહ જુઓ.",
    replyPh: "જવાબ લખો (મોકલવા Ctrl+Enter)", draftAi: "✳ AI થી ડ્રાફ્ટ", drafting: "ડ્રાફ્ટ બની રહ્યો છે…", insertCanned: "સેવ કરેલો જવાબ મૂકો…", sendProduct: "માલ મોકલો…", sending: "મોકલી રહ્યા છીએ…", buttons: "▭ બટન", sendForm: "ફોર્મ મોકલો…", send: "મોકલો",
    buttonsTitle: "3 સુધી ટેપ કરી શકાય તેવા બટન મોકલો", buttonsBodyPh: "સંદેશ, જેમ કે \"તમારો ઑર્ડર તૈયાર રાખીએ?\"", buttonN: "બટન {n}", sendButtons: "બટન મોકલો",
    contactInfo: "ગ્રાહકની માહિતી", edit: "બદલો", nameL: "નામ", emailL: "ઇમેઇલ", namePh: "ગ્રાહકનું નામ", save: "સેવ કરો", saving: "સેવ થઈ રહ્યું છે…", cancel: "રદ કરો", languageL: "ભાષા", sourceL: "ક્યાંથી", adL: "જાહેરાત", sinceL: "થી", optedOutLabel: "સંદેશ બંધ: ઑફર નહીં", optedIn: "સંદેશ ચાલુ",
    privateNotes: "ખાનગી નોંધ", someone: "કોઈક", noNotes: "હજી કોઈ નોંધ નથી. ફક્ત તમારી ટીમ જુએ છે, ગ્રાહકને ક્યારેય જતી નથી.", notePh: "તમારી ટીમ માટે નોંધ લખો…", add: "ઉમેરો",
    sales: "વેચાણ", noSales: "આ ગ્રાહકનું હજી કોઈ વેચાણ નોંધાયું નથી.", fromCampaign: "કૅમ્પેનમાંથી", amount: "રકમ", billNo: "બિલ નં.", buyPh: "શું ખરીદ્યું? (જરૂરી નથી)", logSale: "વેચાણ નોંધો",
    paymentLinks: "પેમેન્ટ લિંક", noLinks: "હજી કોઈ પેમેન્ટ લિંક નથી.", paid: "ચૂકવેલ", failed: "નિષ્ફળ", pending: "બાકી ↗",
    catchUp: "અત્યાર સુધીનો સાર", summarizing: "સાર બની રહ્યો છે…", refresh: "ફરી બનાવો", summarize: "✳ સાર બનાવો", summaryHint: "જવાબ આપતા પહેલા ટૂંકો સાર મેળવો, સાથી પાસેથી કામ લેતી વખતે કામ આવે.",
    calling: "કૉલ", requestPerm: "📞 કૉલની પરવાનગી માંગો", sentOk: "મોકલ્યું.", react: "પ્રતિભાવ",
  },
  ta: {
    fAll: "அனைத்தும்", fAttention: "கவனம் தேவை", fMine: "என்னுடையவை", fUnassigned: "யாருக்கும் ஒதுக்கவில்லை", fOpen: "சுதந்திரமாக பதிலளிக்கலாம்",
    title: "இன்பாக்ஸ்", convOne: "1 உரையாடல்", convMany: "{n} உரையாடல்கள்", awaiting: "{n} பதிலுக்காக காத்திருக்கின்றன", exportBackup: "காப்புப்பிரதி எடு", searchPh: "தொலைபேசி அல்லது பெயரால் தேடு…", searchBtn: "தேடு",
    optedOut: "செய்தி வேண்டாம்", windowOpen: "24 மணி நேர சாளரம் திறந்துள்ளது", windowClosed: "24 மணி நேர சாளரம் மூடியுள்ளது", you: "நீங்கள்: ", templateMsg: "[டெம்ப்ளேட் செய்தி]", replyArrow: "பதில் அளி ↗", noMatch: "இந்த வடிகட்டிக்குப் பொருந்தும் உரையாடல்கள் இல்லை.", none: "இன்னும் உரையாடல்கள் இல்லை.",
    justNow: "இப்போதுதான்", minAgo: "{n} நிமிடம் முன்", hrAgo: "{n} மணி முன்", yesterday: "நேற்று", dayAgo: "{n} நாள் முன்", negative: "அதிருப்தி", urgent: "அவசரம்",
    noMessages: "இன்னும் செய்திகள் இல்லை.", assignedTo: "யாருக்கு ஒதுக்கப்பட்டது", unassignedOpt: "யாருக்கும் இல்லை",
    closedWarn: "24 மணி நேர பதில் சாளரம் மூடியுள்ளது, எனவே தட்டச்சு செய்த பதில் செல்லாது. பிரச்சாரங்களிலிருந்து அங்கீகரிக்கப்பட்ட செய்தியை அனுப்புங்கள், அல்லது வாடிக்கையாளர் மீண்டும் எழுதும் வரை காத்திருங்கள்.",
    replyPh: "பதிலை எழுதுங்கள் (அனுப்ப Ctrl+Enter)", draftAi: "✳ AI மூலம் வரைவு", drafting: "வரைவு உருவாகிறது…", insertCanned: "சேமித்த பதிலைச் செருகு…", sendProduct: "பொருளை அனுப்பு…", sending: "அனுப்புகிறது…", buttons: "▭ பட்டன்கள்", sendForm: "படிவத்தை அனுப்பு…", send: "அனுப்பு",
    buttonsTitle: "3 வரை தட்டக்கூடிய பட்டன்களை அனுப்புங்கள்", buttonsBodyPh: "செய்தி, எ.கா. \"உங்கள் ஆர்டரை தயாராக வைக்கவா?\"", buttonN: "பட்டன் {n}", sendButtons: "பட்டன்களை அனுப்பு",
    contactInfo: "வாடிக்கையாளர் விவரங்கள்", edit: "திருத்து", nameL: "பெயர்", emailL: "மின்னஞ்சல்", namePh: "வாடிக்கையாளர் பெயர்", save: "சேமி", saving: "சேமிக்கிறது…", cancel: "ரத்து செய்", languageL: "மொழி", sourceL: "எங்கிருந்து", adL: "விளம்பரம்", sinceL: "முதல்", optedOutLabel: "செய்தி வேண்டாம்: சலுகைகள் இல்லை", optedIn: "செய்தி ஒப்புதல்",
    privateNotes: "தனிப்பட்ட குறிப்புகள்", someone: "யாரோ", noNotes: "இன்னும் குறிப்புகள் இல்லை. உங்கள் குழு மட்டுமே பார்க்கும், வாடிக்கையாளருக்கு ஒருபோதும் செல்லாது.", notePh: "உங்கள் குழுவுக்கு குறிப்பு எழுதுங்கள்…", add: "சேர்",
    sales: "விற்பனை", noSales: "இந்த வாடிக்கையாளருக்கு இன்னும் விற்பனை பதிவாகவில்லை.", fromCampaign: "பிரச்சாரத்திலிருந்து", amount: "தொகை", billNo: "பில் எண்", buyPh: "என்ன வாங்கினார்? (விருப்பம்)", logSale: "விற்பனையைப் பதிவு செய்",
    paymentLinks: "பணம் செலுத்தும் இணைப்புகள்", noLinks: "இன்னும் பணம் செலுத்தும் இணைப்புகள் இல்லை.", paid: "செலுத்தப்பட்டது", failed: "தோல்வி", pending: "நிலுவை ↗",
    catchUp: "இதுவரையிலான சுருக்கம்", summarizing: "சுருக்கம் உருவாகிறது…", refresh: "புதுப்பி", summarize: "✳ சுருக்கு", summaryHint: "பதில் சொல்வதற்கு முன் சிறு சுருக்கத்தைப் பெறுங்கள், சக ஊழியரிடமிருந்து பொறுப்பேற்கும்போது உதவும்.",
    calling: "அழைப்பு", requestPerm: "📞 அழைப்பு அனுமதி கேள்", sentOk: "அனுப்பப்பட்டது.", react: "எதிர்வினை",
  },
  te: {
    fAll: "అన్నీ", fAttention: "శ్రద్ధ కావాలి", fMine: "నావి", fUnassigned: "ఎవరికీ కేటాయించలేదు", fOpen: "స్వేచ్ఛగా సమాధానం ఇవ్వవచ్చు",
    title: "ఇన్‌బాక్స్", convOne: "1 సంభాషణ", convMany: "{n} సంభాషణలు", awaiting: "{n} సమాధానం కోసం ఎదురుచూస్తున్నాయి", exportBackup: "బ్యాకప్ ఎగుమతి", searchPh: "ఫోన్ లేదా పేరుతో వెతకండి…", searchBtn: "వెతుకు",
    optedOut: "సందేశాలు వద్దు", windowOpen: "24 గంటల విండో తెరిచి ఉంది", windowClosed: "24 గంటల విండో మూసి ఉంది", you: "మీరు: ", templateMsg: "[టెంప్లేట్ సందేశం]", replyArrow: "సమాధానం ఇవ్వండి ↗", noMatch: "ఈ ఫిల్టర్‌కు సరిపోయే సంభాషణలు లేవు.", none: "ఇంకా సంభాషణలు లేవు.",
    justNow: "ఇప్పుడే", minAgo: "{n} నిమిషాల క్రితం", hrAgo: "{n} గంటల క్రితం", yesterday: "నిన్న", dayAgo: "{n} రోజుల క్రితం", negative: "అసంతృప్తి", urgent: "అత్యవసరం",
    noMessages: "ఇంకా సందేశాలు లేవు.", assignedTo: "ఎవరికి కేటాయించారు", unassignedOpt: "ఎవరికీ లేదు",
    closedWarn: "24 గంటల సమాధాన విండో మూసి ఉంది, కాబట్టి టైప్ చేసిన సమాధానం వెళ్లదు. క్యాంపెయిన్ల నుండి ఆమోదిత సందేశం పంపండి, లేదా కస్టమర్ మళ్ళీ రాసే వరకు ఆగండి.",
    replyPh: "సమాధానం రాయండి (పంపడానికి Ctrl+Enter)", draftAi: "✳ AI తో డ్రాఫ్ట్", drafting: "డ్రాఫ్ట్ తయారవుతోంది…", insertCanned: "సేవ్ చేసిన సమాధానం చేర్చండి…", sendProduct: "సరుకు పంపండి…", sending: "పంపుతోంది…", buttons: "▭ బటన్లు", sendForm: "ఫారమ్ పంపండి…", send: "పంపండి",
    buttonsTitle: "3 వరకు ట్యాప్ చేయగల బటన్లు పంపండి", buttonsBodyPh: "సందేశం, ఉదా. \"మీ ఆర్డర్‌ను సిద్ధంగా ఉంచమంటారా?\"", buttonN: "బటన్ {n}", sendButtons: "బటన్లు పంపండి",
    contactInfo: "కస్టమర్ వివరాలు", edit: "మార్చు", nameL: "పేరు", emailL: "ఇమెయిల్", namePh: "కస్టమర్ పేరు", save: "సేవ్", saving: "సేవ్ అవుతోంది…", cancel: "రద్దు", languageL: "భాష", sourceL: "ఎక్కడి నుండి", adL: "ప్రకటన", sinceL: "నుండి", optedOutLabel: "సందేశాలు వద్దు: ఆఫర్లు లేవు", optedIn: "సందేశాలకు అంగీకారం",
    privateNotes: "ప్రైవేట్ నోట్లు", someone: "ఎవరో", noNotes: "ఇంకా నోట్లు లేవు. మీ బృందం మాత్రమే చూస్తుంది, కస్టమర్‌కు ఎప్పుడూ వెళ్లవు.", notePh: "మీ బృందం కోసం నోట్ రాయండి…", add: "జోడించు",
    sales: "అమ్మకాలు", noSales: "ఈ కస్టమర్‌కు ఇంకా అమ్మకాలు నమోదు కాలేదు.", fromCampaign: "క్యాంపెయిన్ నుండి", amount: "మొత్తం", billNo: "బిల్లు నం.", buyPh: "ఏం కొన్నారు? (ఐచ్ఛికం)", logSale: "అమ్మకం నమోదు చేయండి",
    paymentLinks: "చెల్లింపు లింక్‌లు", noLinks: "ఇంకా చెల్లింపు లింక్‌లు లేవు.", paid: "చెల్లించారు", failed: "విఫలం", pending: "బాకీ ↗",
    catchUp: "ఇప్పటివరకు సారాంశం", summarizing: "సారాంశం తయారవుతోంది…", refresh: "రిఫ్రెష్", summarize: "✳ సారాంశం చేయండి", summaryHint: "సమాధానం ఇవ్వడానికి ముందు చిన్న సారాంశం పొందండి, సహోద్యోగి నుండి బాధ్యత తీసుకునేటప్పుడు ఉపయోగపడుతుంది.",
    calling: "కాల్", requestPerm: "📞 కాల్ అనుమతి అడగండి", sentOk: "పంపారు.", react: "స్పందన",
  },
  kn: {
    fAll: "ಎಲ್ಲವೂ", fAttention: "ಗಮನ ಬೇಕು", fMine: "ನನ್ನವು", fUnassigned: "ಯಾರಿಗೂ ನೀಡಿಲ್ಲ", fOpen: "ಮುಕ್ತವಾಗಿ ಉತ್ತರಿಸಬಹುದು",
    title: "ಇನ್‌ಬಾಕ್ಸ್", convOne: "1 ಸಂಭಾಷಣೆ", convMany: "{n} ಸಂಭಾಷಣೆಗಳು", awaiting: "{n} ಉತ್ತರಕ್ಕಾಗಿ ಕಾಯುತ್ತಿವೆ", exportBackup: "ಬ್ಯಾಕಪ್ ರಫ್ತು", searchPh: "ಫೋನ್ ಅಥವಾ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ…", searchBtn: "ಹುಡುಕಿ",
    optedOut: "ಸಂದೇಶ ಬೇಡ", windowOpen: "24 ಗಂಟೆಗಳ ವಿಂಡೋ ತೆರೆದಿದೆ", windowClosed: "24 ಗಂಟೆಗಳ ವಿಂಡೋ ಮುಚ್ಚಿದೆ", you: "ನೀವು: ", templateMsg: "[ಟೆಂಪ್ಲೇಟ್ ಸಂದೇಶ]", replyArrow: "ಉತ್ತರಿಸಿ ↗", noMatch: "ಈ ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದುವ ಸಂಭಾಷಣೆಗಳಿಲ್ಲ.", none: "ಇನ್ನೂ ಸಂಭಾಷಣೆಗಳಿಲ್ಲ.",
    justNow: "ಈಗಷ್ಟೇ", minAgo: "{n} ನಿಮಿಷಗಳ ಹಿಂದೆ", hrAgo: "{n} ಗಂಟೆಗಳ ಹಿಂದೆ", yesterday: "ನಿನ್ನೆ", dayAgo: "{n} ದಿನಗಳ ಹಿಂದೆ", negative: "ಅಸಮಾಧಾನ", urgent: "ತುರ್ತು",
    noMessages: "ಇನ್ನೂ ಸಂದೇಶಗಳಿಲ್ಲ.", assignedTo: "ಯಾರಿಗೆ ನೀಡಲಾಗಿದೆ", unassignedOpt: "ಯಾರಿಗೂ ಇಲ್ಲ",
    closedWarn: "24 ಗಂಟೆಗಳ ಉತ್ತರ ವಿಂಡೋ ಮುಚ್ಚಿದೆ, ಆದ್ದರಿಂದ ಟೈಪ್ ಮಾಡಿದ ಉತ್ತರ ಹೋಗುವುದಿಲ್ಲ. ಅಭಿಯಾನಗಳಿಂದ ಅನುಮೋದಿತ ಸಂದೇಶ ಕಳುಹಿಸಿ, ಅಥವಾ ಗ್ರಾಹಕರು ಮತ್ತೆ ಬರೆಯುವವರೆಗೆ ಕಾಯಿರಿ.",
    replyPh: "ಉತ್ತರ ಬರೆಯಿರಿ (ಕಳುಹಿಸಲು Ctrl+Enter)", draftAi: "✳ AI ಯಿಂದ ಕರಡು", drafting: "ಕರಡು ಸಿದ್ಧವಾಗುತ್ತಿದೆ…", insertCanned: "ಉಳಿಸಿದ ಉತ್ತರ ಸೇರಿಸಿ…", sendProduct: "ವಸ್ತು ಕಳುಹಿಸಿ…", sending: "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…", buttons: "▭ ಬಟನ್‌ಗಳು", sendForm: "ಫಾರ್ಮ್ ಕಳುಹಿಸಿ…", send: "ಕಳುಹಿಸಿ",
    buttonsTitle: "3 ವರೆಗೆ ಟ್ಯಾಪ್ ಮಾಡಬಹುದಾದ ಬಟನ್‌ಗಳನ್ನು ಕಳುಹಿಸಿ", buttonsBodyPh: "ಸಂದೇಶ, ಉದಾ. \"ನಿಮ್ಮ ಆರ್ಡರ್ ಸಿದ್ಧವಾಗಿಡಬೇಕೇ?\"", buttonN: "ಬಟನ್ {n}", sendButtons: "ಬಟನ್‌ಗಳನ್ನು ಕಳುಹಿಸಿ",
    contactInfo: "ಗ್ರಾಹಕರ ವಿವರಗಳು", edit: "ಬದಲಾಯಿಸಿ", nameL: "ಹೆಸರು", emailL: "ಇಮೇಲ್", namePh: "ಗ್ರಾಹಕರ ಹೆಸರು", save: "ಉಳಿಸಿ", saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ…", cancel: "ರದ್ದುಮಾಡಿ", languageL: "ಭಾಷೆ", sourceL: "ಎಲ್ಲಿಂದ", adL: "ಜಾಹೀರಾತು", sinceL: "ಇಂದ", optedOutLabel: "ಸಂದೇಶ ಬೇಡ: ಆಫರ್‌ಗಳಿಲ್ಲ", optedIn: "ಸಂದೇಶಕ್ಕೆ ಒಪ್ಪಿಗೆ",
    privateNotes: "ಖಾಸಗಿ ಟಿಪ್ಪಣಿಗಳು", someone: "ಯಾರೋ", noNotes: "ಇನ್ನೂ ಟಿಪ್ಪಣಿಗಳಿಲ್ಲ. ನಿಮ್ಮ ತಂಡ ಮಾತ್ರ ನೋಡುತ್ತದೆ, ಗ್ರಾಹಕರಿಗೆ ಎಂದೂ ಹೋಗುವುದಿಲ್ಲ.", notePh: "ನಿಮ್ಮ ತಂಡಕ್ಕೆ ಟಿಪ್ಪಣಿ ಬರೆಯಿರಿ…", add: "ಸೇರಿಸಿ",
    sales: "ಮಾರಾಟ", noSales: "ಈ ಗ್ರಾಹಕರ ಮಾರಾಟ ಇನ್ನೂ ದಾಖಲಾಗಿಲ್ಲ.", fromCampaign: "ಅಭಿಯಾನದಿಂದ", amount: "ಮೊತ್ತ", billNo: "ಬಿಲ್ ಸಂ.", buyPh: "ಏನು ಖರೀದಿಸಿದರು? (ಐಚ್ಛಿಕ)", logSale: "ಮಾರಾಟ ದಾಖಲಿಸಿ",
    paymentLinks: "ಪಾವತಿ ಲಿಂಕ್‌ಗಳು", noLinks: "ಇನ್ನೂ ಪಾವತಿ ಲಿಂಕ್‌ಗಳಿಲ್ಲ.", paid: "ಪಾವತಿಸಲಾಗಿದೆ", failed: "ವಿಫಲ", pending: "ಬಾಕಿ ↗",
    catchUp: "ಇಲ್ಲಿಯವರೆಗಿನ ಸಾರಾಂಶ", summarizing: "ಸಾರಾಂಶ ಸಿದ್ಧವಾಗುತ್ತಿದೆ…", refresh: "ರಿಫ್ರೆಶ್", summarize: "✳ ಸಾರಾಂಶ ಮಾಡಿ", summaryHint: "ಉತ್ತರಿಸುವ ಮೊದಲು ಚಿಕ್ಕ ಸಾರಾಂಶ ಪಡೆಯಿರಿ, ಸಹೋದ್ಯೋಗಿಯಿಂದ ಜವಾಬ್ದಾರಿ ಪಡೆಯುವಾಗ ಉಪಯುಕ್ತ.",
    calling: "ಕರೆ", requestPerm: "📞 ಕರೆ ಅನುಮತಿ ಕೇಳಿ", sentOk: "ಕಳುಹಿಸಲಾಗಿದೆ.", react: "ಪ್ರತಿಕ್ರಿಯೆ",
  },
};
