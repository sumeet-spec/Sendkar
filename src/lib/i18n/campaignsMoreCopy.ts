import type { LanguageCode } from "./dictionaries";

/** Words for the rest of the campaign screens: filters, buttons, recipients, variables and the AI planner. */
export type CampaignsMoreUi = {
  newForm: { cancel: string; cardAlt: string; yourCard: string };
  filters: { search: string; all: string; draft: string; sending: string; paused: string; completed: string };
  actions: { retrying: string; retryFailed: string; duplicating: string; duplicate: string };
  test: { button: string; phone: string; sending: string; send: string; cancel: string; sent: string };
  recipients: {
    all: string; queued: string; sent: string; delivered: string; read: string; failed: string;
    search: string; exportCsv: string; phone: string; name: string; status: string; sentAt: string; error: string;
    none: string; noMatch: string; showing: string; exportFull: string;
  };
  mapping: {
    title: string; hint: string; contactName: string; phone: string; email: string; leave: string; same: string; samePh: string;
    saved: string; save: string; saving: string; locked: string; needText: string;
  };
  ai: {
    title: string; sub: string; placeholder: string; thinking: string; draftPlan: string; planning: string; audience: string; everyone: string;
    segmentSaved: string; saveSegment: string; sendTime: string; templateDraft: string; copied: string; copy: string; pasteBefore: string; templates: string; pasteAfter: string;
  };
};

export const CAMPAIGNS_MORE_UI: Record<LanguageCode, CampaignsMoreUi> = {
  en: {
    newForm: { cancel: "Cancel", cardAlt: "Card in {code}", yourCard: "Your card" },
    filters: { search: "Search campaigns…", all: "All", draft: "Draft", sending: "Sending", paused: "Paused", completed: "Done" },
    actions: { retrying: "Retrying…", retryFailed: "Retry failed ({n})", duplicating: "Duplicating…", duplicate: "Duplicate" },
    test: { button: "Send test message", phone: "Your phone number (with country code)", sending: "Sending…", send: "Send test", cancel: "Cancel", sent: "Sent — check your WhatsApp." },
    recipients: {
      all: "All", queued: "Waiting", sent: "Sent", delivered: "Delivered", read: "Read", failed: "Failed",
      search: "Search by phone or name…", exportCsv: "Download list", phone: "Phone", name: "Name", status: "Status", sentAt: "Sent", error: "Problem",
      none: "No one yet — start the campaign to fix the list of people.", noMatch: "No one matches this filter.",
      showing: "Showing the latest 200 people ·", exportFull: "Download the full list",
    },
    mapping: {
      title: "Fill in the message blanks", hint: "Fill each blank from a customer detail, or with one fixed line for everyone, like the festival name, your shop name or the offer.",
      contactName: "Customer name", phone: "Phone number", email: "Email address", leave: "— leave as is (uses the customer name) —", same: "Same text for everyone…",
      samePh: "e.g. Diwali, your shop name, or the offer line", saved: "Saved ✓", save: "Save", saving: "Saving…",
      locked: "These blanks are locked once a campaign has started. Duplicate the campaign to change them.", needText: "Type the text for {{{n}}}, or pick a customer detail.",
    },
    ai: {
      title: "AI campaign helper", sub: "— say your goal, get who to send to, the message and the time", placeholder: "Win back customers who have not bought in 30 days", thinking: "Thinking…", draftPlan: "Make a plan",
      planning: "Planning your campaign…", audience: "Who to send to", everyone: "Everyone", segmentSaved: "Group saved ✓", saveSegment: "Save this group →", sendTime: "Best time to send",
      templateDraft: "Message draft", copied: "Copied ✓", copy: "Copy message", pasteBefore: "Paste this into", templates: "Templates", pasteAfter: "to send it to Meta for approval, then come back and make a campaign with it.",
    },
  },
  hi: {
    newForm: { cancel: "रद्द करें", cardAlt: "{code} में कार्ड", yourCard: "आपका कार्ड" },
    filters: { search: "कैंपेन खोजें…", all: "सभी", draft: "ड्राफ़्ट", sending: "भेजा जा रहा है", paused: "रुका हुआ", completed: "पूरा" },
    actions: { retrying: "फिर कोशिश हो रही है…", retryFailed: "फिर भेजें ({n})", duplicating: "कॉपी बन रही है…", duplicate: "कॉपी बनाएँ" },
    test: { button: "टेस्ट संदेश भेजें", phone: "आपका फ़ोन नंबर (देश कोड के साथ)", sending: "भेज रहे हैं…", send: "टेस्ट भेजें", cancel: "रद्द करें", sent: "भेज दिया — अपना WhatsApp देखें।" },
    recipients: {
      all: "सभी", queued: "इंतज़ार में", sent: "भेजा गया", delivered: "पहुँचा", read: "पढ़ा", failed: "नहीं गया",
      search: "फ़ोन या नाम से खोजें…", exportCsv: "सूची डाउनलोड करें", phone: "फ़ोन", name: "नाम", status: "स्थिति", sentAt: "भेजा", error: "दिक़्क़त",
      none: "अभी कोई नहीं — लोगों की सूची पक्की करने के लिए कैंपेन शुरू करें।", noMatch: "इस फ़िल्टर में कोई नहीं।",
      showing: "आख़िरी 200 लोग दिख रहे हैं ·", exportFull: "पूरी सूची डाउनलोड करें",
    },
    mapping: {
      title: "संदेश के ख़ाली स्थान भरें", hint: "हर ख़ाली स्थान को ग्राहक की किसी जानकारी से भरें, या सबके लिए एक तय पंक्ति रखें, जैसे त्योहार का नाम, दुकान का नाम या ऑफ़र।",
      contactName: "ग्राहक का नाम", phone: "फ़ोन नंबर", email: "ईमेल पता", leave: "— जैसा है वैसा रहने दें (ग्राहक का नाम लगेगा) —", same: "सबके लिए एक ही लिखावट…",
      samePh: "जैसे दिवाली, दुकान का नाम या ऑफ़र की पंक्ति", saved: "सेव हो गया ✓", save: "सेव करें", saving: "सेव हो रहा है…",
      locked: "कैंपेन शुरू होने के बाद ये ख़ाली स्थान बदले नहीं जा सकते। बदलने के लिए कैंपेन की कॉपी बनाएँ।", needText: "{{{n}}} के लिए लिखावट लिखें, या ग्राहक की कोई जानकारी चुनें।",
    },
    ai: {
      title: "AI कैंपेन सहायक", sub: "— अपना लक्ष्य बताएँ, किसे भेजना है, संदेश और समय पाएँ", placeholder: "जिन ग्राहकों ने 30 दिन से कुछ नहीं ख़रीदा उन्हें वापस लाएँ", thinking: "सोच रहे हैं…", draftPlan: "योजना बनाएँ",
      planning: "आपका कैंपेन सोच रहे हैं…", audience: "किसे भेजना है", everyone: "सभी", segmentSaved: "समूह सेव हो गया ✓", saveSegment: "यह समूह सेव करें →", sendTime: "भेजने का सबसे अच्छा समय",
      templateDraft: "संदेश का ड्राफ़्ट", copied: "कॉपी हो गया ✓", copy: "संदेश कॉपी करें", pasteBefore: "इसे", templates: "टेम्पलेट", pasteAfter: "में चिपकाकर Meta की मंज़ूरी के लिए भेजें, फिर लौटकर इससे कैंपेन बनाएँ।",
    },
  },
  mr: {
    newForm: { cancel: "रद्द करा", cardAlt: "{code} मधील कार्ड", yourCard: "तुमचे कार्ड" },
    filters: { search: "कॅम्पेन शोधा…", all: "सर्व", draft: "ड्राफ्ट", sending: "पाठवत आहे", paused: "थांबवलेले", completed: "पूर्ण" },
    actions: { retrying: "पुन्हा प्रयत्न सुरू…", retryFailed: "पुन्हा पाठवा ({n})", duplicating: "प्रत बनत आहे…", duplicate: "प्रत बनवा" },
    test: { button: "टेस्ट संदेश पाठवा", phone: "तुमचा फोन नंबर (देश कोडसह)", sending: "पाठवत आहे…", send: "टेस्ट पाठवा", cancel: "रद्द करा", sent: "पाठवला — तुमचे WhatsApp पहा." },
    recipients: {
      all: "सर्व", queued: "वाट पाहत आहे", sent: "पाठवले", delivered: "पोहोचले", read: "वाचले", failed: "गेले नाही",
      search: "फोन किंवा नावाने शोधा…", exportCsv: "यादी डाउनलोड करा", phone: "फोन", name: "नाव", status: "स्थिती", sentAt: "पाठवले", error: "अडचण",
      none: "अजून कोणीही नाही — लोकांची यादी पक्की करण्यासाठी कॅम्पेन सुरू करा.", noMatch: "या फिल्टरमध्ये कोणीही नाही.",
      showing: "शेवटचे 200 लोक दिसत आहेत ·", exportFull: "पूर्ण यादी डाउनलोड करा",
    },
    mapping: {
      title: "संदेशातील रिकाम्या जागा भरा", hint: "प्रत्येक रिकामी जागा ग्राहकाच्या एखाद्या माहितीने भरा, किंवा सर्वांसाठी एक ठरलेली ओळ ठेवा, जसे सणाचे नाव, दुकानाचे नाव किंवा ऑफर.",
      contactName: "ग्राहकाचे नाव", phone: "फोन नंबर", email: "ईमेल पत्ता", leave: "— जसे आहे तसे राहू द्या (ग्राहकाचे नाव येईल) —", same: "सर्वांसाठी तोच मजकूर…",
      samePh: "उदा. दिवाळी, दुकानाचे नाव किंवा ऑफरची ओळ", saved: "सेव्ह झाले ✓", save: "सेव्ह करा", saving: "सेव्ह होत आहे…",
      locked: "कॅम्पेन सुरू झाल्यावर या जागा बदलता येत नाहीत. बदलण्यासाठी कॅम्पेनची प्रत बनवा.", needText: "{{{n}}} साठी मजकूर लिहा, किंवा ग्राहकाची एखादी माहिती निवडा.",
    },
    ai: {
      title: "AI कॅम्पेन मदतनीस", sub: "— तुमचे ध्येय सांगा, कोणाला पाठवायचे, संदेश आणि वेळ मिळवा", placeholder: "30 दिवसांपासून काही खरेदी न केलेल्या ग्राहकांना परत आणा", thinking: "विचार करत आहे…", draftPlan: "योजना बनवा",
      planning: "तुमचे कॅम्पेन आखत आहे…", audience: "कोणाला पाठवायचे", everyone: "सर्व", segmentSaved: "गट सेव्ह झाला ✓", saveSegment: "हा गट सेव्ह करा →", sendTime: "पाठवण्याची सर्वोत्तम वेळ",
      templateDraft: "संदेशाचा ड्राफ्ट", copied: "कॉपी झाले ✓", copy: "संदेश कॉपी करा", pasteBefore: "हे", templates: "टेम्पलेट्स", pasteAfter: "मध्ये चिकटवून Meta च्या मंजुरीसाठी पाठवा, मग परत येऊन यातून कॅम्पेन बनवा.",
    },
  },
  gu: {
    newForm: { cancel: "રદ કરો", cardAlt: "{code} માં કાર્ડ", yourCard: "તમારું કાર્ડ" },
    filters: { search: "કૅમ્પેન શોધો…", all: "બધા", draft: "ડ્રાફ્ટ", sending: "મોકલાઈ રહ્યું છે", paused: "અટકાવેલું", completed: "પૂરું" },
    actions: { retrying: "ફરી પ્રયત્ન થઈ રહ્યો છે…", retryFailed: "ફરી મોકલો ({n})", duplicating: "નકલ બની રહી છે…", duplicate: "નકલ બનાવો" },
    test: { button: "ટેસ્ટ સંદેશ મોકલો", phone: "તમારો ફોન નંબર (દેશ કોડ સાથે)", sending: "મોકલી રહ્યા છીએ…", send: "ટેસ્ટ મોકલો", cancel: "રદ કરો", sent: "મોકલ્યો — તમારું WhatsApp જુઓ." },
    recipients: {
      all: "બધા", queued: "રાહ જોઈ રહ્યા છે", sent: "મોકલ્યું", delivered: "પહોંચ્યું", read: "વાંચ્યું", failed: "ગયું નથી",
      search: "ફોન કે નામથી શોધો…", exportCsv: "યાદી ડાઉનલોડ કરો", phone: "ફોન", name: "નામ", status: "સ્થિતિ", sentAt: "મોકલ્યું", error: "સમસ્યા",
      none: "હજી કોઈ નથી — લોકોની યાદી નક્કી કરવા કૅમ્પેન શરૂ કરો.", noMatch: "આ ફિલ્ટરમાં કોઈ નથી.",
      showing: "છેલ્લા 200 લોકો દેખાય છે ·", exportFull: "આખી યાદી ડાઉનલોડ કરો",
    },
    mapping: {
      title: "સંદેશની ખાલી જગ્યાઓ ભરો", hint: "દરેક ખાલી જગ્યા ગ્રાહકની કોઈ માહિતીથી ભરો, અથવા બધા માટે એક નક્કી લીટી રાખો, જેમ કે તહેવારનું નામ, દુકાનનું નામ કે ઑફર.",
      contactName: "ગ્રાહકનું નામ", phone: "ફોન નંબર", email: "ઇમેઇલ સરનામું", leave: "— જેમ છે તેમ રહેવા દો (ગ્રાહકનું નામ આવશે) —", same: "બધા માટે એ જ લખાણ…",
      samePh: "દા.ત. દિવાળી, દુકાનનું નામ કે ઑફરની લીટી", saved: "સેવ થયું ✓", save: "સેવ કરો", saving: "સેવ થઈ રહ્યું છે…",
      locked: "કૅમ્પેન શરૂ થયા પછી આ જગ્યાઓ બદલી શકાતી નથી. બદલવા માટે કૅમ્પેનની નકલ બનાવો.", needText: "{{{n}}} માટે લખાણ લખો, અથવા ગ્રાહકની કોઈ માહિતી પસંદ કરો.",
    },
    ai: {
      title: "AI કૅમ્પેન મદદગાર", sub: "— તમારું લક્ષ્ય કહો, કોને મોકલવું, સંદેશ અને સમય મેળવો", placeholder: "30 દિવસથી કંઈ ન ખરીદનાર ગ્રાહકોને પાછા લાવો", thinking: "વિચારી રહ્યા છીએ…", draftPlan: "યોજના બનાવો",
      planning: "તમારું કૅમ્પેન ગોઠવી રહ્યા છીએ…", audience: "કોને મોકલવું", everyone: "બધા", segmentSaved: "જૂથ સેવ થયું ✓", saveSegment: "આ જૂથ સેવ કરો →", sendTime: "મોકલવાનો શ્રેષ્ઠ સમય",
      templateDraft: "સંદેશનો ડ્રાફ્ટ", copied: "કૉપી થયું ✓", copy: "સંદેશ કૉપી કરો", pasteBefore: "આને", templates: "ટેમ્પ્લેટ્સ", pasteAfter: "માં ચોંટાડીને Metaની મંજૂરી માટે મોકલો, પછી પાછા આવી તેમાંથી કૅમ્પેન બનાવો.",
    },
  },
  ta: {
    newForm: { cancel: "ரத்து", cardAlt: "{code} மொழியில் அட்டை", yourCard: "உங்கள் அட்டை" },
    filters: { search: "பிரச்சாரங்களைத் தேடு…", all: "அனைத்தும்", draft: "வரைவு", sending: "அனுப்பப்படுகிறது", paused: "நிறுத்தப்பட்டது", completed: "முடிந்தது" },
    actions: { retrying: "மீண்டும் முயல்கிறது…", retryFailed: "மீண்டும் அனுப்பு ({n})", duplicating: "நகல் உருவாகிறது…", duplicate: "நகல் எடு" },
    test: { button: "சோதனைச் செய்தி அனுப்பு", phone: "உங்கள் தொலைபேசி எண் (நாட்டுக் குறியீட்டுடன்)", sending: "அனுப்புகிறது…", send: "சோதனை அனுப்பு", cancel: "ரத்து", sent: "அனுப்பப்பட்டது — உங்கள் WhatsApp-ஐப் பாருங்கள்." },
    recipients: {
      all: "அனைத்தும்", queued: "காத்திருக்கிறது", sent: "அனுப்பப்பட்டது", delivered: "சேர்ந்தது", read: "படித்தது", failed: "செல்லவில்லை",
      search: "தொலைபேசி அல்லது பெயரால் தேடு…", exportCsv: "பட்டியலைப் பதிவிறக்கு", phone: "தொலைபேசி", name: "பெயர்", status: "நிலை", sentAt: "அனுப்பியது", error: "சிக்கல்",
      none: "இன்னும் யாரும் இல்லை — ஆட்களின் பட்டியலை உறுதிசெய்ய பிரச்சாரத்தைத் தொடங்குங்கள்.", noMatch: "இந்த வடிகட்டியில் யாரும் இல்லை.",
      showing: "கடைசி 200 பேர் காட்டப்படுகின்றனர் ·", exportFull: "முழுப் பட்டியலைப் பதிவிறக்கு",
    },
    mapping: {
      title: "செய்தியின் காலியிடங்களை நிரப்புங்கள்", hint: "ஒவ்வொரு காலியிடத்தையும் வாடிக்கையாளரின் ஒரு விவரத்தால் நிரப்புங்கள், அல்லது அனைவருக்கும் ஒரே வரி வையுங்கள், எ.கா. பண்டிகை பெயர், கடை பெயர் அல்லது சலுகை.",
      contactName: "வாடிக்கையாளர் பெயர்", phone: "தொலைபேசி எண்", email: "மின்னஞ்சல் முகவரி", leave: "— அப்படியே விடு (வாடிக்கையாளர் பெயர் வரும்) —", same: "அனைவருக்கும் ஒரே உரை…",
      samePh: "எ.கா. தீபாவளி, கடையின் பெயர் அல்லது சலுகை வரி", saved: "சேமிக்கப்பட்டது ✓", save: "சேமி", saving: "சேமிக்கிறது…",
      locked: "பிரச்சாரம் தொடங்கிய பின் இந்தக் காலியிடங்களை மாற்ற முடியாது. மாற்ற பிரச்சாரத்தின் நகலை உருவாக்குங்கள்.", needText: "{{{n}}}-க்கான உரையை எழுதுங்கள், அல்லது வாடிக்கையாளர் விவரத்தைத் தேர்ந்தெடுங்கள்.",
    },
    ai: {
      title: "AI பிரச்சார உதவியாளர்", sub: "— உங்கள் இலக்கைச் சொல்லுங்கள், யாருக்கு அனுப்புவது, செய்தி, நேரம் கிடைக்கும்", placeholder: "30 நாட்களாக வாங்காத வாடிக்கையாளர்களை மீண்டும் அழையுங்கள்", thinking: "யோசிக்கிறது…", draftPlan: "திட்டம் போடு",
      planning: "உங்கள் பிரச்சாரத்தைத் திட்டமிடுகிறது…", audience: "யாருக்கு அனுப்புவது", everyone: "அனைவரும்", segmentSaved: "குழு சேமிக்கப்பட்டது ✓", saveSegment: "இந்தக் குழுவைச் சேமி →", sendTime: "அனுப்ப சிறந்த நேரம்",
      templateDraft: "செய்தி வரைவு", copied: "நகலெடுக்கப்பட்டது ✓", copy: "செய்தியை நகலெடு", pasteBefore: "இதை", templates: "டெம்ப்ளேட்கள்", pasteAfter: "பகுதியில் ஒட்டி Meta ஒப்புதலுக்கு அனுப்புங்கள், பின் திரும்பி வந்து இதைக் கொண்டு பிரச்சாரம் உருவாக்குங்கள்.",
    },
  },
  te: {
    newForm: { cancel: "రద్దు", cardAlt: "{code} లో కార్డ్", yourCard: "మీ కార్డ్" },
    filters: { search: "క్యాంపెయిన్లను వెతకండి…", all: "అన్నీ", draft: "డ్రాఫ్ట్", sending: "పంపుతున్నాం", paused: "ఆపినవి", completed: "పూర్తయినవి" },
    actions: { retrying: "మళ్ళీ ప్రయత్నిస్తోంది…", retryFailed: "మళ్ళీ పంపండి ({n})", duplicating: "కాపీ అవుతోంది…", duplicate: "కాపీ చేయండి" },
    test: { button: "టెస్ట్ మెసేజ్ పంపండి", phone: "మీ ఫోన్ నంబర్ (దేశ కోడ్‌తో)", sending: "పంపుతోంది…", send: "టెస్ట్ పంపండి", cancel: "రద్దు", sent: "పంపాం — మీ WhatsApp చూడండి." },
    recipients: {
      all: "అన్నీ", queued: "వేచి ఉంది", sent: "పంపాం", delivered: "చేరింది", read: "చదివారు", failed: "వెళ్ళలేదు",
      search: "ఫోన్ లేదా పేరుతో వెతకండి…", exportCsv: "జాబితా డౌన్‌లోడ్", phone: "ఫోన్", name: "పేరు", status: "స్థితి", sentAt: "పంపినది", error: "సమస్య",
      none: "ఇంకా ఎవరూ లేరు — వ్యక్తుల జాబితా ఖరారు కావడానికి క్యాంపెయిన్ మొదలుపెట్టండి.", noMatch: "ఈ ఫిల్టర్‌కు ఎవరూ సరిపోలలేదు.",
      showing: "చివరి 200 మంది కనిపిస్తున్నారు ·", exportFull: "పూర్తి జాబితా డౌన్‌లోడ్",
    },
    mapping: {
      title: "మెసేజ్‌లోని ఖాళీలను నింపండి", hint: "ప్రతి ఖాళీని కస్టమర్ వివరంతో నింపండి, లేదా అందరికీ ఒకే లైన్ పెట్టండి, ఉదా. పండుగ పేరు, షాప్ పేరు లేదా ఆఫర్.",
      contactName: "కస్టమర్ పేరు", phone: "ఫోన్ నంబర్", email: "ఈమెయిల్ చిరునామా", leave: "— ఉన్నట్లే వదిలేయండి (కస్టమర్ పేరు వస్తుంది) —", same: "అందరికీ ఒకే టెక్స్ట్…",
      samePh: "ఉదా. దీపావళి, షాప్ పేరు లేదా ఆఫర్ లైన్", saved: "సేవ్ అయింది ✓", save: "సేవ్ చేయండి", saving: "సేవ్ అవుతోంది…",
      locked: "క్యాంపెయిన్ మొదలైన తర్వాత ఈ ఖాళీలను మార్చలేరు. మార్చడానికి క్యాంపెయిన్‌ను కాపీ చేయండి.", needText: "{{{n}}} కోసం టెక్స్ట్ రాయండి, లేదా కస్టమర్ వివరాన్ని ఎంచుకోండి.",
    },
    ai: {
      title: "AI క్యాంపెయిన్ సహాయకుడు", sub: "— మీ లక్ష్యం చెప్పండి, ఎవరికి పంపాలి, మెసేజ్, సమయం పొందండి", placeholder: "30 రోజులుగా కొనని కస్టమర్లను తిరిగి రప్పించండి", thinking: "ఆలోచిస్తోంది…", draftPlan: "ప్లాన్ చేయండి",
      planning: "మీ క్యాంపెయిన్‌ను ప్లాన్ చేస్తోంది…", audience: "ఎవరికి పంపాలి", everyone: "అందరూ", segmentSaved: "గ్రూప్ సేవ్ అయింది ✓", saveSegment: "ఈ గ్రూప్ సేవ్ చేయండి →", sendTime: "పంపడానికి మంచి సమయం",
      templateDraft: "మెసేజ్ డ్రాఫ్ట్", copied: "కాపీ అయింది ✓", copy: "మెసేజ్ కాపీ చేయండి", pasteBefore: "దీన్ని", templates: "టెంప్లేట్లు", pasteAfter: "లో పేస్ట్ చేసి Meta ఆమోదానికి పంపండి, తర్వాత తిరిగొచ్చి దీనితో క్యాంపెయిన్ చేయండి.",
    },
  },
  kn: {
    newForm: { cancel: "ರದ್ದು", cardAlt: "{code} ನಲ್ಲಿ ಕಾರ್ಡ್", yourCard: "ನಿಮ್ಮ ಕಾರ್ಡ್" },
    filters: { search: "ಅಭಿಯಾನಗಳನ್ನು ಹುಡುಕಿ…", all: "ಎಲ್ಲಾ", draft: "ಕರಡು", sending: "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ", paused: "ನಿಲ್ಲಿಸಿದ್ದು", completed: "ಮುಗಿದಿದೆ" },
    actions: { retrying: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸುತ್ತಿದೆ…", retryFailed: "ಮತ್ತೆ ಕಳುಹಿಸಿ ({n})", duplicating: "ನಕಲು ಆಗುತ್ತಿದೆ…", duplicate: "ನಕಲು ಮಾಡಿ" },
    test: { button: "ಪರೀಕ್ಷಾ ಸಂದೇಶ ಕಳುಹಿಸಿ", phone: "ನಿಮ್ಮ ಫೋನ್ ಸಂಖ್ಯೆ (ದೇಶದ ಕೋಡ್‌ನೊಂದಿಗೆ)", sending: "ಕಳುಹಿಸುತ್ತಿದೆ…", send: "ಪರೀಕ್ಷೆ ಕಳುಹಿಸಿ", cancel: "ರದ್ದು", sent: "ಕಳುಹಿಸಲಾಗಿದೆ — ನಿಮ್ಮ WhatsApp ನೋಡಿ." },
    recipients: {
      all: "ಎಲ್ಲಾ", queued: "ಕಾಯುತ್ತಿದೆ", sent: "ಕಳುಹಿಸಲಾಗಿದೆ", delivered: "ತಲುಪಿದೆ", read: "ಓದಿದ್ದಾರೆ", failed: "ಹೋಗಿಲ್ಲ",
      search: "ಫೋನ್ ಅಥವಾ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ…", exportCsv: "ಪಟ್ಟಿ ಡೌನ್‌ಲೋಡ್", phone: "ಫೋನ್", name: "ಹೆಸರು", status: "ಸ್ಥಿತಿ", sentAt: "ಕಳುಹಿಸಿದ್ದು", error: "ತೊಂದರೆ",
      none: "ಇನ್ನೂ ಯಾರೂ ಇಲ್ಲ — ಜನರ ಪಟ್ಟಿ ಖಚಿತವಾಗಲು ಅಭಿಯಾನ ಆರಂಭಿಸಿ.", noMatch: "ಈ ಫಿಲ್ಟರ್‌ಗೆ ಯಾರೂ ಹೊಂದುವುದಿಲ್ಲ.",
      showing: "ಕೊನೆಯ 200 ಜನರನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ ·", exportFull: "ಪೂರ್ಣ ಪಟ್ಟಿ ಡೌನ್‌ಲೋಡ್",
    },
    mapping: {
      title: "ಸಂದೇಶದ ಖಾಲಿ ಜಾಗಗಳನ್ನು ತುಂಬಿ", hint: "ಪ್ರತಿ ಖಾಲಿ ಜಾಗವನ್ನು ಗ್ರಾಹಕರ ಒಂದು ವಿವರದಿಂದ ತುಂಬಿ, ಅಥವಾ ಎಲ್ಲರಿಗೂ ಒಂದೇ ಸಾಲು ಇಡಿ, ಉದಾ. ಹಬ್ಬದ ಹೆಸರು, ಅಂಗಡಿಯ ಹೆಸರು ಅಥವಾ ಆಫರ್.",
      contactName: "ಗ್ರಾಹಕರ ಹೆಸರು", phone: "ಫೋನ್ ಸಂಖ್ಯೆ", email: "ಇಮೇಲ್ ವಿಳಾಸ", leave: "— ಇದ್ದಂತೆ ಬಿಡಿ (ಗ್ರಾಹಕರ ಹೆಸರು ಬರುತ್ತದೆ) —", same: "ಎಲ್ಲರಿಗೂ ಅದೇ ಪಠ್ಯ…",
      samePh: "ಉದಾ. ದೀಪಾವಳಿ, ಅಂಗಡಿಯ ಹೆಸರು ಅಥವಾ ಆಫರ್ ಸಾಲು", saved: "ಉಳಿಸಲಾಗಿದೆ ✓", save: "ಉಳಿಸಿ", saving: "ಉಳಿಸುತ್ತಿದೆ…",
      locked: "ಅಭಿಯಾನ ಆರಂಭವಾದ ಮೇಲೆ ಈ ಜಾಗಗಳನ್ನು ಬದಲಿಸಲಾಗದು. ಬದಲಿಸಲು ಅಭಿಯಾನವನ್ನು ನಕಲು ಮಾಡಿ.", needText: "{{{n}}} ಗಾಗಿ ಪಠ್ಯ ಬರೆಯಿರಿ, ಅಥವಾ ಗ್ರಾಹಕರ ವಿವರ ಆಯ್ಕೆಮಾಡಿ.",
    },
    ai: {
      title: "AI ಅಭಿಯಾನ ಸಹಾಯಕ", sub: "— ನಿಮ್ಮ ಗುರಿ ಹೇಳಿ, ಯಾರಿಗೆ ಕಳುಹಿಸಬೇಕು, ಸಂದೇಶ ಮತ್ತು ಸಮಯ ಪಡೆಯಿರಿ", placeholder: "30 ದಿನಗಳಿಂದ ಖರೀದಿಸದ ಗ್ರಾಹಕರನ್ನು ಮರಳಿ ಕರೆತನ್ನಿ", thinking: "ಯೋಚಿಸುತ್ತಿದೆ…", draftPlan: "ಯೋಜನೆ ಮಾಡಿ",
      planning: "ನಿಮ್ಮ ಅಭಿಯಾನವನ್ನು ಯೋಜಿಸುತ್ತಿದೆ…", audience: "ಯಾರಿಗೆ ಕಳುಹಿಸಬೇಕು", everyone: "ಎಲ್ಲರೂ", segmentSaved: "ಗುಂಪು ಉಳಿಸಲಾಗಿದೆ ✓", saveSegment: "ಈ ಗುಂಪನ್ನು ಉಳಿಸಿ →", sendTime: "ಕಳುಹಿಸಲು ಉತ್ತಮ ಸಮಯ",
      templateDraft: "ಸಂದೇಶದ ಕರಡು", copied: "ನಕಲಾಗಿದೆ ✓", copy: "ಸಂದೇಶ ನಕಲಿಸಿ", pasteBefore: "ಇದನ್ನು", templates: "ಟೆಂಪ್ಲೇಟ್‌ಗಳು", pasteAfter: "ನಲ್ಲಿ ಅಂಟಿಸಿ Meta ಅನುಮೋದನೆಗೆ ಕಳುಹಿಸಿ, ನಂತರ ಹಿಂತಿರುಗಿ ಇದರಿಂದ ಅಭಿಯಾನ ಮಾಡಿ.",
    },
  },
};
