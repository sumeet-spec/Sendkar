import type { LanguageCode } from "./dictionaries";

/** Words for Settings, Channels: connecting WhatsApp. Technical names Meta shows in English (Phone number ID, WABA) stay in English. */
export type ChannelsUi = {
  title: string; numbers: string; seePlans: string; quality: string;
  fbTitle: string; fbIntro: string; coTitle: string; coBody: string; warn: string;
  btn: string; btnConnecting: string; btnLoading: string;
  inApp: string; inAppLink: string; inAppAfter: string;
  cancelled: string; noWaba: string; wentWrong: string; metaError: string; okCo: string; ok: string; syncWarn: string;
  waTitle: string; phoneNumberId: string; wabaId: string; displayNumber: string; catalogId: string; token: string; tokenSet: string;
  verifying: string; save: string; saving: string; savedVerified: string; saved: string;
  igTitle: string; msgrTitle: string; locked: string; pageId: string; pageToken: string;
  extraTitle: string; extraHelp: string; addAnother: string; labelPh: string; wabaPh: string; displayPh: string; tokenPh: string; adding: string; addNumber: string; cancel: string; confirmRemove: string; remove: string;
};

export const CHANNELS_UI: Record<LanguageCode, ChannelsUi> = {
  en: {
    title: "Channels", numbers: "WhatsApp numbers: {connected} of {allowed} ({plan}).", seePlans: "See plans", quality: "Quality rating, last {n} checks",
    fbTitle: "Connect with Facebook", fbIntro: "The easy way: nothing to find or paste. It opens Meta's own sign-in window.",
    coTitle: "Already use the WhatsApp Business app?", coBody: "Choose \"connect your existing WhatsApp Business account\" in the window. Your number keeps working in the app, recent chats and contacts come across, and Sendkar adds bills, reminders, offers and a shared inbox on top. You need app version 2.24.17 or newer and a number used on the app for at least 7 days. Groups, status and calls stay in the app, and broadcast lists there become read-only.",
    warn: "Using the regular WhatsApp (not Business) app? Switch to the Business app first, your chats move with you, or connect a separate number here. Connecting a number that is not on the Business app moves it to Sendkar and logs it out of the app.",
    btn: "Continue with Facebook", btnConnecting: "Connecting…", btnLoading: "Loading…",
    inApp: "Using the Sendkar app and the connect window does not open?", inAppLink: "Open this page in Chrome", inAppAfter: ", connect there, then come back.",
    cancelled: "The connection was cancelled or did not finish.", noWaba: "Meta did not report a WhatsApp Business Account. Try again.", wentWrong: "Something went wrong while connecting. Please try again.", metaError: "Meta reported an error while connecting.",
    okCo: "Connected. Your app keeps working. Recent chats and contacts will appear in the inbox over the next few minutes.", ok: "Connected. Refresh to see it below.",
    syncWarn: "Connected, but Meta did not accept the request to bring your existing chats across: {reason}. Meta only allows that within 24 hours of connecting, so reconnect the number if you want them.",
    waTitle: "WhatsApp (manual setup)", phoneNumberId: "Phone number ID", wabaId: "WhatsApp Business Account ID", displayNumber: "Display number (with country code, like 919876543210, for chat links)", catalogId: "Commerce catalog ID (optional, from Meta Commerce Manager)", token: "System user access token", tokenSet: "•••••••• (set: enter a new token to replace it)",
    verifying: "Verifying…", save: "Save", saving: "Saving…", savedVerified: "Saved and checked with Meta.", saved: "Saved.",
    igTitle: "Instagram", msgrTitle: "Facebook Messenger", locked: "Growth plan and above", pageId: "Connected Page ID", pageToken: "Page access token",
    extraTitle: "More WhatsApp numbers", extraHelp: "Your first number above is the main one. Add more to run separate lines, such as sales and support, from one account.", addAnother: "+ Add another number", labelPh: "Label, like Support line", wabaPh: "WABA ID (optional)", displayPh: "Display number (optional)", tokenPh: "Access token", adding: "Adding…", addNumber: "Add number", cancel: "Cancel", confirmRemove: "Remove the number \"{label}\"? Messages to it will stop immediately.", remove: "Remove",
  },
  hi: {
    title: "चैनल", numbers: "WhatsApp नंबर: {allowed} में से {connected} ({plan})।", seePlans: "प्लान देखें", quality: "क्वालिटी रेटिंग, पिछली {n} जाँचें",
    fbTitle: "Facebook से जोड़ें", fbIntro: "आसान तरीका: कुछ ढूँढना या पेस्ट करना नहीं है। Meta का अपना साइन-इन विंडो खुलता है।",
    coTitle: "क्या आप पहले से WhatsApp Business ऐप इस्तेमाल करते हैं?", coBody: "विंडो में \"अपना मौजूदा WhatsApp Business खाता जोड़ें\" चुनें। आपका नंबर ऐप में चलता रहेगा, हाल की चैट और संपर्क आ जाएँगे, और Sendkar ऊपर से बिल, रिमाइंडर, ऑफ़र और साझा इनबॉक्स जोड़ता है। ऐप का वर्ज़न 2.24.17 या नया चाहिए और नंबर ऐप पर कम से कम 7 दिन से चल रहा हो। ग्रुप, स्टेटस और कॉल ऐप में ही रहते हैं, और वहाँ की ब्रॉडकास्ट लिस्ट सिर्फ़ पढ़ने लायक रह जाती हैं।",
    warn: "क्या आप सामान्य WhatsApp (Business नहीं) ऐप इस्तेमाल करते हैं? पहले Business ऐप पर आएँ, आपकी चैट साथ जाती हैं, या यहाँ कोई अलग नंबर जोड़ें। जो नंबर Business ऐप पर नहीं है उसे जोड़ने पर वह Sendkar में चला जाता है और ऐप से लॉग आउट हो जाता है।",
    btn: "Facebook से आगे बढ़ें", btnConnecting: "जोड़ रहे हैं…", btnLoading: "लोड हो रहा है…",
    inApp: "Sendkar ऐप में जोड़ने वाली विंडो नहीं खुल रही?", inAppLink: "यह पेज Chrome में खोलें", inAppAfter: ", वहाँ जोड़ें, फिर वापस आएँ।",
    cancelled: "जोड़ना रद्द हो गया या पूरा नहीं हुआ।", noWaba: "Meta ने WhatsApp Business खाता नहीं बताया। फिर कोशिश करें।", wentWrong: "जोड़ते समय कुछ गड़बड़ हो गई। कृपया फिर कोशिश करें।", metaError: "जोड़ते समय Meta ने एक त्रुटि बताई।",
    okCo: "जुड़ गया। आपका ऐप चलता रहेगा। हाल की चैट और संपर्क अगले कुछ मिनटों में इनबॉक्स में आ जाएँगे।", ok: "जुड़ गया। नीचे देखने के लिए पेज रिफ़्रेश करें।",
    syncWarn: "जुड़ गया, पर Meta ने आपकी पुरानी चैट लाने का अनुरोध स्वीकार नहीं किया: {reason}। Meta यह जोड़ने के 24 घंटे के भीतर ही करने देता है, इसलिए चैट चाहिए तो नंबर फिर से जोड़ें।",
    waTitle: "WhatsApp (हाथ से सेटअप)", phoneNumberId: "Phone number ID", wabaId: "WhatsApp Business Account ID", displayNumber: "दिखने वाला नंबर (देश कोड के साथ, जैसे 919876543210, चैट लिंक के लिए)", catalogId: "Commerce catalog ID (ज़रूरी नहीं, Meta Commerce Manager से)", token: "System user access token", tokenSet: "•••••••• (सेट है: बदलने के लिए नया टोकन डालें)",
    verifying: "जाँच हो रही है…", save: "सेव करें", saving: "सेव हो रहा है…", savedVerified: "सेव हो गया और Meta से जाँच हो गई।", saved: "सेव हो गया।",
    igTitle: "Instagram", msgrTitle: "Facebook Messenger", locked: "ग्रोथ प्लान और ऊपर", pageId: "जुड़ा हुआ Page ID", pageToken: "Page access token",
    extraTitle: "और WhatsApp नंबर", extraHelp: "ऊपर का पहला नंबर मुख्य है। अलग लाइनें चलाने के लिए और जोड़ें, जैसे बिक्री और सपोर्ट, एक ही खाते से।", addAnother: "+ एक और नंबर जोड़ें", labelPh: "नाम, जैसे सपोर्ट लाइन", wabaPh: "WABA ID (ज़रूरी नहीं)", displayPh: "दिखने वाला नंबर (ज़रूरी नहीं)", tokenPh: "Access token", adding: "जोड़ रहे हैं…", addNumber: "नंबर जोड़ें", cancel: "रद्द करें", confirmRemove: "नंबर \"{label}\" हटाएँ? उस पर संदेश तुरंत बंद हो जाएँगे।", remove: "हटाएँ",
  },
  mr: {
    title: "चॅनेल", numbers: "WhatsApp नंबर: {allowed} पैकी {connected} ({plan}).", seePlans: "प्लॅन पहा", quality: "क्वालिटी रेटिंग, मागील {n} तपासण्या",
    fbTitle: "Facebook ने जोडा", fbIntro: "सोपा मार्ग: काही शोधायचे किंवा पेस्ट करायचे नाही. Meta ची स्वतःची साइन-इन विंडो उघडते.",
    coTitle: "तुम्ही आधीच WhatsApp Business ॲप वापरता का?", coBody: "विंडोमध्ये \"तुमचे सध्याचे WhatsApp Business खाते जोडा\" निवडा. तुमचा नंबर ॲपमध्ये चालू राहतो, अलीकडील चॅट आणि संपर्क येतात, आणि Sendkar वरून बिल, रिमाइंडर, ऑफर आणि सामायिक इनबॉक्स जोडते. ॲपची आवृत्ती 2.24.17 किंवा नवीन हवी आणि नंबर ॲपवर किमान 7 दिवस वापरात असावा. ग्रुप, स्टेटस आणि कॉल ॲपमध्येच राहतात, आणि तिथल्या ब्रॉडकास्ट याद्या फक्त वाचता येतात.",
    warn: "तुम्ही साधे WhatsApp (Business नाही) ॲप वापरता का? आधी Business ॲपवर या, तुमच्या चॅट सोबत येतात, किंवा इथे वेगळा नंबर जोडा. Business ॲपवर नसलेला नंबर जोडल्यास तो Sendkar कडे जातो आणि ॲपमधून लॉग आउट होतो.",
    btn: "Facebook ने पुढे जा", btnConnecting: "जोडत आहे…", btnLoading: "लोड होत आहे…",
    inApp: "Sendkar ॲपमध्ये जोडण्याची विंडो उघडत नाही?", inAppLink: "हे पान Chrome मध्ये उघडा", inAppAfter: ", तिथे जोडा, मग परत या.",
    cancelled: "जोडणी रद्द झाली किंवा पूर्ण झाली नाही.", noWaba: "Meta ने WhatsApp Business खाते कळवले नाही. पुन्हा प्रयत्न करा.", wentWrong: "जोडताना काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.", metaError: "जोडताना Meta ने त्रुटी कळवली.",
    okCo: "जोडले गेले. तुमचे ॲप चालू राहील. अलीकडील चॅट आणि संपर्क पुढील काही मिनिटांत इनबॉक्समध्ये दिसतील.", ok: "जोडले गेले. खाली पाहण्यासाठी पान रिफ्रेश करा.",
    syncWarn: "जोडले गेले, पण Meta ने तुमच्या जुन्या चॅट आणण्याची विनंती स्वीकारली नाही: {reason}. Meta हे जोडल्यापासून 24 तासांतच करू देते, म्हणून चॅट हव्या असतील तर नंबर पुन्हा जोडा.",
    waTitle: "WhatsApp (हाताने सेटअप)", phoneNumberId: "Phone number ID", wabaId: "WhatsApp Business Account ID", displayNumber: "दिसणारा नंबर (देश कोडसह, जसे 919876543210, चॅट लिंकसाठी)", catalogId: "Commerce catalog ID (ऐच्छिक, Meta Commerce Manager मधून)", token: "System user access token", tokenSet: "•••••••• (सेट आहे: बदलण्यासाठी नवा टोकन टाका)",
    verifying: "तपासत आहे…", save: "सेव्ह करा", saving: "सेव्ह होत आहे…", savedVerified: "सेव्ह झाले आणि Meta कडून तपासले.", saved: "सेव्ह झाले.",
    igTitle: "Instagram", msgrTitle: "Facebook Messenger", locked: "ग्रोथ प्लॅन आणि वरील", pageId: "जोडलेला Page ID", pageToken: "Page access token",
    extraTitle: "आणखी WhatsApp नंबर", extraHelp: "वरचा पहिला नंबर मुख्य आहे. वेगळ्या लाइन चालवण्यासाठी आणखी जोडा, जसे विक्री आणि सपोर्ट, एकाच खात्यातून.", addAnother: "+ आणखी एक नंबर जोडा", labelPh: "नाव, जसे सपोर्ट लाइन", wabaPh: "WABA ID (ऐच्छिक)", displayPh: "दिसणारा नंबर (ऐच्छिक)", tokenPh: "Access token", adding: "जोडत आहे…", addNumber: "नंबर जोडा", cancel: "रद्द करा", confirmRemove: "नंबर \"{label}\" काढायचा? त्यावरील संदेश लगेच बंद होतील.", remove: "काढा",
  },
  gu: {
    title: "ચેનલ", numbers: "WhatsApp નંબર: {allowed} માંથી {connected} ({plan}).", seePlans: "પ્લાન જુઓ", quality: "ક્વોલિટી રેટિંગ, છેલ્લી {n} તપાસ",
    fbTitle: "Facebook થી જોડો", fbIntro: "સરળ રીત: કંઈ શોધવાનું કે પેસ્ટ કરવાનું નથી. Meta ની પોતાની સાઇન-ઇન વિન્ડો ખુલે છે.",
    coTitle: "શું તમે પહેલેથી WhatsApp Business એપ વાપરો છો?", coBody: "વિન્ડોમાં \"તમારું હાલનું WhatsApp Business ખાતું જોડો\" પસંદ કરો. તમારો નંબર એપમાં ચાલુ રહે છે, તાજેતરની ચૅટ અને સંપર્ક આવે છે, અને Sendkar ઉપરથી બિલ, રિમાઇન્ડર, ઑફર અને સહિયારું ઇનબૉક્સ ઉમેરે છે. એપનું વર્ઝન 2.24.17 કે નવું જોઈએ અને નંબર એપ પર ઓછામાં ઓછા 7 દિવસથી વપરાતો હોવો જોઈએ. ગ્રુપ, સ્ટેટસ અને કૉલ એપમાં જ રહે છે, અને ત્યાંની બ્રૉડકાસ્ટ યાદીઓ ફક્ત વાંચી શકાય છે.",
    warn: "શું તમે સામાન્ય WhatsApp (Business નહીં) એપ વાપરો છો? પહેલા Business એપ પર આવો, તમારી ચૅટ સાથે આવે છે, અથવા અહીં અલગ નંબર જોડો. Business એપ પર ન હોય તેવો નંબર જોડવાથી તે Sendkar માં જાય છે અને એપમાંથી લૉગ આઉટ થાય છે.",
    btn: "Facebook થી આગળ વધો", btnConnecting: "જોડી રહ્યા છીએ…", btnLoading: "લોડ થઈ રહ્યું છે…",
    inApp: "Sendkar એપમાં જોડવાની વિન્ડો ખુલતી નથી?", inAppLink: "આ પેજ Chrome માં ખોલો", inAppAfter: ", ત્યાં જોડો, પછી પાછા આવો.",
    cancelled: "જોડાણ રદ થયું અથવા પૂરું થયું નહીં.", noWaba: "Meta એ WhatsApp Business ખાતું જણાવ્યું નહીં. ફરી પ્રયત્ન કરો.", wentWrong: "જોડતી વખતે કંઈક ખોટું થયું. કૃપા કરી ફરી પ્રયત્ન કરો.", metaError: "જોડતી વખતે Meta એ ભૂલ જણાવી.",
    okCo: "જોડાઈ ગયું. તમારી એપ ચાલુ રહેશે. તાજેતરની ચૅટ અને સંપર્ક આગામી થોડી મિનિટોમાં ઇનબૉક્સમાં દેખાશે.", ok: "જોડાઈ ગયું. નીચે જોવા પેજ રિફ્રેશ કરો.",
    syncWarn: "જોડાઈ ગયું, પણ Meta એ તમારી જૂની ચૅટ લાવવાની વિનંતી સ્વીકારી નહીં: {reason}. Meta આ જોડ્યાના 24 કલાકમાં જ કરવા દે છે, એટલે ચૅટ જોઈતી હોય તો નંબર ફરી જોડો.",
    waTitle: "WhatsApp (હાથે સેટઅપ)", phoneNumberId: "Phone number ID", wabaId: "WhatsApp Business Account ID", displayNumber: "દેખાતો નંબર (દેશ કોડ સાથે, જેમ કે 919876543210, ચૅટ લિંક માટે)", catalogId: "Commerce catalog ID (જરૂરી નથી, Meta Commerce Manager માંથી)", token: "System user access token", tokenSet: "•••••••• (સેટ છે: બદલવા નવો ટોકન નાખો)",
    verifying: "તપાસ થઈ રહી છે…", save: "સેવ કરો", saving: "સેવ થઈ રહ્યું છે…", savedVerified: "સેવ થયું અને Meta પાસે તપાસાયું.", saved: "સેવ થયું.",
    igTitle: "Instagram", msgrTitle: "Facebook Messenger", locked: "ગ્રોથ પ્લાન અને ઉપર", pageId: "જોડાયેલ Page ID", pageToken: "Page access token",
    extraTitle: "વધુ WhatsApp નંબર", extraHelp: "ઉપરનો પહેલો નંબર મુખ્ય છે. અલગ લાઇન ચલાવવા વધુ ઉમેરો, જેમ કે વેચાણ અને સપોર્ટ, એક જ ખાતામાંથી.", addAnother: "+ બીજો નંબર ઉમેરો", labelPh: "નામ, જેમ કે સપોર્ટ લાઇન", wabaPh: "WABA ID (જરૂરી નથી)", displayPh: "દેખાતો નંબર (જરૂરી નથી)", tokenPh: "Access token", adding: "ઉમેરી રહ્યા છીએ…", addNumber: "નંબર ઉમેરો", cancel: "રદ કરો", confirmRemove: "નંબર \"{label}\" કાઢી નાખીએ? તેના પરના સંદેશ તરત બંધ થઈ જશે.", remove: "કાઢો",
  },
  ta: {
    title: "சேனல்கள்", numbers: "WhatsApp எண்கள்: {allowed}-ல் {connected} ({plan}).", seePlans: "திட்டங்களைப் பார்", quality: "தர மதிப்பீடு, கடைசி {n} சோதனைகள்",
    fbTitle: "Facebook மூலம் இணை", fbIntro: "எளிய வழி: எதையும் தேடவோ ஒட்டவோ வேண்டாம். Meta-வின் சொந்த உள்நுழைவு சாளரம் திறக்கும்.",
    coTitle: "ஏற்கனவே WhatsApp Business செயலி பயன்படுத்துகிறீர்களா?", coBody: "சாளரத்தில் \"உங்கள் தற்போதைய WhatsApp Business கணக்கை இணை\" என்பதைத் தேர்ந்தெடுங்கள். உங்கள் எண் செயலியிலும் தொடர்ந்து வேலை செய்யும், சமீபத்திய சாட்களும் தொடர்புகளும் வரும், Sendkar அதன் மேல் பில், நினைவூட்டல், சலுகைகள், பகிரப்பட்ட இன்பாக்ஸ் சேர்க்கும். செயலி பதிப்பு 2.24.17 அல்லது புதியது வேண்டும், எண் குறைந்தது 7 நாட்கள் செயலியில் பயன்பாட்டில் இருக்க வேண்டும். குழுக்கள், ஸ்டேட்டஸ், அழைப்புகள் செயலியிலேயே இருக்கும், அங்குள்ள ஒளிபரப்பு பட்டியல்கள் படிக்க மட்டுமே முடியும்.",
    warn: "சாதாரண WhatsApp (Business அல்ல) செயலியைப் பயன்படுத்துகிறீர்களா? முதலில் Business செயலிக்கு மாறுங்கள், உங்கள் சாட்கள் உடன் வரும், அல்லது இங்கே தனி எண்ணை இணையுங்கள். Business செயலியில் இல்லாத எண்ணை இணைத்தால் அது Sendkar-க்கு மாறி செயலியிலிருந்து வெளியேறிவிடும்.",
    btn: "Facebook மூலம் தொடரவும்", btnConnecting: "இணைக்கிறது…", btnLoading: "ஏற்றுகிறது…",
    inApp: "Sendkar செயலியில் இணைக்கும் சாளரம் திறக்கவில்லையா?", inAppLink: "இந்தப் பக்கத்தை Chrome-ல் திறக்கவும்", inAppAfter: ", அங்கே இணைத்து, பின் திரும்பி வாருங்கள்.",
    cancelled: "இணைப்பு ரத்தானது அல்லது முடியவில்லை.", noWaba: "Meta WhatsApp Business கணக்கைத் தெரிவிக்கவில்லை. மீண்டும் முயலுங்கள்.", wentWrong: "இணைக்கும்போது ஏதோ தவறு நடந்தது. மீண்டும் முயலுங்கள்.", metaError: "இணைக்கும்போது Meta பிழையைத் தெரிவித்தது.",
    okCo: "இணைக்கப்பட்டது. உங்கள் செயலி தொடர்ந்து வேலை செய்யும். சமீபத்திய சாட்களும் தொடர்புகளும் அடுத்த சில நிமிடங்களில் இன்பாக்ஸில் தோன்றும்.", ok: "இணைக்கப்பட்டது. கீழே பார்க்க பக்கத்தைப் புதுப்பிக்கவும்.",
    syncWarn: "இணைக்கப்பட்டது, ஆனால் உங்கள் பழைய சாட்களைக் கொண்டுவரும் கோரிக்கையை Meta ஏற்கவில்லை: {reason}. இணைத்த 24 மணி நேரத்துக்குள் மட்டுமே Meta இதை அனுமதிக்கும், எனவே சாட்கள் வேண்டுமெனில் எண்ணை மீண்டும் இணையுங்கள்.",
    waTitle: "WhatsApp (கைமுறை அமைப்பு)", phoneNumberId: "Phone number ID", wabaId: "WhatsApp Business Account ID", displayNumber: "காட்டப்படும் எண் (நாட்டு குறியீட்டுடன், எ.கா. 919876543210, சாட் இணைப்புகளுக்கு)", catalogId: "Commerce catalog ID (விருப்பம், Meta Commerce Manager-இலிருந்து)", token: "System user access token", tokenSet: "•••••••• (அமைக்கப்பட்டது: மாற்ற புதிய டோக்கனை உள்ளிடுங்கள்)",
    verifying: "சரிபார்க்கிறது…", save: "சேமி", saving: "சேமிக்கிறது…", savedVerified: "சேமிக்கப்பட்டு Meta-வில் சரிபார்க்கப்பட்டது.", saved: "சேமிக்கப்பட்டது.",
    igTitle: "Instagram", msgrTitle: "Facebook Messenger", locked: "க்ரோத் திட்டம் மற்றும் மேல்", pageId: "இணைக்கப்பட்ட Page ID", pageToken: "Page access token",
    extraTitle: "மேலும் WhatsApp எண்கள்", extraHelp: "மேலே உள்ள முதல் எண் முக்கியமானது. விற்பனை, ஆதரவு போன்ற தனி வரிகளை ஒரே கணக்கிலிருந்து இயக்க மேலும் சேர்க்கவும்.", addAnother: "+ இன்னொரு எண்ணைச் சேர்", labelPh: "பெயர், எ.கா. ஆதரவு வரி", wabaPh: "WABA ID (விருப்பம்)", displayPh: "காட்டப்படும் எண் (விருப்பம்)", tokenPh: "Access token", adding: "சேர்க்கிறது…", addNumber: "எண்ணைச் சேர்", cancel: "ரத்து செய்", confirmRemove: "\"{label}\" எண்ணை நீக்கவா? அதற்கான செய்திகள் உடனே நிற்கும்.", remove: "நீக்கு",
  },
  te: {
    title: "ఛానెళ్లు", numbers: "WhatsApp నంబర్లు: {allowed}లో {connected} ({plan}).", seePlans: "ప్లాన్లు చూడండి", quality: "క్వాలిటీ రేటింగ్, చివరి {n} తనిఖీలు",
    fbTitle: "Facebook తో కనెక్ట్ చేయండి", fbIntro: "సులభమైన మార్గం: ఏదీ వెతకక్కర్లేదు, పేస్ట్ చేయక్కర్లేదు. Meta సొంత సైన్-ఇన్ విండో తెరుచుకుంటుంది.",
    coTitle: "ఇప్పటికే WhatsApp Business యాప్ వాడుతున్నారా?", coBody: "విండోలో \"మీ ప్రస్తుత WhatsApp Business ఖాతాను కనెక్ట్ చేయండి\" ఎంచుకోండి. మీ నంబర్ యాప్‌లో కూడా పనిచేస్తూనే ఉంటుంది, ఇటీవలి చాట్లు, కాంటాక్టులు వస్తాయి, Sendkar దానిపై బిల్లులు, రిమైండర్లు, ఆఫర్లు, షేర్డ్ ఇన్‌బాక్స్ జోడిస్తుంది. యాప్ వెర్షన్ 2.24.17 లేదా కొత్తది కావాలి, నంబర్ కనీసం 7 రోజులు యాప్‌లో వాడుకలో ఉండాలి. గ్రూపులు, స్టేటస్, కాల్స్ యాప్‌లోనే ఉంటాయి, అక్కడి బ్రాడ్‌కాస్ట్ జాబితాలు చదవడానికి మాత్రమే అవుతాయి.",
    warn: "సాధారణ WhatsApp (Business కాదు) యాప్ వాడుతున్నారా? ముందు Business యాప్‌కు మారండి, మీ చాట్లు మీతో వస్తాయి, లేదా ఇక్కడ వేరే నంబర్ కనెక్ట్ చేయండి. Business యాప్‌లో లేని నంబర్‌ను కనెక్ట్ చేస్తే అది Sendkarకు మారి యాప్ నుండి లాగ్ అవుట్ అవుతుంది.",
    btn: "Facebook తో కొనసాగండి", btnConnecting: "కనెక్ట్ చేస్తోంది…", btnLoading: "లోడ్ అవుతోంది…",
    inApp: "Sendkar యాప్‌లో కనెక్ట్ విండో తెరుచుకోవడం లేదా?", inAppLink: "ఈ పేజీని Chromeలో తెరవండి", inAppAfter: ", అక్కడ కనెక్ట్ చేసి, తిరిగి రండి.",
    cancelled: "కనెక్షన్ రద్దయింది లేదా పూర్తి కాలేదు.", noWaba: "Meta WhatsApp Business ఖాతాను తెలపలేదు. మళ్ళీ ప్రయత్నించండి.", wentWrong: "కనెక్ట్ చేసేటప్పుడు ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.", metaError: "కనెక్ట్ చేసేటప్పుడు Meta లోపాన్ని తెలిపింది.",
    okCo: "కనెక్ట్ అయింది. మీ యాప్ పనిచేస్తూనే ఉంటుంది. ఇటీవలి చాట్లు, కాంటాక్టులు రాబోయే కొన్ని నిమిషాల్లో ఇన్‌బాక్స్‌లో కనిపిస్తాయి.", ok: "కనెక్ట్ అయింది. కింద చూడటానికి పేజీని రిఫ్రెష్ చేయండి.",
    syncWarn: "కనెక్ట్ అయింది, కానీ మీ పాత చాట్లను తీసుకురావాలన్న అభ్యర్థనను Meta అంగీకరించలేదు: {reason}. కనెక్ట్ చేసిన 24 గంటల్లోనే Meta దీన్ని అనుమతిస్తుంది, కాబట్టి చాట్లు కావాలంటే నంబర్‌ను మళ్ళీ కనెక్ట్ చేయండి.",
    waTitle: "WhatsApp (చేత్తో సెటప్)", phoneNumberId: "Phone number ID", wabaId: "WhatsApp Business Account ID", displayNumber: "కనిపించే నంబర్ (దేశ కోడ్‌తో, ఉదా. 919876543210, చాట్ లింక్‌ల కోసం)", catalogId: "Commerce catalog ID (ఐచ్ఛికం, Meta Commerce Manager నుండి)", token: "System user access token", tokenSet: "•••••••• (సెట్ అయింది: మార్చడానికి కొత్త టోకెన్ ఇవ్వండి)",
    verifying: "తనిఖీ చేస్తోంది…", save: "సేవ్", saving: "సేవ్ అవుతోంది…", savedVerified: "సేవ్ అయి Metaలో తనిఖీ అయింది.", saved: "సేవ్ అయింది.",
    igTitle: "Instagram", msgrTitle: "Facebook Messenger", locked: "గ్రోత్ ప్లాన్ మరియు పైన", pageId: "కనెక్ట్ చేసిన Page ID", pageToken: "Page access token",
    extraTitle: "మరిన్ని WhatsApp నంబర్లు", extraHelp: "పైన ఉన్న మొదటి నంబర్ ప్రధానమైనది. అమ్మకాలు, సపోర్ట్ లాంటి వేర్వేరు లైన్లను ఒకే ఖాతా నుండి నడపడానికి మరిన్ని జోడించండి.", addAnother: "+ మరో నంబర్ జోడించండి", labelPh: "పేరు, ఉదా. సపోర్ట్ లైన్", wabaPh: "WABA ID (ఐచ్ఛికం)", displayPh: "కనిపించే నంబర్ (ఐచ్ఛికం)", tokenPh: "Access token", adding: "జోడిస్తోంది…", addNumber: "నంబర్ జోడించు", cancel: "రద్దు", confirmRemove: "\"{label}\" నంబర్‌ను తొలగించాలా? దానికి వచ్చే సందేశాలు వెంటనే ఆగిపోతాయి.", remove: "తొలగించు",
  },
  kn: {
    title: "ಚಾನೆಲ್‌ಗಳು", numbers: "WhatsApp ಸಂಖ್ಯೆಗಳು: {allowed} ರಲ್ಲಿ {connected} ({plan}).", seePlans: "ಪ್ಲಾನ್‌ಗಳನ್ನು ನೋಡಿ", quality: "ಗುಣಮಟ್ಟ ರೇಟಿಂಗ್, ಕೊನೆಯ {n} ಪರೀಕ್ಷೆಗಳು",
    fbTitle: "Facebook ಮೂಲಕ ಜೋಡಿಸಿ", fbIntro: "ಸುಲಭ ಮಾರ್ಗ: ಏನನ್ನೂ ಹುಡುಕಬೇಕಿಲ್ಲ, ಅಂಟಿಸಬೇಕಿಲ್ಲ. Meta ದ ಸ್ವಂತ ಸೈನ್-ಇನ್ ವಿಂಡೋ ತೆರೆಯುತ್ತದೆ.",
    coTitle: "ಈಗಾಗಲೇ WhatsApp Business ಆ್ಯಪ್ ಬಳಸುತ್ತಿದ್ದೀರಾ?", coBody: "ವಿಂಡೋದಲ್ಲಿ \"ನಿಮ್ಮ ಈಗಿರುವ WhatsApp Business ಖಾತೆಯನ್ನು ಜೋಡಿಸಿ\" ಆಯ್ಕೆಮಾಡಿ. ನಿಮ್ಮ ಸಂಖ್ಯೆ ಆ್ಯಪ್‌ನಲ್ಲೂ ಕೆಲಸ ಮಾಡುತ್ತಿರುತ್ತದೆ, ಇತ್ತೀಚಿನ ಚಾಟ್‌ಗಳು ಮತ್ತು ಸಂಪರ್ಕಗಳು ಬರುತ್ತವೆ, Sendkar ಅದರ ಮೇಲೆ ಬಿಲ್, ಜ್ಞಾಪನೆ, ಆಫರ್ ಮತ್ತು ಹಂಚಿಕೆಯ ಇನ್‌ಬಾಕ್ಸ್ ಸೇರಿಸುತ್ತದೆ. ಆ್ಯಪ್ ಆವೃತ್ತಿ 2.24.17 ಅಥವಾ ಹೊಸದು ಬೇಕು, ಸಂಖ್ಯೆ ಕನಿಷ್ಠ 7 ದಿನ ಆ್ಯಪ್‌ನಲ್ಲಿ ಬಳಕೆಯಲ್ಲಿರಬೇಕು. ಗುಂಪುಗಳು, ಸ್ಟೇಟಸ್, ಕರೆಗಳು ಆ್ಯಪ್‌ನಲ್ಲೇ ಇರುತ್ತವೆ, ಅಲ್ಲಿನ ಬ್ರಾಡ್‌ಕಾಸ್ಟ್ ಪಟ್ಟಿಗಳು ಓದಲು ಮಾತ್ರ ಆಗುತ್ತವೆ.",
    warn: "ಸಾಮಾನ್ಯ WhatsApp (Business ಅಲ್ಲ) ಆ್ಯಪ್ ಬಳಸುತ್ತಿದ್ದೀರಾ? ಮೊದಲು Business ಆ್ಯಪ್‌ಗೆ ಬದಲಾಯಿಸಿ, ನಿಮ್ಮ ಚಾಟ್‌ಗಳು ಜೊತೆಗೆ ಬರುತ್ತವೆ, ಅಥವಾ ಇಲ್ಲಿ ಬೇರೆ ಸಂಖ್ಯೆ ಜೋಡಿಸಿ. Business ಆ್ಯಪ್‌ನಲ್ಲಿ ಇಲ್ಲದ ಸಂಖ್ಯೆಯನ್ನು ಜೋಡಿಸಿದರೆ ಅದು Sendkar ಗೆ ಹೋಗಿ ಆ್ಯಪ್‌ನಿಂದ ಲಾಗ್ ಔಟ್ ಆಗುತ್ತದೆ.",
    btn: "Facebook ಮೂಲಕ ಮುಂದುವರಿಸಿ", btnConnecting: "ಜೋಡಿಸಲಾಗುತ್ತಿದೆ…", btnLoading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
    inApp: "Sendkar ಆ್ಯಪ್‌ನಲ್ಲಿ ಜೋಡಿಸುವ ವಿಂಡೋ ತೆರೆಯುತ್ತಿಲ್ಲವೇ?", inAppLink: "ಈ ಪುಟವನ್ನು Chrome ನಲ್ಲಿ ತೆರೆಯಿರಿ", inAppAfter: ", ಅಲ್ಲಿ ಜೋಡಿಸಿ, ನಂತರ ಹಿಂತಿರುಗಿ.",
    cancelled: "ಜೋಡಣೆ ರದ್ದಾಯಿತು ಅಥವಾ ಪೂರ್ಣಗೊಳ್ಳಲಿಲ್ಲ.", noWaba: "Meta WhatsApp Business ಖಾತೆಯನ್ನು ತಿಳಿಸಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", wentWrong: "ಜೋಡಿಸುವಾಗ ಏನೋ ತಪ್ಪಾಯಿತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", metaError: "ಜೋಡಿಸುವಾಗ Meta ದೋಷವನ್ನು ತಿಳಿಸಿತು.",
    okCo: "ಜೋಡಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಆ್ಯಪ್ ಕೆಲಸ ಮಾಡುತ್ತಲೇ ಇರುತ್ತದೆ. ಇತ್ತೀಚಿನ ಚಾಟ್‌ಗಳು ಮತ್ತು ಸಂಪರ್ಕಗಳು ಮುಂದಿನ ಕೆಲವು ನಿಮಿಷಗಳಲ್ಲಿ ಇನ್‌ಬಾಕ್ಸ್‌ನಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.", ok: "ಜೋಡಿಸಲಾಗಿದೆ. ಕೆಳಗೆ ನೋಡಲು ಪುಟವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ.",
    syncWarn: "ಜೋಡಿಸಲಾಗಿದೆ, ಆದರೆ ನಿಮ್ಮ ಹಳೆಯ ಚಾಟ್‌ಗಳನ್ನು ತರುವ ವಿನಂತಿಯನ್ನು Meta ಸ್ವೀಕರಿಸಲಿಲ್ಲ: {reason}. ಜೋಡಿಸಿದ 24 ಗಂಟೆಗಳೊಳಗೆ ಮಾತ್ರ Meta ಇದಕ್ಕೆ ಅವಕಾಶ ನೀಡುತ್ತದೆ, ಆದ್ದರಿಂದ ಚಾಟ್‌ಗಳು ಬೇಕಾದರೆ ಸಂಖ್ಯೆಯನ್ನು ಮತ್ತೆ ಜೋಡಿಸಿ.",
    waTitle: "WhatsApp (ಕೈಯಿಂದ ಸೆಟಪ್)", phoneNumberId: "Phone number ID", wabaId: "WhatsApp Business Account ID", displayNumber: "ಕಾಣುವ ಸಂಖ್ಯೆ (ದೇಶದ ಕೋಡ್‌ನೊಂದಿಗೆ, ಉದಾ. 919876543210, ಚಾಟ್ ಲಿಂಕ್‌ಗಳಿಗಾಗಿ)", catalogId: "Commerce catalog ID (ಐಚ್ಛಿಕ, Meta Commerce Manager ನಿಂದ)", token: "System user access token", tokenSet: "•••••••• (ಹೊಂದಿಸಲಾಗಿದೆ: ಬದಲಾಯಿಸಲು ಹೊಸ ಟೋಕನ್ ನೀಡಿ)",
    verifying: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…", save: "ಉಳಿಸಿ", saving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ…", savedVerified: "ಉಳಿಸಿ Meta ನಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.", saved: "ಉಳಿಸಲಾಗಿದೆ.",
    igTitle: "Instagram", msgrTitle: "Facebook Messenger", locked: "ಗ್ರೋತ್ ಪ್ಲಾನ್ ಮತ್ತು ಮೇಲೆ", pageId: "ಜೋಡಿಸಿದ Page ID", pageToken: "Page access token",
    extraTitle: "ಇನ್ನಷ್ಟು WhatsApp ಸಂಖ್ಯೆಗಳು", extraHelp: "ಮೇಲಿನ ಮೊದಲ ಸಂಖ್ಯೆ ಮುಖ್ಯವಾದದ್ದು. ಮಾರಾಟ ಮತ್ತು ಸಪೋರ್ಟ್‌ನಂತಹ ಬೇರೆ ಲೈನ್‌ಗಳನ್ನು ಒಂದೇ ಖಾತೆಯಿಂದ ನಡೆಸಲು ಇನ್ನಷ್ಟು ಸೇರಿಸಿ.", addAnother: "+ ಇನ್ನೊಂದು ಸಂಖ್ಯೆ ಸೇರಿಸಿ", labelPh: "ಹೆಸರು, ಉದಾ. ಸಪೋರ್ಟ್ ಲೈನ್", wabaPh: "WABA ID (ಐಚ್ಛಿಕ)", displayPh: "ಕಾಣುವ ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ)", tokenPh: "Access token", adding: "ಸೇರಿಸಲಾಗುತ್ತಿದೆ…", addNumber: "ಸಂಖ್ಯೆ ಸೇರಿಸಿ", cancel: "ರದ್ದುಮಾಡಿ", confirmRemove: "\"{label}\" ಸಂಖ್ಯೆಯನ್ನು ತೆಗೆಯಬೇಕೆ? ಅದಕ್ಕೆ ಬರುವ ಸಂದೇಶಗಳು ತಕ್ಷಣ ನಿಲ್ಲುತ್ತವೆ.", remove: "ತೆಗೆಯಿರಿ",
  },
};
