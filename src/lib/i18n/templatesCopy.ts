import type { LanguageCode } from "./dictionaries";

/** Words for the Templates page: heading, filters, cards, buttons and the starter pack chrome. */
export type TemplatesUi = {
  title: string; introConnected: string; introNot: string;
  search: string; all: string; approved: string; pending: string; rejected: string;
  group: string; cards: string; underReview: string; empty: string; emptyFilter: string;
  fixResubmit: string; correctedPh: string; resubmitting: string; resubmit: string; cancel: string;
  duplicating: string; duplicate: string; deleting: string; confirmDelete: string; delete: string;
  pack: {
    title: string; blurb: string; campaignTitle: string; campaignBlurb: string; transTitle: string; transBlurb: string; nurtureTitle: string; nurtureBlurb: string;
    service: string; promo: string; submitting: string; add: string; noteConnected: string; noteNot: string; draftNote: string;
    submitted: string; drafts: string; already: string; rejectedN: string;
  };
};

export const TEMPLATES_UI: Record<LanguageCode, TemplatesUi> = {
  en: {
    title: "Templates", introConnected: "Sent straight to Meta for review — the status updates by itself.", introNot: "Connect WhatsApp in Settings → Channels to send templates to Meta for real review.",
    search: "Search templates…", all: "All", approved: "Approved", pending: "Waiting", rejected: "Rejected",
    group: "group: {name}", cards: "{n} cards", underReview: "Meta is reviewing this — usually a few hours, sometimes up to 48 hours. It updates by itself.",
    empty: "No templates yet — every campaign needs at least one approved template. Tap \"New template\" to send your first.", emptyFilter: "No templates match this filter.",
    fixResubmit: "Fix and send to Meta again", correctedPh: "Corrected message…", resubmitting: "Sending again…", resubmit: "Send again", cancel: "Cancel",
    duplicating: "Duplicating…", duplicate: "Duplicate", deleting: "Deleting…", confirmDelete: "Yes, delete", delete: "Delete",
    pack: {
      title: "Starter pack for Indian shops", blurb: "{n} ready-made messages for any shop or business — festival greetings and offers, new stock, price lists, thank-yous, payment reminders, dispatch updates and follow-ups. Add them in one tap, and write your own for anything special to your trade.",
      campaignTitle: "Festival and offer campaigns", campaignBlurb: "Send to all your customers at once.", transTitle: "After a sale and for payments", transBlurb: "Bills, thank-yous, LR numbers and payment reminders.",
      nurtureTitle: "Keeping customers close", nurtureBlurb: "Tips, birthdays and win-backs.", service: "Service", promo: "Promotional",
      submitting: "Sending to Meta…", add: "Add {n} templates",
      noteConnected: "Meta reviews each one on your own account: service messages are usually approved within minutes, promotional ones within hours. Anything Meta rejects shows below with the reason.",
      noteNot: "First connect WhatsApp in Settings → Channels to send these to Meta. Until then they are saved as drafts.",
      draftNote: "The Hindi and Gujarati wording is a first draft — have someone fluent read it before your first campaign.",
      submitted: "{n} sent to Meta for review.", drafts: "{n} saved as drafts.", already: "{n} were already in your account.", rejectedN: "{n} were rejected.",
    },
  },
  hi: {
    title: "टेम्पलेट", introConnected: "सीधे Meta को जाँच के लिए भेजे जाते हैं — स्थिति अपने आप बदलती रहती है।", introNot: "टेम्पलेट Meta को भेजने के लिए सेटिंग्स → चैनल में WhatsApp जोड़ें।",
    search: "टेम्पलेट खोजें…", all: "सभी", approved: "मंज़ूर", pending: "इंतज़ार में", rejected: "नामंज़ूर",
    group: "ग्रुप: {name}", cards: "{n} कार्ड", underReview: "Meta जाँच रहा है — आम तौर पर कुछ घंटे, कभी 48 घंटे तक। अपने आप बदल जाएगा।",
    empty: "अभी कोई टेम्पलेट नहीं — हर कैंपेन के लिए कम से कम एक मंज़ूर टेम्पलेट चाहिए। पहला भेजने के लिए \"नया टेम्पलेट\" दबाएँ।", emptyFilter: "इस फ़िल्टर में कोई टेम्पलेट नहीं।",
    fixResubmit: "ठीक करके Meta को फिर भेजें", correctedPh: "सुधारा हुआ संदेश…", resubmitting: "फिर भेज रहे हैं…", resubmit: "फिर भेजें", cancel: "रद्द करें",
    duplicating: "कॉपी बन रही है…", duplicate: "कॉपी बनाएँ", deleting: "मिटा रहे हैं…", confirmDelete: "हाँ, मिटाएँ", delete: "मिटाएँ",
    pack: {
      title: "भारतीय दुकानों के लिए स्टार्टर पैक", blurb: "किसी भी दुकान या कारोबार के लिए {n} बने-बनाए संदेश — त्योहार की बधाई और ऑफ़र, नया माल, रेट लिस्ट, धन्यवाद, पेमेंट की याद, डिस्पैच की ख़बर और फ़ॉलो-अप। एक दबाव में जोड़ें, और अपने काम की ख़ास बातों के लिए ख़ुद लिखें।",
      campaignTitle: "त्योहार और ऑफ़र कैंपेन", campaignBlurb: "अपने सभी ग्राहकों को एक साथ भेजें।", transTitle: "बिक्री के बाद और पेमेंट के लिए", transBlurb: "बिल, धन्यवाद, LR नंबर और पेमेंट की याद।",
      nurtureTitle: "ग्राहकों से जुड़े रहना", nurtureBlurb: "सुझाव, जन्मदिन और पुराने ग्राहकों को वापस लाना।", service: "सेवा", promo: "प्रचार",
      submitting: "Meta को भेज रहे हैं…", add: "{n} टेम्पलेट जोड़ें",
      noteConnected: "Meta हर एक को आपके अपने अकाउंट पर जाँचता है: सेवा वाले संदेश आम तौर पर मिनटों में, प्रचार वाले घंटों में मंज़ूर होते हैं। जो Meta नामंज़ूर करे वह कारण के साथ नीचे दिखेगा।",
      noteNot: "इन्हें Meta को भेजने के लिए पहले सेटिंग्स → चैनल में WhatsApp जोड़ें। तब तक ये ड्राफ़्ट में सेव रहेंगे।",
      draftNote: "हिंदी और गुजराती शब्द पहला ड्राफ़्ट हैं — पहले कैंपेन से पहले किसी जानकार से पढ़वा लें।",
      submitted: "{n} Meta को जाँच के लिए भेजे गए।", drafts: "{n} ड्राफ़्ट में सेव हुए।", already: "{n} पहले से आपके अकाउंट में थे।", rejectedN: "{n} नामंज़ूर हुए।",
    },
  },
  mr: {
    title: "टेम्पलेट", introConnected: "थेट Meta कडे तपासणीसाठी जातात — स्थिती आपोआप बदलते.", introNot: "टेम्पलेट Meta ला पाठवण्यासाठी सेटिंग्ज → चॅनेलमध्ये WhatsApp जोडा.",
    search: "टेम्पलेट शोधा…", all: "सर्व", approved: "मंजूर", pending: "वाट पाहत आहे", rejected: "नामंजूर",
    group: "गट: {name}", cards: "{n} कार्ड", underReview: "Meta तपासत आहे — साधारण काही तास, कधी 48 तासांपर्यंत. आपोआप बदलेल.",
    empty: "अजून टेम्पलेट नाहीत — प्रत्येक कॅम्पेनसाठी किमान एक मंजूर टेम्पलेट हवे. पहिले पाठवण्यासाठी \"नवीन टेम्पलेट\" दाबा.", emptyFilter: "या फिल्टरमध्ये टेम्पलेट नाही.",
    fixResubmit: "दुरुस्त करून Meta ला पुन्हा पाठवा", correctedPh: "दुरुस्त केलेला संदेश…", resubmitting: "पुन्हा पाठवत आहे…", resubmit: "पुन्हा पाठवा", cancel: "रद्द करा",
    duplicating: "प्रत बनत आहे…", duplicate: "प्रत बनवा", deleting: "काढत आहे…", confirmDelete: "होय, काढा", delete: "काढा",
    pack: {
      title: "भारतीय दुकानांसाठी स्टार्टर पॅक", blurb: "कोणत्याही दुकान किंवा व्यवसायासाठी {n} तयार संदेश — सणाच्या शुभेच्छा आणि ऑफर, नवा माल, भावयादी, आभार, पेमेंटची आठवण, डिस्पॅच अपडेट आणि फॉलो-अप. एका टॅपमध्ये जोडा, आणि तुमच्या व्यवसायाच्या खास गोष्टींसाठी स्वतः लिहा.",
      campaignTitle: "सण आणि ऑफर कॅम्पेन", campaignBlurb: "तुमच्या सर्व ग्राहकांना एकदम पाठवा.", transTitle: "विक्रीनंतर आणि पेमेंटसाठी", transBlurb: "बिले, आभार, LR क्रमांक आणि पेमेंटची आठवण.",
      nurtureTitle: "ग्राहकांशी जोडलेले राहणे", nurtureBlurb: "टिप्स, वाढदिवस आणि जुन्या ग्राहकांना परत आणणे.", service: "सेवा", promo: "प्रचार",
      submitting: "Meta ला पाठवत आहे…", add: "{n} टेम्पलेट जोडा",
      noteConnected: "Meta प्रत्येक संदेश तुमच्या स्वतःच्या खात्यावर तपासतो: सेवा संदेश साधारण मिनिटांत, प्रचार संदेश तासांत मंजूर होतात. Meta ने नाकारलेले कारणासह खाली दिसेल.",
      noteNot: "हे Meta ला पाठवण्यासाठी आधी सेटिंग्ज → चॅनेलमध्ये WhatsApp जोडा. तोपर्यंत ते ड्राफ्ट म्हणून सेव्ह राहतील.",
      draftNote: "हिंदी आणि गुजराती शब्दरचना पहिला मसुदा आहे — पहिल्या कॅम्पेनआधी जाणकाराकडून वाचून घ्या.",
      submitted: "{n} Meta ला तपासणीसाठी पाठवले.", drafts: "{n} ड्राफ्ट म्हणून सेव्ह केले.", already: "{n} आधीच तुमच्या खात्यात होते.", rejectedN: "{n} नामंजूर झाले.",
    },
  },
  gu: {
    title: "ટેમ્પ્લેટ", introConnected: "સીધા Metaને તપાસ માટે મોકલાય છે — સ્થિતિ આપોઆપ બદલાય છે.", introNot: "ટેમ્પ્લેટ Metaને મોકલવા સેટિંગ્સ → ચેનલમાં WhatsApp જોડો.",
    search: "ટેમ્પ્લેટ શોધો…", all: "બધા", approved: "મંજૂર", pending: "રાહ જોઈ રહ્યા છે", rejected: "નામંજૂર",
    group: "જૂથ: {name}", cards: "{n} કાર્ડ", underReview: "Meta તપાસી રહ્યું છે — સામાન્ય રીતે થોડા કલાક, ક્યારેક 48 કલાક સુધી. આપોઆપ બદલાશે.",
    empty: "હજી કોઈ ટેમ્પ્લેટ નથી — દરેક કૅમ્પેન માટે ઓછામાં ઓછું એક મંજૂર ટેમ્પ્લેટ જોઈએ. પહેલું મોકલવા \"નવું ટેમ્પ્લેટ\" દબાવો.", emptyFilter: "આ ફિલ્ટરમાં કોઈ ટેમ્પ્લેટ નથી.",
    fixResubmit: "સુધારીને Metaને ફરી મોકલો", correctedPh: "સુધારેલો સંદેશ…", resubmitting: "ફરી મોકલી રહ્યા છીએ…", resubmit: "ફરી મોકલો", cancel: "રદ કરો",
    duplicating: "નકલ બની રહી છે…", duplicate: "નકલ બનાવો", deleting: "કાઢી રહ્યા છીએ…", confirmDelete: "હા, કાઢો", delete: "કાઢો",
    pack: {
      title: "ભારતીય દુકાનો માટે સ્ટાર્ટર પૅક", blurb: "કોઈ પણ દુકાન કે ધંધા માટે {n} તૈયાર સંદેશ — તહેવારની શુભેચ્છા અને ઑફર, નવો માલ, ભાવ યાદી, આભાર, પેમેન્ટની યાદ, ડિસ્પૅચ અપડેટ અને ફૉલો-અપ. એક ટૅપમાં ઉમેરો, અને તમારા ધંધાની ખાસ વાતો માટે જાતે લખો.",
      campaignTitle: "તહેવાર અને ઑફર કૅમ્પેન", campaignBlurb: "તમારા બધા ગ્રાહકોને એક સાથે મોકલો.", transTitle: "વેચાણ પછી અને પેમેન્ટ માટે", transBlurb: "બિલ, આભાર, LR નંબર અને પેમેન્ટની યાદ.",
      nurtureTitle: "ગ્રાહકો સાથે જોડાયેલા રહેવું", nurtureBlurb: "ટિપ્સ, જન્મદિવસ અને જૂના ગ્રાહકોને પાછા લાવવા.", service: "સેવા", promo: "પ્રચાર",
      submitting: "Metaને મોકલી રહ્યા છીએ…", add: "{n} ટેમ્પ્લેટ ઉમેરો",
      noteConnected: "Meta દરેકને તમારા પોતાના ખાતા પર તપાસે છે: સેવા સંદેશ સામાન્ય રીતે મિનિટોમાં, પ્રચાર સંદેશ કલાકોમાં મંજૂર થાય છે. Meta જે નામંજૂર કરે તે કારણ સાથે નીચે દેખાશે.",
      noteNot: "આ Metaને મોકલવા પહેલા સેટિંગ્સ → ચેનલમાં WhatsApp જોડો. ત્યાં સુધી તે ડ્રાફ્ટ તરીકે સેવ રહેશે.",
      draftNote: "હિન્દી અને ગુજરાતી શબ્દો પહેલો ડ્રાફ્ટ છે — પહેલા કૅમ્પેન પહેલાં કોઈ જાણકાર પાસે વંચાવી લો.",
      submitted: "{n} Metaને તપાસ માટે મોકલ્યા.", drafts: "{n} ડ્રાફ્ટ તરીકે સેવ થયા.", already: "{n} પહેલેથી તમારા ખાતામાં હતા.", rejectedN: "{n} નામંજૂર થયા.",
    },
  },
  ta: {
    title: "டெம்ப்ளேட்கள்", introConnected: "நேரடியாக Meta-வின் சரிபார்ப்புக்கு அனுப்பப்படும் — நிலை தானாக மாறும்.", introNot: "டெம்ப்ளேட்களை Meta-வுக்கு அனுப்ப அமைப்புகள் → சேனல்களில் WhatsApp-ஐ இணையுங்கள்.",
    search: "டெம்ப்ளேட்களைத் தேடு…", all: "அனைத்தும்", approved: "அங்கீகரிக்கப்பட்டவை", pending: "காத்திருப்பவை", rejected: "நிராகரிக்கப்பட்டவை",
    group: "குழு: {name}", cards: "{n} அட்டைகள்", underReview: "Meta சரிபார்க்கிறது — பொதுவாக சில மணி நேரம், சில சமயம் 48 மணி நேரம் வரை. தானாகப் புதுப்பிக்கப்படும்.",
    empty: "இன்னும் டெம்ப்ளேட் இல்லை — ஒவ்வொரு பிரச்சாரத்துக்கும் குறைந்தது ஒரு அங்கீகரிக்கப்பட்ட டெம்ப்ளேட் வேண்டும். முதல் ஒன்றை அனுப்ப \"புதிய டெம்ப்ளேட்\" அழுத்துங்கள்.", emptyFilter: "இந்த வடிகட்டிக்கு டெம்ப்ளேட் இல்லை.",
    fixResubmit: "சரிசெய்து Meta-வுக்கு மீண்டும் அனுப்பு", correctedPh: "திருத்திய செய்தி…", resubmitting: "மீண்டும் அனுப்புகிறது…", resubmit: "மீண்டும் அனுப்பு", cancel: "ரத்து",
    duplicating: "நகல் உருவாகிறது…", duplicate: "நகல் எடு", deleting: "அழிக்கிறது…", confirmDelete: "ஆம், அழி", delete: "அழி",
    pack: {
      title: "இந்தியக் கடைகளுக்கான தொடக்கத் தொகுப்பு", blurb: "எந்தக் கடைக்கும் தொழிலுக்கும் {n} தயார் செய்திகள் — பண்டிகை வாழ்த்து, சலுகைகள், புதிய சரக்கு, விலைப்பட்டியல், நன்றி, பணம் நினைவூட்டல், அனுப்பிய தகவல், தொடர் செய்திகள். ஒரு தட்டில் சேர்க்கலாம்; உங்கள் தொழிலுக்கே உரியவற்றை நீங்களே எழுதுங்கள்.",
      campaignTitle: "பண்டிகை மற்றும் சலுகை பிரச்சாரங்கள்", campaignBlurb: "உங்கள் அனைத்து வாடிக்கையாளர்களுக்கும் ஒரே நேரத்தில் அனுப்புங்கள்.", transTitle: "விற்பனைக்குப் பின் மற்றும் பணத்துக்கு", transBlurb: "பில்கள், நன்றிகள், LR எண்கள், பண நினைவூட்டல்கள்.",
      nurtureTitle: "வாடிக்கையாளர்களுடன் தொடர்பில் இருத்தல்", nurtureBlurb: "குறிப்புகள், பிறந்தநாள்கள், பழைய வாடிக்கையாளர்களை மீண்டும் அழைத்தல்.", service: "சேவை", promo: "விளம்பரம்",
      submitting: "Meta-வுக்கு அனுப்புகிறது…", add: "{n} டெம்ப்ளேட்களைச் சேர்",
      noteConnected: "Meta ஒவ்வொன்றையும் உங்கள் சொந்தக் கணக்கில் சரிபார்க்கும்: சேவைச் செய்திகள் பொதுவாக சில நிமிடங்களில், விளம்பரச் செய்திகள் சில மணி நேரத்தில் அங்கீகரிக்கப்படும். Meta நிராகரித்தவை காரணத்துடன் கீழே தெரியும்.",
      noteNot: "இவற்றை Meta-வுக்கு அனுப்ப முதலில் அமைப்புகள் → சேனல்களில் WhatsApp-ஐ இணையுங்கள். அதுவரை வரைவுகளாகச் சேமிக்கப்படும்.",
      draftNote: "இந்தி மற்றும் குஜராத்தி சொற்கள் முதல் வரைவு — முதல் பிரச்சாரத்துக்கு முன் தெரிந்தவரிடம் படிக்கக் கொடுங்கள்.",
      submitted: "{n} Meta சரிபார்ப்புக்கு அனுப்பப்பட்டன.", drafts: "{n} வரைவுகளாகச் சேமிக்கப்பட்டன.", already: "{n} ஏற்கெனவே உங்கள் கணக்கில் இருந்தன.", rejectedN: "{n} நிராகரிக்கப்பட்டன.",
    },
  },
  te: {
    title: "టెంప్లేట్లు", introConnected: "నేరుగా Meta సమీక్షకు పంపుతాం — స్థితి దానంతట అదే మారుతుంది.", introNot: "టెంప్లేట్లను Metaకు పంపడానికి సెట్టింగ్స్ → ఛానెల్స్‌లో WhatsApp కనెక్ట్ చేయండి.",
    search: "టెంప్లేట్లు వెతకండి…", all: "అన్నీ", approved: "ఆమోదించినవి", pending: "వేచి ఉన్నవి", rejected: "తిరస్కరించినవి",
    group: "గ్రూప్: {name}", cards: "{n} కార్డులు", underReview: "Meta పరిశీలిస్తోంది — సాధారణంగా కొన్ని గంటలు, కొన్నిసార్లు 48 గంటల వరకు. దానంతట అదే మారుతుంది.",
    empty: "ఇంకా టెంప్లేట్లు లేవు — ప్రతి క్యాంపెయిన్‌కు కనీసం ఒక ఆమోదించిన టెంప్లేట్ కావాలి. మొదటిది పంపడానికి \"కొత్త టెంప్లేట్\" నొక్కండి.", emptyFilter: "ఈ ఫిల్టర్‌కు టెంప్లేట్లు లేవు.",
    fixResubmit: "సరిచేసి Metaకు మళ్ళీ పంపండి", correctedPh: "సరిచేసిన మెసేజ్…", resubmitting: "మళ్ళీ పంపుతోంది…", resubmit: "మళ్ళీ పంపండి", cancel: "రద్దు",
    duplicating: "కాపీ అవుతోంది…", duplicate: "కాపీ చేయండి", deleting: "తొలగిస్తోంది…", confirmDelete: "అవును, తొలగించు", delete: "తొలగించు",
    pack: {
      title: "భారతీయ షాపుల కోసం స్టార్టర్ ప్యాక్", blurb: "ఏ షాప్ లేదా వ్యాపారానికైనా {n} సిద్ధమైన మెసేజ్‌లు — పండుగ శుభాకాంక్షలు, ఆఫర్లు, కొత్త సరుకు, ధరల జాబితా, ధన్యవాదాలు, పేమెంట్ గుర్తు, డిస్పాచ్ అప్‌డేట్లు, ఫాలో-అప్‌లు. ఒక్క ట్యాప్‌తో జోడించండి; మీ వ్యాపారానికి ప్రత్యేకమైనవి మీరే రాయండి.",
      campaignTitle: "పండుగ, ఆఫర్ క్యాంపెయిన్లు", campaignBlurb: "మీ కస్టమర్లందరికీ ఒకేసారి పంపండి.", transTitle: "అమ్మకం తర్వాత, పేమెంట్ కోసం", transBlurb: "బిల్లులు, ధన్యవాదాలు, LR నంబర్లు, పేమెంట్ గుర్తులు.",
      nurtureTitle: "కస్టమర్లతో అనుబంధం", nurtureBlurb: "చిట్కాలు, పుట్టినరోజులు, పాత కస్టమర్లను తిరిగి రప్పించడం.", service: "సేవ", promo: "ప్రచారం",
      submitting: "Metaకు పంపుతోంది…", add: "{n} టెంప్లేట్లు జోడించండి",
      noteConnected: "Meta ప్రతిదాన్ని మీ సొంత ఖాతాలో పరిశీలిస్తుంది: సేవ మెసేజ్‌లు సాధారణంగా నిమిషాల్లో, ప్రచార మెసేజ్‌లు గంటల్లో ఆమోదం పొందుతాయి. Meta తిరస్కరించినవి కారణంతో కింద కనిపిస్తాయి.",
      noteNot: "వీటిని Metaకు పంపడానికి ముందు సెట్టింగ్స్ → ఛానెల్స్‌లో WhatsApp కనెక్ట్ చేయండి. అప్పటివరకు డ్రాఫ్ట్‌లుగా సేవ్ అవుతాయి.",
      draftNote: "హిందీ, గుజరాతీ పదాలు మొదటి డ్రాఫ్ట్ — మొదటి క్యాంపెయిన్ ముందు తెలిసినవారితో చదివించండి.",
      submitted: "{n} Meta సమీక్షకు పంపాం.", drafts: "{n} డ్రాఫ్ట్‌లుగా సేవ్ అయ్యాయి.", already: "{n} ఇప్పటికే మీ ఖాతాలో ఉన్నాయి.", rejectedN: "{n} తిరస్కరించబడ్డాయి.",
    },
  },
  kn: {
    title: "ಟೆಂಪ್ಲೇಟ್‌ಗಳು", introConnected: "ನೇರವಾಗಿ Meta ಪರಿಶೀಲನೆಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ — ಸ್ಥಿತಿ ತಾನಾಗಿ ಬದಲಾಗುತ್ತದೆ.", introNot: "ಟೆಂಪ್ಲೇಟ್‌ಗಳನ್ನು Metaಗೆ ಕಳುಹಿಸಲು ಸೆಟ್ಟಿಂಗ್ಸ್ → ಚಾನೆಲ್ಸ್‌ನಲ್ಲಿ WhatsApp ಜೋಡಿಸಿ.",
    search: "ಟೆಂಪ್ಲೇಟ್‌ಗಳನ್ನು ಹುಡುಕಿ…", all: "ಎಲ್ಲಾ", approved: "ಅನುಮೋದಿತ", pending: "ಕಾಯುತ್ತಿವೆ", rejected: "ತಿರಸ್ಕೃತ",
    group: "ಗುಂಪು: {name}", cards: "{n} ಕಾರ್ಡ್‌ಗಳು", underReview: "Meta ಪರಿಶೀಲಿಸುತ್ತಿದೆ — ಸಾಮಾನ್ಯವಾಗಿ ಕೆಲವು ಗಂಟೆ, ಕೆಲವೊಮ್ಮೆ 48 ಗಂಟೆಗಳವರೆಗೆ. ತಾನಾಗಿ ಬದಲಾಗುತ್ತದೆ.",
    empty: "ಇನ್ನೂ ಟೆಂಪ್ಲೇಟ್‌ಗಳಿಲ್ಲ — ಪ್ರತಿ ಅಭಿಯಾನಕ್ಕೂ ಕನಿಷ್ಠ ಒಂದು ಅನುಮೋದಿತ ಟೆಂಪ್ಲೇಟ್ ಬೇಕು. ಮೊದಲನೆಯದನ್ನು ಕಳುಹಿಸಲು \"ಹೊಸ ಟೆಂಪ್ಲೇಟ್\" ಒತ್ತಿ.", emptyFilter: "ಈ ಫಿಲ್ಟರ್‌ಗೆ ಟೆಂಪ್ಲೇಟ್‌ಗಳಿಲ್ಲ.",
    fixResubmit: "ಸರಿಪಡಿಸಿ Metaಗೆ ಮತ್ತೆ ಕಳುಹಿಸಿ", correctedPh: "ಸರಿಪಡಿಸಿದ ಸಂದೇಶ…", resubmitting: "ಮತ್ತೆ ಕಳುಹಿಸುತ್ತಿದೆ…", resubmit: "ಮತ್ತೆ ಕಳುಹಿಸಿ", cancel: "ರದ್ದು",
    duplicating: "ನಕಲು ಆಗುತ್ತಿದೆ…", duplicate: "ನಕಲು ಮಾಡಿ", deleting: "ಅಳಿಸುತ್ತಿದೆ…", confirmDelete: "ಹೌದು, ಅಳಿಸಿ", delete: "ಅಳಿಸಿ",
    pack: {
      title: "ಭಾರತೀಯ ಅಂಗಡಿಗಳಿಗೆ ಸ್ಟಾರ್ಟರ್ ಪ್ಯಾಕ್", blurb: "ಯಾವುದೇ ಅಂಗಡಿ ಅಥವಾ ವ್ಯಾಪಾರಕ್ಕೆ {n} ಸಿದ್ಧ ಸಂದೇಶಗಳು — ಹಬ್ಬದ ಶುಭಾಶಯ, ಆಫರ್‌ಗಳು, ಹೊಸ ಸರಕು, ಬೆಲೆ ಪಟ್ಟಿ, ಧನ್ಯವಾದ, ಪಾವತಿ ನೆನಪು, ರವಾನೆ ಮಾಹಿತಿ, ಫಾಲೋ-ಅಪ್. ಒಂದು ಟ್ಯಾಪ್‌ನಲ್ಲಿ ಸೇರಿಸಿ; ನಿಮ್ಮ ವ್ಯಾಪಾರಕ್ಕೆ ವಿಶೇಷವಾದವನ್ನು ನೀವೇ ಬರೆಯಿರಿ.",
      campaignTitle: "ಹಬ್ಬ ಮತ್ತು ಆಫರ್ ಅಭಿಯಾನಗಳು", campaignBlurb: "ನಿಮ್ಮ ಎಲ್ಲಾ ಗ್ರಾಹಕರಿಗೆ ಒಮ್ಮೆಗೇ ಕಳುಹಿಸಿ.", transTitle: "ಮಾರಾಟದ ನಂತರ ಮತ್ತು ಪಾವತಿಗೆ", transBlurb: "ಬಿಲ್‌ಗಳು, ಧನ್ಯವಾದಗಳು, LR ಸಂಖ್ಯೆಗಳು, ಪಾವತಿ ನೆನಪುಗಳು.",
      nurtureTitle: "ಗ್ರಾಹಕರೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿರುವುದು", nurtureBlurb: "ಸಲಹೆಗಳು, ಹುಟ್ಟುಹಬ್ಬಗಳು, ಹಳೆಯ ಗ್ರಾಹಕರನ್ನು ಮರಳಿ ಕರೆತರುವುದು.", service: "ಸೇವೆ", promo: "ಪ್ರಚಾರ",
      submitting: "Metaಗೆ ಕಳುಹಿಸುತ್ತಿದೆ…", add: "{n} ಟೆಂಪ್ಲೇಟ್‌ಗಳನ್ನು ಸೇರಿಸಿ",
      noteConnected: "Meta ಪ್ರತಿಯೊಂದನ್ನೂ ನಿಮ್ಮದೇ ಖಾತೆಯಲ್ಲಿ ಪರಿಶೀಲಿಸುತ್ತದೆ: ಸೇವಾ ಸಂದೇಶಗಳು ಸಾಮಾನ್ಯವಾಗಿ ನಿಮಿಷಗಳಲ್ಲಿ, ಪ್ರಚಾರ ಸಂದೇಶಗಳು ಗಂಟೆಗಳಲ್ಲಿ ಅನುಮೋದನೆ ಪಡೆಯುತ್ತವೆ. Meta ತಿರಸ್ಕರಿಸಿದವು ಕಾರಣದೊಂದಿಗೆ ಕೆಳಗೆ ಕಾಣುತ್ತವೆ.",
      noteNot: "ಇವನ್ನು Metaಗೆ ಕಳುಹಿಸಲು ಮೊದಲು ಸೆಟ್ಟಿಂಗ್ಸ್ → ಚಾನೆಲ್ಸ್‌ನಲ್ಲಿ WhatsApp ಜೋಡಿಸಿ. ಅಲ್ಲಿಯವರೆಗೆ ಕರಡುಗಳಾಗಿ ಉಳಿಯುತ್ತವೆ.",
      draftNote: "ಹಿಂದಿ ಮತ್ತು ಗುಜರಾತಿ ಪದಗಳು ಮೊದಲ ಕರಡು — ಮೊದಲ ಅಭಿಯಾನದ ಮುನ್ನ ಬಲ್ಲವರಿಂದ ಓದಿಸಿ.",
      submitted: "{n} Meta ಪರಿಶೀಲನೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.", drafts: "{n} ಕರಡುಗಳಾಗಿ ಉಳಿಸಲಾಗಿದೆ.", already: "{n} ಈಗಾಗಲೇ ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿದ್ದವು.", rejectedN: "{n} ತಿರಸ್ಕೃತವಾದವು.",
    },
  },
};
