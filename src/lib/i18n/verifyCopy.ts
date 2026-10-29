import type { LanguageCode } from "./dictionaries";
import type { VerifyError } from "@/lib/phoneVerify";

/** Words for the "verify your WhatsApp number" screen. `{phone}` is filled in by the page. */
export type VerifyCopy = {
  title: string; sentTo: string; codeLabel: string; verify: string; verifying: string; resend: string; sending: string; sent: string; otherNumber: string;
  errors: Record<VerifyError, string>;
};

export const VERIFY_COPY: Record<LanguageCode, VerifyCopy> = {
  en: {
    title: "Verify your WhatsApp number", sentTo: "We sent a 6-digit code on WhatsApp to {phone}.", codeLabel: "Enter the code", verify: "Verify", verifying: "Checking…",
    resend: "Send the code again", sending: "Sending…", sent: "Code sent. Check your WhatsApp.", otherNumber: "Use a different number",
    errors: {
      notAvailable: "Verification is not available right now. Please contact support.", wait: "Please wait a minute before asking again.", tooMany: "Too many codes asked for. Try again later.",
      sendFailed: "We could not send the code. Try again in a moment.", wrong: "That code is not right.", expired: "That code has expired. Send a new one.", tooManyAttempts: "Too many tries. Send a new code.",
    },
  },
  hi: {
    title: "अपना WhatsApp नंबर वेरिफ़ाई करें", sentTo: "हमने {phone} पर WhatsApp में 6 अंकों का कोड भेजा है।", codeLabel: "कोड डालें", verify: "वेरिफ़ाई करें", verifying: "जाँच हो रही है…",
    resend: "कोड फिर से भेजें", sending: "भेज रहे हैं…", sent: "कोड भेज दिया। अपना WhatsApp देखें।", otherNumber: "दूसरा नंबर इस्तेमाल करें",
    errors: {
      notAvailable: "अभी वेरिफ़िकेशन उपलब्ध नहीं है। कृपया सपोर्ट से संपर्क करें।", wait: "दोबारा माँगने से पहले एक मिनट रुकें।", tooMany: "बहुत ज़्यादा कोड माँगे गए। बाद में कोशिश करें।",
      sendFailed: "हम कोड नहीं भेज सके। थोड़ी देर में फिर कोशिश करें।", wrong: "यह कोड सही नहीं है।", expired: "इस कोड की समय-सीमा ख़त्म हो गई। नया कोड भेजें।", tooManyAttempts: "बहुत ज़्यादा कोशिशें हुईं। नया कोड भेजें।",
    },
  },
  mr: {
    title: "तुमचा WhatsApp नंबर व्हेरिफाय करा", sentTo: "आम्ही {phone} वर WhatsApp मध्ये 6 अंकी कोड पाठवला आहे.", codeLabel: "कोड टाका", verify: "व्हेरिफाय करा", verifying: "तपासत आहे…",
    resend: "कोड पुन्हा पाठवा", sending: "पाठवत आहे…", sent: "कोड पाठवला. तुमचे WhatsApp पाहा.", otherNumber: "दुसरा नंबर वापरा",
    errors: {
      notAvailable: "सध्या व्हेरिफिकेशन उपलब्ध नाही. कृपया सपोर्टशी संपर्क साधा.", wait: "पुन्हा मागण्यापूर्वी एक मिनिट थांबा.", tooMany: "खूप जास्त कोड मागितले गेले. नंतर प्रयत्न करा.",
      sendFailed: "आम्ही कोड पाठवू शकलो नाही. थोड्या वेळाने पुन्हा प्रयत्न करा.", wrong: "हा कोड बरोबर नाही.", expired: "या कोडची मुदत संपली आहे. नवीन कोड पाठवा.", tooManyAttempts: "खूप जास्त प्रयत्न झाले. नवीन कोड पाठवा.",
    },
  },
  ta: {
    title: "உங்கள் WhatsApp எண்ணைச் சரிபார்க்கவும்", sentTo: "{phone} க்கு WhatsApp-இல் 6 இலக்கக் குறியீட்டை அனுப்பியுள்ளோம்.", codeLabel: "குறியீட்டை உள்ளிடவும்", verify: "சரிபார்", verifying: "சரிபார்க்கிறது…",
    resend: "குறியீட்டை மீண்டும் அனுப்பு", sending: "அனுப்புகிறது…", sent: "குறியீடு அனுப்பப்பட்டது. உங்கள் WhatsApp-ஐப் பாருங்கள்.", otherNumber: "வேறு எண்ணைப் பயன்படுத்து",
    errors: {
      notAvailable: "இப்போது சரிபார்ப்பு கிடைக்கவில்லை. ஆதரவைத் தொடர்பு கொள்ளவும்.", wait: "மீண்டும் கேட்கும் முன் ஒரு நிமிடம் காத்திருக்கவும்.", tooMany: "அதிகமான குறியீடுகள் கேட்கப்பட்டன. பின்னர் முயலவும்.",
      sendFailed: "குறியீட்டை அனுப்ப முடியவில்லை. சிறிது நேரம் கழித்து முயலவும்.", wrong: "அந்தக் குறியீடு சரியல்ல.", expired: "அந்தக் குறியீட்டின் காலம் முடிந்தது. புதியதை அனுப்புங்கள்.", tooManyAttempts: "அதிக முயற்சிகள். புதிய குறியீட்டை அனுப்புங்கள்.",
    },
  },
  te: {
    title: "మీ WhatsApp నంబర్‌ను ధృవీకరించండి", sentTo: "{phone} కు WhatsApp లో 6 అంకెల కోడ్ పంపాము.", codeLabel: "కోడ్ నమోదు చేయండి", verify: "ధృవీకరించు", verifying: "తనిఖీ చేస్తోంది…",
    resend: "కోడ్ మళ్ళీ పంపు", sending: "పంపుతోంది…", sent: "కోడ్ పంపబడింది. మీ WhatsApp చూడండి.", otherNumber: "వేరే నంబర్ వాడండి",
    errors: {
      notAvailable: "ప్రస్తుతం ధృవీకరణ అందుబాటులో లేదు. దయచేసి సపోర్ట్‌ను సంప్రదించండి.", wait: "మళ్ళీ అడగడానికి ముందు ఒక నిమిషం ఆగండి.", tooMany: "చాలా ఎక్కువ కోడ్‌లు అడిగారు. తర్వాత ప్రయత్నించండి.",
      sendFailed: "కోడ్ పంపలేకపోయాం. కొద్దిసేపటి తర్వాత ప్రయత్నించండి.", wrong: "ఆ కోడ్ సరైనది కాదు.", expired: "ఆ కోడ్ గడువు ముగిసింది. కొత్తది పంపండి.", tooManyAttempts: "చాలా ఎక్కువ ప్రయత్నాలు. కొత్త కోడ్ పంపండి.",
    },
  },
  kn: {
    title: "ನಿಮ್ಮ WhatsApp ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ", sentTo: "{phone} ಗೆ WhatsApp ನಲ್ಲಿ 6 ಅಂಕಿಯ ಕೋಡ್ ಕಳುಹಿಸಿದ್ದೇವೆ.", codeLabel: "ಕೋಡ್ ನಮೂದಿಸಿ", verify: "ಪರಿಶೀಲಿಸಿ", verifying: "ಪರಿಶೀಲಿಸುತ್ತಿದೆ…",
    resend: "ಕೋಡ್ ಮತ್ತೆ ಕಳುಹಿಸಿ", sending: "ಕಳುಹಿಸುತ್ತಿದೆ…", sent: "ಕೋಡ್ ಕಳುಹಿಸಲಾಗಿದೆ. ನಿಮ್ಮ WhatsApp ನೋಡಿ.", otherNumber: "ಬೇರೆ ಸಂಖ್ಯೆ ಬಳಸಿ",
    errors: {
      notAvailable: "ಈಗ ಪರಿಶೀಲನೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಸಪೋರ್ಟ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಿ.", wait: "ಮತ್ತೆ ಕೇಳುವ ಮೊದಲು ಒಂದು ನಿಮಿಷ ಕಾಯಿರಿ.", tooMany: "ತುಂಬಾ ಹೆಚ್ಚು ಕೋಡ್‌ಗಳನ್ನು ಕೇಳಲಾಗಿದೆ. ನಂತರ ಪ್ರಯತ್ನಿಸಿ.",
      sendFailed: "ಕೋಡ್ ಕಳುಹಿಸಲಾಗಲಿಲ್ಲ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", wrong: "ಆ ಕೋಡ್ ಸರಿಯಾಗಿಲ್ಲ.", expired: "ಆ ಕೋಡ್‌ನ ಅವಧಿ ಮುಗಿದಿದೆ. ಹೊಸದನ್ನು ಕಳುಹಿಸಿ.", tooManyAttempts: "ತುಂಬಾ ಹೆಚ್ಚು ಪ್ರಯತ್ನಗಳು. ಹೊಸ ಕೋಡ್ ಕಳುಹಿಸಿ.",
    },
  },
  gu: {
    title: "તમારો WhatsApp નંબર વેરિફાય કરો", sentTo: "અમે {phone} પર WhatsApp માં 6 આંકડાનો કોડ મોકલ્યો છે.", codeLabel: "કોડ દાખલ કરો", verify: "વેરિફાય કરો", verifying: "તપાસી રહ્યા છીએ…",
    resend: "કોડ ફરી મોકલો", sending: "મોકલી રહ્યા છીએ…", sent: "કોડ મોકલ્યો. તમારું WhatsApp જુઓ.", otherNumber: "બીજો નંબર વાપરો",
    errors: {
      notAvailable: "હમણાં વેરિફિકેશન ઉપલબ્ધ નથી. કૃપા કરીને સપોર્ટનો સંપર્ક કરો.", wait: "ફરી માંગતા પહેલા એક મિનિટ રાહ જુઓ.", tooMany: "ઘણા બધા કોડ માંગ્યા છે. પછી પ્રયાસ કરો.",
      sendFailed: "અમે કોડ મોકલી શક્યા નથી. થોડી વારમાં ફરી પ્રયાસ કરો.", wrong: "આ કોડ સાચો નથી.", expired: "આ કોડની મુદત પૂરી થઈ ગઈ છે. નવો કોડ મોકલો.", tooManyAttempts: "ઘણા બધા પ્રયાસો થયા. નવો કોડ મોકલો.",
    },
  },
};
