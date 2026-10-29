import type { LanguageCode } from "./dictionaries";

/**
 * Words for the screens a shopkeeper uses every day: the card maker, the campaign progress report, the
 * brand kit and the "collect permission" page. `{n}` is a number filled in by the page.
 * Shop-facing words are kept short and plain: how a shopkeeper would say it, not formal Hindi/Tamil/etc.
 */
export type AppCopy = {
  cards: {
    title: string; intro: string; comingUp: string; confirmDay: string; today: string; tomorrow: string; inDays: string;
    stageNow: string; stageSoon: string; stageLater: string; setupFirst: string; setupLink: string;
    askLabel: string; askPlaceholder: string; occasion: string; ownHeading: string; cardLanguage: string;
    hintRemembered: string; hintCustomers: string; hintApp: string; offerLabel: string; offerPlaceholder: string;
    everyLanguage: string; everyLanguageHelp: string; picture: string; pictureHelp: string;
    noLogo: string; addLogo: string; noLogoTail: string; make: string; makeAgain: string; making: string;
    placeholder: string; send: string; download: string; picturesLeft: string;
  };
  report: {
    finished: string; sending: string; paused: string; ready: string; percentDone: string;
    gotIt: string; andRead: string; toGo: string; waiting: string;
    optedOut: string; notOnWhatsApp: string; noPhone: string; needsPicture: string; limit: string; other: string;
  };
  permission: {
    title: string; intro: string; agreedLabel: string; ofContacts: string; createIntro: string; create: string; creating: string;
    yourLink: string; copy: string; copied: string; linkHelp: string; posterTitle: string; posterHelp: string; footnote: string;
  };
  brand: {
    title: string; intro: string; shopName: string; namesTitle: string; namesHelp: string; logo: string; logoHelp: string;
    upload: string; uploadAnother: string; uploading: string; fromWebsite: string; looking: string; makeOne: string; makeLogo: string; making: string;
    mainColour: string; highlightColour: string; tagline: string; phone: string; website: string; address: string; save: string; saving: string; saved: string;
  };
};

export const APP_COPY: Record<LanguageCode, AppCopy> = {
  en: {
    cards: {
      title: "Make a card", intro: "Pick a festival or write what you want to say. Your name, logo and colours are added for you, in the language you choose.",
      comingUp: "Coming up", confirmDay: "confirm the day with your calendar", today: "Today", tomorrow: "Tomorrow", inDays: "in {n} days",
      stageNow: "Send your greeting now", stageSoon: "Get your card ready", stageLater: "Plan ahead",
      setupFirst: "Set up your brand kit first, so every card carries your name and logo.", setupLink: "Set up brand kit →",
      askLabel: "What card do you want? (optional)", askPlaceholder: "make a card for Diwali", occasion: "Occasion", ownHeading: "Or write your own heading",
      cardLanguage: "Language of the card", hintRemembered: "Remembered from last time. Change it any time.", hintCustomers: "Most of your customers speak this language. Change it any time.", hintApp: "Starts as the language of your app. Change it any time.",
      offerLabel: "Offer or message (optional)", offerPlaceholder: "15% off till Sunday",
      everyLanguage: "Make a card for every language my customers speak", everyLanguageHelp: "Each customer gets the card in their own language. Your offer line is translated automatically, so look at each card before you send.",
      picture: "Add a festive picture behind the words", pictureHelp: "Uses 1 of your monthly AI pictures. The words are always written by Sendkar, so they are never wrong.",
      noLogo: "No logo yet.", addLogo: "Add your logo", noLogoTail: "to have it on every card.",
      make: "Make card", makeAgain: "Make it again", making: "Making your card…", placeholder: "Your card will appear here.",
      send: "Send to my customers", download: "Download", picturesLeft: "{n} AI pictures left this month",
    },
    report: {
      finished: "Finished sending", sending: "Sending now…", paused: "Paused", ready: "Ready to send", percentDone: "{n}% done",
      gotIt: "{n} of {total} people got your message", andRead: "and {n} have read it", toGo: "{n} are still to go.", waiting: "{n} are waiting to be sent.",
      optedOut: "{n} asked to stop receiving messages.", notOnWhatsApp: "{n} are not on WhatsApp, or cannot receive this message.",
      noPhone: "{n} have no phone number saved.", needsPicture: "{n} could not be sent because the message needs a picture.",
      limit: "{n} were stopped by WhatsApp's sending limit.", other: "{n} could not be sent for another reason.",
    },
    permission: {
      title: "Collect permission",
      intro: "Customers who say yes themselves are the best people to message: they read your offers and rarely report you. Put the poster on your counter. A customer scans it, types their number, ticks the box, and is added to your list with the date they agreed.",
      agreedLabel: "Customers who agreed themselves", ofContacts: "of {n} contacts",
      createIntro: "Create your own link once. It is safe to share: it only lets a person add their own number to your list.", create: "Create my link and poster", creating: "Creating…",
      yourLink: "Your link", copy: "Copy", copied: "Copied", linkHelp: "Share it in your WhatsApp status, on your shop board or on your bills.",
      posterTitle: "Print the counter poster", posterHelp: "Uses your brand kit. The words on the poster and on the page the customer sees are in the language you pick.",
      footnote: "Customers you already have are not changed. If someone who had asked to stop scans the poster and ticks the box, they are added back, because it is their own fresh yes.",
    },
    brand: {
      title: "Brand kit", intro: "Fill this in once. Every festival card, offer card and thank-you card you make will use your name, logo and colours automatically, in the language of the people you are sending to.",
      shopName: "Shop or business name", namesTitle: "Your name in each language", namesHelp: "Optional. When you send a Gujarati card, it shows the Gujarati name. Leave a language empty to use the name above.",
      logo: "Logo", logoHelp: "Three ways: upload yours, take it from your website, or make a simple one from your name.",
      upload: "Upload logo", uploadAnother: "Upload a different logo", uploading: "Uploading…", fromWebsite: "Get it from my website", looking: "Looking…",
      makeOne: "No logo? Make one:", makeLogo: "Make my logo", making: "Making…",
      mainColour: "Main colour", highlightColour: "Highlight colour", tagline: "Tagline (optional)", phone: "Phone shown on cards", website: "Website (optional)", address: "Address or area (optional)",
      save: "Save brand kit", saving: "Saving…", saved: "Saved. Now make a card with it.",
    },
  },
  hi: {
    cards: {
      title: "कार्ड बनाएँ", intro: "कोई त्योहार चुनें या अपना संदेश लिखें। आपका नाम, लोगो और रंग अपने आप जुड़ जाएँगे, आपकी चुनी हुई भाषा में।",
      comingUp: "आने वाले त्योहार", confirmDay: "तारीख़ अपने कैलेंडर से पक्की कर लें", today: "आज", tomorrow: "कल", inDays: "{n} दिन में",
      stageNow: "अभी शुभकामना भेजें", stageSoon: "अपना कार्ड तैयार रखें", stageLater: "पहले से तैयारी करें",
      setupFirst: "पहले अपना ब्रांड किट भरें, ताकि हर कार्ड पर आपका नाम और लोगो आए।", setupLink: "ब्रांड किट भरें →",
      askLabel: "कौन सा कार्ड चाहिए? (ज़रूरी नहीं)", askPlaceholder: "दिवाली का कार्ड बनाओ", occasion: "मौक़ा", ownHeading: "या अपना शीर्षक लिखें",
      cardLanguage: "कार्ड की भाषा", hintRemembered: "पिछली बार की चुनी भाषा। कभी भी बदल सकते हैं।", hintCustomers: "आपके ज़्यादातर ग्राहक यही भाषा बोलते हैं। कभी भी बदल सकते हैं।", hintApp: "आपके ऐप की भाषा से शुरू होती है। कभी भी बदल सकते हैं।",
      offerLabel: "ऑफ़र या संदेश (ज़रूरी नहीं)", offerPlaceholder: "रविवार तक 15% छूट",
      everyLanguage: "मेरे ग्राहकों की हर भाषा में कार्ड बनाएँ", everyLanguageHelp: "हर ग्राहक को उसकी अपनी भाषा में कार्ड मिलेगा। आपका ऑफ़र अपने आप अनुवाद होता है, इसलिए भेजने से पहले हर कार्ड देख लें।",
      picture: "शब्दों के पीछे त्योहार की तस्वीर लगाएँ", pictureHelp: "महीने की AI तस्वीरों में से 1 लगेगी। शब्द हमेशा Sendkar लिखता है, इसलिए कभी ग़लत नहीं होते।",
      noLogo: "अभी लोगो नहीं है।", addLogo: "अपना लोगो जोड़ें", noLogoTail: "ताकि वह हर कार्ड पर आए।",
      make: "कार्ड बनाएँ", makeAgain: "फिर से बनाएँ", making: "आपका कार्ड बन रहा है…", placeholder: "आपका कार्ड यहाँ दिखेगा।",
      send: "मेरे ग्राहकों को भेजें", download: "डाउनलोड करें", picturesLeft: "इस महीने {n} AI तस्वीरें बाक़ी हैं",
    },
    report: {
      finished: "भेजना पूरा हुआ", sending: "अभी भेजा जा रहा है…", paused: "रुका हुआ", ready: "भेजने के लिए तैयार", percentDone: "{n}% पूरा",
      gotIt: "{total} में से {n} लोगों को आपका संदेश मिल गया", andRead: "और {n} ने पढ़ लिया है", toGo: "{n} को भेजना बाक़ी है।", waiting: "{n} भेजे जाने का इंतज़ार कर रहे हैं।",
      optedOut: "{n} ने संदेश बंद करने को कहा था।", notOnWhatsApp: "{n} WhatsApp पर नहीं हैं, या यह संदेश नहीं पा सकते।",
      noPhone: "{n} का फ़ोन नंबर सेव नहीं है।", needsPicture: "{n} को नहीं भेजा जा सका, क्योंकि संदेश के लिए तस्वीर चाहिए।",
      limit: "{n} को WhatsApp की भेजने की सीमा ने रोक दिया।", other: "{n} किसी और कारण से नहीं भेजे जा सके।",
    },
    permission: {
      title: "अनुमति लें",
      intro: "जो ग्राहक खुद हाँ कहते हैं, उन्हें संदेश भेजना सबसे अच्छा रहता है: वे आपके ऑफ़र पढ़ते हैं और शायद ही शिकायत करते हैं। पोस्टर अपने काउंटर पर लगाएँ। ग्राहक उसे स्कैन करता है, अपना नंबर लिखता है, बॉक्स पर टिक करता है, और सहमति की तारीख़ के साथ आपकी सूची में जुड़ जाता है।",
      agreedLabel: "जिन ग्राहकों ने खुद सहमति दी", ofContacts: "कुल {n} संपर्कों में से",
      createIntro: "अपना लिंक एक बार बनाएँ। इसे बाँटना सुरक्षित है: इससे कोई सिर्फ़ अपना नंबर आपकी सूची में जोड़ सकता है।", create: "मेरा लिंक और पोस्टर बनाएँ", creating: "बन रहा है…",
      yourLink: "आपका लिंक", copy: "कॉपी करें", copied: "कॉपी हो गया", linkHelp: "इसे अपने WhatsApp स्टेटस, दुकान के बोर्ड या बिल पर डालें।",
      posterTitle: "काउंटर का पोस्टर प्रिंट करें", posterHelp: "आपका ब्रांड किट इस्तेमाल होता है। पोस्टर और ग्राहक को दिखने वाले पेज के शब्द आपकी चुनी भाषा में होते हैं।",
      footnote: "जो ग्राहक पहले से आपके पास हैं, उनमें कोई बदलाव नहीं होता। अगर किसी ने पहले संदेश बंद करने को कहा था और अब पोस्टर स्कैन करके बॉक्स पर टिक करता है, तो उसे वापस जोड़ दिया जाता है, क्योंकि यह उसकी अपनी नई हाँ है।",
    },
    brand: {
      title: "ब्रांड किट", intro: "इसे एक बार भरें। आपके बनाए हर त्योहार, ऑफ़र और धन्यवाद कार्ड पर आपका नाम, लोगो और रंग अपने आप लगेंगे, उसी भाषा में जिसमें आप भेज रहे हैं।",
      shopName: "दुकान या व्यवसाय का नाम", namesTitle: "हर भाषा में आपका नाम", namesHelp: "ज़रूरी नहीं। गुजराती कार्ड भेजने पर गुजराती नाम दिखेगा। किसी भाषा को ख़ाली छोड़ें तो ऊपर वाला नाम इस्तेमाल होगा।",
      logo: "लोगो", logoHelp: "तीन तरीक़े: अपना अपलोड करें, अपनी वेबसाइट से लें, या अपने नाम से एक सादा लोगो बनाएँ।",
      upload: "लोगो अपलोड करें", uploadAnother: "दूसरा लोगो अपलोड करें", uploading: "अपलोड हो रहा है…", fromWebsite: "मेरी वेबसाइट से लें", looking: "ढूँढ रहे हैं…",
      makeOne: "लोगो नहीं है? बनाएँ:", makeLogo: "मेरा लोगो बनाएँ", making: "बन रहा है…",
      mainColour: "मुख्य रंग", highlightColour: "उभारने वाला रंग", tagline: "टैगलाइन (ज़रूरी नहीं)", phone: "कार्ड पर दिखने वाला फ़ोन नंबर", website: "वेबसाइट (ज़रूरी नहीं)", address: "पता या इलाक़ा (ज़रूरी नहीं)",
      save: "ब्रांड किट सेव करें", saving: "सेव हो रहा है…", saved: "सेव हो गया। अब इससे कार्ड बनाएँ।",
    },
  },
  mr: {
    cards: {
      title: "कार्ड बनवा", intro: "एखादा सण निवडा किंवा तुमचा संदेश लिहा. तुमचे नाव, लोगो आणि रंग आपोआप जोडले जातील, तुम्ही निवडलेल्या भाषेत.",
      comingUp: "येणारे सण", confirmDay: "तारीख तुमच्या कॅलेंडरमध्ये पक्की करा", today: "आज", tomorrow: "उद्या", inDays: "{n} दिवसांत",
      stageNow: "आत्ताच शुभेच्छा पाठवा", stageSoon: "तुमचे कार्ड तयार ठेवा", stageLater: "आधीच नियोजन करा",
      setupFirst: "आधी तुमचा ब्रँड किट भरा, म्हणजे प्रत्येक कार्डवर तुमचे नाव आणि लोगो येईल.", setupLink: "ब्रँड किट भरा →",
      askLabel: "कोणते कार्ड हवे? (ऐच्छिक)", askPlaceholder: "दिवाळीचे कार्ड बनवा", occasion: "प्रसंग", ownHeading: "किंवा स्वतःचे शीर्षक लिहा",
      cardLanguage: "कार्डची भाषा", hintRemembered: "मागच्या वेळची निवडलेली भाषा. केव्हाही बदलता येते.", hintCustomers: "तुमचे बहुतेक ग्राहक हीच भाषा बोलतात. केव्हाही बदलता येते.", hintApp: "तुमच्या ॲपच्या भाषेपासून सुरू होते. केव्हाही बदलता येते.",
      offerLabel: "ऑफर किंवा संदेश (ऐच्छिक)", offerPlaceholder: "रविवारपर्यंत १५% सूट",
      everyLanguage: "माझ्या ग्राहकांच्या प्रत्येक भाषेत कार्ड बनवा", everyLanguageHelp: "प्रत्येक ग्राहकाला त्यांच्या स्वतःच्या भाषेत कार्ड मिळेल. तुमची ऑफर आपोआप भाषांतरित होते, म्हणून पाठवण्यापूर्वी प्रत्येक कार्ड पाहा.",
      picture: "शब्दांमागे सणाचे चित्र लावा", pictureHelp: "महिन्याच्या AI चित्रांपैकी 1 वापरले जाईल. शब्द नेहमी Sendkar लिहितो, त्यामुळे ते कधीही चुकीचे नसतात.",
      noLogo: "अजून लोगो नाही.", addLogo: "तुमचा लोगो जोडा", noLogoTail: "म्हणजे तो प्रत्येक कार्डवर येईल.",
      make: "कार्ड बनवा", makeAgain: "पुन्हा बनवा", making: "तुमचे कार्ड बनत आहे…", placeholder: "तुमचे कार्ड इथे दिसेल.",
      send: "माझ्या ग्राहकांना पाठवा", download: "डाउनलोड करा", picturesLeft: "या महिन्यात {n} AI चित्रे शिल्लक आहेत",
    },
    report: {
      finished: "पाठवणे पूर्ण झाले", sending: "आत्ता पाठवत आहे…", paused: "थांबवले आहे", ready: "पाठवण्यास तयार", percentDone: "{n}% पूर्ण",
      gotIt: "{total} पैकी {n} जणांना तुमचा संदेश मिळाला", andRead: "आणि {n} जणांनी तो वाचला आहे", toGo: "{n} जणांना पाठवायचे बाकी आहे.", waiting: "{n} जण पाठवण्याची वाट पाहत आहेत.",
      optedOut: "{n} जणांनी संदेश थांबवण्यास सांगितले होते.", notOnWhatsApp: "{n} जण WhatsApp वर नाहीत, किंवा हा संदेश मिळवू शकत नाहीत.",
      noPhone: "{n} जणांचा फोन नंबर सेव्ह नाही.", needsPicture: "{n} जणांना पाठवता आले नाही, कारण संदेशासाठी चित्र हवे आहे.",
      limit: "{n} जणांना WhatsApp च्या पाठवण्याच्या मर्यादेने थांबवले.", other: "{n} जणांना दुसऱ्या कारणाने पाठवता आले नाही.",
    },
    permission: {
      title: "परवानगी मिळवा",
      intro: "जे ग्राहक स्वतः होय म्हणतात, त्यांना संदेश पाठवणे सर्वात चांगले: ते तुमच्या ऑफर्स वाचतात आणि क्वचितच तक्रार करतात. पोस्टर तुमच्या काउंटरवर लावा. ग्राहक ते स्कॅन करतो, आपला नंबर टाकतो, बॉक्सवर टिक करतो, आणि सहमतीच्या तारखेसह तुमच्या यादीत जोडला जातो.",
      agreedLabel: "ज्या ग्राहकांनी स्वतः सहमती दिली", ofContacts: "एकूण {n} संपर्कांपैकी",
      createIntro: "तुमची स्वतःची लिंक एकदा बनवा. ती शेअर करणे सुरक्षित आहे: त्यामुळे कोणीही फक्त स्वतःचा नंबर तुमच्या यादीत जोडू शकतो.", create: "माझी लिंक आणि पोस्टर बनवा", creating: "बनत आहे…",
      yourLink: "तुमची लिंक", copy: "कॉपी करा", copied: "कॉपी झाले", linkHelp: "ती तुमच्या WhatsApp स्टेटसवर, दुकानाच्या फलकावर किंवा बिलांवर टाका.",
      posterTitle: "काउंटरचे पोस्टर प्रिंट करा", posterHelp: "तुमचा ब्रँड किट वापरला जातो. पोस्टरवरील आणि ग्राहकाला दिसणाऱ्या पानावरील शब्द तुम्ही निवडलेल्या भाषेत असतात.",
      footnote: "तुमच्याकडे आधीपासून असलेल्या ग्राहकांमध्ये कोणताही बदल होत नाही. ज्याने आधी संदेश थांबवण्यास सांगितले होते तो आता पोस्टर स्कॅन करून बॉक्सवर टिक करतो, तर त्याला परत जोडले जाते, कारण ती त्याची स्वतःची नवीन संमती आहे.",
    },
    brand: {
      title: "ब्रँड किट", intro: "हे एकदा भरा. तुम्ही बनवलेल्या प्रत्येक सणाच्या, ऑफरच्या आणि आभार कार्डवर तुमचे नाव, लोगो आणि रंग आपोआप येतील, ज्यांना पाठवत आहात त्यांच्या भाषेत.",
      shopName: "दुकान किंवा व्यवसायाचे नाव", namesTitle: "प्रत्येक भाषेत तुमचे नाव", namesHelp: "ऐच्छिक. गुजराती कार्ड पाठवताना गुजराती नाव दिसेल. एखादी भाषा रिकामी ठेवली तर वरचे नाव वापरले जाईल.",
      logo: "लोगो", logoHelp: "तीन मार्ग: तुमचा अपलोड करा, तुमच्या वेबसाइटवरून घ्या, किंवा तुमच्या नावावरून साधा लोगो बनवा.",
      upload: "लोगो अपलोड करा", uploadAnother: "दुसरा लोगो अपलोड करा", uploading: "अपलोड होत आहे…", fromWebsite: "माझ्या वेबसाइटवरून घ्या", looking: "शोधत आहे…",
      makeOne: "लोगो नाही? बनवा:", makeLogo: "माझा लोगो बनवा", making: "बनत आहे…",
      mainColour: "मुख्य रंग", highlightColour: "ठळक रंग", tagline: "टॅगलाइन (ऐच्छिक)", phone: "कार्डवर दिसणारा फोन नंबर", website: "वेबसाइट (ऐच्छिक)", address: "पत्ता किंवा परिसर (ऐच्छिक)",
      save: "ब्रँड किट सेव्ह करा", saving: "सेव्ह होत आहे…", saved: "सेव्ह झाले. आता याने कार्ड बनवा.",
    },
  },
  ta: {
    cards: {
      title: "கார்டு உருவாக்கு", intro: "ஒரு பண்டிகையைத் தேர்ந்தெடுக்கவும் அல்லது உங்கள் செய்தியை எழுதவும். உங்கள் பெயர், லோகோ, நிறங்கள் தானாகச் சேரும், நீங்கள் தேர்ந்த மொழியில்.",
      comingUp: "வரப்போகும் பண்டிகைகள்", confirmDay: "நாளை உங்கள் நாட்காட்டியில் உறுதி செய்யவும்", today: "இன்று", tomorrow: "நாளை", inDays: "{n} நாட்களில்",
      stageNow: "இப்போதே வாழ்த்து அனுப்புங்கள்", stageSoon: "உங்கள் கார்டை தயாராக வையுங்கள்", stageLater: "முன்கூட்டியே திட்டமிடுங்கள்",
      setupFirst: "முதலில் உங்கள் பிராண்ட் கிட்டை நிரப்புங்கள், அப்போது ஒவ்வொரு கார்டிலும் உங்கள் பெயரும் லோகோவும் வரும்.", setupLink: "பிராண்ட் கிட் நிரப்பு →",
      askLabel: "என்ன கார்டு வேண்டும்? (விருப்பம்)", askPlaceholder: "தீபாவளி கார்டு உருவாக்கு", occasion: "சந்தர்ப்பம்", ownHeading: "அல்லது உங்கள் தலைப்பை எழுதுங்கள்",
      cardLanguage: "கார்டின் மொழி", hintRemembered: "கடந்த முறை தேர்ந்த மொழி. எப்போது வேண்டுமானாலும் மாற்றலாம்.", hintCustomers: "உங்கள் வாடிக்கையாளர்களில் பெரும்பாலானோர் இந்த மொழி பேசுகிறார்கள். எப்போது வேண்டுமானாலும் மாற்றலாம்.", hintApp: "உங்கள் ஆப்பின் மொழியில் தொடங்கும். எப்போது வேண்டுமானாலும் மாற்றலாம்.",
      offerLabel: "சலுகை அல்லது செய்தி (விருப்பம்)", offerPlaceholder: "ஞாயிறு வரை 15% தள்ளுபடி",
      everyLanguage: "என் வாடிக்கையாளர்கள் பேசும் ஒவ்வொரு மொழியிலும் கார்டு உருவாக்கு", everyLanguageHelp: "ஒவ்வொரு வாடிக்கையாளருக்கும் அவர்களின் சொந்த மொழியில் கார்டு கிடைக்கும். உங்கள் சலுகை தானாக மொழிபெயர்க்கப்படுகிறது, அதனால் அனுப்பும் முன் ஒவ்வொரு கார்டையும் பாருங்கள்.",
      picture: "வார்த்தைகளுக்குப் பின்னால் பண்டிகைப் படம் சேர்", pictureHelp: "மாதத்தின் AI படங்களில் 1 பயன்படுத்தப்படும். வார்த்தைகளை எப்போதும் Sendkar எழுதுகிறது, அதனால் அவை தவறாகாது.",
      noLogo: "இன்னும் லோகோ இல்லை.", addLogo: "உங்கள் லோகோவைச் சேருங்கள்", noLogoTail: "அது ஒவ்வொரு கார்டிலும் வர.",
      make: "கார்டு உருவாக்கு", makeAgain: "மீண்டும் உருவாக்கு", making: "உங்கள் கார்டு உருவாகிறது…", placeholder: "உங்கள் கார்டு இங்கே தெரியும்.",
      send: "என் வாடிக்கையாளர்களுக்கு அனுப்பு", download: "பதிவிறக்கு", picturesLeft: "இந்த மாதம் {n} AI படங்கள் மீதம் உள்ளன",
    },
    report: {
      finished: "அனுப்பி முடிந்தது", sending: "இப்போது அனுப்புகிறது…", paused: "நிறுத்தப்பட்டது", ready: "அனுப்ப தயார்", percentDone: "{n}% முடிந்தது",
      gotIt: "{total} பேரில் {n} பேருக்கு உங்கள் செய்தி கிடைத்தது", andRead: "{n} பேர் படித்துள்ளனர்", toGo: "{n} பேருக்கு இன்னும் அனுப்ப வேண்டும்.", waiting: "{n} பேர் அனுப்பப்படக் காத்திருக்கிறார்கள்.",
      optedOut: "{n} பேர் செய்திகளை நிறுத்தச் சொன்னார்கள்.", notOnWhatsApp: "{n} பேர் WhatsApp-இல் இல்லை, அல்லது இந்தச் செய்தியைப் பெற முடியாது.",
      noPhone: "{n} பேரின் தொலைபேசி எண் சேமிக்கப்படவில்லை.", needsPicture: "செய்திக்குப் படம் தேவை என்பதால் {n} பேருக்கு அனுப்ப முடியவில்லை.",
      limit: "{n} பேரை WhatsApp-இன் அனுப்பும் வரம்பு தடுத்தது.", other: "{n} பேருக்கு வேறு காரணத்தால் அனுப்ப முடியவில்லை.",
    },
    permission: {
      title: "அனுமதி பெறுங்கள்",
      intro: "தாங்களாகவே சம்மதம் சொல்லும் வாடிக்கையாளர்களுக்குச் செய்தி அனுப்புவதே சிறந்தது: அவர்கள் உங்கள் சலுகைகளைப் படிப்பார்கள், அரிதாகவே புகார் செய்வார்கள். போஸ்டரை உங்கள் கவுண்டரில் ஒட்டுங்கள். வாடிக்கையாளர் அதை ஸ்கேன் செய்து, எண்ணை உள்ளிட்டு, பெட்டியில் டிக் செய்தால், சம்மதம் சொன்ன தேதியுடன் உங்கள் பட்டியலில் சேர்க்கப்படுவார்.",
      agreedLabel: "தாங்களாகவே சம்மதித்த வாடிக்கையாளர்கள்", ofContacts: "மொத்தம் {n} தொடர்புகளில்",
      createIntro: "உங்கள் சொந்த இணைப்பை ஒருமுறை உருவாக்குங்கள். இதைப் பகிர்வது பாதுகாப்பானது: இது ஒருவர் தன் எண்ணை மட்டுமே உங்கள் பட்டியலில் சேர்க்க அனுமதிக்கும்.", create: "என் இணைப்பையும் போஸ்டரையும் உருவாக்கு", creating: "உருவாகிறது…",
      yourLink: "உங்கள் இணைப்பு", copy: "நகலெடு", copied: "நகலெடுக்கப்பட்டது", linkHelp: "இதை உங்கள் WhatsApp ஸ்டேட்டஸ், கடை பலகை அல்லது பில்களில் போடுங்கள்.",
      posterTitle: "கவுண்டர் போஸ்டரை அச்சிடுங்கள்", posterHelp: "உங்கள் பிராண்ட் கிட் பயன்படுத்தப்படும். போஸ்டரிலும் வாடிக்கையாளர் பார்க்கும் பக்கத்திலும் உள்ள வார்த்தைகள் நீங்கள் தேர்ந்த மொழியில் இருக்கும்.",
      footnote: "ஏற்கெனவே உங்களிடம் உள்ள வாடிக்கையாளர்கள் மாற்றப்படமாட்டார்கள். முன்பு நிறுத்தச் சொன்ன ஒருவர் இப்போது போஸ்டரை ஸ்கேன் செய்து பெட்டியில் டிக் செய்தால், அவர் மீண்டும் சேர்க்கப்படுவார், ஏனெனில் அது அவரது புதிய சம்மதம்.",
    },
    brand: {
      title: "பிராண்ட் கிட்", intro: "இதை ஒருமுறை நிரப்புங்கள். நீங்கள் உருவாக்கும் ஒவ்வொரு பண்டிகை, சலுகை, நன்றி கார்டிலும் உங்கள் பெயர், லோகோ, நிறங்கள் தானாக வரும், நீங்கள் அனுப்புபவர்களின் மொழியில்.",
      shopName: "கடை அல்லது தொழிலின் பெயர்", namesTitle: "ஒவ்வொரு மொழியிலும் உங்கள் பெயர்", namesHelp: "விருப்பம். குஜராத்தி கார்டு அனுப்பும்போது குஜராத்திப் பெயர் தெரியும். ஒரு மொழியை காலியாக விட்டால் மேலே உள்ள பெயர் பயன்படுத்தப்படும்.",
      logo: "லோகோ", logoHelp: "மூன்று வழிகள்: உங்களுடையதைப் பதிவேற்றுங்கள், உங்கள் இணையதளத்திலிருந்து எடுங்கள், அல்லது உங்கள் பெயரிலிருந்து எளிய ஒன்றை உருவாக்குங்கள்.",
      upload: "லோகோ பதிவேற்று", uploadAnother: "வேறு லோகோ பதிவேற்று", uploading: "பதிவேற்றுகிறது…", fromWebsite: "என் இணையதளத்திலிருந்து எடு", looking: "தேடுகிறது…",
      makeOne: "லோகோ இல்லையா? உருவாக்குங்கள்:", makeLogo: "என் லோகோவை உருவாக்கு", making: "உருவாகிறது…",
      mainColour: "முக்கிய நிறம்", highlightColour: "அழுத்த நிறம்", tagline: "டேக்லைன் (விருப்பம்)", phone: "கார்டில் காட்டப்படும் தொலைபேசி எண்", website: "இணையதளம் (விருப்பம்)", address: "முகவரி அல்லது பகுதி (விருப்பம்)",
      save: "பிராண்ட் கிட் சேமி", saving: "சேமிக்கிறது…", saved: "சேமிக்கப்பட்டது. இப்போது இதைக் கொண்டு கார்டு உருவாக்குங்கள்.",
    },
  },
  te: {
    cards: {
      title: "కార్డ్ తయారు చేయండి", intro: "పండుగను ఎంచుకోండి లేదా మీ సందేశం రాయండి. మీ పేరు, లోగో, రంగులు మీరు ఎంచుకున్న భాషలో ఆటోమేటిక్‌గా చేరతాయి.",
      comingUp: "రాబోయే పండుగలు", confirmDay: "తేదీని మీ క్యాలెండర్‌లో సరిచూసుకోండి", today: "ఈ రోజు", tomorrow: "రేపు", inDays: "{n} రోజుల్లో",
      stageNow: "ఇప్పుడే శుభాకాంక్షలు పంపండి", stageSoon: "మీ కార్డ్ సిద్ధం చేసుకోండి", stageLater: "ముందుగా ప్లాన్ చేయండి",
      setupFirst: "ముందుగా మీ బ్రాండ్ కిట్ నింపండి, అప్పుడు ప్రతి కార్డ్‌పై మీ పేరు, లోగో ఉంటాయి.", setupLink: "బ్రాండ్ కిట్ నింపండి →",
      askLabel: "ఏ కార్డ్ కావాలి? (ఐచ్ఛికం)", askPlaceholder: "దీపావళి కార్డ్ తయారు చేయి", occasion: "సందర్భం", ownHeading: "లేదా మీ స్వంత శీర్షిక రాయండి",
      cardLanguage: "కార్డ్ భాష", hintRemembered: "గత సారి ఎంచుకున్న భాష. ఎప్పుడైనా మార్చవచ్చు.", hintCustomers: "మీ కస్టమర్లలో ఎక్కువమంది ఈ భాష మాట్లాడతారు. ఎప్పుడైనా మార్చవచ్చు.", hintApp: "మీ యాప్ భాషతో మొదలవుతుంది. ఎప్పుడైనా మార్చవచ్చు.",
      offerLabel: "ఆఫర్ లేదా సందేశం (ఐచ్ఛికం)", offerPlaceholder: "ఆదివారం వరకు 15% తగ్గింపు",
      everyLanguage: "నా కస్టమర్లు మాట్లాడే ప్రతి భాషలో కార్డ్ తయారు చేయి", everyLanguageHelp: "ప్రతి కస్టమర్‌కు వారి స్వంత భాషలో కార్డ్ వస్తుంది. మీ ఆఫర్ ఆటోమేటిక్‌గా అనువదించబడుతుంది, కాబట్టి పంపే ముందు ప్రతి కార్డ్‌ను చూడండి.",
      picture: "అక్షరాల వెనుక పండుగ చిత్రం జోడించండి", pictureHelp: "నెలవారీ AI చిత్రాలలో 1 వాడబడుతుంది. అక్షరాలను ఎల్లప్పుడూ Sendkar రాస్తుంది, కాబట్టి అవి తప్పు కావు.",
      noLogo: "ఇంకా లోగో లేదు.", addLogo: "మీ లోగో జోడించండి", noLogoTail: "అది ప్రతి కార్డ్‌పై ఉండేలా.",
      make: "కార్డ్ తయారు చేయండి", makeAgain: "మళ్ళీ తయారు చేయండి", making: "మీ కార్డ్ తయారవుతోంది…", placeholder: "మీ కార్డ్ ఇక్కడ కనిపిస్తుంది.",
      send: "నా కస్టమర్లకు పంపండి", download: "డౌన్‌లోడ్", picturesLeft: "ఈ నెల {n} AI చిత్రాలు మిగిలి ఉన్నాయి",
    },
    report: {
      finished: "పంపడం పూర్తయింది", sending: "ఇప్పుడు పంపుతోంది…", paused: "ఆపబడింది", ready: "పంపడానికి సిద్ధం", percentDone: "{n}% పూర్తి",
      gotIt: "{total} మందిలో {n} మందికి మీ సందేశం అందింది", andRead: "{n} మంది చదివారు", toGo: "{n} మందికి ఇంకా పంపాలి.", waiting: "{n} మంది పంపబడటానికి వేచి ఉన్నారు.",
      optedOut: "{n} మంది సందేశాలు ఆపమని చెప్పారు.", notOnWhatsApp: "{n} మంది WhatsApp లో లేరు, లేదా ఈ సందేశం అందుకోలేరు.",
      noPhone: "{n} మంది ఫోన్ నంబర్ సేవ్ కాలేదు.", needsPicture: "సందేశానికి చిత్రం అవసరం కాబట్టి {n} మందికి పంపలేకపోయాం.",
      limit: "{n} మందిని WhatsApp పంపే పరిమితి ఆపింది.", other: "{n} మందికి వేరే కారణంతో పంపలేకపోయాం.",
    },
    permission: {
      title: "అనుమతి పొందండి",
      intro: "తామే అవును అని చెప్పిన కస్టమర్లకు సందేశం పంపడం ఉత్తమం: వారు మీ ఆఫర్లు చదువుతారు, అరుదుగా ఫిర్యాదు చేస్తారు. పోస్టర్‌ను మీ కౌంటర్‌పై పెట్టండి. కస్టమర్ దాన్ని స్కాన్ చేసి, నంబర్ రాసి, బాక్స్‌ను టిక్ చేస్తే, అంగీకరించిన తేదీతో మీ జాబితాలో చేరతారు.",
      agreedLabel: "తామే అంగీకరించిన కస్టమర్లు", ofContacts: "మొత్తం {n} కాంటాక్ట్‌లలో",
      createIntro: "మీ స్వంత లింక్‌ను ఒకసారి తయారు చేయండి. దీన్ని పంచుకోవడం సురక్షితం: ఇది ఒకరు తమ నంబర్‌ను మాత్రమే మీ జాబితాలో చేర్చుకోవడానికి అనుమతిస్తుంది.", create: "నా లింక్, పోస్టర్ తయారు చేయి", creating: "తయారవుతోంది…",
      yourLink: "మీ లింక్", copy: "కాపీ", copied: "కాపీ అయింది", linkHelp: "దీన్ని మీ WhatsApp స్టేటస్‌లో, షాపు బోర్డుపై లేదా బిల్లులపై పెట్టండి.",
      posterTitle: "కౌంటర్ పోస్టర్ ప్రింట్ చేయండి", posterHelp: "మీ బ్రాండ్ కిట్ వాడబడుతుంది. పోస్టర్‌పై, కస్టమర్ చూసే పేజీలో అక్షరాలు మీరు ఎంచుకున్న భాషలో ఉంటాయి.",
      footnote: "ఇప్పటికే మీ దగ్గర ఉన్న కస్టమర్లలో ఏ మార్పూ ఉండదు. ఇంతకు ముందు ఆపమని చెప్పిన వారు ఇప్పుడు పోస్టర్ స్కాన్ చేసి బాక్స్‌ను టిక్ చేస్తే, వారు మళ్ళీ చేరతారు, ఎందుకంటే అది వారి కొత్త అంగీకారం.",
    },
    brand: {
      title: "బ్రాండ్ కిట్", intro: "దీన్ని ఒకసారి నింపండి. మీరు తయారు చేసే ప్రతి పండుగ, ఆఫర్, ధన్యవాద కార్డ్‌పై మీ పేరు, లోగో, రంగులు ఆటోమేటిక్‌గా వస్తాయి, మీరు పంపేవారి భాషలో.",
      shopName: "షాపు లేదా వ్యాపారం పేరు", namesTitle: "ప్రతి భాషలో మీ పేరు", namesHelp: "ఐచ్ఛికం. గుజరాతీ కార్డ్ పంపినప్పుడు గుజరాతీ పేరు కనిపిస్తుంది. ఏదైనా భాషను ఖాళీగా వదిలితే పైన ఉన్న పేరు వాడబడుతుంది.",
      logo: "లోగో", logoHelp: "మూడు మార్గాలు: మీది అప్‌లోడ్ చేయండి, మీ వెబ్‌సైట్ నుండి తీసుకోండి, లేదా మీ పేరుతో సాధారణమైనది తయారు చేయండి.",
      upload: "లోగో అప్‌లోడ్ చేయండి", uploadAnother: "వేరే లోగో అప్‌లోడ్ చేయండి", uploading: "అప్‌లోడ్ అవుతోంది…", fromWebsite: "నా వెబ్‌సైట్ నుండి తీసుకో", looking: "వెతుకుతోంది…",
      makeOne: "లోగో లేదా? తయారు చేయండి:", makeLogo: "నా లోగో తయారు చేయి", making: "తయారవుతోంది…",
      mainColour: "ప్రధాన రంగు", highlightColour: "హైలైట్ రంగు", tagline: "ట్యాగ్‌లైన్ (ఐచ్ఛికం)", phone: "కార్డ్‌పై చూపే ఫోన్ నంబర్", website: "వెబ్‌సైట్ (ఐచ్ఛికం)", address: "చిరునామా లేదా ప్రాంతం (ఐచ్ఛికం)",
      save: "బ్రాండ్ కిట్ సేవ్ చేయండి", saving: "సేవ్ అవుతోంది…", saved: "సేవ్ అయింది. ఇప్పుడు దీనితో కార్డ్ తయారు చేయండి.",
    },
  },
  kn: {
    cards: {
      title: "ಕಾರ್ಡ್ ಮಾಡಿ", intro: "ಹಬ್ಬವನ್ನು ಆರಿಸಿ ಅಥವಾ ನಿಮ್ಮ ಸಂದೇಶ ಬರೆಯಿರಿ. ನಿಮ್ಮ ಹೆಸರು, ಲೋಗೋ, ಬಣ್ಣಗಳು ನೀವು ಆರಿಸಿದ ಭಾಷೆಯಲ್ಲಿ ತಾನಾಗಿಯೇ ಸೇರುತ್ತವೆ.",
      comingUp: "ಮುಂಬರುವ ಹಬ್ಬಗಳು", confirmDay: "ದಿನಾಂಕವನ್ನು ನಿಮ್ಮ ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ", today: "ಇಂದು", tomorrow: "ನಾಳೆ", inDays: "{n} ದಿನಗಳಲ್ಲಿ",
      stageNow: "ಈಗಲೇ ಶುಭಾಶಯ ಕಳುಹಿಸಿ", stageSoon: "ನಿಮ್ಮ ಕಾರ್ಡ್ ಸಿದ್ಧವಾಗಿಡಿ", stageLater: "ಮೊದಲೇ ಯೋಜಿಸಿ",
      setupFirst: "ಮೊದಲು ನಿಮ್ಮ ಬ್ರ್ಯಾಂಡ್ ಕಿಟ್ ತುಂಬಿ, ಆಗ ಪ್ರತಿ ಕಾರ್ಡ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಲೋಗೋ ಬರುತ್ತದೆ.", setupLink: "ಬ್ರ್ಯಾಂಡ್ ಕಿಟ್ ತುಂಬಿ →",
      askLabel: "ಯಾವ ಕಾರ್ಡ್ ಬೇಕು? (ಐಚ್ಛಿಕ)", askPlaceholder: "ದೀಪಾವಳಿ ಕಾರ್ಡ್ ಮಾಡಿ", occasion: "ಸಂದರ್ಭ", ownHeading: "ಅಥವಾ ನಿಮ್ಮದೇ ಶೀರ್ಷಿಕೆ ಬರೆಯಿರಿ",
      cardLanguage: "ಕಾರ್ಡ್‌ನ ಭಾಷೆ", hintRemembered: "ಕಳೆದ ಬಾರಿ ಆರಿಸಿದ ಭಾಷೆ. ಯಾವಾಗ ಬೇಕಾದರೂ ಬದಲಾಯಿಸಬಹುದು.", hintCustomers: "ನಿಮ್ಮ ಹೆಚ್ಚಿನ ಗ್ರಾಹಕರು ಈ ಭಾಷೆ ಮಾತನಾಡುತ್ತಾರೆ. ಯಾವಾಗ ಬೇಕಾದರೂ ಬದಲಾಯಿಸಬಹುದು.", hintApp: "ನಿಮ್ಮ ಆ್ಯಪ್‌ನ ಭಾಷೆಯಿಂದ ಶುರುವಾಗುತ್ತದೆ. ಯಾವಾಗ ಬೇಕಾದರೂ ಬದಲಾಯಿಸಬಹುದು.",
      offerLabel: "ಆಫರ್ ಅಥವಾ ಸಂದೇಶ (ಐಚ್ಛಿಕ)", offerPlaceholder: "ಭಾನುವಾರದವರೆಗೆ 15% ರಿಯಾಯಿತಿ",
      everyLanguage: "ನನ್ನ ಗ್ರಾಹಕರು ಮಾತನಾಡುವ ಪ್ರತಿ ಭಾಷೆಯಲ್ಲೂ ಕಾರ್ಡ್ ಮಾಡಿ", everyLanguageHelp: "ಪ್ರತಿ ಗ್ರಾಹಕರಿಗೆ ಅವರ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ ಕಾರ್ಡ್ ಸಿಗುತ್ತದೆ. ನಿಮ್ಮ ಆಫರ್ ತಾನಾಗಿ ಅನುವಾದವಾಗುತ್ತದೆ, ಆದ್ದರಿಂದ ಕಳುಹಿಸುವ ಮೊದಲು ಪ್ರತಿ ಕಾರ್ಡ್ ನೋಡಿ.",
      picture: "ಅಕ್ಷರಗಳ ಹಿಂದೆ ಹಬ್ಬದ ಚಿತ್ರ ಸೇರಿಸಿ", pictureHelp: "ತಿಂಗಳ AI ಚಿತ್ರಗಳಲ್ಲಿ 1 ಬಳಕೆಯಾಗುತ್ತದೆ. ಅಕ್ಷರಗಳನ್ನು ಯಾವಾಗಲೂ Sendkar ಬರೆಯುತ್ತದೆ, ಆದ್ದರಿಂದ ಅವು ತಪ್ಪಾಗುವುದಿಲ್ಲ.",
      noLogo: "ಇನ್ನೂ ಲೋಗೋ ಇಲ್ಲ.", addLogo: "ನಿಮ್ಮ ಲೋಗೋ ಸೇರಿಸಿ", noLogoTail: "ಅದು ಪ್ರತಿ ಕಾರ್ಡ್‌ನಲ್ಲಿ ಬರಲು.",
      make: "ಕಾರ್ಡ್ ಮಾಡಿ", makeAgain: "ಮತ್ತೆ ಮಾಡಿ", making: "ನಿಮ್ಮ ಕಾರ್ಡ್ ತಯಾರಾಗುತ್ತಿದೆ…", placeholder: "ನಿಮ್ಮ ಕಾರ್ಡ್ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.",
      send: "ನನ್ನ ಗ್ರಾಹಕರಿಗೆ ಕಳುಹಿಸಿ", download: "ಡೌನ್‌ಲೋಡ್", picturesLeft: "ಈ ತಿಂಗಳು {n} AI ಚಿತ್ರಗಳು ಉಳಿದಿವೆ",
    },
    report: {
      finished: "ಕಳುಹಿಸುವುದು ಮುಗಿಯಿತು", sending: "ಈಗ ಕಳುಹಿಸುತ್ತಿದೆ…", paused: "ನಿಲ್ಲಿಸಲಾಗಿದೆ", ready: "ಕಳುಹಿಸಲು ಸಿದ್ಧ", percentDone: "{n}% ಮುಗಿದಿದೆ",
      gotIt: "{total} ಜನರಲ್ಲಿ {n} ಜನರಿಗೆ ನಿಮ್ಮ ಸಂದೇಶ ಸಿಕ್ಕಿದೆ", andRead: "{n} ಜನ ಓದಿದ್ದಾರೆ", toGo: "{n} ಜನರಿಗೆ ಇನ್ನೂ ಕಳುಹಿಸಬೇಕು.", waiting: "{n} ಜನ ಕಳುಹಿಸಲು ಕಾಯುತ್ತಿದ್ದಾರೆ.",
      optedOut: "{n} ಜನ ಸಂದೇಶ ನಿಲ್ಲಿಸಲು ಹೇಳಿದ್ದರು.", notOnWhatsApp: "{n} ಜನ WhatsApp ನಲ್ಲಿ ಇಲ್ಲ, ಅಥವಾ ಈ ಸಂದೇಶ ಪಡೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ.",
      noPhone: "{n} ಜನರ ಫೋನ್ ಸಂಖ್ಯೆ ಉಳಿಸಿಲ್ಲ.", needsPicture: "ಸಂದೇಶಕ್ಕೆ ಚಿತ್ರ ಬೇಕಾಗಿರುವುದರಿಂದ {n} ಜನರಿಗೆ ಕಳುಹಿಸಲಾಗಲಿಲ್ಲ.",
      limit: "{n} ಜನರನ್ನು WhatsApp ನ ಕಳುಹಿಸುವ ಮಿತಿ ತಡೆಯಿತು.", other: "{n} ಜನರಿಗೆ ಬೇರೆ ಕಾರಣದಿಂದ ಕಳುಹಿಸಲಾಗಲಿಲ್ಲ.",
    },
    permission: {
      title: "ಅನುಮತಿ ಪಡೆಯಿರಿ",
      intro: "ತಾವೇ ಹೌದು ಎಂದು ಹೇಳಿದ ಗ್ರಾಹಕರಿಗೆ ಸಂದೇಶ ಕಳುಹಿಸುವುದು ಉತ್ತಮ: ಅವರು ನಿಮ್ಮ ಆಫರ್‌ಗಳನ್ನು ಓದುತ್ತಾರೆ, ಅಪರೂಪಕ್ಕೆ ದೂರು ನೀಡುತ್ತಾರೆ. ಪೋಸ್ಟರ್ ಅನ್ನು ನಿಮ್ಮ ಕೌಂಟರ್‌ನಲ್ಲಿ ಹಾಕಿ. ಗ್ರಾಹಕರು ಅದನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ, ಸಂಖ್ಯೆ ಬರೆದು, ಬಾಕ್ಸ್ ಟಿಕ್ ಮಾಡಿದರೆ, ಒಪ್ಪಿದ ದಿನಾಂಕದೊಂದಿಗೆ ನಿಮ್ಮ ಪಟ್ಟಿಗೆ ಸೇರುತ್ತಾರೆ.",
      agreedLabel: "ತಾವೇ ಒಪ್ಪಿದ ಗ್ರಾಹಕರು", ofContacts: "ಒಟ್ಟು {n} ಸಂಪರ್ಕಗಳಲ್ಲಿ",
      createIntro: "ನಿಮ್ಮ ಸ್ವಂತ ಲಿಂಕ್ ಅನ್ನು ಒಮ್ಮೆ ಮಾಡಿ. ಇದನ್ನು ಹಂಚುವುದು ಸುರಕ್ಷಿತ: ಇದು ಒಬ್ಬರು ತಮ್ಮ ಸಂಖ್ಯೆಯನ್ನು ಮಾತ್ರ ನಿಮ್ಮ ಪಟ್ಟಿಗೆ ಸೇರಿಸಲು ಅವಕಾಶ ಕೊಡುತ್ತದೆ.", create: "ನನ್ನ ಲಿಂಕ್ ಮತ್ತು ಪೋಸ್ಟರ್ ಮಾಡಿ", creating: "ತಯಾರಾಗುತ್ತಿದೆ…",
      yourLink: "ನಿಮ್ಮ ಲಿಂಕ್", copy: "ನಕಲಿಸಿ", copied: "ನಕಲಾಯಿತು", linkHelp: "ಇದನ್ನು ನಿಮ್ಮ WhatsApp ಸ್ಟೇಟಸ್, ಅಂಗಡಿ ಬೋರ್ಡ್ ಅಥವಾ ಬಿಲ್‌ಗಳಲ್ಲಿ ಹಾಕಿ.",
      posterTitle: "ಕೌಂಟರ್ ಪೋಸ್ಟರ್ ಪ್ರಿಂಟ್ ಮಾಡಿ", posterHelp: "ನಿಮ್ಮ ಬ್ರ್ಯಾಂಡ್ ಕಿಟ್ ಬಳಕೆಯಾಗುತ್ತದೆ. ಪೋಸ್ಟರ್‌ನಲ್ಲಿ ಮತ್ತು ಗ್ರಾಹಕರು ನೋಡುವ ಪುಟದಲ್ಲಿ ಅಕ್ಷರಗಳು ನೀವು ಆರಿಸಿದ ಭಾಷೆಯಲ್ಲಿರುತ್ತವೆ.",
      footnote: "ಈಗಾಗಲೇ ನಿಮ್ಮ ಬಳಿ ಇರುವ ಗ್ರಾಹಕರಲ್ಲಿ ಯಾವುದೇ ಬದಲಾವಣೆ ಆಗುವುದಿಲ್ಲ. ಈ ಮೊದಲು ನಿಲ್ಲಿಸಲು ಹೇಳಿದವರು ಈಗ ಪೋಸ್ಟರ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಬಾಕ್ಸ್ ಟಿಕ್ ಮಾಡಿದರೆ, ಅವರನ್ನು ಮತ್ತೆ ಸೇರಿಸಲಾಗುತ್ತದೆ, ಏಕೆಂದರೆ ಅದು ಅವರ ಹೊಸ ಒಪ್ಪಿಗೆ.",
    },
    brand: {
      title: "ಬ್ರ್ಯಾಂಡ್ ಕಿಟ್", intro: "ಇದನ್ನು ಒಮ್ಮೆ ತುಂಬಿ. ನೀವು ಮಾಡುವ ಪ್ರತಿ ಹಬ್ಬ, ಆಫರ್, ಧನ್ಯವಾದ ಕಾರ್ಡ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು, ಲೋಗೋ, ಬಣ್ಣಗಳು ತಾನಾಗಿ ಬರುತ್ತವೆ, ನೀವು ಕಳುಹಿಸುವವರ ಭಾಷೆಯಲ್ಲಿ.",
      shopName: "ಅಂಗಡಿ ಅಥವಾ ವ್ಯವಹಾರದ ಹೆಸರು", namesTitle: "ಪ್ರತಿ ಭಾಷೆಯಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು", namesHelp: "ಐಚ್ಛಿಕ. ಗುಜರಾತಿ ಕಾರ್ಡ್ ಕಳುಹಿಸುವಾಗ ಗುಜರಾತಿ ಹೆಸರು ಕಾಣಿಸುತ್ತದೆ. ಯಾವುದಾದರೂ ಭಾಷೆ ಖಾಲಿ ಬಿಟ್ಟರೆ ಮೇಲಿನ ಹೆಸರು ಬಳಕೆಯಾಗುತ್ತದೆ.",
      logo: "ಲೋಗೋ", logoHelp: "ಮೂರು ಮಾರ್ಗಗಳು: ನಿಮ್ಮದನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ನಿಮ್ಮ ವೆಬ್‌ಸೈಟ್‌ನಿಂದ ತೆಗೆದುಕೊಳ್ಳಿ, ಅಥವಾ ನಿಮ್ಮ ಹೆಸರಿನಿಂದ ಸರಳವಾದದ್ದನ್ನು ಮಾಡಿ.",
      upload: "ಲೋಗೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", uploadAnother: "ಬೇರೆ ಲೋಗೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", uploading: "ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ…", fromWebsite: "ನನ್ನ ವೆಬ್‌ಸೈಟ್‌ನಿಂದ ತೆಗೆದುಕೊ", looking: "ಹುಡುಕುತ್ತಿದೆ…",
      makeOne: "ಲೋಗೋ ಇಲ್ಲವೇ? ಮಾಡಿ:", makeLogo: "ನನ್ನ ಲೋಗೋ ಮಾಡಿ", making: "ತಯಾರಾಗುತ್ತಿದೆ…",
      mainColour: "ಮುಖ್ಯ ಬಣ್ಣ", highlightColour: "ಹೈಲೈಟ್ ಬಣ್ಣ", tagline: "ಟ್ಯಾಗ್‌ಲೈನ್ (ಐಚ್ಛಿಕ)", phone: "ಕಾರ್ಡ್‌ನಲ್ಲಿ ಕಾಣುವ ಫೋನ್ ಸಂಖ್ಯೆ", website: "ವೆಬ್‌ಸೈಟ್ (ಐಚ್ಛಿಕ)", address: "ವಿಳಾಸ ಅಥವಾ ಪ್ರದೇಶ (ಐಚ್ಛಿಕ)",
      save: "ಬ್ರ್ಯಾಂಡ್ ಕಿಟ್ ಉಳಿಸಿ", saving: "ಉಳಿಸುತ್ತಿದೆ…", saved: "ಉಳಿಸಲಾಗಿದೆ. ಈಗ ಇದರಿಂದ ಕಾರ್ಡ್ ಮಾಡಿ.",
    },
  },
  gu: {
    cards: {
      title: "કાર્ડ બનાવો", intro: "કોઈ તહેવાર પસંદ કરો અથવા તમારો સંદેશ લખો. તમારું નામ, લોગો અને રંગ આપોઆપ ઉમેરાઈ જશે, તમે પસંદ કરેલી ભાષામાં.",
      comingUp: "આવનારા તહેવારો", confirmDay: "તારીખ તમારા કૅલેન્ડરમાં પાકી કરી લો", today: "આજે", tomorrow: "કાલે", inDays: "{n} દિવસમાં",
      stageNow: "હમણાં જ શુભેચ્છા મોકલો", stageSoon: "તમારું કાર્ડ તૈયાર રાખો", stageLater: "અગાઉથી આયોજન કરો",
      setupFirst: "પહેલા તમારી બ્રાન્ડ કિટ ભરો, જેથી દરેક કાર્ડ પર તમારું નામ અને લોગો આવે.", setupLink: "બ્રાન્ડ કિટ ભરો →",
      askLabel: "કયું કાર્ડ જોઈએ છે? (વૈકલ્પિક)", askPlaceholder: "દિવાળીનું કાર્ડ બનાવો", occasion: "પ્રસંગ", ownHeading: "અથવા તમારું પોતાનું શીર્ષક લખો",
      cardLanguage: "કાર્ડની ભાષા", hintRemembered: "છેલ્લી વખતે પસંદ કરેલી ભાષા. ગમે ત્યારે બદલી શકાય.", hintCustomers: "તમારા મોટાભાગના ગ્રાહકો આ ભાષા બોલે છે. ગમે ત્યારે બદલી શકાય.", hintApp: "તમારી એપની ભાષાથી શરૂ થાય છે. ગમે ત્યારે બદલી શકાય.",
      offerLabel: "ઑફર અથવા સંદેશ (વૈકલ્પિક)", offerPlaceholder: "રવિવાર સુધી 15% છૂટ",
      everyLanguage: "મારા ગ્રાહકો બોલે છે તે દરેક ભાષામાં કાર્ડ બનાવો", everyLanguageHelp: "દરેક ગ્રાહકને તેમની પોતાની ભાષામાં કાર્ડ મળશે. તમારી ઑફરનો આપોઆપ અનુવાદ થાય છે, એટલે મોકલતા પહેલા દરેક કાર્ડ જોઈ લો.",
      picture: "શબ્દોની પાછળ તહેવારનું ચિત્ર ઉમેરો", pictureHelp: "મહિનાના AI ચિત્રોમાંથી 1 વપરાશે. શબ્દો હંમેશા Sendkar લખે છે, એટલે તે ક્યારેય ખોટા નથી થતા.",
      noLogo: "હજી લોગો નથી.", addLogo: "તમારો લોગો ઉમેરો", noLogoTail: "જેથી તે દરેક કાર્ડ પર આવે.",
      make: "કાર્ડ બનાવો", makeAgain: "ફરી બનાવો", making: "તમારું કાર્ડ બની રહ્યું છે…", placeholder: "તમારું કાર્ડ અહીં દેખાશે.",
      send: "મારા ગ્રાહકોને મોકલો", download: "ડાઉનલોડ કરો", picturesLeft: "આ મહિને {n} AI ચિત્રો બાકી છે",
    },
    report: {
      finished: "મોકલવાનું પૂરું થયું", sending: "હમણાં મોકલી રહ્યા છીએ…", paused: "અટકાવ્યું છે", ready: "મોકલવા માટે તૈયાર", percentDone: "{n}% પૂરું",
      gotIt: "{total} માંથી {n} લોકોને તમારો સંદેશ મળ્યો", andRead: "અને {n} લોકોએ વાંચ્યો છે", toGo: "{n} લોકોને હજી મોકલવાનું બાકી છે.", waiting: "{n} લોકો મોકલાવાની રાહ જોઈ રહ્યા છે.",
      optedOut: "{n} લોકોએ સંદેશ બંધ કરવા કહ્યું હતું.", notOnWhatsApp: "{n} લોકો WhatsApp પર નથી, અથવા આ સંદેશ મેળવી શકતા નથી.",
      noPhone: "{n} લોકોનો ફોન નંબર સેવ નથી.", needsPicture: "સંદેશ માટે ચિત્ર જોઈએ, એટલે {n} લોકોને મોકલી શકાયું નહીં.",
      limit: "{n} લોકોને WhatsApp ની મોકલવાની મર્યાદાએ રોક્યા.", other: "{n} લોકોને બીજા કારણથી મોકલી શકાયું નહીં.",
    },
    permission: {
      title: "પરવાનગી મેળવો",
      intro: "જે ગ્રાહકો પોતે હા કહે છે, તેમને સંદેશ મોકલવો સૌથી સારો: તેઓ તમારી ઑફર વાંચે છે અને ભાગ્યે જ ફરિયાદ કરે છે. પોસ્ટર તમારા કાઉન્ટર પર લગાવો. ગ્રાહક તેને સ્કેન કરે છે, પોતાનો નંબર લખે છે, બૉક્સ પર ટિક કરે છે, અને સંમતિની તારીખ સાથે તમારી યાદીમાં ઉમેરાઈ જાય છે.",
      agreedLabel: "જે ગ્રાહકોએ પોતે સંમતિ આપી", ofContacts: "કુલ {n} સંપર્કોમાંથી",
      createIntro: "તમારી પોતાની લિંક એક વાર બનાવો. તેને શેર કરવી સુરક્ષિત છે: તેનાથી કોઈ ફક્ત પોતાનો નંબર તમારી યાદીમાં ઉમેરી શકે છે.", create: "મારી લિંક અને પોસ્ટર બનાવો", creating: "બની રહ્યું છે…",
      yourLink: "તમારી લિંક", copy: "કૉપિ કરો", copied: "કૉપિ થયું", linkHelp: "તેને તમારા WhatsApp સ્ટેટસ, દુકાનના બોર્ડ કે બિલ પર મૂકો.",
      posterTitle: "કાઉન્ટરનું પોસ્ટર પ્રિન્ટ કરો", posterHelp: "તમારી બ્રાન્ડ કિટ વપરાય છે. પોસ્ટર પરના અને ગ્રાહક જે પાનું જુએ છે તેના શબ્દો તમે પસંદ કરેલી ભાષામાં હોય છે.",
      footnote: "જે ગ્રાહકો પહેલેથી તમારી પાસે છે તેમાં કોઈ ફેરફાર થતો નથી. જેણે પહેલા સંદેશ બંધ કરવા કહ્યું હતું તે હવે પોસ્ટર સ્કેન કરીને બૉક્સ પર ટિક કરે, તો તેને પાછા ઉમેરવામાં આવે છે, કારણ કે તે તેની પોતાની નવી હા છે.",
    },
    brand: {
      title: "બ્રાન્ડ કિટ", intro: "આ એક વાર ભરો. તમે બનાવો છો તે દરેક તહેવાર, ઑફર અને આભાર કાર્ડ પર તમારું નામ, લોગો અને રંગ આપોઆપ આવશે, તમે જેમને મોકલો છો તેમની ભાષામાં.",
      shopName: "દુકાન કે ધંધાનું નામ", namesTitle: "દરેક ભાષામાં તમારું નામ", namesHelp: "વૈકલ્પિક. ગુજરાતી કાર્ડ મોકલતી વખતે ગુજરાતી નામ દેખાશે. કોઈ ભાષા ખાલી રાખશો તો ઉપરનું નામ વપરાશે.",
      logo: "લોગો", logoHelp: "ત્રણ રીત: તમારો અપલોડ કરો, તમારી વેબસાઇટ પરથી લો, અથવા તમારા નામ પરથી સાદો લોગો બનાવો.",
      upload: "લોગો અપલોડ કરો", uploadAnother: "બીજો લોગો અપલોડ કરો", uploading: "અપલોડ થઈ રહ્યું છે…", fromWebsite: "મારી વેબસાઇટ પરથી લો", looking: "શોધી રહ્યા છીએ…",
      makeOne: "લોગો નથી? બનાવો:", makeLogo: "મારો લોગો બનાવો", making: "બની રહ્યું છે…",
      mainColour: "મુખ્ય રંગ", highlightColour: "હાઇલાઇટ રંગ", tagline: "ટેગલાઇન (વૈકલ્પિક)", phone: "કાર્ડ પર દેખાતો ફોન નંબર", website: "વેબસાઇટ (વૈકલ્પિક)", address: "સરનામું કે વિસ્તાર (વૈકલ્પિક)",
      save: "બ્રાન્ડ કિટ સેવ કરો", saving: "સેવ થઈ રહ્યું છે…", saved: "સેવ થયું. હવે આનાથી કાર્ડ બનાવો.",
    },
  },
};

export const fillN = (text: string, n: number | string, total?: number | string) =>
  text.replaceAll("{n}", String(n)).replaceAll("{total}", total === undefined ? "" : String(total));
