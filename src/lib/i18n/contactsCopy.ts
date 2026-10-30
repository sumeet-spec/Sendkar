import type { LanguageCode } from "./dictionaries";

/** Words for the Contacts list. `{n}`, `{u}`, `{tag}`, `{headline}` are filled in by the page. */
export type ContactsUi = {
  title: string; total: string; showing: string; exportCsv: string; importToggle: string;
  search: string; allLanguages: string; allTags: string; optedOutOnly: string; optedOut: string; clearFilters: string;
  selected: string; addTag: string; removeTag: string; tagPh: string; apply: string; applying: string; clear: string; tagAdded: string; tagRemoved: string;
  colPhone: string; colName: string; colLanguage: string; colTags: string; colSource: string; colSpend: string; colAdded: string; optedOutPill: string; viaAd: string; noMatch: string;
  csvLabel: string; language: string; select: string; importBtn: string; importing: string; imported: string; updated: string;
  srcCsv: string; srcWhatsapp: string; srcManual: string; srcApi: string;
};

export const CONTACTS_UI: Record<LanguageCode, ContactsUi> = {
  en: {
    title: "Contacts", total: "{n} total", showing: " (showing the most recent 200)", exportCsv: "Export CSV", importToggle: "Import contacts from a CSV file",
    search: "Search phone or name…", allLanguages: "All languages", allTags: "All tags", optedOutOnly: "✕ Opted-out only", optedOut: "Opted-out", clearFilters: "Clear filters",
    selected: "{n} selected", addTag: "Add tag", removeTag: "Remove tag", tagPh: "Tag name…", apply: "Apply", applying: "Applying…", clear: "Clear", tagAdded: "Added the tag \"{tag}\" on {n} contacts.", tagRemoved: "Removed the tag \"{tag}\" from {n} contacts.",
    colPhone: "Phone", colName: "Name", colLanguage: "Language", colTags: "Tags", colSource: "Source", colSpend: "Spend", colAdded: "Added", optedOutPill: "opted out", viaAd: "via ad: {headline}", noMatch: "No contacts match this filter.",
    csvLabel: "CSV file (phone, email, tags: tags is optional, separated by semicolons)", language: "Language", select: "Select…", importBtn: "Import", importing: "Importing…", imported: "{n} new contacts", updated: ", {u} updated",
    srcCsv: "File import", srcWhatsapp: "WhatsApp", srcManual: "Added by you", srcApi: "API",
  },
  hi: {
    title: "संपर्क", total: "कुल {n}", showing: " (सबसे हाल के 200 दिखा रहे हैं)", exportCsv: "CSV निकालें", importToggle: "CSV फ़ाइल से संपर्क जोड़ें",
    search: "फ़ोन या नाम खोजें…", allLanguages: "सभी भाषाएँ", allTags: "सभी टैग", optedOutOnly: "✕ सिर्फ़ संदेश बंद कराने वाले", optedOut: "संदेश बंद कराने वाले", clearFilters: "फ़िल्टर हटाएँ",
    selected: "{n} चुने गए", addTag: "टैग जोड़ें", removeTag: "टैग हटाएँ", tagPh: "टैग का नाम…", apply: "लागू करें", applying: "लागू हो रहा है…", clear: "हटाएँ", tagAdded: "{n} संपर्कों पर टैग \"{tag}\" जोड़ा गया।", tagRemoved: "{n} संपर्कों से टैग \"{tag}\" हटाया गया।",
    colPhone: "फ़ोन", colName: "नाम", colLanguage: "भाषा", colTags: "टैग", colSource: "कहाँ से", colSpend: "ख़र्च", colAdded: "जोड़ा गया", optedOutPill: "संदेश बंद", viaAd: "विज्ञापन से: {headline}", noMatch: "इस फ़िल्टर से कोई संपर्क नहीं मिला।",
    csvLabel: "CSV फ़ाइल (phone, email, tags: tags ज़रूरी नहीं, सेमीकोलन से अलग)", language: "भाषा", select: "चुनें…", importBtn: "जोड़ें", importing: "जोड़ रहे हैं…", imported: "{n} नए संपर्क", updated: ", {u} अपडेट हुए",
    srcCsv: "फ़ाइल से", srcWhatsapp: "WhatsApp", srcManual: "आपने जोड़ा", srcApi: "API",
  },
  mr: {
    title: "संपर्क", total: "एकूण {n}", showing: " (अगदी अलीकडील 200 दाखवत आहे)", exportCsv: "CSV काढा", importToggle: "CSV फाइलमधून संपर्क जोडा",
    search: "फोन किंवा नाव शोधा…", allLanguages: "सर्व भाषा", allTags: "सर्व टॅग", optedOutOnly: "✕ फक्त संदेश बंद केलेले", optedOut: "संदेश बंद केलेले", clearFilters: "फिल्टर काढा",
    selected: "{n} निवडले", addTag: "टॅग जोडा", removeTag: "टॅग काढा", tagPh: "टॅगचे नाव…", apply: "लागू करा", applying: "लागू होत आहे…", clear: "काढा", tagAdded: "{n} संपर्कांवर \"{tag}\" टॅग जोडला.", tagRemoved: "{n} संपर्कांवरून \"{tag}\" टॅग काढला.",
    colPhone: "फोन", colName: "नाव", colLanguage: "भाषा", colTags: "टॅग", colSource: "कुठून", colSpend: "खर्च", colAdded: "जोडले", optedOutPill: "संदेश बंद", viaAd: "जाहिरातीतून: {headline}", noMatch: "या फिल्टरशी जुळणारा संपर्क नाही.",
    csvLabel: "CSV फाइल (phone, email, tags: tags ऐच्छिक, सेमिकोलनने वेगळे)", language: "भाषा", select: "निवडा…", importBtn: "जोडा", importing: "जोडत आहे…", imported: "{n} नवीन संपर्क", updated: ", {u} अपडेट केले",
    srcCsv: "फाइलमधून", srcWhatsapp: "WhatsApp", srcManual: "तुम्ही जोडले", srcApi: "API",
  },
  gu: {
    title: "સંપર્કો", total: "કુલ {n}", showing: " (તાજેતરના 200 બતાવી રહ્યા છીએ)", exportCsv: "CSV કાઢો", importToggle: "CSV ફાઇલમાંથી સંપર્કો ઉમેરો",
    search: "ફોન કે નામ શોધો…", allLanguages: "બધી ભાષાઓ", allTags: "બધા ટેગ", optedOutOnly: "✕ ફક્ત સંદેશ બંધ કરાવનાર", optedOut: "સંદેશ બંધ કરાવનાર", clearFilters: "ફિલ્ટર હટાવો",
    selected: "{n} પસંદ કર્યા", addTag: "ટેગ ઉમેરો", removeTag: "ટેગ કાઢો", tagPh: "ટેગનું નામ…", apply: "લાગુ કરો", applying: "લાગુ થઈ રહ્યું છે…", clear: "હટાવો", tagAdded: "{n} સંપર્કો પર \"{tag}\" ટેગ ઉમેર્યો.", tagRemoved: "{n} સંપર્કોમાંથી \"{tag}\" ટેગ કાઢ્યો.",
    colPhone: "ફોન", colName: "નામ", colLanguage: "ભાષા", colTags: "ટેગ", colSource: "ક્યાંથી", colSpend: "ખર્ચ", colAdded: "ઉમેર્યા", optedOutPill: "સંદેશ બંધ", viaAd: "જાહેરાતથી: {headline}", noMatch: "આ ફિલ્ટર સાથે મેળ ખાતો કોઈ સંપર્ક નથી.",
    csvLabel: "CSV ફાઇલ (phone, email, tags: tags જરૂરી નથી, સેમીકોલનથી અલગ)", language: "ભાષા", select: "પસંદ કરો…", importBtn: "ઉમેરો", importing: "ઉમેરી રહ્યા છીએ…", imported: "{n} નવા સંપર્કો", updated: ", {u} અપડેટ થયા",
    srcCsv: "ફાઇલમાંથી", srcWhatsapp: "WhatsApp", srcManual: "તમે ઉમેર્યા", srcApi: "API",
  },
  ta: {
    title: "தொடர்புகள்", total: "மொத்தம் {n}", showing: " (சமீபத்திய 200 மட்டும் காட்டப்படுகின்றன)", exportCsv: "CSV ஏற்றுமதி", importToggle: "CSV கோப்பிலிருந்து தொடர்புகளைச் சேர்",
    search: "தொலைபேசி அல்லது பெயரைத் தேடு…", allLanguages: "அனைத்து மொழிகள்", allTags: "அனைத்து குறிச்சொற்கள்", optedOutOnly: "✕ செய்தி வேண்டாம் என்றவர்கள் மட்டும்", optedOut: "செய்தி வேண்டாம் என்றவர்கள்", clearFilters: "வடிகட்டிகளை நீக்கு",
    selected: "{n} தேர்ந்தெடுக்கப்பட்டன", addTag: "குறிச்சொல் சேர்", removeTag: "குறிச்சொல் நீக்கு", tagPh: "குறிச்சொல் பெயர்…", apply: "செயல்படுத்து", applying: "செயல்படுத்துகிறது…", clear: "நீக்கு", tagAdded: "{n} தொடர்புகளில் \"{tag}\" குறிச்சொல் சேர்க்கப்பட்டது.", tagRemoved: "{n} தொடர்புகளிலிருந்து \"{tag}\" குறிச்சொல் நீக்கப்பட்டது.",
    colPhone: "தொலைபேசி", colName: "பெயர்", colLanguage: "மொழி", colTags: "குறிச்சொற்கள்", colSource: "எங்கிருந்து", colSpend: "செலவு", colAdded: "சேர்க்கப்பட்டது", optedOutPill: "செய்தி வேண்டாம்", viaAd: "விளம்பரம் மூலம்: {headline}", noMatch: "இந்த வடிகட்டிக்குப் பொருந்தும் தொடர்புகள் இல்லை.",
    csvLabel: "CSV கோப்பு (phone, email, tags: tags விருப்பம், அரைப்புள்ளியால் பிரித்து)", language: "மொழி", select: "தேர்ந்தெடுங்கள்…", importBtn: "சேர்", importing: "சேர்க்கிறது…", imported: "{n} புதிய தொடர்புகள்", updated: ", {u} புதுப்பிக்கப்பட்டன",
    srcCsv: "கோப்பிலிருந்து", srcWhatsapp: "WhatsApp", srcManual: "நீங்கள் சேர்த்தது", srcApi: "API",
  },
  te: {
    title: "కాంటాక్టులు", total: "మొత్తం {n}", showing: " (ఇటీవలి 200 మాత్రమే చూపుతున్నాం)", exportCsv: "CSV ఎగుమతి", importToggle: "CSV ఫైల్ నుండి కాంటాక్టులు జోడించండి",
    search: "ఫోన్ లేదా పేరు వెతకండి…", allLanguages: "అన్ని భాషలు", allTags: "అన్ని ట్యాగ్‌లు", optedOutOnly: "✕ సందేశాలు వద్దన్నవారు మాత్రమే", optedOut: "సందేశాలు వద్దన్నవారు", clearFilters: "ఫిల్టర్లు తొలగించండి",
    selected: "{n} ఎంచుకున్నారు", addTag: "ట్యాగ్ జోడించు", removeTag: "ట్యాగ్ తొలగించు", tagPh: "ట్యాగ్ పేరు…", apply: "వర్తింపజేయి", applying: "వర్తింపజేస్తోంది…", clear: "తొలగించు", tagAdded: "{n} కాంటాక్టులపై \"{tag}\" ట్యాగ్ జోడించారు.", tagRemoved: "{n} కాంటాక్టుల నుండి \"{tag}\" ట్యాగ్ తొలగించారు.",
    colPhone: "ఫోన్", colName: "పేరు", colLanguage: "భాష", colTags: "ట్యాగ్‌లు", colSource: "ఎక్కడి నుండి", colSpend: "ఖర్చు", colAdded: "జోడించినది", optedOutPill: "సందేశాలు వద్దు", viaAd: "ప్రకటన ద్వారా: {headline}", noMatch: "ఈ ఫిల్టర్‌కు సరిపోయే కాంటాక్టులు లేవు.",
    csvLabel: "CSV ఫైల్ (phone, email, tags: tags ఐచ్ఛికం, సెమీకోలన్‌తో వేరు)", language: "భాష", select: "ఎంచుకోండి…", importBtn: "జోడించు", importing: "జోడిస్తోంది…", imported: "{n} కొత్త కాంటాక్టులు", updated: ", {u} అప్‌డేట్ అయ్యాయి",
    srcCsv: "ఫైల్ నుండి", srcWhatsapp: "WhatsApp", srcManual: "మీరు జోడించారు", srcApi: "API",
  },
  kn: {
    title: "ಸಂಪರ್ಕಗಳು", total: "ಒಟ್ಟು {n}", showing: " (ಇತ್ತೀಚಿನ 200 ಮಾತ್ರ ತೋರಿಸಲಾಗುತ್ತಿದೆ)", exportCsv: "CSV ರಫ್ತು", importToggle: "CSV ಫೈಲ್‌ನಿಂದ ಸಂಪರ್ಕಗಳನ್ನು ಸೇರಿಸಿ",
    search: "ಫೋನ್ ಅಥವಾ ಹೆಸರು ಹುಡುಕಿ…", allLanguages: "ಎಲ್ಲ ಭಾಷೆಗಳು", allTags: "ಎಲ್ಲ ಟ್ಯಾಗ್‌ಗಳು", optedOutOnly: "✕ ಸಂದೇಶ ಬೇಡ ಎಂದವರು ಮಾತ್ರ", optedOut: "ಸಂದೇಶ ಬೇಡ ಎಂದವರು", clearFilters: "ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆಗೆಯಿರಿ",
    selected: "{n} ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ", addTag: "ಟ್ಯಾಗ್ ಸೇರಿಸಿ", removeTag: "ಟ್ಯಾಗ್ ತೆಗೆಯಿರಿ", tagPh: "ಟ್ಯಾಗ್ ಹೆಸರು…", apply: "ಅನ್ವಯಿಸಿ", applying: "ಅನ್ವಯಿಸಲಾಗುತ್ತಿದೆ…", clear: "ತೆಗೆಯಿರಿ", tagAdded: "{n} ಸಂಪರ್ಕಗಳಿಗೆ \"{tag}\" ಟ್ಯಾಗ್ ಸೇರಿಸಲಾಗಿದೆ.", tagRemoved: "{n} ಸಂಪರ್ಕಗಳಿಂದ \"{tag}\" ಟ್ಯಾಗ್ ತೆಗೆಯಲಾಗಿದೆ.",
    colPhone: "ಫೋನ್", colName: "ಹೆಸರು", colLanguage: "ಭಾಷೆ", colTags: "ಟ್ಯಾಗ್‌ಗಳು", colSource: "ಎಲ್ಲಿಂದ", colSpend: "ಖರ್ಚು", colAdded: "ಸೇರಿಸಿದ್ದು", optedOutPill: "ಸಂದೇಶ ಬೇಡ", viaAd: "ಜಾಹೀರಾತಿನಿಂದ: {headline}", noMatch: "ಈ ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದುವ ಸಂಪರ್ಕಗಳಿಲ್ಲ.",
    csvLabel: "CSV ಫೈಲ್ (phone, email, tags: tags ಐಚ್ಛಿಕ, ಸೆಮಿಕೋಲನ್‌ನಿಂದ ಬೇರ್ಪಡಿಸಿ)", language: "ಭಾಷೆ", select: "ಆಯ್ಕೆಮಾಡಿ…", importBtn: "ಸೇರಿಸಿ", importing: "ಸೇರಿಸಲಾಗುತ್ತಿದೆ…", imported: "{n} ಹೊಸ ಸಂಪರ್ಕಗಳು", updated: ", {u} ನವೀಕರಿಸಲಾಗಿದೆ",
    srcCsv: "ಫೈಲ್‌ನಿಂದ", srcWhatsapp: "WhatsApp", srcManual: "ನೀವು ಸೇರಿಸಿದ್ದು", srcApi: "API",
  },
};
