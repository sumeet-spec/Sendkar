import type { LanguageCode } from "./dictionaries";

/** Words for creating, controlling and reading a campaign. `{n}`, `{langs}` and `{cat}` are filled in by the page. */
export type CampaignCopy = {
  form: {
    newCampaign: string; needTemplate: string; name: string; namePlaceholder: string; template: string; selectTemplate: string; withPicture: string;
    noPicture: string; noApproved: string; audience: string; tagLabel: string; tagHelp: string; tagPlaceholder: string; segmentLabel: string; segmentHelp: string;
    none: string; counting: string; willReceive: string; checkTag: string; sendFrom: string; sendFromHelp: string; primaryNumber: string;
    schedule: string; scheduleHelp: string; creating: string; createDraft: string; cardLanguages: string; cardOne: string;
  };
  controls: { sendNow: string; starting: string; schedule: string; confirmSchedule: string; scheduling: string; pause: string; resume: string; scheduledFor: string; startNote: string };
  detail: {
    multiLanguage: string; scheduledFor: string; costBefore: string; costSoFar: string; costNote: string; revenue: string; revenueNote: string;
    queued: string; sent: string; delivered: string; read: string; failed: string; delivery: string;
  };
};

export const CAMPAIGN_COPY: Record<LanguageCode, CampaignCopy> = {
  en: {
    form: {
      newCampaign: "New campaign", needTemplate: "You need at least one approved template first", name: "Campaign name", namePlaceholder: "Diwali sale — all customers",
      template: "Template", selectTemplate: "Select an approved template…", withPicture: "with picture",
      noPicture: "This template has no picture at the top, so your card would not be sent. Pick one marked \"with picture\".",
      noApproved: "No approved templates — Meta must approve one before it can be used in a campaign.", audience: "Audience",
      tagLabel: "Filter by tag", tagHelp: "(optional — blank sends to everyone in the template's language)", tagPlaceholder: "e.g. vip",
      segmentLabel: "Or a saved segment", segmentHelp: "(combined with tag above if both set)", none: "None", counting: "Counting…",
      willReceive: "{n} people will receive this", checkTag: " — check the tag or template language",
      sendFrom: "Send from", sendFromHelp: "(optional — defaults to your primary number)", primaryNumber: "Primary number",
      schedule: "Schedule", scheduleHelp: "(optional — leave blank to send manually from the campaign page)", creating: "Creating…", createDraft: "Create draft",
      cardLanguages: "Each customer gets the card in their own language. Pick a template that has an image at the top.", cardOne: "This card will go out with the campaign. Pick a template that has an image at the top.",
    },
    controls: {
      sendNow: "Send now", starting: "Starting…", schedule: "Schedule", confirmSchedule: "Confirm schedule", scheduling: "Scheduling…", pause: "Pause", resume: "Resume", scheduledFor: "Scheduled for",
      startNote: "Send now starts straight away. A scheduled campaign goes out within a few minutes of the time you pick. Sending always stays within Meta's daily limit for your number.",
    },
    detail: {
      multiLanguage: "Multi-language — auto-sends the right version to each contact ({langs})", scheduledFor: "Scheduled for",
      costBefore: "Estimated Meta cost before you send", costSoFar: "Meta cost so far",
      costNote: "{n} × {cat} rate — India, at Meta's published rates. Not your Sendkar subscription fee, this is what Meta itself charges.",
      revenue: "Revenue attributed to this campaign", revenueNote: "Sales logged or synced within 7 days of a contact receiving this campaign.",
      queued: "Waiting", sent: "Sent", delivered: "Delivered", read: "Read", failed: "Failed", delivery: "Delivery",
    },
  },
  hi: {
    form: {
      newCampaign: "नया कैंपेन", needTemplate: "पहले कम से कम एक मंज़ूर टेम्पलेट चाहिए", name: "कैंपेन का नाम", namePlaceholder: "दिवाली सेल — सभी ग्राहक",
      template: "टेम्पलेट", selectTemplate: "कोई मंज़ूर टेम्पलेट चुनें…", withPicture: "तस्वीर के साथ",
      noPicture: "इस टेम्पलेट में ऊपर तस्वीर नहीं है, इसलिए आपका कार्ड नहीं जाएगा। \"तस्वीर के साथ\" वाला चुनें।",
      noApproved: "कोई मंज़ूर टेम्पलेट नहीं — कैंपेन में इस्तेमाल से पहले Meta को उसे मंज़ूर करना होगा।", audience: "किन्हें भेजना है",
      tagLabel: "टैग से छाँटें", tagHelp: "(ज़रूरी नहीं — ख़ाली छोड़ने पर टेम्पलेट की भाषा वाले सभी को जाएगा)", tagPlaceholder: "जैसे vip",
      segmentLabel: "या सेव किया हुआ ग्रुप", segmentHelp: "(दोनों भरे हों तो ऊपर के टैग के साथ जुड़ेगा)", none: "कोई नहीं", counting: "गिन रहे हैं…",
      willReceive: "{n} लोगों को यह मिलेगा", checkTag: " — टैग या टेम्पलेट की भाषा जाँचें",
      sendFrom: "कहाँ से भेजें", sendFromHelp: "(ज़रूरी नहीं — आपका मुख्य नंबर इस्तेमाल होगा)", primaryNumber: "मुख्य नंबर",
      schedule: "समय तय करें", scheduleHelp: "(ज़रूरी नहीं — ख़ाली छोड़ें तो कैंपेन पेज से खुद भेजें)", creating: "बन रहा है…", createDraft: "ड्राफ़्ट बनाएँ",
      cardLanguages: "हर ग्राहक को उसकी अपनी भाषा में कार्ड मिलेगा। ऊपर तस्वीर वाला टेम्पलेट चुनें।", cardOne: "यह कार्ड कैंपेन के साथ जाएगा। ऊपर तस्वीर वाला टेम्पलेट चुनें।",
    },
    controls: {
      sendNow: "अभी भेजें", starting: "शुरू हो रहा है…", schedule: "समय तय करें", confirmSchedule: "समय पक्का करें", scheduling: "तय हो रहा है…", pause: "रोकें", resume: "फिर शुरू करें", scheduledFor: "तय समय",
      startNote: "अभी भेजें दबाते ही भेजना शुरू हो जाता है। समय तय किया हुआ कैंपेन चुने हुए समय के कुछ ही मिनटों में चला जाता है। भेजना हमेशा आपके नंबर की Meta की रोज़ की सीमा के भीतर रहता है।",
    },
    detail: {
      multiLanguage: "कई भाषाएँ — हर संपर्क को सही भाषा वाला संदेश अपने आप जाता है ({langs})", scheduledFor: "तय समय",
      costBefore: "भेजने से पहले Meta का अनुमानित ख़र्च", costSoFar: "अब तक Meta का ख़र्च",
      costNote: "{n} × {cat} दर — भारत, Meta की प्रकाशित दरों पर। यह आपकी Sendkar सब्सक्रिप्शन फ़ीस नहीं है, यह Meta खुद लेता है।",
      revenue: "इस कैंपेन से हुई कमाई", revenueNote: "संपर्क को यह कैंपेन मिलने के 7 दिन के भीतर दर्ज या सिंक हुई बिक्री।",
      queued: "इंतज़ार में", sent: "भेजे गए", delivered: "पहुँचे", read: "पढ़े गए", failed: "नहीं गए", delivery: "पहुँचने की दर",
    },
  },
  mr: {
    form: {
      newCampaign: "नवीन कॅम्पेन", needTemplate: "आधी किमान एक मंजूर टेम्पलेट हवे", name: "कॅम्पेनचे नाव", namePlaceholder: "दिवाळी सेल — सर्व ग्राहक",
      template: "टेम्पलेट", selectTemplate: "मंजूर टेम्पलेट निवडा…", withPicture: "चित्रासह",
      noPicture: "या टेम्पलेटमध्ये वर चित्र नाही, त्यामुळे तुमचे कार्ड जाणार नाही. \"चित्रासह\" असलेले निवडा.",
      noApproved: "मंजूर टेम्पलेट नाही — कॅम्पेनमध्ये वापरण्यापूर्वी Meta ने ते मंजूर करायला हवे.", audience: "कोणाला पाठवायचे",
      tagLabel: "टॅगने निवडा", tagHelp: "(ऐच्छिक — रिकामे ठेवल्यास टेम्पलेटच्या भाषेतील सर्वांना जाईल)", tagPlaceholder: "उदा. vip",
      segmentLabel: "किंवा सेव्ह केलेला गट", segmentHelp: "(दोन्ही भरले असतील तर वरच्या टॅगसह जोडले जाईल)", none: "काहीही नाही", counting: "मोजत आहे…",
      willReceive: "{n} जणांना हे मिळेल", checkTag: " — टॅग किंवा टेम्पलेटची भाषा तपासा",
      sendFrom: "कुठून पाठवायचे", sendFromHelp: "(ऐच्छिक — तुमचा मुख्य नंबर वापरला जाईल)", primaryNumber: "मुख्य नंबर",
      schedule: "वेळ ठरवा", scheduleHelp: "(ऐच्छिक — रिकामे ठेवल्यास कॅम्पेन पानावरून स्वतः पाठवा)", creating: "बनत आहे…", createDraft: "ड्राफ्ट बनवा",
      cardLanguages: "प्रत्येक ग्राहकाला त्यांच्या स्वतःच्या भाषेत कार्ड मिळेल. वर चित्र असलेले टेम्पलेट निवडा.", cardOne: "हे कार्ड कॅम्पेनसोबत जाईल. वर चित्र असलेले टेम्पलेट निवडा.",
    },
    controls: {
      sendNow: "आत्ता पाठवा", starting: "सुरू होत आहे…", schedule: "वेळ ठरवा", confirmSchedule: "वेळ पक्की करा", scheduling: "ठरवत आहे…", pause: "थांबवा", resume: "पुन्हा सुरू करा", scheduledFor: "ठरलेली वेळ",
      startNote: "आत्ता पाठवा दाबताच पाठवणे सुरू होते. वेळ ठरवलेले कॅम्पेन निवडलेल्या वेळेच्या काही मिनिटांतच जाते. पाठवणे नेहमी तुमच्या नंबरच्या Meta च्या रोजच्या मर्यादेत राहते.",
    },
    detail: {
      multiLanguage: "अनेक भाषा — प्रत्येक संपर्काला योग्य भाषेतील संदेश आपोआप जातो ({langs})", scheduledFor: "ठरलेली वेळ",
      costBefore: "पाठवण्यापूर्वी Meta चा अंदाजे खर्च", costSoFar: "आतापर्यंतचा Meta चा खर्च",
      costNote: "{n} × {cat} दर — भारत, Meta च्या प्रकाशित दरांनुसार. ही तुमची Sendkar सबस्क्रिप्शन फी नाही, हे Meta स्वतः आकारते.",
      revenue: "या कॅम्पेनमुळे झालेली कमाई", revenueNote: "संपर्काला हे कॅम्पेन मिळाल्यानंतर 7 दिवसांत नोंदलेली किंवा सिंक झालेली विक्री.",
      queued: "वाट पाहत आहेत", sent: "पाठवले", delivered: "पोहोचले", read: "वाचले", failed: "गेले नाहीत", delivery: "पोहोचण्याचा दर",
    },
  },
  ta: {
    form: {
      newCampaign: "புதிய கேம்பெயின்", needTemplate: "முதலில் குறைந்தது ஒரு அங்கீகரிக்கப்பட்ட டெம்ப்ளேட் வேண்டும்", name: "கேம்பெயின் பெயர்", namePlaceholder: "தீபாவளி விற்பனை — எல்லா வாடிக்கையாளர்களும்",
      template: "டெம்ப்ளேட்", selectTemplate: "அங்கீகரிக்கப்பட்ட டெம்ப்ளேட்டைத் தேர்ந்தெடுங்கள்…", withPicture: "படத்துடன்",
      noPicture: "இந்த டெம்ப்ளேட்டின் மேலே படம் இல்லை, அதனால் உங்கள் கார்டு அனுப்பப்படாது. \"படத்துடன்\" என்று உள்ளதைத் தேர்ந்தெடுங்கள்.",
      noApproved: "அங்கீகரிக்கப்பட்ட டெம்ப்ளேட் இல்லை — கேம்பெயினில் பயன்படுத்த Meta அதை அங்கீகரிக்க வேண்டும்.", audience: "யாருக்கு அனுப்ப வேண்டும்",
      tagLabel: "டேக் மூலம் வடிகட்டு", tagHelp: "(விருப்பம் — காலியாக விட்டால் டெம்ப்ளேட்டின் மொழியில் உள்ள அனைவருக்கும் செல்லும்)", tagPlaceholder: "எ.கா. vip",
      segmentLabel: "அல்லது சேமித்த குழு", segmentHelp: "(இரண்டும் இருந்தால் மேலே உள்ள டேக்குடன் சேரும்)", none: "எதுவுமில்லை", counting: "எண்ணுகிறது…",
      willReceive: "{n} பேருக்கு இது கிடைக்கும்", checkTag: " — டேக் அல்லது டெம்ப்ளேட் மொழியைச் சரிபார்க்கவும்",
      sendFrom: "எங்கிருந்து அனுப்ப", sendFromHelp: "(விருப்பம் — உங்கள் முதன்மை எண் பயன்படுத்தப்படும்)", primaryNumber: "முதன்மை எண்",
      schedule: "நேரம் குறிக்கவும்", scheduleHelp: "(விருப்பம் — காலியாக விட்டால் கேம்பெயின் பக்கத்திலிருந்து நீங்களே அனுப்புங்கள்)", creating: "உருவாகிறது…", createDraft: "வரைவை உருவாக்கு",
      cardLanguages: "ஒவ்வொரு வாடிக்கையாளருக்கும் அவர்களின் சொந்த மொழியில் கார்டு கிடைக்கும். மேலே படம் உள்ள டெம்ப்ளேட்டைத் தேர்ந்தெடுங்கள்.", cardOne: "இந்தக் கார்டு கேம்பெயினுடன் செல்லும். மேலே படம் உள்ள டெம்ப்ளேட்டைத் தேர்ந்தெடுங்கள்.",
    },
    controls: {
      sendNow: "இப்போதே அனுப்பு", starting: "தொடங்குகிறது…", schedule: "நேரம் குறிக்கவும்", confirmSchedule: "நேரத்தை உறுதி செய்", scheduling: "குறிக்கிறது…", pause: "நிறுத்து", resume: "தொடரவும்", scheduledFor: "குறித்த நேரம்",
      startNote: "இப்போதே அனுப்பு என்பதை அழுத்தியவுடன் அனுப்புதல் தொடங்கும். நேரம் குறித்த கேம்பெயின் நீங்கள் தேர்ந்த நேரத்திலிருந்து சில நிமிடங்களுக்குள் செல்லும். அனுப்புதல் எப்போதும் உங்கள் எண்ணுக்கான Meta-வின் தினசரி வரம்புக்குள் இருக்கும்.",
    },
    detail: {
      multiLanguage: "பல மொழிகள் — ஒவ்வொருவருக்கும் சரியான மொழிச் செய்தி தானாகச் செல்லும் ({langs})", scheduledFor: "குறித்த நேரம்",
      costBefore: "அனுப்பும் முன் Meta-வின் மதிப்பிடப்பட்ட செலவு", costSoFar: "இதுவரை Meta-வின் செலவு",
      costNote: "{n} × {cat} கட்டணம் — இந்தியா, Meta வெளியிட்ட கட்டணங்களில். இது உங்கள் Sendkar சந்தா கட்டணம் அல்ல, இதை Meta தானே வசூலிக்கிறது.",
      revenue: "இந்தக் கேம்பெயினால் வந்த வருவாய்", revenueNote: "இந்தக் கேம்பெயின் கிடைத்த 7 நாட்களுக்குள் பதிவான அல்லது ஒத்திசைந்த விற்பனை.",
      queued: "காத்திருப்பவை", sent: "அனுப்பியவை", delivered: "சென்றடைந்தவை", read: "படித்தவை", failed: "செல்லாதவை", delivery: "சென்றடையும் விகிதம்",
    },
  },
  te: {
    form: {
      newCampaign: "కొత్త క్యాంపెయిన్", needTemplate: "ముందుగా కనీసం ఒక ఆమోదించిన టెంప్లేట్ కావాలి", name: "క్యాంపెయిన్ పేరు", namePlaceholder: "దీపావళి సేల్ — కస్టమర్లందరూ",
      template: "టెంప్లేట్", selectTemplate: "ఆమోదించిన టెంప్లేట్‌ను ఎంచుకోండి…", withPicture: "చిత్రంతో",
      noPicture: "ఈ టెంప్లేట్ పైన చిత్రం లేదు, కాబట్టి మీ కార్డ్ వెళ్ళదు. \"చిత్రంతో\" అని ఉన్నదాన్ని ఎంచుకోండి.",
      noApproved: "ఆమోదించిన టెంప్లేట్ లేదు — క్యాంపెయిన్‌లో వాడటానికి Meta దాన్ని ఆమోదించాలి.", audience: "ఎవరికి పంపాలి",
      tagLabel: "ట్యాగ్‌తో ఫిల్టర్ చేయండి", tagHelp: "(ఐచ్ఛికం — ఖాళీగా వదిలితే టెంప్లేట్ భాషలోని అందరికీ వెళ్తుంది)", tagPlaceholder: "ఉదా. vip",
      segmentLabel: "లేదా సేవ్ చేసిన గ్రూప్", segmentHelp: "(రెండూ ఉంటే పైన ట్యాగ్‌తో కలుస్తుంది)", none: "ఏదీ లేదు", counting: "లెక్కిస్తోంది…",
      willReceive: "{n} మందికి ఇది వస్తుంది", checkTag: " — ట్యాగ్ లేదా టెంప్లేట్ భాషను చూడండి",
      sendFrom: "ఎక్కడి నుండి పంపాలి", sendFromHelp: "(ఐచ్ఛికం — మీ ప్రధాన నంబర్ వాడబడుతుంది)", primaryNumber: "ప్రధాన నంబర్",
      schedule: "సమయం నిర్ణయించండి", scheduleHelp: "(ఐచ్ఛికం — ఖాళీగా వదిలితే క్యాంపెయిన్ పేజీ నుండి మీరే పంపండి)", creating: "తయారవుతోంది…", createDraft: "డ్రాఫ్ట్ తయారు చేయండి",
      cardLanguages: "ప్రతి కస్టమర్‌కు వారి స్వంత భాషలో కార్డ్ వస్తుంది. పైన చిత్రం ఉన్న టెంప్లేట్‌ను ఎంచుకోండి.", cardOne: "ఈ కార్డ్ క్యాంపెయిన్‌తో వెళ్తుంది. పైన చిత్రం ఉన్న టెంప్లేట్‌ను ఎంచుకోండి.",
    },
    controls: {
      sendNow: "ఇప్పుడే పంపండి", starting: "మొదలవుతోంది…", schedule: "సమయం నిర్ణయించండి", confirmSchedule: "సమయం ఖరారు చేయండి", scheduling: "నిర్ణయిస్తోంది…", pause: "ఆపండి", resume: "మళ్ళీ మొదలుపెట్టండి", scheduledFor: "నిర్ణయించిన సమయం",
      startNote: "ఇప్పుడే పంపండి నొక్కగానే పంపడం మొదలవుతుంది. సమయం నిర్ణయించిన క్యాంపెయిన్ మీరు ఎంచుకున్న సమయం నుండి కొన్ని నిమిషాల్లో వెళ్తుంది. పంపడం ఎప్పుడూ మీ నంబర్‌కు Meta రోజువారీ పరిమితిలోనే ఉంటుంది.",
    },
    detail: {
      multiLanguage: "బహుళ భాషలు — ప్రతి కాంటాక్ట్‌కు సరైన భాష సందేశం ఆటోమేటిక్‌గా వెళ్తుంది ({langs})", scheduledFor: "నిర్ణయించిన సమయం",
      costBefore: "పంపే ముందు Meta అంచనా ఖర్చు", costSoFar: "ఇప్పటివరకు Meta ఖర్చు",
      costNote: "{n} × {cat} రేటు — భారతదేశం, Meta ప్రచురించిన రేట్లలో. ఇది మీ Sendkar సబ్‌స్క్రిప్షన్ ఫీజు కాదు, దీన్ని Meta స్వయంగా వసూలు చేస్తుంది.",
      revenue: "ఈ క్యాంపెయిన్ వల్ల వచ్చిన ఆదాయం", revenueNote: "కాంటాక్ట్‌కు ఈ క్యాంపెయిన్ అందిన 7 రోజుల్లో నమోదైన లేదా సింక్ అయిన అమ్మకాలు.",
      queued: "వేచి ఉన్నవి", sent: "పంపినవి", delivered: "చేరినవి", read: "చదివినవి", failed: "వెళ్ళనివి", delivery: "చేరే రేటు",
    },
  },
  kn: {
    form: {
      newCampaign: "ಹೊಸ ಕ್ಯಾಂಪೇನ್", needTemplate: "ಮೊದಲು ಕನಿಷ್ಠ ಒಂದು ಅನುಮೋದಿತ ಟೆಂಪ್ಲೇಟ್ ಬೇಕು", name: "ಕ್ಯಾಂಪೇನ್ ಹೆಸರು", namePlaceholder: "ದೀಪಾವಳಿ ಸೇಲ್ — ಎಲ್ಲಾ ಗ್ರಾಹಕರು",
      template: "ಟೆಂಪ್ಲೇಟ್", selectTemplate: "ಅನುಮೋದಿತ ಟೆಂಪ್ಲೇಟ್ ಆರಿಸಿ…", withPicture: "ಚಿತ್ರದೊಂದಿಗೆ",
      noPicture: "ಈ ಟೆಂಪ್ಲೇಟ್‌ನ ಮೇಲೆ ಚಿತ್ರ ಇಲ್ಲ, ಆದ್ದರಿಂದ ನಿಮ್ಮ ಕಾರ್ಡ್ ಹೋಗುವುದಿಲ್ಲ. \"ಚಿತ್ರದೊಂದಿಗೆ\" ಎಂದಿರುವುದನ್ನು ಆರಿಸಿ.",
      noApproved: "ಅನುಮೋದಿತ ಟೆಂಪ್ಲೇಟ್ ಇಲ್ಲ — ಕ್ಯಾಂಪೇನ್‌ನಲ್ಲಿ ಬಳಸುವ ಮೊದಲು Meta ಅದನ್ನು ಅನುಮೋದಿಸಬೇಕು.", audience: "ಯಾರಿಗೆ ಕಳುಹಿಸಬೇಕು",
      tagLabel: "ಟ್ಯಾಗ್ ಮೂಲಕ ಆರಿಸಿ", tagHelp: "(ಐಚ್ಛಿಕ — ಖಾಲಿ ಬಿಟ್ಟರೆ ಟೆಂಪ್ಲೇಟ್ ಭಾಷೆಯ ಎಲ್ಲರಿಗೂ ಹೋಗುತ್ತದೆ)", tagPlaceholder: "ಉದಾ. vip",
      segmentLabel: "ಅಥವಾ ಉಳಿಸಿದ ಗುಂಪು", segmentHelp: "(ಎರಡೂ ಇದ್ದರೆ ಮೇಲಿನ ಟ್ಯಾಗ್‌ನೊಂದಿಗೆ ಸೇರುತ್ತದೆ)", none: "ಯಾವುದೂ ಇಲ್ಲ", counting: "ಎಣಿಸುತ್ತಿದೆ…",
      willReceive: "{n} ಜನರಿಗೆ ಇದು ಸಿಗುತ್ತದೆ", checkTag: " — ಟ್ಯಾಗ್ ಅಥವಾ ಟೆಂಪ್ಲೇಟ್ ಭಾಷೆಯನ್ನು ಪರಿಶೀಲಿಸಿ",
      sendFrom: "ಎಲ್ಲಿಂದ ಕಳುಹಿಸಬೇಕು", sendFromHelp: "(ಐಚ್ಛಿಕ — ನಿಮ್ಮ ಮುಖ್ಯ ಸಂಖ್ಯೆ ಬಳಕೆಯಾಗುತ್ತದೆ)", primaryNumber: "ಮುಖ್ಯ ಸಂಖ್ಯೆ",
      schedule: "ಸಮಯ ನಿಗದಿಸಿ", scheduleHelp: "(ಐಚ್ಛಿಕ — ಖಾಲಿ ಬಿಟ್ಟರೆ ಕ್ಯಾಂಪೇನ್ ಪುಟದಿಂದ ನೀವೇ ಕಳುಹಿಸಿ)", creating: "ತಯಾರಾಗುತ್ತಿದೆ…", createDraft: "ಡ್ರಾಫ್ಟ್ ಮಾಡಿ",
      cardLanguages: "ಪ್ರತಿ ಗ್ರಾಹಕರಿಗೆ ಅವರ ಸ್ವಂತ ಭಾಷೆಯಲ್ಲಿ ಕಾರ್ಡ್ ಸಿಗುತ್ತದೆ. ಮೇಲೆ ಚಿತ್ರ ಇರುವ ಟೆಂಪ್ಲೇಟ್ ಆರಿಸಿ.", cardOne: "ಈ ಕಾರ್ಡ್ ಕ್ಯಾಂಪೇನ್‌ನೊಂದಿಗೆ ಹೋಗುತ್ತದೆ. ಮೇಲೆ ಚಿತ್ರ ಇರುವ ಟೆಂಪ್ಲೇಟ್ ಆರಿಸಿ.",
    },
    controls: {
      sendNow: "ಈಗಲೇ ಕಳುಹಿಸಿ", starting: "ಶುರುವಾಗುತ್ತಿದೆ…", schedule: "ಸಮಯ ನಿಗದಿಸಿ", confirmSchedule: "ಸಮಯ ಖಚಿತಪಡಿಸಿ", scheduling: "ನಿಗದಿಸುತ್ತಿದೆ…", pause: "ನಿಲ್ಲಿಸಿ", resume: "ಮತ್ತೆ ಶುರು ಮಾಡಿ", scheduledFor: "ನಿಗದಿತ ಸಮಯ",
      startNote: "ಈಗಲೇ ಕಳುಹಿಸಿ ಒತ್ತಿದ ತಕ್ಷಣ ಕಳುಹಿಸುವಿಕೆ ಶುರುವಾಗುತ್ತದೆ. ಸಮಯ ನಿಗದಿಸಿದ ಕ್ಯಾಂಪೇನ್ ನೀವು ಆರಿಸಿದ ಸಮಯದಿಂದ ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ ಹೋಗುತ್ತದೆ. ಕಳುಹಿಸುವಿಕೆ ಯಾವಾಗಲೂ ನಿಮ್ಮ ಸಂಖ್ಯೆಗೆ Meta ದ ದೈನಂದಿನ ಮಿತಿಯೊಳಗೇ ಇರುತ್ತದೆ.",
    },
    detail: {
      multiLanguage: "ಬಹು ಭಾಷೆ — ಪ್ರತಿ ಸಂಪರ್ಕಕ್ಕೂ ಸರಿಯಾದ ಭಾಷೆಯ ಸಂದೇಶ ತಾನಾಗಿ ಹೋಗುತ್ತದೆ ({langs})", scheduledFor: "ನಿಗದಿತ ಸಮಯ",
      costBefore: "ಕಳುಹಿಸುವ ಮೊದಲು Meta ದ ಅಂದಾಜು ವೆಚ್ಚ", costSoFar: "ಇಲ್ಲಿಯವರೆಗಿನ Meta ವೆಚ್ಚ",
      costNote: "{n} × {cat} ದರ — ಭಾರತ, Meta ಪ್ರಕಟಿಸಿದ ದರಗಳಲ್ಲಿ. ಇದು ನಿಮ್ಮ Sendkar ಚಂದಾ ಶುಲ್ಕ ಅಲ್ಲ, ಇದನ್ನು Meta ಸ್ವತಃ ವಿಧಿಸುತ್ತದೆ.",
      revenue: "ಈ ಕ್ಯಾಂಪೇನ್‌ನಿಂದ ಬಂದ ಆದಾಯ", revenueNote: "ಸಂಪರ್ಕಕ್ಕೆ ಈ ಕ್ಯಾಂಪೇನ್ ಸಿಕ್ಕ 7 ದಿನಗಳೊಳಗೆ ದಾಖಲಾದ ಅಥವಾ ಸಿಂಕ್ ಆದ ಮಾರಾಟ.",
      queued: "ಕಾಯುತ್ತಿರುವವು", sent: "ಕಳುಹಿಸಿದವು", delivered: "ತಲುಪಿದವು", read: "ಓದಿದವು", failed: "ಹೋಗದವು", delivery: "ತಲುಪುವ ಪ್ರಮಾಣ",
    },
  },
  gu: {
    form: {
      newCampaign: "નવું કેમ્પેઇન", needTemplate: "પહેલા ઓછામાં ઓછું એક મંજૂર ટેમ્પલેટ જોઈએ", name: "કેમ્પેઇનનું નામ", namePlaceholder: "દિવાળી સેલ — બધા ગ્રાહકો",
      template: "ટેમ્પલેટ", selectTemplate: "મંજૂર ટેમ્પલેટ પસંદ કરો…", withPicture: "ચિત્ર સાથે",
      noPicture: "આ ટેમ્પલેટમાં ઉપર ચિત્ર નથી, એટલે તમારું કાર્ડ નહીં જાય. \"ચિત્ર સાથે\" વાળું પસંદ કરો.",
      noApproved: "કોઈ મંજૂર ટેમ્પલેટ નથી — કેમ્પેઇનમાં વાપરતા પહેલા Meta એ તેને મંજૂર કરવું પડશે.", audience: "કોને મોકલવું છે",
      tagLabel: "ટેગથી પસંદ કરો", tagHelp: "(વૈકલ્પિક — ખાલી રાખશો તો ટેમ્પલેટની ભાષાવાળા બધાને જશે)", tagPlaceholder: "જેમ કે vip",
      segmentLabel: "અથવા સેવ કરેલું ગ્રુપ", segmentHelp: "(બંને ભર્યા હોય તો ઉપરના ટેગ સાથે જોડાશે)", none: "કંઈ નહીં", counting: "ગણી રહ્યા છીએ…",
      willReceive: "{n} લોકોને આ મળશે", checkTag: " — ટેગ અથવા ટેમ્પલેટની ભાષા તપાસો",
      sendFrom: "ક્યાંથી મોકલવું", sendFromHelp: "(વૈકલ્પિક — તમારો મુખ્ય નંબર વપરાશે)", primaryNumber: "મુખ્ય નંબર",
      schedule: "સમય નક્કી કરો", scheduleHelp: "(વૈકલ્પિક — ખાલી રાખશો તો કેમ્પેઇન પેજ પરથી જાતે મોકલો)", creating: "બની રહ્યું છે…", createDraft: "ડ્રાફ્ટ બનાવો",
      cardLanguages: "દરેક ગ્રાહકને તેમની પોતાની ભાષામાં કાર્ડ મળશે. ઉપર ચિત્ર વાળું ટેમ્પલેટ પસંદ કરો.", cardOne: "આ કાર્ડ કેમ્પેઇન સાથે જશે. ઉપર ચિત્ર વાળું ટેમ્પલેટ પસંદ કરો.",
    },
    controls: {
      sendNow: "હમણાં જ મોકલો", starting: "શરૂ થઈ રહ્યું છે…", schedule: "સમય નક્કી કરો", confirmSchedule: "સમય પાકો કરો", scheduling: "નક્કી થઈ રહ્યું છે…", pause: "અટકાવો", resume: "ફરી શરૂ કરો", scheduledFor: "નક્કી કરેલો સમય",
      startNote: "હમણાં જ મોકલો દબાવતા જ મોકલવાનું શરૂ થઈ જાય છે. સમય નક્કી કરેલું કેમ્પેઇન તમે પસંદ કરેલા સમયથી થોડી જ મિનિટોમાં જાય છે. મોકલવાનું હંમેશા તમારા નંબરની Meta ની રોજની મર્યાદામાં રહે છે.",
    },
    detail: {
      multiLanguage: "ઘણી ભાષાઓ — દરેક સંપર્કને સાચી ભાષાનો સંદેશ આપોઆપ જાય છે ({langs})", scheduledFor: "નક્કી કરેલો સમય",
      costBefore: "મોકલતા પહેલા Meta નો અંદાજિત ખર્ચ", costSoFar: "અત્યાર સુધીનો Meta નો ખર્ચ",
      costNote: "{n} × {cat} દર — ભારત, Meta ના પ્રકાશિત દરો પ્રમાણે. આ તમારી Sendkar સબ્સ્ક્રિપ્શન ફી નથી, આ Meta પોતે લે છે.",
      revenue: "આ કેમ્પેઇનથી થયેલી કમાણી", revenueNote: "સંપર્કને આ કેમ્પેઇન મળ્યાના 7 દિવસમાં નોંધાયેલું કે સિંક થયેલું વેચાણ.",
      queued: "રાહ જોઈ રહ્યા", sent: "મોકલ્યા", delivered: "પહોંચ્યા", read: "વાંચ્યા", failed: "ન ગયા", delivery: "પહોંચવાનો દર",
    },
  },
};
