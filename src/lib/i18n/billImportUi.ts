import type { LanguageCode } from "./dictionaries";

/** Words for sending bills from a pasted Tally or Excel sales list. `{n}` is filled in by the page. */
export type BillImportUi = {
  title: string; hint: string; button: string; working: string;
  resultSent: string; resultOld: string; resultNoNumber: string; resultAlready: string; resultFailed: string;
};

export const BILL_IMPORT_UI: Record<LanguageCode, BillImportUi> = {
  en: {
    title: "Send today's bills from Tally or Excel",
    hint: "Copy the sales list from Tally (Sales Register or Day Book) or Excel and paste it here, with its heading row. Tally has no mobile numbers, so each party is matched by name to a customer you already have. Only the last two days' sales are sent, up to 40 at a time.",
    button: "Send these bills", working: "Sending…",
    resultSent: "{n} bills sent.", resultOld: "{n} older sales skipped.", resultNoNumber: "No mobile number found for these, so they were not sent. Add them as customers with the same name, or add a Mobile column:", resultAlready: "{n} were already billed before.", resultFailed: "{n} could not be sent:",
  },
  hi: {
    title: "Tally या Excel से आज के बिल भेजें",
    hint: "Tally (सेल्स रजिस्टर या डे बुक) या Excel से बिक्री की सूची हेडिंग वाली पहली पंक्ति के साथ कॉपी करके यहाँ चिपकाएँ। Tally में मोबाइल नंबर नहीं होते, इसलिए हर पार्टी को नाम से आपके मौजूदा ग्राहक से मिलाया जाता है। सिर्फ़ पिछले दो दिन की बिक्री भेजी जाती है, एक बार में 40 तक।",
    button: "ये बिल भेजें", working: "भेज रहे हैं…",
    resultSent: "{n} बिल भेजे गए।", resultOld: "{n} पुरानी बिक्री छोड़ी गई।", resultNoNumber: "इनके मोबाइल नंबर नहीं मिले, इसलिए नहीं भेजे गए। इसी नाम से इन्हें ग्राहक के रूप में जोड़ें, या Mobile कॉलम जोड़ें:", resultAlready: "{n} के बिल पहले ही बन चुके हैं।", resultFailed: "{n} नहीं भेजे जा सके:",
  },
  mr: {
    title: "Tally किंवा Excel मधून आजची बिले पाठवा",
    hint: "Tally (सेल्स रजिस्टर किंवा डे बुक) किंवा Excel मधून विक्रीची यादी शीर्षकाच्या ओळीसह कॉपी करून इथे पेस्ट करा. Tally मध्ये मोबाइल नंबर नसतात, म्हणून प्रत्येक पार्टी नावाने तुमच्या सध्याच्या ग्राहकाशी जुळवली जाते. फक्त मागील दोन दिवसांची विक्री पाठवली जाते, एकावेळी 40 पर्यंत.",
    button: "ही बिले पाठवा", working: "पाठवत आहे…",
    resultSent: "{n} बिले पाठवली.", resultOld: "{n} जुनी विक्री वगळली.", resultNoNumber: "यांचे मोबाइल नंबर सापडले नाहीत, म्हणून पाठवले नाहीत. याच नावाने त्यांना ग्राहक म्हणून जोडा, किंवा Mobile कॉलम जोडा:", resultAlready: "{n} चे बिल आधीच झाले आहे.", resultFailed: "{n} पाठवता आली नाहीत:",
  },
  gu: {
    title: "Tally અથવા Excel માંથી આજનાં બિલ મોકલો",
    hint: "Tally (સેલ્સ રજિસ્ટર કે ડે બુક) અથવા Excel માંથી વેચાણની યાદી હેડિંગ વાળી પહેલી લીટી સાથે કૉપી કરીને અહીં પેસ્ટ કરો. Tally માં મોબાઇલ નંબર હોતા નથી, એટલે દરેક પાર્ટીને નામથી તમારા હાલના ગ્રાહક સાથે મેળવવામાં આવે છે. ફક્ત છેલ્લા બે દિવસનું વેચાણ મોકલાય છે, એક વારમાં 40 સુધી.",
    button: "આ બિલ મોકલો", working: "મોકલી રહ્યા છીએ…",
    resultSent: "{n} બિલ મોકલ્યાં.", resultOld: "{n} જૂનું વેચાણ છોડ્યું.", resultNoNumber: "આમના મોબાઇલ નંબર મળ્યા નથી, એટલે મોકલ્યા નથી. આ જ નામથી તેમને ગ્રાહક તરીકે ઉમેરો, અથવા Mobile કૉલમ ઉમેરો:", resultAlready: "{n} નાં બિલ પહેલાં બની ગયાં છે.", resultFailed: "{n} મોકલી શકાયાં નથી:",
  },
  ta: {
    title: "Tally அல்லது Excel-இலிருந்து இன்றைய பில்களை அனுப்பு",
    hint: "Tally (சேல்ஸ் ரிஜிஸ்டர் அல்லது டே புக்) அல்லது Excel-இலிருந்து விற்பனை பட்டியலை தலைப்பு வரியுடன் நகலெடுத்து இங்கே ஒட்டவும். Tally-யில் மொபைல் எண்கள் இருக்காது, அதனால் ஒவ்வொரு பார்ட்டியும் பெயரால் உங்கள் தற்போதைய வாடிக்கையாளருடன் பொருத்தப்படும். கடந்த இரண்டு நாட்களின் விற்பனை மட்டுமே அனுப்பப்படும், ஒரு முறைக்கு 40 வரை.",
    button: "இந்த பில்களை அனுப்பு", working: "அனுப்புகிறது…",
    resultSent: "{n} பில்கள் அனுப்பப்பட்டன.", resultOld: "{n} பழைய விற்பனை தவிர்க்கப்பட்டது.", resultNoNumber: "இவர்களுக்கு மொபைல் எண் கிடைக்கவில்லை, அதனால் அனுப்பவில்லை. அதே பெயரில் அவர்களை வாடிக்கையாளராகச் சேர்க்கவும், அல்லது Mobile நெடுவரிசையைச் சேர்க்கவும்:", resultAlready: "{n} பில்கள் ஏற்கனவே போடப்பட்டுவிட்டன.", resultFailed: "{n} அனுப்ப முடியவில்லை:",
  },
  te: {
    title: "Tally లేదా Excel నుండి ఈ రోజు బిల్లులు పంపండి",
    hint: "Tally (సేల్స్ రిజిస్టర్ లేదా డే బుక్) లేదా Excel నుండి అమ్మకాల జాబితాను హెడింగ్ వరుసతో కాపీ చేసి ఇక్కడ పేస్ట్ చేయండి. Tallyలో మొబైల్ నంబర్లు ఉండవు, కాబట్టి ప్రతి పార్టీని పేరుతో మీ ప్రస్తుత కస్టమర్‌తో సరిపోల్చుతాం. గత రెండు రోజుల అమ్మకాలు మాత్రమే పంపబడతాయి, ఒకేసారి 40 వరకు.",
    button: "ఈ బిల్లులు పంపండి", working: "పంపుతున్నాం…",
    resultSent: "{n} బిల్లులు పంపారు.", resultOld: "{n} పాత అమ్మకాలు వదిలేశాం.", resultNoNumber: "వీరి మొబైల్ నంబర్లు దొరకలేదు, అందుకే పంపలేదు. అదే పేరుతో వారిని కస్టమర్లుగా చేర్చండి, లేదా Mobile కాలమ్ జోడించండి:", resultAlready: "{n} బిల్లులు ఇంతకుముందే వేశారు.", resultFailed: "{n} పంపలేకపోయాం:",
  },
  kn: {
    title: "Tally ಅಥವಾ Excel ನಿಂದ ಇಂದಿನ ಬಿಲ್‌ಗಳನ್ನು ಕಳುಹಿಸಿ",
    hint: "Tally (ಸೇಲ್ಸ್ ರಿಜಿಸ್ಟರ್ ಅಥವಾ ಡೇ ಬುಕ್) ಅಥವಾ Excel ನಿಂದ ಮಾರಾಟದ ಪಟ್ಟಿಯನ್ನು ಶೀರ್ಷಿಕೆ ಸಾಲಿನೊಂದಿಗೆ ನಕಲಿಸಿ ಇಲ್ಲಿ ಅಂಟಿಸಿ. Tally ಯಲ್ಲಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಇರುವುದಿಲ್ಲ, ಆದ್ದರಿಂದ ಪ್ರತಿ ಪಾರ್ಟಿಯನ್ನು ಹೆಸರಿನಿಂದ ನಿಮ್ಮ ಈಗಿನ ಗ್ರಾಹಕರೊಂದಿಗೆ ಹೊಂದಿಸಲಾಗುತ್ತದೆ. ಕಳೆದ ಎರಡು ದಿನಗಳ ಮಾರಾಟ ಮಾತ್ರ ಕಳುಹಿಸಲಾಗುತ್ತದೆ, ಒಮ್ಮೆಗೆ 40 ವರೆಗೆ.",
    button: "ಈ ಬಿಲ್‌ಗಳನ್ನು ಕಳುಹಿಸಿ", working: "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ…",
    resultSent: "{n} ಬಿಲ್‌ಗಳನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ.", resultOld: "{n} ಹಳೆಯ ಮಾರಾಟಗಳನ್ನು ಬಿಟ್ಟಿದೆ.", resultNoNumber: "ಇವರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಸಿಗಲಿಲ್ಲ, ಆದ್ದರಿಂದ ಕಳುಹಿಸಿಲ್ಲ. ಅದೇ ಹೆಸರಿನಲ್ಲಿ ಅವರನ್ನು ಗ್ರಾಹಕರಾಗಿ ಸೇರಿಸಿ, ಅಥವಾ Mobile ಕಾಲಮ್ ಸೇರಿಸಿ:", resultAlready: "{n} ಬಿಲ್‌ಗಳನ್ನು ಈಗಾಗಲೇ ಮಾಡಲಾಗಿದೆ.", resultFailed: "{n} ಕಳುಹಿಸಲಾಗಲಿಲ್ಲ:",
  },
};
