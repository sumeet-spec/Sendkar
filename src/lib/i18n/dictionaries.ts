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
    businessHours: string; payments: string; calling: string; language: string; aiAgent: string;
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
  onboarding: {
    title: string; introBefore: string; skipLabel: string; introAfter: string; numberWarning: string;
    step1Title: string; step1Body: string; phoneIdPlaceholder: string; wabaIdPlaceholder: string;
    step2Title: string; step2Body: string; tokenPlaceholder: string;
    step3Title: string; step3Body: string;
    submitButton: string; submitPending: string;
    noMetaApp: string; createOne: string;
    successTitle: string; successAs: string; successBody: string; continueButton: string;
  };
}

export const dictionaries: Record<LanguageCode, Dictionary> = {
  en: {
    nav: {
      overview: "Overview", contacts: "Contacts", templates: "Templates", catalog: "Catalog", campaigns: "Campaigns",
      inbox: "Inbox", analytics: "Analytics", chatbotFlows: "Chatbot flows", forms: "Forms", automations: "Automations", segments: "Segments",
      webhooks: "Webhooks", linksWidget: "Links & widget", agency: "Agency", settings: "Settings", billing: "Billing", sequences: "Sequences",
      team: "Team", channels: "Channels", cannedResponses: "Canned responses", apiKeys: "API keys", integrations: "Integrations",
      businessHours: "Business hours", payments: "Payments", calling: "Calling", language: "Language", aiAgent: "AI agent",
      logout: "Log out",
    },
    auth: {
      loginTitle: "Log in", loginSubtitle: "Welcome back.", whatsappNumber: "WhatsApp number", password: "Password",
      loginButton: "Log in", noAccount: "New here? Create your business account", signupTitle: "Set up your business",
      signupSubtitle: "Free to start, real Cloud API from day one.", workspaceName: "Business name",
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
    onboarding: {
      title: "Connect WhatsApp",
      introBefore: "Three things from Meta Business Manager. Don't have a WhatsApp Business number yet?",
      skipLabel: "Skip this",
      introAfter: "— everything else in Sendkar already works, sending just stays off until this is filled in.",
      numberWarning: "Use a WhatsApp number you don't already use in the regular WhatsApp app — connecting it here moves it to Sendkar and logs it out of the app (your chats stay on your phone, but you'll manage this number from Sendkar going forward).",
      step1Title: "Get your Phone Number ID and WABA ID",
      step1Body: "In your Meta App → WhatsApp → API Setup, you'll see a \"From\" phone number with its Phone number ID beneath it, and a WhatsApp Business Account ID field nearby.",
      phoneIdPlaceholder: "Phone number ID — e.g. 102938475600000", wabaIdPlaceholder: "WhatsApp Business Account ID",
      step2Title: "Get an access token",
      step2Body: "The temporary token on that same API Setup page works for testing (expires in 24h). For real use, create a System User in Meta Business Settings, assign it this app with whatsapp_business_messaging and whatsapp_business_management permissions, and generate its token there instead.",
      tokenPlaceholder: "EAAG...",
      step3Title: "We verify it, live",
      step3Body: "Sendkar checks these credentials against Meta's API before saving, and subscribes your WABA to receive replies and delivery statuses — the two steps most WhatsApp platforms skip, which is why \"connected\" sometimes doesn't mean messages actually flow both ways.",
      submitButton: "Connect & verify", submitPending: "Verifying with Meta…",
      noMetaApp: "No Meta app yet?", createOne: "Create one at developers.facebook.com →",
      successTitle: "Connected", successAs: " as ", successBody: "Meta confirmed these credentials actually work — not just saved, verified.",
      continueButton: "Continue to dashboard →",
    },
  },
  hi: {
    nav: {
      overview: "अवलोकन", contacts: "संपर्क", templates: "टेम्पलेट", catalog: "कैटलॉग", campaigns: "कैंपेन",
      inbox: "इनबॉक्स", analytics: "एनालिटिक्स", chatbotFlows: "चैटबॉट फ्लो", forms: "फ़ॉर्म", automations: "ऑटोमेशन", segments: "सेगमेंट्स",
      webhooks: "वेबहुक", linksWidget: "लिंक और विजेट", agency: "एजेंसी", settings: "सेटिंग्स", billing: "बिलिंग", sequences: "सीक्वेंस",
      team: "टीम", channels: "चैनल", cannedResponses: "सेव्ड रिप्लाई", apiKeys: "API कीज़", integrations: "इंटीग्रेशन",
      businessHours: "बिज़नेस समय", payments: "पेमेंट्स", calling: "कॉलिंग", language: "भाषा", aiAgent: "AI एजेंट",
      logout: "लॉग आउट",
    },
    auth: {
      loginTitle: "लॉग इन करें", loginSubtitle: "वापसी पर स्वागत है।", whatsappNumber: "WhatsApp नंबर", password: "पासवर्ड",
      loginButton: "लॉग इन करें", noAccount: "नए हैं? अपना बिज़नेस बनाएं", signupTitle: "अपना बिज़नेस सेट अप करें",
      signupSubtitle: "शुरू करना मुफ़्त है, पहले दिन से असली Cloud API।", workspaceName: "बिज़नेस का नाम",
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
    onboarding: {
      title: "WhatsApp कनेक्ट करें",
      introBefore: "Meta Business Manager से तीन चीज़ें चाहिए। अभी तक WhatsApp Business नंबर नहीं है?",
      skipLabel: "इसे छोड़ें",
      introAfter: "— Sendkar में बाकी सब पहले से काम करता है, बस यह भरने तक मैसेज भेजना बंद रहेगा।",
      numberWarning: "ऐसा WhatsApp नंबर इस्तेमाल करें जिसे आप सामान्य WhatsApp ऐप में पहले से इस्तेमाल नहीं कर रहे — इसे यहाँ जोड़ने पर यह Sendkar में चला जाता है और ऐप से लॉग आउट हो जाता है (आपकी चैट्स आपके फ़ोन में सुरक्षित रहती हैं, पर अब से यह नंबर आप Sendkar से ही चलाएंगे)।",
      step1Title: "अपना फ़ोन नंबर ID और WABA ID लें",
      step1Body: "अपने Meta App → WhatsApp → API Setup में, आपको एक \"From\" फ़ोन नंबर दिखेगा जिसके नीचे उसका Phone number ID होगा, और पास में एक WhatsApp Business Account ID फ़ील्ड होगी।",
      phoneIdPlaceholder: "फ़ोन नंबर ID — जैसे 102938475600000", wabaIdPlaceholder: "WhatsApp Business Account ID",
      step2Title: "एक्सेस टोकन लें",
      step2Body: "उसी API Setup पेज पर मौजूद टेम्पररी टोकन टेस्टिंग के लिए काम करता है (24 घंटे में एक्सपायर होता है)। असली इस्तेमाल के लिए, Meta Business Settings में एक System User बनाएं, इसे whatsapp_business_messaging और whatsapp_business_management परमिशन दें, और वहीं से इसका टोकन जनरेट करें।",
      tokenPlaceholder: "EAAG...",
      step3Title: "हम इसे लाइव वेरिफ़ाई करते हैं",
      step3Body: "Sendkar सेव करने से पहले इन क्रेडेंशियल्स को Meta के API से जांचता है, और आपके WABA को रिप्लाई व डिलीवरी स्टेटस पाने के लिए सब्सक्राइब करता है — ये वो दो कदम हैं जो ज़्यादातर WhatsApp प्लेटफ़ॉर्म छोड़ देते हैं, इसलिए \"कनेक्टेड\" होने का मतलब हमेशा यह नहीं होता कि मैसेज दोनों तरफ़ चल रहे हैं।",
      submitButton: "कनेक्ट करें और वेरिफ़ाई करें", submitPending: "Meta से वेरिफ़ाई हो रहा है…",
      noMetaApp: "अभी तक Meta App नहीं है?", createOne: "developers.facebook.com पर एक बनाएं →",
      successTitle: "कनेक्ट हो गया", successAs: " — ", successBody: "Meta ने पुष्टि की कि ये क्रेडेंशियल्स वाक़ई काम करते हैं — सिर्फ़ सेव नहीं, वेरिफ़ाई किए गए।",
      continueButton: "डैशबोर्ड पर जाएं →",
    },
  },
  mr: {
    nav: {
      overview: "आढावा", contacts: "संपर्क", templates: "टेम्पलेट", catalog: "कॅटलॉग", campaigns: "कॅम्पेन",
      inbox: "इनबॉक्स", analytics: "अॅनालिटिक्स", chatbotFlows: "चॅटबॉट फ्लो", forms: "फॉर्म", automations: "ऑटोमेशन", segments: "सेगमेंट्स",
      webhooks: "वेबहुक", linksWidget: "लिंक आणि विजेट", agency: "एजन्सी", settings: "सेटिंग्ज", billing: "बिलिंग", sequences: "सीक्वेन्स",
      team: "टीम", channels: "चॅनेल्स", cannedResponses: "सेव्ह केलेली उत्तरे", apiKeys: "API कीज", integrations: "इंटिग्रेशन्स",
      businessHours: "व्यवसाय वेळ", payments: "पेमेंट्स", calling: "कॉलिंग", language: "भाषा", aiAgent: "AI एजंट",
      logout: "लॉग आउट",
    },
    auth: {
      loginTitle: "लॉग इन करा", loginSubtitle: "पुन्हा स्वागत आहे.", whatsappNumber: "WhatsApp नंबर", password: "पासवर्ड",
      loginButton: "लॉग इन करा", noAccount: "नवीन आहात? तुमचा व्यवसाय तयार करा", signupTitle: "तुमचा व्यवसाय सेट करा",
      signupSubtitle: "सुरुवात मोफत आहे, पहिल्या दिवसापासून खरे Cloud API.", workspaceName: "व्यवसायाचे नाव",
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
    onboarding: {
      title: "WhatsApp कनेक्ट करा",
      introBefore: "Meta Business Manager कडून तीन गोष्टी हव्यात. अजून WhatsApp Business नंबर नाही?",
      skipLabel: "हे वगळा",
      introAfter: "— Sendkar मधील बाकी सर्व आधीच काम करते, फक्त हे भरेपर्यंत मेसेज पाठवणे बंद राहील.",
      numberWarning: "असा WhatsApp नंबर वापरा जो तुम्ही नेहमीच्या WhatsApp अ‍ॅपमध्ये आधीच वापरत नाही आहात — तो इथे जोडल्यास तो Sendkar कडे स्थलांतरित होतो आणि अ‍ॅपमधून लॉग आउट होतो (तुमचे चॅट्स तुमच्या फोनमध्ये सुरक्षित राहतात, पण यापुढे हा नंबर तुम्ही Sendkar मधूनच चालवाल).",
      step1Title: "तुमचा फोन नंबर ID आणि WABA ID मिळवा",
      step1Body: "तुमच्या Meta App → WhatsApp → API Setup मध्ये, तुम्हाला एक \"From\" फोन नंबर दिसेल ज्याच्या खाली त्याचा Phone number ID असेल, आणि जवळच एक WhatsApp Business Account ID फील्ड असेल.",
      phoneIdPlaceholder: "फोन नंबर ID — उदा. 102938475600000", wabaIdPlaceholder: "WhatsApp Business Account ID",
      step2Title: "अ‍ॅक्सेस टोकन मिळवा",
      step2Body: "त्याच API Setup पेजवरील तात्पुरता टोकन चाचणीसाठी काम करतो (24 तासांत एक्सपायर होतो). खऱ्या वापरासाठी, Meta Business Settings मध्ये एक System User तयार करा, त्याला whatsapp_business_messaging आणि whatsapp_business_management परवानग्या द्या, आणि तिथूनच त्याचा टोकन तयार करा.",
      tokenPlaceholder: "EAAG...",
      step3Title: "आम्ही ते थेट पडताळतो",
      step3Body: "Sendkar सेव्ह करण्यापूर्वी ही क्रेडेन्शियल्स Meta च्या API कडून तपासते, आणि तुमचे WABA रिप्लाय व डिलिव्हरी स्टेटस मिळवण्यासाठी सबस्क्राइब करते — बहुतांश WhatsApp प्लॅटफॉर्म हे दोन टप्पे वगळतात, म्हणूनच \"कनेक्टेड\" असण्याचा अर्थ नेहमी दोन्ही बाजूंनी मेसेज चालणे असा नसतो.",
      submitButton: "कनेक्ट करा आणि पडताळा", submitPending: "Meta कडून पडताळणी सुरू आहे…",
      noMetaApp: "अजून Meta App नाही?", createOne: "developers.facebook.com वर एक तयार करा →",
      successTitle: "कनेक्ट झाले", successAs: " — ", successBody: "Meta ने पुष्टी केली की ही क्रेडेन्शियल्स खरोखर काम करतात — फक्त सेव्ह नाही, पडताळलेली.",
      continueButton: "डॅशबोर्डवर जा →",
    },
  },
  ta: {
    nav: {
      overview: "மேலோட்டம்", contacts: "தொடர்புகள்", templates: "வார்ப்புருக்கள்", catalog: "பட்டியல்", campaigns: "பிரச்சாரங்கள்",
      inbox: "இன்பாக்ஸ்", analytics: "பகுப்பாய்வு", chatbotFlows: "சாட்பாட் ஃப்ளோ", forms: "படிவங்கள்", automations: "ஆட்டோமேஷன்", segments: "செக்மென்ட்கள்",
      webhooks: "வெப்ஹூக்குகள்", linksWidget: "இணைப்புகள் & விட்ஜெட்", agency: "ஏஜென்சி", settings: "அமைப்புகள்", billing: "பில்லிங்", sequences: "சீக்வென்ஸ்கள்",
      team: "குழு", channels: "சேனல்கள்", cannedResponses: "சேமித்த பதில்கள்", apiKeys: "API கீகள்", integrations: "இன்டகிரேஷன்கள்",
      businessHours: "வணிக நேரம்", payments: "பணம் செலுத்துதல்", calling: "கால் செய்தல்", language: "மொழி", aiAgent: "AI ஏஜென்ட்",
      logout: "வெளியேறு",
    },
    auth: {
      loginTitle: "உள்நுழையவும்", loginSubtitle: "மீண்டும் வருக.", whatsappNumber: "WhatsApp எண்", password: "கடவுச்சொல்",
      loginButton: "உள்நுழையவும்", noAccount: "புதியவரா? உங்கள் வணிகத்தை உருவாக்குங்கள்", signupTitle: "உங்கள் வணிகத்தை அமைக்கவும்",
      signupSubtitle: "தொடங்குவது இலவசம், முதல் நாளிலிருந்தே உண்மையான Cloud API.", workspaceName: "வணிகத்தின் பெயர்",
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
    onboarding: {
      title: "WhatsApp இணைக்கவும்",
      introBefore: "Meta Business Manager-இலிருந்து மூன்று விஷயங்கள் தேவை. இன்னும் WhatsApp Business எண் இல்லையா?",
      skipLabel: "இதைத் தவிர்",
      introAfter: "— Sendkar-இல் மற்ற அனைத்தும் ஏற்கனவே வேலை செய்கிறது, இது நிரப்பப்படும் வரை மட்டும் அனுப்புவது நிறுத்தப்பட்டிருக்கும்.",
      numberWarning: "நீங்கள் ஏற்கனவே வழக்கமான WhatsApp ஆப்பில் பயன்படுத்தாத ஒரு WhatsApp எண்ணைப் பயன்படுத்துங்கள் — இதை இங்கே இணைத்தால், அது Sendkar-க்கு மாற்றப்பட்டு ஆப்பிலிருந்து வெளியேறும் (உங்கள் அரட்டைகள் உங்கள் தொலைபேசியில் பாதுகாப்பாக இருக்கும், ஆனால் இனி இந்த எண்ணை நீங்கள் Sendkar மூலமாகவே பயன்படுத்த வேண்டும்).",
      step1Title: "உங்கள் Phone Number ID மற்றும் WABA ID-ஐப் பெறுங்கள்",
      step1Body: "உங்கள் Meta App → WhatsApp → API Setup-இல், ஒரு \"From\" ஃபோன் எண்ணையும் அதன் கீழ் Phone number ID-ஐயும், அருகில் ஒரு WhatsApp Business Account ID புலத்தையும் காண்பீர்கள்.",
      phoneIdPlaceholder: "Phone number ID — எ.கா. 102938475600000", wabaIdPlaceholder: "WhatsApp Business Account ID",
      step2Title: "ஒரு அணுகல் டோக்கனைப் பெறுங்கள்",
      step2Body: "அதே API Setup பக்கத்தில் உள்ள தற்காலிக டோக்கன் சோதனைக்கு வேலை செய்யும் (24 மணி நேரத்தில் காலாவதியாகும்). உண்மையான பயன்பாட்டிற்கு, Meta Business Settings-இல் ஒரு System User-ஐ உருவாக்கி, அதற்கு whatsapp_business_messaging மற்றும் whatsapp_business_management அனுமதிகளை வழங்கி, அங்கிருந்தே அதன் டோக்கனை உருவாக்குங்கள்.",
      tokenPlaceholder: "EAAG...",
      step3Title: "நாங்கள் அதை நேரலையில் சரிபார்க்கிறோம்",
      step3Body: "சேமிக்கும் முன் Sendkar இந்த விவரங்களை Meta-வின் API-க்கு எதிராக சரிபார்க்கிறது, மேலும் பதில்கள் மற்றும் டெலிவரி நிலைகளைப் பெற உங்கள் WABA-ஐ சப்ஸ்கிரைப் செய்கிறது — பெரும்பாலான WhatsApp தளங்கள் தவிர்க்கும் இரண்டு படிகள் இவை, அதனால்தான் \"இணைக்கப்பட்டது\" என்பது எப்போதும் இரு திசைகளிலும் மெசேஜ் ஓடுகிறது என்று அர்த்தமாகாது.",
      submitButton: "இணைத்து சரிபார்க்கவும்", submitPending: "Meta-வுடன் சரிபார்க்கப்படுகிறது…",
      noMetaApp: "இன்னும் Meta App இல்லையா?", createOne: "developers.facebook.com-இல் ஒன்றை உருவாக்குங்கள் →",
      successTitle: "இணைக்கப்பட்டது", successAs: " — ", successBody: "இந்த விவரங்கள் உண்மையில் வேலை செய்கின்றன என்பதை Meta உறுதிப்படுத்தியது — வெறும் சேமிக்கப்படவில்லை, சரிபார்க்கப்பட்டது.",
      continueButton: "டாஷ்போர்டுக்குச் செல்லுங்கள் →",
    },
  },
  te: {
    nav: {
      overview: "అవలోకనం", contacts: "పరిచయాలు", templates: "టెంప్లేట్‌లు", catalog: "క్యాటలాగ్", campaigns: "క్యాంపెయిన్‌లు",
      inbox: "ఇన్‌బాక్స్", analytics: "అనలిటిక్స్", chatbotFlows: "చాట్‌బాట్ ఫ్లోలు", forms: "ఫారమ్‌లు", automations: "ఆటోమేషన్‌లు", segments: "సెగ్మెంట్‌లు",
      webhooks: "వెబ్‌హుక్‌లు", linksWidget: "లింక్‌లు & విడ్జెట్", agency: "ఏజెన్సీ", settings: "సెట్టింగ్‌లు", billing: "బిల్లింగ్", sequences: "సీక్వెన్స్‌లు",
      team: "టీమ్", channels: "ఛానెల్‌లు", cannedResponses: "సేవ్ చేసిన రిప్లైలు", apiKeys: "API కీలు", integrations: "ఇంటిగ్రేషన్‌లు",
      businessHours: "వ్యాపార వేళలు", payments: "పేమెంట్స్", calling: "కాలింగ్", language: "భాష", aiAgent: "AI ఏజెంట్",
      logout: "లాగ్ అవుట్",
    },
    auth: {
      loginTitle: "లాగిన్ చేయండి", loginSubtitle: "తిరిగి రావడం సంతోషం.", whatsappNumber: "WhatsApp నంబర్", password: "పాస్‌వర్డ్",
      loginButton: "లాగిన్ చేయండి", noAccount: "కొత్తగా వచ్చారా? మీ వ్యాపారాన్ని సృష్టించండి", signupTitle: "మీ వ్యాపారాన్ని సెటప్ చేయండి",
      signupSubtitle: "ప్రారంభించడం ఉచితం, మొదటి రోజు నుండే నిజమైన Cloud API.", workspaceName: "వ్యాపార పేరు",
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
    onboarding: {
      title: "WhatsApp కనెక్ట్ చేయండి",
      introBefore: "Meta Business Manager నుండి మూడు విషయాలు కావాలి. ఇంకా WhatsApp Business నంబర్ లేదా?",
      skipLabel: "దీన్ని దాటవేయండి",
      introAfter: "— Sendkar లో మిగతా అన్నీ ఇప్పటికే పనిచేస్తాయి, ఇది నింపేవరకు మెసేజ్‌లు పంపడం మాత్రమే ఆఫ్‌లో ఉంటుంది.",
      numberWarning: "మీరు సాధారణ WhatsApp యాప్‌లో ఇప్పటికే వాడని WhatsApp నంబర్‌ను వాడండి — దీన్ని ఇక్కడ కనెక్ట్ చేస్తే అది Sendkar‌కు మారిపోయి యాప్ నుండి లాగ్ అవుట్ అవుతుంది (మీ చాట్‌లు మీ ఫోన్‌లో సురక్షితంగా ఉంటాయి, కానీ ఇకపై ఈ నంబర్‌ను మీరు Sendkar నుండే నిర్వహించాలి).",
      step1Title: "మీ Phone Number ID మరియు WABA ID పొందండి",
      step1Body: "మీ Meta App → WhatsApp → API Setup లో, మీకు ఒక \"From\" ఫోన్ నంబర్ దాని కింద Phone number ID తో, మరియు దగ్గరలో WhatsApp Business Account ID ఫీల్డ్ కనిపిస్తుంది.",
      phoneIdPlaceholder: "Phone number ID — ఉదా. 102938475600000", wabaIdPlaceholder: "WhatsApp Business Account ID",
      step2Title: "యాక్సెస్ టోకెన్ పొందండి",
      step2Body: "అదే API Setup పేజీలో ఉన్న తాత్కాలిక టోకెన్ టెస్టింగ్‌కి పనిచేస్తుంది (24 గంటల్లో గడువు ముగుస్తుంది). నిజమైన వాడకానికి, Meta Business Settings లో ఒక System User ని సృష్టించి, దానికి whatsapp_business_messaging మరియు whatsapp_business_management అనుమతులు ఇచ్చి, అక్కడి నుండే దాని టోకెన్ జనరేట్ చేయండి.",
      tokenPlaceholder: "EAAG...",
      step3Title: "మేము దీన్ని లైవ్‌లో వెరిఫై చేస్తాము",
      step3Body: "సేవ్ చేయడానికి ముందు Sendkar ఈ క్రెడెన్షియల్స్‌ని Meta యొక్క API కి వ్యతిరేకంగా తనిఖీ చేస్తుంది, మరియు రిప్లైలు మరియు డెలివరీ స్టేటస్‌లు అందుకోవడానికి మీ WABA ని సబ్‌స్క్రైబ్ చేస్తుంది — చాలా WhatsApp ప్లాట్‌ఫారమ్‌లు వదిలేసే రెండు దశలు ఇవే, అందుకే \"కనెక్ట్ అయింది\" అంటే ఎప్పుడూ రెండు వైపులా మెసేజ్‌లు నడుస్తున్నాయని అర్థం కాదు.",
      submitButton: "కనెక్ట్ చేసి వెరిఫై చేయండి", submitPending: "Meta తో వెరిఫై అవుతోంది…",
      noMetaApp: "ఇంకా Meta App లేదా?", createOne: "developers.facebook.com లో ఒకటి సృష్టించండి →",
      successTitle: "కనెక్ట్ అయింది", successAs: " — ", successBody: "ఈ క్రెడెన్షియల్స్ నిజంగా పనిచేస్తున్నాయని Meta నిర్ధారించింది — కేవలం సేవ్ కాలేదు, వెరిఫై చేయబడింది.",
      continueButton: "డాష్‌బోర్డ్‌కి వెళ్లండి →",
    },
  },
  kn: {
    nav: {
      overview: "ಅವಲೋಕನ", contacts: "ಸಂಪರ್ಕಗಳು", templates: "ಟೆಂಪ್ಲೇಟ್‌ಗಳು", catalog: "ಕ್ಯಾಟಲಾಗ್", campaigns: "ಕ್ಯಾಂಪೇನ್‌ಗಳು",
      inbox: "ಇನ್‌ಬಾಕ್ಸ್", analytics: "ಅನಾಲಿಟಿಕ್ಸ್", chatbotFlows: "ಚಾಟ್‌ಬಾಟ್ ಫ್ಲೋಗಳು", forms: "ಫಾರ್ಮ್‌ಗಳು", automations: "ಆಟೊಮೇಷನ್‌ಗಳು", segments: "ಸೆಗ್ಮೆಂಟ್‌ಗಳು",
      webhooks: "ವೆಬ್‌ಹುಕ್‌ಗಳು", linksWidget: "ಲಿಂಕ್‌ಗಳು ಮತ್ತು ವಿಡ್ಜೆಟ್", agency: "ಏಜೆನ್ಸಿ", settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", billing: "ಬಿಲ್ಲಿಂಗ್", sequences: "ಸೀಕ್ವೆನ್ಸ್‌ಗಳು",
      team: "ತಂಡ", channels: "ಚಾನೆಲ್‌ಗಳು", cannedResponses: "ಉಳಿಸಿದ ಪ್ರತ್ಯುತ್ತರಗಳು", apiKeys: "API ಕೀಗಳು", integrations: "ಇಂಟಿಗ್ರೇಷನ್‌ಗಳು",
      businessHours: "ವ್ಯಾಪಾರ ಸಮಯ", payments: "ಪೇಮೆಂಟ್‌ಗಳು", calling: "ಕಾಲಿಂಗ್", language: "ಭಾಷೆ", aiAgent: "AI ಏಜೆಂಟ್",
      logout: "ಲಾಗ್ ಔಟ್",
    },
    auth: {
      loginTitle: "ಲಾಗಿನ್ ಮಾಡಿ", loginSubtitle: "ಮತ್ತೆ ಸ್ವಾಗತ.", whatsappNumber: "WhatsApp ಸಂಖ್ಯೆ", password: "ಪಾಸ್‌ವರ್ಡ್",
      loginButton: "ಲಾಗಿನ್ ಮಾಡಿ", noAccount: "ಹೊಸಬರೇ? ನಿಮ್ಮ ವ್ಯಾಪಾರವನ್ನು ರಚಿಸಿ", signupTitle: "ನಿಮ್ಮ ವ್ಯಾಪಾರವನ್ನು ಹೊಂದಿಸಿ",
      signupSubtitle: "ಪ್ರಾರಂಭಿಸಲು ಉಚಿತ, ಮೊದಲ ದಿನದಿಂದಲೇ ನಿಜವಾದ Cloud API.", workspaceName: "ವ್ಯಾಪಾರದ ಹೆಸರು",
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
    onboarding: {
      title: "WhatsApp ಸಂಪರ್ಕಿಸಿ",
      introBefore: "Meta Business Manager ನಿಂದ ಮೂರು ವಿಷಯಗಳು ಬೇಕು. ಇನ್ನೂ WhatsApp Business ಸಂಖ್ಯೆ ಇಲ್ಲವೇ?",
      skipLabel: "ಇದನ್ನು ಬಿಟ್ಟುಬಿಡಿ",
      introAfter: "— Sendkar ನಲ್ಲಿ ಉಳಿದೆಲ್ಲವೂ ಈಗಾಗಲೇ ಕೆಲಸ ಮಾಡುತ್ತದೆ, ಇದನ್ನು ಭರ್ತಿ ಮಾಡುವವರೆಗೆ ಸಂದೇಶ ಕಳುಹಿಸುವುದು ಮಾತ್ರ ಆಫ್ ಆಗಿರುತ್ತದೆ.",
      numberWarning: "ನೀವು ಸಾಮಾನ್ಯ WhatsApp ಆ್ಯಪ್‌ನಲ್ಲಿ ಈಗಾಗಲೇ ಬಳಸದ WhatsApp ಸಂಖ್ಯೆಯನ್ನು ಬಳಸಿ — ಇದನ್ನು ಇಲ್ಲಿ ಸಂಪರ್ಕಿಸಿದರೆ ಅದು Sendkar‌ಗೆ ಸ್ಥಳಾಂತರಗೊಂಡು ಆ್ಯಪ್‌ನಿಂದ ಲಾಗ್ ಔಟ್ ಆಗುತ್ತದೆ (ನಿಮ್ಮ ಚಾಟ್‌ಗಳು ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಉಳಿಯುತ್ತವೆ, ಆದರೆ ಇನ್ನು ಮುಂದೆ ಈ ಸಂಖ್ಯೆಯನ್ನು ನೀವು Sendkar ಮೂಲಕವೇ ನಿರ್ವಹಿಸಬೇಕಾಗುತ್ತದೆ).",
      step1Title: "ನಿಮ್ಮ Phone Number ID ಮತ್ತು WABA ID ಪಡೆಯಿರಿ",
      step1Body: "ನಿಮ್ಮ Meta App → WhatsApp → API Setup ನಲ್ಲಿ, ನಿಮಗೆ ಒಂದು \"From\" ಫೋನ್ ಸಂಖ್ಯೆ ಅದರ ಕೆಳಗೆ Phone number ID ಯೊಂದಿಗೆ, ಮತ್ತು ಹತ್ತಿರದಲ್ಲಿ WhatsApp Business Account ID ಕ್ಷೇತ್ರ ಕಾಣಿಸುತ್ತದೆ.",
      phoneIdPlaceholder: "Phone number ID — ಉದಾ. 102938475600000", wabaIdPlaceholder: "WhatsApp Business Account ID",
      step2Title: "ಆಕ್ಸೆಸ್ ಟೋಕನ್ ಪಡೆಯಿರಿ",
      step2Body: "ಅದೇ API Setup ಪುಟದಲ್ಲಿರುವ ತಾತ್ಕಾಲಿಕ ಟೋಕನ್ ಪರೀಕ್ಷೆಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ (24 ಗಂಟೆಗಳಲ್ಲಿ ಅವಧಿ ಮುಗಿಯುತ್ತದೆ). ನಿಜವಾದ ಬಳಕೆಗೆ, Meta Business Settings ನಲ್ಲಿ ಒಂದು System User ಅನ್ನು ರಚಿಸಿ, ಅದಕ್ಕೆ whatsapp_business_messaging ಮತ್ತು whatsapp_business_management ಅನುಮತಿಗಳನ್ನು ನೀಡಿ, ಅಲ್ಲಿಂದಲೇ ಅದರ ಟೋಕನ್ ಅನ್ನು ರಚಿಸಿ.",
      tokenPlaceholder: "EAAG...",
      step3Title: "ನಾವು ಅದನ್ನು ಲೈವ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸುತ್ತೇವೆ",
      step3Body: "ಉಳಿಸುವ ಮೊದಲು Sendkar ಈ ಕ್ರೆಡೆನ್ಷಿಯಲ್‌ಗಳನ್ನು Meta ಯ API ವಿರುದ್ಧ ಪರಿಶೀಲಿಸುತ್ತದೆ, ಮತ್ತು ಪ್ರತ್ಯುತ್ತರಗಳು ಹಾಗೂ ಡೆಲಿವರಿ ಸ್ಥಿತಿಗಳನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ WABA ಅನ್ನು ಚಂದಾದಾರರಾಗಿಸುತ್ತದೆ — ಹೆಚ್ಚಿನ WhatsApp ವೇದಿಕೆಗಳು ಬಿಟ್ಟುಬಿಡುವ ಎರಡು ಹಂತಗಳು ಇವು, ಅದಕ್ಕಾಗಿಯೇ \"ಸಂಪರ್ಕಗೊಂಡಿದೆ\" ಎಂದರೆ ಯಾವಾಗಲೂ ಎರಡೂ ಕಡೆ ಸಂದೇಶಗಳು ಹರಿಯುತ್ತಿವೆ ಎಂದರ್ಥವಲ್ಲ.",
      submitButton: "ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿ", submitPending: "Meta ಜೊತೆ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…",
      noMetaApp: "ಇನ್ನೂ Meta App ಇಲ್ಲವೇ?", createOne: "developers.facebook.com ನಲ್ಲಿ ಒಂದನ್ನು ರಚಿಸಿ →",
      successTitle: "ಸಂಪರ್ಕಗೊಂಡಿದೆ", successAs: " — ", successBody: "ಈ ಕ್ರೆಡೆನ್ಷಿಯಲ್‌ಗಳು ನಿಜವಾಗಿಯೂ ಕೆಲಸ ಮಾಡುತ್ತವೆ ಎಂದು Meta ದೃಢಪಡಿಸಿದೆ — ಕೇವಲ ಉಳಿಸಲಾಗಿಲ್ಲ, ಪರಿಶೀಲಿಸಲಾಗಿದೆ.",
      continueButton: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮುಂದುವರಿಸಿ →",
    },
  },
};

export function getDictionary(lang: LanguageCode): Dictionary {
  return dictionaries[lang] ?? dictionaries.en;
}
