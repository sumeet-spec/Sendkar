import type { LanguageCode } from "./dictionaries";

/** Words for the after-bill follow-ups: AI writes the message, WhatsApp approves it, then it goes out by itself. */
export type FollowUi = {
  title: string; intro: string; when: string; day1: string; week1: string; week6: string; month3: string;
  lang: string; goal: string; goalPlaceholder: string; write: string; writing: string; draft: string; draftHint: string;
  submit: string; submitting: string; saved: string; offersNote: string; yours: string; none: string;
  approved: string; waiting: string; rejected: string; sendNow: string; sentNow: string; pickMessage: string; noConsent: string;
};

export const FOLLOW_UI: Record<LanguageCode, FollowUi> = {
  en: {
    title: "Follow-ups after a bill", intro: "Write what you want to tell customers in a few words. AI turns it into a proper message in any language. WhatsApp checks it (usually within minutes), then it goes out by itself after every bill.",
    when: "Send it", day1: "The next day", week1: "After 1 week", week6: "After 6 weeks", month3: "After 3 months",
    lang: "Language of the message", goal: "What do you want to say?", goalPlaceholder: "Thank them, and say 10% off on their next visit this month",
    write: "Write it with AI", writing: "Writing…", draft: "Your message", draftHint: "You can edit it. {1} becomes the customer's name and {2} your shop name.",
    submit: "Send for WhatsApp approval and start", submitting: "Submitting…", saved: "Done. It starts going out after WhatsApp approves it.",
    offersNote: "Follow-ups go only to customers you ticked as agreeing to offers when you made their bill.", yours: "Your follow-ups", none: "No follow-ups yet.",
    approved: "Approved", waiting: "Waiting for WhatsApp", rejected: "Not accepted", sendNow: "Send now", sentNow: "Sent.", pickMessage: "Pick a message", noConsent: "Did not agree to offers",
  },
  hi: {
    title: "बिल के बाद फ़ॉलो-अप", intro: "ग्राहकों को क्या कहना है, कुछ शब्दों में लिखिए। AI उसे किसी भी भाषा में अच्छा संदेश बना देगा। WhatsApp उसे जाँचता है (आमतौर पर कुछ मिनटों में), फिर हर बिल के बाद वह अपने आप जाता है।",
    when: "कब भेजें", day1: "अगले दिन", week1: "1 हफ़्ते बाद", week6: "6 हफ़्ते बाद", month3: "3 महीने बाद",
    lang: "संदेश की भाषा", goal: "आप क्या कहना चाहते हैं?", goalPlaceholder: "धन्यवाद कहें, और इस महीने अगली बार आने पर 10% छूट बताएँ",
    write: "AI से लिखवाएँ", writing: "लिख रहे हैं…", draft: "आपका संदेश", draftHint: "आप इसे बदल सकते हैं। {1} की जगह ग्राहक का नाम और {2} की जगह आपकी दुकान का नाम आएगा।",
    submit: "WhatsApp मंज़ूरी के लिए भेजें और शुरू करें", submitting: "भेज रहे हैं…", saved: "हो गया। WhatsApp की मंज़ूरी के बाद यह जाना शुरू होगा।",
    offersNote: "फ़ॉलो-अप सिर्फ़ उन्हीं ग्राहकों को जाते हैं जिनके बिल पर आपने ऑफ़र की हाँ चुनी थी।", yours: "आपके फ़ॉलो-अप", none: "अभी कोई फ़ॉलो-अप नहीं।",
    approved: "मंज़ूर", waiting: "WhatsApp की प्रतीक्षा", rejected: "स्वीकार नहीं हुआ", sendNow: "अभी भेजें", sentNow: "भेज दिया।", pickMessage: "संदेश चुनें", noConsent: "ऑफ़र के लिए हाँ नहीं कहा",
  },
  mr: {
    title: "बिलानंतर फॉलो-अप", intro: "ग्राहकांना काय सांगायचे ते थोडक्यात लिहा. AI त्याचा कोणत्याही भाषेत चांगला संदेश बनवेल. WhatsApp तो तपासते (साधारणपणे काही मिनिटांत), मग प्रत्येक बिलानंतर तो आपोआप जातो.",
    when: "केव्हा पाठवायचे", day1: "दुसऱ्या दिवशी", week1: "1 आठवड्यानंतर", week6: "6 आठवड्यांनंतर", month3: "3 महिन्यांनंतर",
    lang: "संदेशाची भाषा", goal: "तुम्हाला काय सांगायचे आहे?", goalPlaceholder: "धन्यवाद सांगा, आणि या महिन्यात पुढच्या खरेदीवर 10% सूट सांगा",
    write: "AI कडून लिहून घ्या", writing: "लिहित आहे…", draft: "तुमचा संदेश", draftHint: "तुम्ही यात बदल करू शकता. {1} च्या जागी ग्राहकाचे नाव आणि {2} च्या जागी तुमच्या दुकानाचे नाव येईल.",
    submit: "WhatsApp मंजुरीसाठी पाठवा आणि सुरू करा", submitting: "पाठवत आहे…", saved: "झाले. WhatsApp ने मंजूर केल्यावर हे जाणे सुरू होईल.",
    offersNote: "फॉलो-अप फक्त त्याच ग्राहकांना जातात ज्यांच्या बिलावर तुम्ही ऑफरला होकार निवडला होता.", yours: "तुमचे फॉलो-अप", none: "अजून फॉलो-अप नाहीत.",
    approved: "मंजूर", waiting: "WhatsApp ची प्रतीक्षा", rejected: "स्वीकारले नाही", sendNow: "आता पाठवा", sentNow: "पाठवले.", pickMessage: "संदेश निवडा", noConsent: "ऑफरला होकार दिला नाही",
  },
  gu: {
    title: "બિલ પછી ફોલો-અપ", intro: "ગ્રાહકોને શું કહેવું છે તે થોડા શબ્દોમાં લખો. AI તેને કોઈ પણ ભાષામાં સારો સંદેશ બનાવી આપશે. WhatsApp તેને તપાસે છે (સામાન્ય રીતે થોડી મિનિટોમાં), પછી દરેક બિલ પછી તે આપમેળે જાય છે.",
    when: "ક્યારે મોકલવું", day1: "બીજા દિવસે", week1: "1 અઠવાડિયા પછી", week6: "6 અઠવાડિયા પછી", month3: "3 મહિના પછી",
    lang: "સંદેશની ભાષા", goal: "તમે શું કહેવા માંગો છો?", goalPlaceholder: "આભાર માનો, અને આ મહિનામાં આગલી ખરીદી પર 10% છૂટ જણાવો",
    write: "AI થી લખાવો", writing: "લખી રહ્યા છીએ…", draft: "તમારો સંદેશ", draftHint: "તમે તેમાં ફેરફાર કરી શકો છો. {1} ની જગ્યાએ ગ્રાહકનું નામ અને {2} ની જગ્યાએ તમારી દુકાનનું નામ આવશે.",
    submit: "WhatsApp મંજૂરી માટે મોકલો અને શરૂ કરો", submitting: "મોકલી રહ્યા છીએ…", saved: "થઈ ગયું. WhatsApp મંજૂર કરે પછી તે જવાનું શરૂ થશે.",
    offersNote: "ફોલો-અપ ફક્ત એ ગ્રાહકોને જાય છે જેમના બિલ પર તમે ઑફર માટે હા પસંદ કરી હતી.", yours: "તમારા ફોલો-અપ", none: "હજી કોઈ ફોલો-અપ નથી.",
    approved: "મંજૂર", waiting: "WhatsApp ની રાહ", rejected: "સ્વીકાર્યું નથી", sendNow: "હમણાં મોકલો", sentNow: "મોકલ્યું.", pickMessage: "સંદેશ પસંદ કરો", noConsent: "ઑફર માટે હા કહી નથી",
  },
  ta: {
    title: "பில்லுக்குப் பின் பின்தொடர்தல்", intro: "வாடிக்கையாளர்களுக்கு என்ன சொல்ல வேண்டும் என்பதை சில வார்த்தைகளில் எழுதுங்கள். AI அதை எந்த மொழியிலும் நல்ல செய்தியாக மாற்றும். WhatsApp அதைச் சரிபார்க்கும் (பொதுவாக சில நிமிடங்களில்), பிறகு ஒவ்வொரு பில்லுக்குப் பின்னும் தானாக செல்லும்.",
    when: "எப்போது அனுப்புவது", day1: "அடுத்த நாள்", week1: "1 வாரத்துக்குப் பின்", week6: "6 வாரங்களுக்குப் பின்", month3: "3 மாதங்களுக்குப் பின்",
    lang: "செய்தியின் மொழி", goal: "என்ன சொல்ல விரும்புகிறீர்கள்?", goalPlaceholder: "நன்றி சொல்லுங்கள், இந்த மாதம் அடுத்த முறை வரும்போது 10% தள்ளுபடி என்று சொல்லுங்கள்",
    write: "AI மூலம் எழுது", writing: "எழுதுகிறது…", draft: "உங்கள் செய்தி", draftHint: "இதை மாற்றலாம். {1} என்பது வாடிக்கையாளர் பெயராகவும் {2} உங்கள் கடை பெயராகவும் மாறும்.",
    submit: "WhatsApp ஒப்புதலுக்கு அனுப்பி தொடங்கு", submitting: "அனுப்புகிறது…", saved: "முடிந்தது. WhatsApp ஒப்புதல் அளித்ததும் இது செல்லத் தொடங்கும்.",
    offersNote: "பில் போடும்போது சலுகைகளுக்கு சம்மதம் என்று குறித்த வாடிக்கையாளர்களுக்கு மட்டுமே பின்தொடர்தல் செல்லும்.", yours: "உங்கள் பின்தொடர்தல்கள்", none: "இன்னும் பின்தொடர்தல்கள் இல்லை.",
    approved: "ஒப்புதல் பெற்றது", waiting: "WhatsApp-க்காக காத்திருப்பு", rejected: "ஏற்கப்படவில்லை", sendNow: "இப்போது அனுப்பு", sentNow: "அனுப்பப்பட்டது.", pickMessage: "செய்தியைத் தேர்ந்தெடுங்கள்", noConsent: "சலுகைகளுக்கு சம்மதிக்கவில்லை",
  },
  te: {
    title: "బిల్లు తర్వాత ఫాలో-అప్‌లు", intro: "కస్టమర్లకు ఏం చెప్పాలో కొన్ని మాటల్లో రాయండి. AI దాన్ని ఏ భాషలోనైనా చక్కని సందేశంగా మారుస్తుంది. WhatsApp దాన్ని పరిశీలిస్తుంది (సాధారణంగా కొన్ని నిమిషాల్లో), ఆ తర్వాత ప్రతి బిల్లు తర్వాత అదే వెళ్తుంది.",
    when: "ఎప్పుడు పంపాలి", day1: "మరుసటి రోజు", week1: "1 వారం తర్వాత", week6: "6 వారాల తర్వాత", month3: "3 నెలల తర్వాత",
    lang: "సందేశ భాష", goal: "మీరు ఏమి చెప్పాలనుకుంటున్నారు?", goalPlaceholder: "ధన్యవాదాలు చెప్పండి, ఈ నెల తదుపరి సారి వస్తే 10% తగ్గింపు అని చెప్పండి",
    write: "AI తో రాయించండి", writing: "రాస్తోంది…", draft: "మీ సందేశం", draftHint: "మీరు దీన్ని మార్చవచ్చు. {1} స్థానంలో కస్టమర్ పేరు, {2} స్థానంలో మీ షాప్ పేరు వస్తాయి.",
    submit: "WhatsApp ఆమోదానికి పంపి ప్రారంభించండి", submitting: "పంపుతున్నాం…", saved: "అయింది. WhatsApp ఆమోదించాక ఇది వెళ్లడం మొదలవుతుంది.",
    offersNote: "బిల్లు వేసేటప్పుడు ఆఫర్లకు అంగీకారం అని మీరు టిక్ చేసిన కస్టమర్లకే ఫాలో-అప్‌లు వెళ్తాయి.", yours: "మీ ఫాలో-అప్‌లు", none: "ఇంకా ఫాలో-అప్‌లు లేవు.",
    approved: "ఆమోదించారు", waiting: "WhatsApp కోసం వేచి ఉంది", rejected: "అంగీకరించలేదు", sendNow: "ఇప్పుడే పంపండి", sentNow: "పంపారు.", pickMessage: "సందేశాన్ని ఎంచుకోండి", noConsent: "ఆఫర్లకు అంగీకరించలేదు",
  },
  kn: {
    title: "ಬಿಲ್ ನಂತರದ ಫಾಲೋ-ಅಪ್‌ಗಳು", intro: "ಗ್ರಾಹಕರಿಗೆ ಏನು ಹೇಳಬೇಕೆಂದು ಕೆಲವು ಮಾತುಗಳಲ್ಲಿ ಬರೆಯಿರಿ. AI ಅದನ್ನು ಯಾವುದೇ ಭಾಷೆಯಲ್ಲಿ ಒಳ್ಳೆಯ ಸಂದೇಶವಾಗಿ ಮಾಡುತ್ತದೆ. WhatsApp ಅದನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ (ಸಾಮಾನ್ಯವಾಗಿ ಕೆಲವು ನಿಮಿಷಗಳಲ್ಲಿ), ನಂತರ ಪ್ರತಿ ಬಿಲ್ ನಂತರ ತಾನಾಗಿ ಹೋಗುತ್ತದೆ.",
    when: "ಯಾವಾಗ ಕಳುಹಿಸಬೇಕು", day1: "ಮರುದಿನ", week1: "1 ವಾರದ ನಂತರ", week6: "6 ವಾರಗಳ ನಂತರ", month3: "3 ತಿಂಗಳ ನಂತರ",
    lang: "ಸಂದೇಶದ ಭಾಷೆ", goal: "ನೀವು ಏನು ಹೇಳಲು ಬಯಸುತ್ತೀರಿ?", goalPlaceholder: "ಧನ್ಯವಾದ ಹೇಳಿ, ಈ ತಿಂಗಳು ಮುಂದಿನ ಬಾರಿ ಬಂದರೆ 10% ರಿಯಾಯಿತಿ ಎಂದು ಹೇಳಿ",
    write: "AI ಯಿಂದ ಬರೆಸಿ", writing: "ಬರೆಯುತ್ತಿದೆ…", draft: "ನಿಮ್ಮ ಸಂದೇಶ", draftHint: "ನೀವು ಇದನ್ನು ಬದಲಾಯಿಸಬಹುದು. {1} ಜಾಗದಲ್ಲಿ ಗ್ರಾಹಕರ ಹೆಸರು, {2} ಜಾಗದಲ್ಲಿ ನಿಮ್ಮ ಅಂಗಡಿಯ ಹೆಸರು ಬರುತ್ತದೆ.",
    submit: "WhatsApp ಅನುಮೋದನೆಗೆ ಕಳುಹಿಸಿ ಪ್ರಾರಂಭಿಸಿ", submitting: "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…", saved: "ಆಯಿತು. WhatsApp ಅನುಮೋದಿಸಿದ ನಂತರ ಇದು ಹೋಗಲು ಆರಂಭವಾಗುತ್ತದೆ.",
    offersNote: "ಬಿಲ್ ಮಾಡುವಾಗ ಆಫರ್‌ಗಳಿಗೆ ಒಪ್ಪಿಗೆ ಎಂದು ನೀವು ಗುರುತಿಸಿದ ಗ್ರಾಹಕರಿಗೆ ಮಾತ್ರ ಫಾಲೋ-ಅಪ್ ಹೋಗುತ್ತದೆ.", yours: "ನಿಮ್ಮ ಫಾಲೋ-ಅಪ್‌ಗಳು", none: "ಇನ್ನೂ ಫಾಲೋ-ಅಪ್‌ಗಳಿಲ್ಲ.",
    approved: "ಅನುಮೋದಿತ", waiting: "WhatsApp ಗಾಗಿ ಕಾಯುತ್ತಿದೆ", rejected: "ಸ್ವೀಕರಿಸಿಲ್ಲ", sendNow: "ಈಗ ಕಳುಹಿಸಿ", sentNow: "ಕಳುಹಿಸಿದೆ.", pickMessage: "ಸಂದೇಶ ಆಯ್ಕೆಮಾಡಿ", noConsent: "ಆಫರ್‌ಗಳಿಗೆ ಒಪ್ಪಿಲ್ಲ",
  },
};
