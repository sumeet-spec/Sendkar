/**
 * A deliberately small, high-leverage set of UI strings — sidebar nav (on
 * every authenticated page), dashboard, login/signup, contacts, and
 * campaigns — not an exhaustive translation of every settings sub-page.
 * Machine-translated by Claude, not a native speaker: treat every non-English
 * string here as a first draft that needs a fluent-speaker review pass
 * before it's the first thing a real Kannada/Hindi/Tamil/Telugu/Marathi
 * customer sees. English is the only language reviewed as final.
 */

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export interface Dictionary {
  nav: {
    overview: string; contacts: string; templates: string; catalog: string; campaigns: string;
    inbox: string; analytics: string; chatbotFlows: string; forms: string; automations: string; segments: string;
    webhooks: string; linksWidget: string; agency: string; settings: string; billing: string; sequences: string;
    team: string; channels: string; cannedResponses: string; apiKeys: string; integrations: string;
    businessHours: string; payments: string; calling: string;
    logout: string;
  };
  auth: {
    loginTitle: string; loginSubtitle: string; whatsappNumber: string; password: string;
    loginButton: string; noAccount: string; signupTitle: string; signupSubtitle: string;
    workspaceName: string; signupButton: string; haveAccount: string; logIn: string;
  };
  dashboard: {
    title: string; whatsappConnected: string; whatsappNotConnected: string; noWhatsappBanner: string;
    contacts: string; campaigns: string; messagesSent: string; deliveryRate: string; failedSuffix: string;
    revenueTracked: string; fromCampaign: string; topCustomers: string; messagingTier: string;
    checklistTitle: string; checklistConnect: string; checklistTemplate: string; checklistContacts: string;
    checklistCampaign: string;
  };
  contacts: {
    title: string; searchPlaceholder: string; search: string; exportCsv: string; total: string;
    colPhone: string; colName: string; colLanguage: string; colTags: string; colSource: string;
    colSpend: string; colAdded: string; noContacts: string;
  };
  campaigns: {
    title: string; newCampaign: string; colName: string; colTemplate: string; colStatus: string;
    colCreated: string; noCampaigns: string; startSending: string;
  };
  landing: {
    navPricing: string; navMcp: string; navLogin: string; navGetStarted: string;
    heroEyebrow: string; heroLine1: string; heroLine2: string; heroLine3: string; heroSubhead: string;
    badgeReseller: string; badgeFree: string; ctaGetStarted: string; ctaSeePricing: string;
    statChannels: string; statMcp: string; statPrice: string;
  };
}

export const dictionaries: Record<LanguageCode, Dictionary> = {
  en: {
    nav: {
      overview: "Overview", contacts: "Contacts", templates: "Templates", catalog: "Catalog", campaigns: "Campaigns",
      inbox: "Inbox", analytics: "Analytics", chatbotFlows: "Chatbot flows", forms: "Forms", automations: "Automations", segments: "Segments",
      webhooks: "Webhooks", linksWidget: "Links & widget", agency: "Agency", settings: "Settings", billing: "Billing", sequences: "Sequences",
      team: "Team", channels: "Channels", cannedResponses: "Canned responses", apiKeys: "API keys", integrations: "Integrations",
      businessHours: "Business hours", payments: "Payments", calling: "Calling",
      logout: "Log out",
    },
    auth: {
      loginTitle: "Log in", loginSubtitle: "Welcome back.", whatsappNumber: "WhatsApp number", password: "Password",
      loginButton: "Log in", noAccount: "New here? Create a workspace", signupTitle: "Create your workspace",
      signupSubtitle: "Free to start, real Cloud API from day one.", workspaceName: "Workspace name",
      signupButton: "Create workspace", haveAccount: "Already have an account?", logIn: "Log in",
    },
    dashboard: {
      title: "Overview", whatsappConnected: "WhatsApp connected", whatsappNotConnected: "WhatsApp not connected",
      noWhatsappBanner: "No WhatsApp Business number connected yet. Finish setup once you have a phone number ID and access token from Meta Business Manager — everything else here already works.",
      contacts: "Contacts", campaigns: "Campaigns", messagesSent: "Messages sent", deliveryRate: "Delivery rate",
      failedSuffix: "failed", revenueTracked: "Revenue tracked", fromCampaign: "From a campaign",
      topCustomers: "Top customers", messagingTier: "Messaging tier",
      checklistTitle: "Get to your first message", checklistConnect: "Connect your WhatsApp Business number",
      checklistTemplate: "Get one template approved", checklistContacts: "Import your contacts",
      checklistCampaign: "Send your first campaign",
    },
    contacts: {
      title: "Contacts", searchPlaceholder: "Search by phone or name…", search: "Search", exportCsv: "Export CSV",
      total: "total", colPhone: "Phone", colName: "Name", colLanguage: "Language", colTags: "Tags",
      colSource: "Source", colSpend: "Spend", colAdded: "Added", noContacts: "No contacts yet — import a CSV above.",
    },
    campaigns: {
      title: "Campaigns", newCampaign: "New campaign", colName: "Name", colTemplate: "Template", colStatus: "Status",
      colCreated: "Created", noCampaigns: "No campaigns yet.", startSending: "Start sending",
    },
    landing: {
      navPricing: "Pricing", navMcp: "MCP", navLogin: "Log in", navGetStarted: "Get started",
      heroEyebrow: "WhatsApp Marketing Software", heroLine1: "Send once.", heroLine2: "Every language,", heroLine3: "half the price.",
      heroSubhead: "This is Priya Textiles' actual order, start to finish — an Instagram ad, a reply in her customer's own language, a payment collected without leaving WhatsApp, and revenue traced back to the ad that earned it.",
      badgeReseller: "⚡ Meta's official Cloud API — not a reseller", badgeFree: "🆓 Free plan, forever — not a 14-day trial",
      ctaGetStarted: "Get started free →", ctaSeePricing: "See pricing",
      statChannels: "Channels", statMcp: "MCP tools for Claude", statPrice: "The price of the rest",
    },
  },
  hi: {
    nav: {
      overview: "अवलोकन", contacts: "संपर्क", templates: "टेम्पलेट", catalog: "कैटलॉग", campaigns: "कैंपेन",
      inbox: "इनबॉक्स", analytics: "एनालिटिक्स", chatbotFlows: "चैटबॉट फ्लो", forms: "फ़ॉर्म", automations: "ऑटोमेशन", segments: "सेगमेंट्स",
      webhooks: "वेबहुक", linksWidget: "लिंक और विजेट", agency: "एजेंसी", settings: "सेटिंग्स", billing: "बिलिंग", sequences: "सीक्वेंस",
      team: "टीम", channels: "चैनल", cannedResponses: "सेव्ड रिप्लाई", apiKeys: "API कीज़", integrations: "इंटीग्रेशन",
      businessHours: "बिज़नेस समय", payments: "पेमेंट्स", calling: "कॉलिंग",
      logout: "लॉग आउट",
    },
    auth: {
      loginTitle: "लॉग इन करें", loginSubtitle: "वापसी पर स्वागत है।", whatsappNumber: "WhatsApp नंबर", password: "पासवर्ड",
      loginButton: "लॉग इन करें", noAccount: "नए हैं? वर्कस्पेस बनाएं", signupTitle: "अपना वर्कस्पेस बनाएं",
      signupSubtitle: "शुरू करना मुफ़्त है, पहले दिन से असली Cloud API।", workspaceName: "वर्कस्पेस का नाम",
      signupButton: "वर्कस्पेस बनाएं", haveAccount: "पहले से खाता है?", logIn: "लॉग इन करें",
    },
    dashboard: {
      title: "अवलोकन", whatsappConnected: "WhatsApp जुड़ा हुआ है", whatsappNotConnected: "WhatsApp नहीं जुड़ा है",
      noWhatsappBanner: "अभी तक कोई WhatsApp Business नंबर नहीं जोड़ा गया। Meta Business Manager से फ़ोन नंबर ID और एक्सेस टोकन मिलने पर सेटअप पूरा करें — बाकी सब यहाँ पहले से ही काम करता है।",
      contacts: "संपर्क", campaigns: "कैंपेन", messagesSent: "भेजे गए मैसेज", deliveryRate: "डिलीवरी दर",
      failedSuffix: "असफल", revenueTracked: "दर्ज की गई कमाई", fromCampaign: "किसी कैंपेन से",
      topCustomers: "टॉप ग्राहक", messagingTier: "मैसेजिंग टियर",
      checklistTitle: "अपना पहला मैसेज भेजने तक पहुँचें", checklistConnect: "अपना WhatsApp Business नंबर जोड़ें",
      checklistTemplate: "एक टेम्पलेट अप्रूव कराएं", checklistContacts: "अपने संपर्क इम्पोर्ट करें",
      checklistCampaign: "अपना पहला कैंपेन भेजें",
    },
    contacts: {
      title: "संपर्क", searchPlaceholder: "फ़ोन या नाम से खोजें…", search: "खोजें", exportCsv: "CSV एक्सपोर्ट करें",
      total: "कुल", colPhone: "फ़ोन", colName: "नाम", colLanguage: "भाषा", colTags: "टैग",
      colSource: "स्रोत", colSpend: "खर्च", colAdded: "जोड़ा गया", noContacts: "अभी कोई संपर्क नहीं — ऊपर से CSV इम्पोर्ट करें।",
    },
    campaigns: {
      title: "कैंपेन", newCampaign: "नया कैंपेन", colName: "नाम", colTemplate: "टेम्पलेट", colStatus: "स्थिति",
      colCreated: "बनाया गया", noCampaigns: "अभी कोई कैंपेन नहीं।", startSending: "भेजना शुरू करें",
    },
    landing: {
      navPricing: "प्राइसिंग", navMcp: "MCP", navLogin: "लॉग इन", navGetStarted: "शुरू करें",
      heroEyebrow: "व्हाट्सएप मार्केटिंग सॉफ्टवेयर", heroLine1: "एक बार भेजें।", heroLine2: "हर भाषा में,", heroLine3: "आधी कीमत पर।",
      heroSubhead: "यह प्रिया टेक्सटाइल्स का असली ऑर्डर है, शुरू से आखिर तक — एक इंस्टाग्राम विज्ञापन, ग्राहक की अपनी भाषा में जवाब, व्हाट्सएप छोड़े बिना लिया गया पेमेंट, और उस बिक्री तक वापस जोड़ा गया रेवेन्यू जिसने इसे दिलाया।",
      badgeReseller: "⚡ Meta का असली Cloud API — रीसेलर नहीं", badgeFree: "🆓 हमेशा के लिए फ्री प्लान — 14-दिन का ट्रायल नहीं",
      ctaGetStarted: "मुफ़्त में शुरू करें →", ctaSeePricing: "प्राइसिंग देखें",
      statChannels: "चैनल", statMcp: "Claude के लिए MCP टूल्स", statPrice: "बाकियों की आधी कीमत",
    },
  },
  mr: {
    nav: {
      overview: "आढावा", contacts: "संपर्क", templates: "टेम्पलेट", catalog: "कॅटलॉग", campaigns: "कॅम्पेन",
      inbox: "इनबॉक्स", analytics: "अॅनालिटिक्स", chatbotFlows: "चॅटबॉट फ्लो", forms: "फॉर्म", automations: "ऑटोमेशन", segments: "सेगमेंट्स",
      webhooks: "वेबहुक", linksWidget: "लिंक आणि विजेट", agency: "एजन्सी", settings: "सेटिंग्ज", billing: "बिलिंग", sequences: "सीक्वेन्स",
      team: "टीम", channels: "चॅनेल्स", cannedResponses: "सेव्ह केलेली उत्तरे", apiKeys: "API कीज", integrations: "इंटिग्रेशन्स",
      businessHours: "व्यवसाय वेळ", payments: "पेमेंट्स", calling: "कॉलिंग",
      logout: "लॉग आउट",
    },
    auth: {
      loginTitle: "लॉग इन करा", loginSubtitle: "पुन्हा स्वागत आहे.", whatsappNumber: "WhatsApp नंबर", password: "पासवर्ड",
      loginButton: "लॉग इन करा", noAccount: "नवीन आहात? वर्कस्पेस तयार करा", signupTitle: "तुमचे वर्कस्पेस तयार करा",
      signupSubtitle: "सुरुवात मोफत आहे, पहिल्या दिवसापासून खरे Cloud API.", workspaceName: "वर्कस्पेसचे नाव",
      signupButton: "वर्कस्पेस तयार करा", haveAccount: "आधीच खाते आहे?", logIn: "लॉग इन करा",
    },
    dashboard: {
      title: "आढावा", whatsappConnected: "WhatsApp जोडलेले आहे", whatsappNotConnected: "WhatsApp जोडलेले नाही",
      noWhatsappBanner: "अजून कोणताही WhatsApp Business नंबर जोडलेला नाही. Meta Business Manager कडून फोन नंबर ID आणि अ‍ॅक्सेस टोकन मिळाल्यावर सेटअप पूर्ण करा — इथले बाकी सर्व आधीच काम करते.",
      contacts: "संपर्क", campaigns: "कॅम्पेन", messagesSent: "पाठवलेले मेसेज", deliveryRate: "डिलिव्हरी दर",
      failedSuffix: "अयशस्वी", revenueTracked: "नोंदवलेली कमाई", fromCampaign: "एका कॅम्पेनमधून",
      topCustomers: "टॉप ग्राहक", messagingTier: "मेसेजिंग टियर",
      checklistTitle: "तुमच्या पहिल्या मेसेजपर्यंत पोहोचा", checklistConnect: "तुमचा WhatsApp Business नंबर जोडा",
      checklistTemplate: "एक टेम्पलेट मंजूर करा", checklistContacts: "तुमचे संपर्क इम्पोर्ट करा",
      checklistCampaign: "तुमचा पहिला कॅम्पेन पाठवा",
    },
    contacts: {
      title: "संपर्क", searchPlaceholder: "फोन किंवा नावाने शोधा…", search: "शोधा", exportCsv: "CSV एक्सपोर्ट करा",
      total: "एकूण", colPhone: "फोन", colName: "नाव", colLanguage: "भाषा", colTags: "टॅग्ज",
      colSource: "स्रोत", colSpend: "खर्च", colAdded: "जोडले", noContacts: "अजून संपर्क नाहीत — वर CSV इम्पोर्ट करा.",
    },
    campaigns: {
      title: "कॅम्पेन", newCampaign: "नवीन कॅम्पेन", colName: "नाव", colTemplate: "टेम्पलेट", colStatus: "स्थिती",
      colCreated: "तयार केले", noCampaigns: "अजून कॅम्पेन नाहीत.", startSending: "पाठवणे सुरू करा",
    },
    landing: {
      navPricing: "किंमत", navMcp: "MCP", navLogin: "लॉग इन", navGetStarted: "सुरू करा",
      heroEyebrow: "व्हॉट्सअ‍ॅप मार्केटिंग सॉफ्टवेअर", heroLine1: "एकदा पाठवा.", heroLine2: "प्रत्येक भाषेत,", heroLine3: "निम्म्या किमतीत.",
      heroSubhead: "ही प्रिया टेक्सटाइल्सची खरी ऑर्डर आहे, सुरुवातीपासून शेवटपर्यंत — एक इंस्टाग्राम जाहिरात, ग्राहकाच्या स्वतःच्या भाषेत उत्तर, व्हॉट्सअ‍ॅप न सोडता घेतलेले पेमेंट, आणि ती विक्री मिळवून देणाऱ्या जाहिरातीपर्यंत जोडलेले रेव्हेन्यू.",
      badgeReseller: "⚡ Meta चे अधिकृत Cloud API — रिसेलर नाही", badgeFree: "🆓 कायमचा मोफत प्लॅन — 14-दिवसांची ट्रायल नाही",
      ctaGetStarted: "मोफत सुरू करा →", ctaSeePricing: "किंमत पहा",
      statChannels: "चॅनेल्स", statMcp: "Claude साठी MCP टूल्स", statPrice: "इतरांच्या निम्मी किंमत",
    },
  },
  ta: {
    nav: {
      overview: "மேலோட்டம்", contacts: "தொடர்புகள்", templates: "வார்ப்புருக்கள்", catalog: "பட்டியல்", campaigns: "பிரச்சாரங்கள்",
      inbox: "இன்பாக்ஸ்", analytics: "பகுப்பாய்வு", chatbotFlows: "சாட்பாட் ஃப்ளோ", forms: "படிவங்கள்", automations: "ஆட்டோமேஷன்", segments: "செக்மென்ட்கள்",
      webhooks: "வெப்ஹூக்குகள்", linksWidget: "இணைப்புகள் & விட்ஜெட்", agency: "ஏஜென்சி", settings: "அமைப்புகள்", billing: "பில்லிங்", sequences: "சீக்வென்ஸ்கள்",
      team: "குழு", channels: "சேனல்கள்", cannedResponses: "சேமித்த பதில்கள்", apiKeys: "API கீகள்", integrations: "இன்டகிரேஷன்கள்",
      businessHours: "வணிக நேரம்", payments: "பணம் செலுத்துதல்", calling: "கால் செய்தல்",
      logout: "வெளியேறு",
    },
    auth: {
      loginTitle: "உள்நுழையவும்", loginSubtitle: "மீண்டும் வருக.", whatsappNumber: "WhatsApp எண்", password: "கடவுச்சொல்",
      loginButton: "உள்நுழையவும்", noAccount: "புதியவரா? வேலைத்தளம் உருவாக்கவும்", signupTitle: "உங்கள் வேலைத்தளத்தை உருவாக்கவும்",
      signupSubtitle: "தொடங்குவது இலவசம், முதல் நாளிலிருந்தே உண்மையான Cloud API.", workspaceName: "வேலைத்தள பெயர்",
      signupButton: "வேலைத்தளம் உருவாக்கவும்", haveAccount: "ஏற்கனவே கணக்கு உள்ளதா?", logIn: "உள்நுழையவும்",
    },
    dashboard: {
      title: "மேலோட்டம்", whatsappConnected: "WhatsApp இணைக்கப்பட்டுள்ளது", whatsappNotConnected: "WhatsApp இணைக்கப்படவில்லை",
      noWhatsappBanner: "இன்னும் WhatsApp Business எண் இணைக்கப்படவில்லை. Meta Business Manager இலிருந்து ஃபோன் நம்பர் ஐடி மற்றும் அணுகல் டோக்கன் கிடைத்தவுடன் அமைப்பை முடிக்கவும் — இங்கு மற்ற அனைத்தும் ஏற்கனவே வேலை செய்கிறது.",
      contacts: "தொடர்புகள்", campaigns: "பிரச்சாரங்கள்", messagesSent: "அனுப்பிய செய்திகள்", deliveryRate: "விநியோக விகிதம்",
      failedSuffix: "தோல்வி", revenueTracked: "பதிவான வருவாய்", fromCampaign: "ஒரு பிரச்சாரத்திலிருந்து",
      topCustomers: "சிறந்த வாடிக்கையாளர்கள்", messagingTier: "மெசேஜிங் அடுக்கு",
      checklistTitle: "உங்கள் முதல் செய்தியை அடையுங்கள்", checklistConnect: "உங்கள் WhatsApp Business எண்ணை இணைக்கவும்",
      checklistTemplate: "ஒரு வார்ப்புருவை அங்கீகரிக்கச் செய்யவும்", checklistContacts: "உங்கள் தொடர்புகளை இறக்கவும்",
      checklistCampaign: "உங்கள் முதல் பிரச்சாரத்தை அனுப்பவும்",
    },
    contacts: {
      title: "தொடர்புகள்", searchPlaceholder: "எண் அல்லது பெயரால் தேடவும்…", search: "தேடு", exportCsv: "CSV ஏற்றுமதி",
      total: "மொத்தம்", colPhone: "எண்", colName: "பெயர்", colLanguage: "மொழி", colTags: "குறிச்சொற்கள்",
      colSource: "மூலம்", colSpend: "செலவு", colAdded: "சேர்க்கப்பட்டது", noContacts: "இன்னும் தொடர்புகள் இல்லை — மேலே CSV இறக்கவும்.",
    },
    campaigns: {
      title: "பிரச்சாரங்கள்", newCampaign: "புதிய பிரச்சாரம்", colName: "பெயர்", colTemplate: "வார்ப்புரு", colStatus: "நிலை",
      colCreated: "உருவாக்கப்பட்டது", noCampaigns: "இன்னும் பிரச்சாரங்கள் இல்லை.", startSending: "அனுப்புவதைத் தொடங்கு",
    },
    landing: {
      navPricing: "விலை", navMcp: "MCP", navLogin: "உள்நுழை", navGetStarted: "தொடங்குங்கள்",
      heroEyebrow: "வாட்ஸ்அப் மார்க்கெட்டிங் மென்பொருள்", heroLine1: "ஒருமுறை அனுப்புங்கள்.", heroLine2: "ஒவ்வொரு மொழியிலும்,", heroLine3: "பாதி விலையில்.",
      heroSubhead: "இது பிரியா டெக்ஸ்டைல்ஸின் உண்மையான ஆர்டர், தொடக்கத்திலிருந்து முடிவு வரை — ஒரு இன்ஸ்டாகிராம் விளம்பரம், வாடிக்கையாளரின் சொந்த மொழியில் பதில், வாட்ஸ்அப்பை விட்டு வெளியேறாமல் பெறப்பட்ட பணம், மற்றும் அந்த விற்பனையைத் தந்த விளம்பரத்திற்கு திரும்ப இணைக்கப்பட்ட வருவாய்.",
      badgeReseller: "⚡ Meta-வின் அதிகாரப்பூர்வ Cloud API — மறுவிற்பனையாளர் அல்ல", badgeFree: "🆓 எப்போதும் இலவச திட்டம் — 14-நாள் சோதனை அல்ல",
      ctaGetStarted: "இலவசமாகத் தொடங்குங்கள் →", ctaSeePricing: "விலையைப் பார்க்க",
      statChannels: "சேனல்கள்", statMcp: "Claude-க்கான MCP கருவிகள்", statPrice: "மற்றவற்றின் பாதி விலை",
    },
  },
  te: {
    nav: {
      overview: "అవలోకనం", contacts: "పరిచయాలు", templates: "టెంప్లేట్‌లు", catalog: "క్యాటలాగ్", campaigns: "క్యాంపెయిన్‌లు",
      inbox: "ఇన్‌బాక్స్", analytics: "అనలిటిక్స్", chatbotFlows: "చాట్‌బాట్ ఫ్లోలు", forms: "ఫారమ్‌లు", automations: "ఆటోమేషన్‌లు", segments: "సెగ్మెంట్‌లు",
      webhooks: "వెబ్‌హుక్‌లు", linksWidget: "లింక్‌లు & విడ్జెట్", agency: "ఏజెన్సీ", settings: "సెట్టింగ్‌లు", billing: "బిల్లింగ్", sequences: "సీక్వెన్స్‌లు",
      team: "టీమ్", channels: "ఛానెల్‌లు", cannedResponses: "సేవ్ చేసిన రిప్లైలు", apiKeys: "API కీలు", integrations: "ఇంటిగ్రేషన్‌లు",
      businessHours: "వ్యాపార వేళలు", payments: "పేమెంట్స్", calling: "కాలింగ్",
      logout: "లాగ్ అవుట్",
    },
    auth: {
      loginTitle: "లాగిన్ చేయండి", loginSubtitle: "తిరిగి రావడం సంతోషం.", whatsappNumber: "WhatsApp నంబర్", password: "పాస్‌వర్డ్",
      loginButton: "లాగిన్ చేయండి", noAccount: "కొత్తగా వచ్చారా? వర్క్‌స్పేస్ సృష్టించండి", signupTitle: "మీ వర్క్‌స్పేస్ సృష్టించండి",
      signupSubtitle: "ప్రారంభించడం ఉచితం, మొదటి రోజు నుండే నిజమైన Cloud API.", workspaceName: "వర్క్‌స్పేస్ పేరు",
      signupButton: "వర్క్‌స్పేస్ సృష్టించండి", haveAccount: "ఇప్పటికే ఖాతా ఉందా?", logIn: "లాగిన్ చేయండి",
    },
    dashboard: {
      title: "అవలోకనం", whatsappConnected: "WhatsApp కనెక్ట్ అయింది", whatsappNotConnected: "WhatsApp కనెక్ట్ కాలేదు",
      noWhatsappBanner: "ఇంకా WhatsApp Business నంబర్ కనెక్ట్ కాలేదు. Meta Business Manager నుండి ఫోన్ నంబర్ ID మరియు యాక్సెస్ టోకెన్ వచ్చాక సెటప్ పూర్తి చేయండి — ఇక్కడ మిగతావన్నీ ఇప్పటికే పని చేస్తున్నాయి.",
      contacts: "పరిచయాలు", campaigns: "క్యాంపెయిన్‌లు", messagesSent: "పంపిన మెసేజ్‌లు", deliveryRate: "డెలివరీ రేటు",
      failedSuffix: "విఫలమైంది", revenueTracked: "నమోదైన ఆదాయం", fromCampaign: "ఒక క్యాంపెయిన్ నుండి",
      topCustomers: "టాప్ కస్టమర్‌లు", messagingTier: "మెసేజింగ్ టైర్",
      checklistTitle: "మీ మొదటి మెసేజ్‌కి చేరుకోండి", checklistConnect: "మీ WhatsApp Business నంబర్‌ను కనెక్ట్ చేయండి",
      checklistTemplate: "ఒక టెంప్లేట్‌ను ఆమోదించండి", checklistContacts: "మీ పరిచయాలను దిగుమతి చేయండి",
      checklistCampaign: "మీ మొదటి క్యాంపెయిన్‌ను పంపండి",
    },
    contacts: {
      title: "పరిచయాలు", searchPlaceholder: "ఫోన్ లేదా పేరుతో వెతకండి…", search: "వెతకండి", exportCsv: "CSV ఎగుమతి",
      total: "మొత్తం", colPhone: "ఫోన్", colName: "పేరు", colLanguage: "భాష", colTags: "టాగ్‌లు",
      colSource: "మూలం", colSpend: "ఖర్చు", colAdded: "చేర్చబడింది", noContacts: "ఇంకా పరిచయాలు లేవు — పైన CSV దిగుమతి చేయండి.",
    },
    campaigns: {
      title: "క్యాంపెయిన్‌లు", newCampaign: "కొత్త క్యాంపెయిన్", colName: "పేరు", colTemplate: "టెంప్లేట్", colStatus: "స్థితి",
      colCreated: "సృష్టించబడింది", noCampaigns: "ఇంకా క్యాంపెయిన్‌లు లేవు.", startSending: "పంపడం మొదలుపెట్టండి",
    },
    landing: {
      navPricing: "ధర", navMcp: "MCP", navLogin: "లాగిన్", navGetStarted: "ప్రారంభించండి",
      heroEyebrow: "వాట్సాప్ మార్కెటింగ్ సాఫ్ట్‌వేర్", heroLine1: "ఒకసారి పంపండి.", heroLine2: "ప్రతి భాషలో,", heroLine3: "సగం ధరకే.",
      heroSubhead: "ఇది ప్రియా టెక్స్‌టైల్స్ యొక్క నిజమైన ఆర్డర్, మొదటి నుండి చివరి వరకు — ఒక ఇన్‌స్టాగ్రామ్ ప్రకటన, కస్టమర్ సొంత భాషలో సమాధానం, వాట్సాప్ వదలకుండా తీసుకున్న చెల్లింపు, మరియు ఆ అమ్మకాన్ని తెచ్చిన ప్రకటనకు తిరిగి అనుసంధానించబడిన ఆదాయం.",
      badgeReseller: "⚡ Meta యొక్క అధికారిక Cloud API — రీసెల్లర్ కాదు", badgeFree: "🆓 ఎప్పటికీ ఉచిత ప్లాన్ — 14-రోజుల ట్రయల్ కాదు",
      ctaGetStarted: "ఉచితంగా ప్రారంభించండి →", ctaSeePricing: "ధర చూడండి",
      statChannels: "ఛానెల్‌లు", statMcp: "Claude కోసం MCP టూల్స్", statPrice: "మిగతా వాటి సగం ధర",
    },
  },
  kn: {
    nav: {
      overview: "ಅವಲೋಕನ", contacts: "ಸಂಪರ್ಕಗಳು", templates: "ಟೆಂಪ್ಲೇಟ್‌ಗಳು", catalog: "ಕ್ಯಾಟಲಾಗ್", campaigns: "ಕ್ಯಾಂಪೇನ್‌ಗಳು",
      inbox: "ಇನ್‌ಬಾಕ್ಸ್", analytics: "ಅನಾಲಿಟಿಕ್ಸ್", chatbotFlows: "ಚಾಟ್‌ಬಾಟ್ ಫ್ಲೋಗಳು", forms: "ಫಾರ್ಮ್‌ಗಳು", automations: "ಆಟೊಮೇಷನ್‌ಗಳು", segments: "ಸೆಗ್ಮೆಂಟ್‌ಗಳು",
      webhooks: "ವೆಬ್‌ಹುಕ್‌ಗಳು", linksWidget: "ಲಿಂಕ್‌ಗಳು ಮತ್ತು ವಿಡ್ಜೆಟ್", agency: "ಏಜೆನ್ಸಿ", settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", billing: "ಬಿಲ್ಲಿಂಗ್", sequences: "ಸೀಕ್ವೆನ್ಸ್‌ಗಳು",
      team: "ತಂಡ", channels: "ಚಾನೆಲ್‌ಗಳು", cannedResponses: "ಉಳಿಸಿದ ಪ್ರತ್ಯುತ್ತರಗಳು", apiKeys: "API ಕೀಗಳು", integrations: "ಇಂಟಿಗ್ರೇಷನ್‌ಗಳು",
      businessHours: "ವ್ಯಾಪಾರ ಸಮಯ", payments: "ಪೇಮೆಂಟ್‌ಗಳು", calling: "ಕಾಲಿಂಗ್",
      logout: "ಲಾಗ್ ಔಟ್",
    },
    auth: {
      loginTitle: "ಲಾಗಿನ್ ಮಾಡಿ", loginSubtitle: "ಮತ್ತೆ ಸ್ವಾಗತ.", whatsappNumber: "WhatsApp ಸಂಖ್ಯೆ", password: "ಪಾಸ್‌ವರ್ಡ್",
      loginButton: "ಲಾಗಿನ್ ಮಾಡಿ", noAccount: "ಹೊಸಬರೇ? ವರ್ಕ್‌ಸ್ಪೇಸ್ ರಚಿಸಿ", signupTitle: "ನಿಮ್ಮ ವರ್ಕ್‌ಸ್ಪೇಸ್ ರಚಿಸಿ",
      signupSubtitle: "ಪ್ರಾರಂಭಿಸಲು ಉಚಿತ, ಮೊದಲ ದಿನದಿಂದಲೇ ನಿಜವಾದ Cloud API.", workspaceName: "ವರ್ಕ್‌ಸ್ಪೇಸ್ ಹೆಸರು",
      signupButton: "ವರ್ಕ್‌ಸ್ಪೇಸ್ ರಚಿಸಿ", haveAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?", logIn: "ಲಾಗಿನ್ ಮಾಡಿ",
    },
    dashboard: {
      title: "ಅವಲೋಕನ", whatsappConnected: "WhatsApp ಸಂಪರ್ಕಗೊಂಡಿದೆ", whatsappNotConnected: "WhatsApp ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ",
      noWhatsappBanner: "ಇನ್ನೂ ಯಾವುದೇ WhatsApp Business ಸಂಖ್ಯೆ ಸಂಪರ್ಕಗೊಂಡಿಲ್ಲ. Meta Business Manager ನಿಂದ ಫೋನ್ ನಂಬರ್ ID ಮತ್ತು ಆಕ್ಸೆಸ್ ಟೋಕನ್ ಸಿಕ್ಕ ನಂತರ ಸೆಟಪ್ ಪೂರ್ಣಗೊಳಿಸಿ — ಇಲ್ಲಿನ ಇನ್ನೆಲ್ಲವೂ ಈಗಾಗಲೇ ಕೆಲಸ ಮಾಡುತ್ತದೆ.",
      contacts: "ಸಂಪರ್ಕಗಳು", campaigns: "ಕ್ಯಾಂಪೇನ್‌ಗಳು", messagesSent: "ಕಳುಹಿಸಿದ ಸಂದೇಶಗಳು", deliveryRate: "ಡೆಲಿವರಿ ದರ",
      failedSuffix: "ವಿಫಲವಾಗಿದೆ", revenueTracked: "ದಾಖಲಾದ ಆದಾಯ", fromCampaign: "ಒಂದು ಕ್ಯಾಂಪೇನ್‌ನಿಂದ",
      topCustomers: "ಟಾಪ್ ಗ್ರಾಹಕರು", messagingTier: "ಮೆಸೇಜಿಂಗ್ ಟಯರ್",
      checklistTitle: "ನಿಮ್ಮ ಮೊದಲ ಸಂದೇಶವನ್ನು ತಲುಪಿ", checklistConnect: "ನಿಮ್ಮ WhatsApp Business ಸಂಖ್ಯೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ",
      checklistTemplate: "ಒಂದು ಟೆಂಪ್ಲೇಟ್ ಅನುಮೋದನೆ ಪಡೆಯಿರಿ", checklistContacts: "ನಿಮ್ಮ ಸಂಪರ್ಕಗಳನ್ನು ಇಂಪೋರ್ಟ್ ಮಾಡಿ",
      checklistCampaign: "ನಿಮ್ಮ ಮೊದಲ ಕ್ಯಾಂಪೇನ್ ಕಳುಹಿಸಿ",
    },
    contacts: {
      title: "ಸಂಪರ್ಕಗಳು", searchPlaceholder: "ಫೋನ್ ಅಥವಾ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ…", search: "ಹುಡುಕಿ", exportCsv: "CSV ಎಕ್ಸ್‌ಪೋರ್ಟ್",
      total: "ಒಟ್ಟು", colPhone: "ಫೋನ್", colName: "ಹೆಸರು", colLanguage: "ಭಾಷೆ", colTags: "ಟ್ಯಾಗ್‌ಗಳು",
      colSource: "ಮೂಲ", colSpend: "ಖರ್ಚು", colAdded: "ಸೇರಿಸಲಾಗಿದೆ", noContacts: "ಇನ್ನೂ ಸಂಪರ್ಕಗಳಿಲ್ಲ — ಮೇಲೆ CSV ಇಂಪೋರ್ಟ್ ಮಾಡಿ.",
    },
    campaigns: {
      title: "ಕ್ಯಾಂಪೇನ್‌ಗಳು", newCampaign: "ಹೊಸ ಕ್ಯಾಂಪೇನ್", colName: "ಹೆಸರು", colTemplate: "ಟೆಂಪ್ಲೇಟ್", colStatus: "ಸ್ಥಿತಿ",
      colCreated: "ರಚಿಸಲಾಗಿದೆ", noCampaigns: "ಇನ್ನೂ ಕ್ಯಾಂಪೇನ್‌ಗಳಿಲ್ಲ.", startSending: "ಕಳುಹಿಸುವುದನ್ನು ಪ್ರಾರಂಭಿಸಿ",
    },
    landing: {
      navPricing: "ಬೆಲೆ", navMcp: "MCP", navLogin: "ಲಾಗಿನ್", navGetStarted: "ಪ್ರಾರಂಭಿಸಿ",
      heroEyebrow: "ವಾಟ್ಸಾಪ್ ಮಾರ್ಕೆಟಿಂಗ್ ಸಾಫ್ಟ್‌ವೇರ್", heroLine1: "ಒಮ್ಮೆ ಕಳುಹಿಸಿ.", heroLine2: "ಪ್ರತಿ ಭಾಷೆಯಲ್ಲಿ,", heroLine3: "ಅರ್ಧ ಬೆಲೆಗೆ.",
      heroSubhead: "ಇದು ಪ್ರಿಯಾ ಟೆಕ್ಸ್‌ಟೈಲ್ಸ್‌ನ ನಿಜವಾದ ಆರ್ಡರ್, ಆರಂಭದಿಂದ ಅಂತ್ಯದವರೆಗೆ — ಒಂದು ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ಜಾಹೀರಾತು, ಗ್ರಾಹಕರ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ ಪ್ರತ್ಯುತ್ತರ, ವಾಟ್ಸಾಪ್ ಬಿಡದೆ ಪಡೆದ ಪಾವತಿ, ಮತ್ತು ಆ ಮಾರಾಟವನ್ನು ತಂದ ಜಾಹೀರಾತಿಗೆ ಮರಳಿ ಜೋಡಿಸಲಾದ ಆದಾಯ.",
      badgeReseller: "⚡ Meta ನ ಅಧಿಕೃತ Cloud API — ಮರುಮಾರಾಟಗಾರರಲ್ಲ", badgeFree: "🆓 ಶಾಶ್ವತ ಉಚಿತ ಯೋಜನೆ — 14-ದಿನಗಳ ಟ್ರಯಲ್ ಅಲ್ಲ",
      ctaGetStarted: "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ →", ctaSeePricing: "ಬೆಲೆ ನೋಡಿ",
      statChannels: "ಚಾನೆಲ್‌ಗಳು", statMcp: "Claude ಗಾಗಿ MCP ಟೂಲ್‌ಗಳು", statPrice: "ಉಳಿದವರ ಅರ್ಧ ಬೆಲೆ",
    },
  },
};

export function getDictionary(lang: LanguageCode): Dictionary {
  return dictionaries[lang] ?? dictionaries.en;
}
