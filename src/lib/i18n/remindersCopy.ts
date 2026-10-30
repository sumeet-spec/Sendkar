import type { LanguageCode } from "./dictionaries";

/** Words for the Payment reminders screen. `{n}`, `{a}`, `{b}`, `{days}` are filled in by the page. */
export type RemindersUi = {
  title: string; intro: string; beforeTitle: string; connectA: string; channelsLink: string; connectB: string; needTemplate: string; gwA: string; paymentsLink: string; gwB: string;
  outstanding: string; overdueLabel: string; collected: string; billOne: string; billMany: string; paidSub: string;
  colCustomer: string; colAmount: string; colDue: string; colStatus: string; colReminders: string;
  stPaid: string; stStopped: string; stFailed: string; stOverdue: string; stOpen: string; allSent: string; aOfB: string; emptyTitle: string; emptyHint: string;
  remindNow: string; markPaid: string; stop: string; resume: string; reminderSent: string;
  tplTitle: string; tplHelp: string; noTemplate: string; tplSave: string; tplSaving: string; tplSaved: string; noApprovedA: string; noApprovedB: string; templatesLink: string; noApprovedC: string; suggested: string; english: string; gujaratiCheck: string;
  pasteLabel: string; pasteHelp: string; uploadLabel: string; langLabel: string; select: string; consent: string; importBtn: string; importing: string; added: string; skippedDup: string; skippedOpted: string;
};

export const REMINDERS_UI: Record<LanguageCode, RemindersUi> = {
  en: {
    title: "Payment reminders", intro: "Paste the bills you are waiting on and Sendkar reminds each customer on WhatsApp: 3 days before the due date, on the day, then {days} days after, with a payment link. It stops the moment they pay or reply STOP.",
    beforeTitle: "Before reminders can go out", connectA: "Connect your WhatsApp number in ", channelsLink: "Channels", connectB: ".", needTemplate: "Choose an approved reminder message below.",
    gwA: "Razorpay or PayU is not connected, so reminders will tell customers to reply instead of giving a link. Connect one in ", paymentsLink: "Payments", gwB: ".",
    outstanding: "Outstanding", overdueLabel: "Overdue", collected: "Collected", billOne: "1 bill", billMany: "{n} bills", paidSub: "{n} marked paid",
    colCustomer: "Customer", colAmount: "Amount", colDue: "Due", colStatus: "Status", colReminders: "Reminders",
    stPaid: "Paid", stStopped: "Stopped", stFailed: "Failed", stOverdue: "Overdue", stOpen: "Open", allSent: "All sent", aOfB: "{a} of {b}", emptyTitle: "No bills yet.", emptyHint: "Paste your outstanding list above to start.",
    remindNow: "Remind now", markPaid: "Mark paid", stop: "Stop", resume: "Resume", reminderSent: "Reminder sent.",
    tplTitle: "Reminder message", tplHelp: "Reminders go out as a WhatsApp-approved template, because customers usually have not written to you in the last 24 hours. Pick an approved one with four variables: {{1}} name, {{2}} amount, {{3}} due date, {{4}} payment link.",
    noTemplate: "No template chosen", tplSave: "Save", tplSaving: "Saving…", tplSaved: "Saved.", noApprovedA: "No approved templates yet. Create a Utility template in ", noApprovedB: "Templates", noApprovedC: " using the text below, then come back once WhatsApp approves it.", templatesLink: "Templates", suggested: "Suggested template text", english: "English", gujaratiCheck: "Gujarati (have a native speaker check it)",
    pasteLabel: "Paste your outstanding list", pasteHelp: "Copy the rows straight from Excel or a Tally report. Columns can be in any order if the first row has headings like Party, Mobile, Amount, Due date. No due date means due today. Up to 500 rows at a time.",
    uploadLabel: "…or upload a CSV file", langLabel: "Customers' language", select: "Select…", consent: "These customers have agreed to receive payment reminders from us on WhatsApp. (WhatsApp requires this, and anyone who replies STOP is removed automatically.)",
    importBtn: "Import bills", importing: "Importing…", added: "Added {n} bills", skippedDup: ", skipped {n} already on the list", skippedOpted: ", skipped {n} who opted out",
  },
  hi: {
    title: "पेमेंट रिमाइंडर", intro: "जिन बिलों का पैसा बाकी है उन्हें पेस्ट करें और Sendkar हर ग्राहक को WhatsApp पर याद दिलाएगा: देय तारीख़ से 3 दिन पहले, उसी दिन, फिर {days} दिन बाद, पेमेंट लिंक के साथ। ग्राहक के भुगतान करते ही या STOP लिखते ही यह रुक जाता है।",
    beforeTitle: "रिमाइंडर जाने से पहले", connectA: "अपना WhatsApp नंबर ", channelsLink: "चैनल", connectB: " में जोड़ें।", needTemplate: "नीचे से एक मंज़ूर किया हुआ रिमाइंडर संदेश चुनें।",
    gwA: "Razorpay या PayU नहीं जुड़ा है, इसलिए रिमाइंडर लिंक देने की जगह ग्राहक से जवाब देने को कहेंगे। इसे ", paymentsLink: "भुगतान", gwB: " में जोड़ें।",
    outstanding: "बाकी रकम", overdueLabel: "देर हो चुकी", collected: "वसूल हुआ", billOne: "1 बिल", billMany: "{n} बिल", paidSub: "{n} चुकता",
    colCustomer: "ग्राहक", colAmount: "रकम", colDue: "देय तारीख़", colStatus: "स्थिति", colReminders: "रिमाइंडर",
    stPaid: "चुकता", stStopped: "रुका हुआ", stFailed: "विफल", stOverdue: "देर हो चुकी", stOpen: "बाकी", allSent: "सब भेजे गए", aOfB: "{b} में से {a}", emptyTitle: "अभी कोई बिल नहीं।", emptyHint: "शुरू करने के लिए ऊपर अपनी बाकी सूची पेस्ट करें।",
    remindNow: "अभी याद दिलाएँ", markPaid: "चुकता करें", stop: "रोकें", resume: "फिर शुरू करें", reminderSent: "रिमाइंडर भेज दिया।",
    tplTitle: "रिमाइंडर संदेश", tplHelp: "रिमाइंडर WhatsApp से मंज़ूर टेम्पलेट के रूप में जाते हैं, क्योंकि ग्राहकों ने आमतौर पर पिछले 24 घंटों में आपको नहीं लिखा होता। चार वेरिएबल वाला मंज़ूर टेम्पलेट चुनें: {{1}} नाम, {{2}} रकम, {{3}} देय तारीख़, {{4}} पेमेंट लिंक।",
    noTemplate: "कोई टेम्पलेट नहीं चुना", tplSave: "सेव करें", tplSaving: "सेव हो रहा है…", tplSaved: "सेव हो गया।", noApprovedA: "अभी कोई मंज़ूर टेम्पलेट नहीं है। नीचे के टेक्स्ट से ", noApprovedB: "टेम्पलेट", noApprovedC: " में एक Utility टेम्पलेट बनाएँ, फिर WhatsApp के मंज़ूर करने पर वापस आएँ।", templatesLink: "टेम्पलेट", suggested: "सुझाया गया टेम्पलेट टेक्स्ट", english: "अंग्रेज़ी", gujaratiCheck: "गुजराती (किसी जानकार से जँचवा लें)",
    pasteLabel: "अपनी बाकी सूची पेस्ट करें", pasteHelp: "पंक्तियाँ सीधे Excel या Tally रिपोर्ट से कॉपी करें। पहली पंक्ति में Party, Mobile, Amount, Due date जैसे शीर्षक हों तो कॉलम किसी भी क्रम में हो सकते हैं। देय तारीख़ न हो तो आज की मानी जाती है। एक बार में 500 पंक्तियाँ तक।",
    uploadLabel: "…या CSV फ़ाइल अपलोड करें", langLabel: "ग्राहकों की भाषा", select: "चुनें…", consent: "इन ग्राहकों ने हमसे WhatsApp पर पेमेंट रिमाइंडर पाने की हाँ कही है। (WhatsApp के लिए यह ज़रूरी है, और STOP लिखने वाले अपने आप हट जाते हैं।)",
    importBtn: "बिल जोड़ें", importing: "जोड़ रहे हैं…", added: "{n} बिल जुड़े", skippedDup: ", {n} पहले से सूची में थे इसलिए छोड़े", skippedOpted: ", {n} ने संदेश बंद कराए थे इसलिए छोड़े",
  },
  mr: {
    title: "पेमेंट रिमाइंडर", intro: "ज्या बिलांचे पैसे बाकी आहेत ती पेस्ट करा आणि Sendkar प्रत्येक ग्राहकाला WhatsApp वर आठवण करून देईल: देय तारखेच्या 3 दिवस आधी, त्याच दिवशी, मग {days} दिवसांनी, पेमेंट लिंकसह. ग्राहकाने पैसे दिले किंवा STOP लिहिले की ते थांबते.",
    beforeTitle: "रिमाइंडर जाण्यापूर्वी", connectA: "तुमचा WhatsApp नंबर ", channelsLink: "चॅनेल", connectB: " मध्ये जोडा.", needTemplate: "खालून मंजूर झालेला रिमाइंडर संदेश निवडा.",
    gwA: "Razorpay किंवा PayU जोडलेले नाही, म्हणून रिमाइंडर लिंक देण्याऐवजी ग्राहकाला उत्तर देण्यास सांगतील. ते ", paymentsLink: "पेमेंट", gwB: " मध्ये जोडा.",
    outstanding: "बाकी रक्कम", overdueLabel: "उशीर झालेली", collected: "वसूल झाले", billOne: "1 बिल", billMany: "{n} बिले", paidSub: "{n} भरले",
    colCustomer: "ग्राहक", colAmount: "रक्कम", colDue: "देय तारीख", colStatus: "स्थिती", colReminders: "रिमाइंडर",
    stPaid: "भरले", stStopped: "थांबवले", stFailed: "अयशस्वी", stOverdue: "उशीर झाला", stOpen: "बाकी", allSent: "सर्व पाठवले", aOfB: "{b} पैकी {a}", emptyTitle: "अजून बिले नाहीत.", emptyHint: "सुरू करण्यासाठी वर तुमची बाकी यादी पेस्ट करा.",
    remindNow: "आता आठवण करा", markPaid: "भरले करा", stop: "थांबवा", resume: "पुन्हा सुरू करा", reminderSent: "रिमाइंडर पाठवले.",
    tplTitle: "रिमाइंडर संदेश", tplHelp: "रिमाइंडर WhatsApp ने मंजूर केलेल्या टेम्पलेट म्हणून जातात, कारण ग्राहकांनी साधारणपणे गेल्या 24 तासांत तुम्हाला लिहिलेले नसते. चार व्हेरिएबल असलेले मंजूर टेम्पलेट निवडा: {{1}} नाव, {{2}} रक्कम, {{3}} देय तारीख, {{4}} पेमेंट लिंक.",
    noTemplate: "टेम्पलेट निवडलेले नाही", tplSave: "सेव्ह करा", tplSaving: "सेव्ह होत आहे…", tplSaved: "सेव्ह झाले.", noApprovedA: "अजून मंजूर टेम्पलेट नाही. खालील मजकुराने ", noApprovedB: "टेम्पलेट", noApprovedC: " मध्ये एक Utility टेम्पलेट बनवा, मग WhatsApp ने मंजूर केल्यावर परत या.", templatesLink: "टेम्पलेट", suggested: "सुचवलेला टेम्पलेट मजकूर", english: "इंग्रजी", gujaratiCheck: "गुजराती (जाणकाराकडून तपासून घ्या)",
    pasteLabel: "तुमची बाकी यादी पेस्ट करा", pasteHelp: "ओळी थेट Excel किंवा Tally रिपोर्टमधून कॉपी करा. पहिल्या ओळीत Party, Mobile, Amount, Due date असे शीर्षक असेल तर स्तंभ कोणत्याही क्रमात असू शकतात. देय तारीख नसेल तर आजची धरली जाते. एकावेळी 500 ओळींपर्यंत.",
    uploadLabel: "…किंवा CSV फाइल अपलोड करा", langLabel: "ग्राहकांची भाषा", select: "निवडा…", consent: "या ग्राहकांनी आमच्याकडून WhatsApp वर पेमेंट रिमाइंडर घेण्यास होकार दिला आहे. (WhatsApp ला हे आवश्यक आहे, आणि STOP लिहिणारे आपोआप वगळले जातात.)",
    importBtn: "बिले जोडा", importing: "जोडत आहे…", added: "{n} बिले जोडली", skippedDup: ", {n} आधीच यादीत होती म्हणून वगळली", skippedOpted: ", {n} ने संदेश बंद केले होते म्हणून वगळली",
  },
  gu: {
    title: "પેમેન્ટ રિમાઇન્ડર", intro: "જે બિલના પૈસા બાકી છે તે પેસ્ટ કરો અને Sendkar દરેક ગ્રાહકને WhatsApp પર યાદ અપાવશે: નિયત તારીખના 3 દિવસ પહેલા, એ જ દિવસે, પછી {days} દિવસ પછી, પેમેન્ટ લિંક સાથે. ગ્રાહક ચૂકવે કે STOP લખે એટલે તે અટકી જાય છે.",
    beforeTitle: "રિમાઇન્ડર જાય તે પહેલા", connectA: "તમારો WhatsApp નંબર ", channelsLink: "ચેનલ", connectB: " માં જોડો.", needTemplate: "નીચેથી મંજૂર થયેલો રિમાઇન્ડર સંદેશ પસંદ કરો.",
    gwA: "Razorpay કે PayU જોડેલ નથી, એટલે રિમાઇન્ડર લિંક આપવાને બદલે ગ્રાહકને જવાબ આપવા કહેશે. તેને ", paymentsLink: "ચુકવણી", gwB: " માં જોડો.",
    outstanding: "બાકી રકમ", overdueLabel: "મોડું થયેલ", collected: "વસૂલ થયું", billOne: "1 બિલ", billMany: "{n} બિલ", paidSub: "{n} ચૂકવેલ",
    colCustomer: "ગ્રાહક", colAmount: "રકમ", colDue: "નિયત તારીખ", colStatus: "સ્થિતિ", colReminders: "રિમાઇન્ડર",
    stPaid: "ચૂકવેલ", stStopped: "અટકાવેલ", stFailed: "નિષ્ફળ", stOverdue: "મોડું થયું", stOpen: "બાકી", allSent: "બધા મોકલ્યા", aOfB: "{b} માંથી {a}", emptyTitle: "હજી કોઈ બિલ નથી.", emptyHint: "શરૂ કરવા ઉપર તમારી બાકી યાદી પેસ્ટ કરો.",
    remindNow: "હમણાં યાદ અપાવો", markPaid: "ચૂકવેલ કરો", stop: "અટકાવો", resume: "ફરી શરૂ કરો", reminderSent: "રિમાઇન્ડર મોકલ્યું.",
    tplTitle: "રિમાઇન્ડર સંદેશ", tplHelp: "રિમાઇન્ડર WhatsApp એ મંજૂર કરેલા ટેમ્પ્લેટ તરીકે જાય છે, કારણ કે ગ્રાહકોએ સામાન્ય રીતે છેલ્લા 24 કલાકમાં તમને લખ્યું હોતું નથી. ચાર વેરિએબલ વાળું મંજૂર ટેમ્પ્લેટ પસંદ કરો: {{1}} નામ, {{2}} રકમ, {{3}} નિયત તારીખ, {{4}} પેમેન્ટ લિંક.",
    noTemplate: "કોઈ ટેમ્પ્લેટ પસંદ નથી", tplSave: "સેવ કરો", tplSaving: "સેવ થઈ રહ્યું છે…", tplSaved: "સેવ થયું.", noApprovedA: "હજી કોઈ મંજૂર ટેમ્પ્લેટ નથી. નીચેના લખાણથી ", noApprovedB: "ટેમ્પ્લેટ", noApprovedC: " માં એક Utility ટેમ્પ્લેટ બનાવો, પછી WhatsApp મંજૂર કરે ત્યારે પાછા આવો.", templatesLink: "ટેમ્પ્લેટ", suggested: "સૂચવેલું ટેમ્પ્લેટ લખાણ", english: "અંગ્રેજી", gujaratiCheck: "ગુજરાતી (જાણકાર પાસે તપાસાવી લો)",
    pasteLabel: "તમારી બાકી યાદી પેસ્ટ કરો", pasteHelp: "લીટીઓ સીધી Excel કે Tally રિપોર્ટમાંથી કૉપી કરો. પહેલી લીટીમાં Party, Mobile, Amount, Due date જેવા શીર્ષક હોય તો સ્તંભ કોઈ પણ ક્રમમાં હોઈ શકે. નિયત તારીખ ન હોય તો આજની ગણાય છે. એક વારમાં 500 લીટી સુધી.",
    uploadLabel: "…અથવા CSV ફાઇલ અપલોડ કરો", langLabel: "ગ્રાહકોની ભાષા", select: "પસંદ કરો…", consent: "આ ગ્રાહકોએ અમારી પાસેથી WhatsApp પર પેમેન્ટ રિમાઇન્ડર મેળવવા હા કહી છે. (WhatsApp માટે આ જરૂરી છે, અને STOP લખનાર આપમેળે દૂર થાય છે.)",
    importBtn: "બિલ ઉમેરો", importing: "ઉમેરી રહ્યા છીએ…", added: "{n} બિલ ઉમેર્યાં", skippedDup: ", {n} પહેલેથી યાદીમાં હતાં એટલે છોડ્યાં", skippedOpted: ", {n} એ સંદેશ બંધ કરાવ્યા હતા એટલે છોડ્યાં",
  },
  ta: {
    title: "பணம் செலுத்தும் நினைவூட்டல்கள்", intro: "பணம் வர வேண்டிய பில்களை ஒட்டுங்கள், Sendkar ஒவ்வொரு வாடிக்கையாளருக்கும் WhatsApp-ல் நினைவூட்டும்: கடைசி தேதிக்கு 3 நாள் முன், அன்றே, பிறகு {days} நாட்கள் கழித்து, பணம் செலுத்தும் இணைப்புடன். அவர்கள் பணம் செலுத்தியதும் அல்லது STOP என்றதும் நின்றுவிடும்.",
    beforeTitle: "நினைவூட்டல்கள் செல்வதற்கு முன்", connectA: "உங்கள் WhatsApp எண்ணை ", channelsLink: "சேனல்கள்", connectB: "-ல் இணையுங்கள்.", needTemplate: "கீழே அங்கீகரிக்கப்பட்ட நினைவூட்டல் செய்தியைத் தேர்ந்தெடுங்கள்.",
    gwA: "Razorpay அல்லது PayU இணைக்கப்படவில்லை, எனவே நினைவூட்டல்கள் இணைப்புக்குப் பதிலாக பதில் அனுப்பச் சொல்லும். அதை ", paymentsLink: "பணம் செலுத்துதல்", gwB: "-ல் அமையுங்கள்.",
    outstanding: "நிலுவை", overdueLabel: "தாமதமானவை", collected: "வசூலானது", billOne: "1 பில்", billMany: "{n} பில்கள்", paidSub: "{n} செலுத்தப்பட்டது",
    colCustomer: "வாடிக்கையாளர்", colAmount: "தொகை", colDue: "கடைசி தேதி", colStatus: "நிலை", colReminders: "நினைவூட்டல்கள்",
    stPaid: "செலுத்தப்பட்டது", stStopped: "நிறுத்தப்பட்டது", stFailed: "தோல்வி", stOverdue: "தாமதம்", stOpen: "நிலுவை", allSent: "அனைத்தும் அனுப்பப்பட்டன", aOfB: "{b}-ல் {a}", emptyTitle: "இன்னும் பில்கள் இல்லை.", emptyHint: "தொடங்க மேலே உங்கள் நிலுவை பட்டியலை ஒட்டுங்கள்.",
    remindNow: "இப்போது நினைவூட்டு", markPaid: "செலுத்தப்பட்டது எனக் குறி", stop: "நிறுத்து", resume: "தொடர்", reminderSent: "நினைவூட்டல் அனுப்பப்பட்டது.",
    tplTitle: "நினைவூட்டல் செய்தி", tplHelp: "நினைவூட்டல்கள் WhatsApp அங்கீகரித்த டெம்ப்ளேட்டாகச் செல்லும், ஏனெனில் வாடிக்கையாளர்கள் பொதுவாக கடந்த 24 மணி நேரத்தில் உங்களுக்கு எழுதியிருக்க மாட்டார்கள். நான்கு மாறிகள் உள்ள அங்கீகரிக்கப்பட்ட டெம்ப்ளேட்டைத் தேர்ந்தெடுங்கள்: {{1}} பெயர், {{2}} தொகை, {{3}} கடைசி தேதி, {{4}} பணம் செலுத்தும் இணைப்பு.",
    noTemplate: "டெம்ப்ளேட் தேர்ந்தெடுக்கப்படவில்லை", tplSave: "சேமி", tplSaving: "சேமிக்கிறது…", tplSaved: "சேமிக்கப்பட்டது.", noApprovedA: "இன்னும் அங்கீகரிக்கப்பட்ட டெம்ப்ளேட் இல்லை. கீழே உள்ள உரையைக் கொண்டு ", noApprovedB: "டெம்ப்ளேட்டுகள்", noApprovedC: "-ல் ஒரு Utility டெம்ப்ளேட்டை உருவாக்குங்கள், WhatsApp அங்கீகரித்ததும் திரும்பி வாருங்கள்.", templatesLink: "டெம்ப்ளேட்டுகள்", suggested: "பரிந்துரைக்கப்பட்ட டெம்ப்ளேட் உரை", english: "ஆங்கிலம்", gujaratiCheck: "குஜராத்தி (அறிந்தவரிடம் சரிபார்த்துக் கொள்ளுங்கள்)",
    pasteLabel: "உங்கள் நிலுவை பட்டியலை ஒட்டுங்கள்", pasteHelp: "வரிசைகளை நேரடியாக Excel அல்லது Tally அறிக்கையிலிருந்து நகலெடுங்கள். முதல் வரியில் Party, Mobile, Amount, Due date போன்ற தலைப்புகள் இருந்தால் நெடுவரிசைகள் எந்த வரிசையிலும் இருக்கலாம். கடைசி தேதி இல்லையெனில் இன்று என எடுத்துக்கொள்ளப்படும். ஒரு முறைக்கு 500 வரிசைகள் வரை.",
    uploadLabel: "…அல்லது CSV கோப்பை பதிவேற்றுங்கள்", langLabel: "வாடிக்கையாளர்களின் மொழி", select: "தேர்ந்தெடுங்கள்…", consent: "இந்த வாடிக்கையாளர்கள் எங்களிடமிருந்து WhatsApp-ல் பணம் செலுத்தும் நினைவூட்டல்களைப் பெற சம்மதித்துள்ளனர். (WhatsApp இதைக் கோருகிறது, STOP என்பவர்கள் தானாக நீக்கப்படுவர்.)",
    importBtn: "பில்களைச் சேர்", importing: "சேர்க்கிறது…", added: "{n} பில்கள் சேர்க்கப்பட்டன", skippedDup: ", {n} ஏற்கனவே பட்டியலில் இருந்ததால் தவிர்க்கப்பட்டன", skippedOpted: ", {n} செய்தி வேண்டாம் என்றதால் தவிர்க்கப்பட்டன",
  },
  te: {
    title: "చెల్లింపు రిమైండర్లు", intro: "డబ్బు రావాల్సిన బిల్లులను పేస్ట్ చేయండి, Sendkar ప్రతి కస్టమర్‌కు WhatsApp‌లో గుర్తు చేస్తుంది: గడువుకు 3 రోజుల ముందు, ఆ రోజే, తర్వాత {days} రోజుల తర్వాత, చెల్లింపు లింక్‌తో. వారు చెల్లించగానే లేదా STOP అనగానే ఆగిపోతుంది.",
    beforeTitle: "రిమైండర్లు వెళ్లడానికి ముందు", connectA: "మీ WhatsApp నంబర్‌ను ", channelsLink: "ఛానెళ్లు", connectB: "లో కనెక్ట్ చేయండి.", needTemplate: "కింద ఆమోదం పొందిన రిమైండర్ సందేశాన్ని ఎంచుకోండి.",
    gwA: "Razorpay లేదా PayU కనెక్ట్ చేయలేదు, కాబట్టి రిమైండర్లు లింక్ ఇవ్వడానికి బదులు సమాధానం ఇవ్వమని చెబుతాయి. దాన్ని ", paymentsLink: "చెల్లింపులు", gwB: "లో సెటప్ చేయండి.",
    outstanding: "బాకీ", overdueLabel: "ఆలస్యమైనవి", collected: "వసూలైంది", billOne: "1 బిల్లు", billMany: "{n} బిల్లులు", paidSub: "{n} చెల్లించారు",
    colCustomer: "కస్టమర్", colAmount: "మొత్తం", colDue: "గడువు", colStatus: "స్థితి", colReminders: "రిమైండర్లు",
    stPaid: "చెల్లించారు", stStopped: "ఆపారు", stFailed: "విఫలం", stOverdue: "ఆలస్యం", stOpen: "బాకీ", allSent: "అన్నీ పంపారు", aOfB: "{b}లో {a}", emptyTitle: "ఇంకా బిల్లులు లేవు.", emptyHint: "ప్రారంభించడానికి పైన మీ బాకీ జాబితాను పేస్ట్ చేయండి.",
    remindNow: "ఇప్పుడే గుర్తు చేయండి", markPaid: "చెల్లించినట్టు గుర్తించు", stop: "ఆపు", resume: "కొనసాగించు", reminderSent: "రిమైండర్ పంపారు.",
    tplTitle: "రిమైండర్ సందేశం", tplHelp: "రిమైండర్లు WhatsApp ఆమోదించిన టెంప్లేట్‌గా వెళ్తాయి, ఎందుకంటే కస్టమర్లు సాధారణంగా గత 24 గంటల్లో మీకు రాసి ఉండరు. నాలుగు వేరియబుల్స్ ఉన్న ఆమోదిత టెంప్లేట్‌ను ఎంచుకోండి: {{1}} పేరు, {{2}} మొత్తం, {{3}} గడువు తేదీ, {{4}} చెల్లింపు లింక్.",
    noTemplate: "టెంప్లేట్ ఎంచుకోలేదు", tplSave: "సేవ్", tplSaving: "సేవ్ అవుతోంది…", tplSaved: "సేవ్ అయింది.", noApprovedA: "ఇంకా ఆమోదిత టెంప్లేట్లు లేవు. కింది టెక్స్ట్‌తో ", noApprovedB: "టెంప్లేట్లు", noApprovedC: "లో ఒక Utility టెంప్లేట్‌ను సృష్టించండి, WhatsApp ఆమోదించాక తిరిగి రండి.", templatesLink: "టెంప్లేట్లు", suggested: "సూచించిన టెంప్లేట్ టెక్స్ట్", english: "ఇంగ్లీష్", gujaratiCheck: "గుజరాతీ (తెలిసినవారితో చూపించుకోండి)",
    pasteLabel: "మీ బాకీ జాబితాను పేస్ట్ చేయండి", pasteHelp: "వరుసలను నేరుగా Excel లేదా Tally రిపోర్ట్ నుండి కాపీ చేయండి. మొదటి వరుసలో Party, Mobile, Amount, Due date లాంటి శీర్షికలు ఉంటే నిలువు వరుసలు ఏ క్రమంలోనైనా ఉండవచ్చు. గడువు తేదీ లేకపోతే ఈ రోజు అనుకుంటాం. ఒకేసారి 500 వరుసల వరకు.",
    uploadLabel: "…లేదా CSV ఫైల్ అప్‌లోడ్ చేయండి", langLabel: "కస్టమర్ల భాష", select: "ఎంచుకోండి…", consent: "ఈ కస్టమర్లు మా నుండి WhatsApp‌లో చెల్లింపు రిమైండర్లు పొందడానికి అంగీకరించారు. (WhatsApp దీన్ని కోరుతుంది, STOP అన్నవారు ఆటోమేటిక్‌గా తొలగించబడతారు.)",
    importBtn: "బిల్లులు జోడించు", importing: "జోడిస్తోంది…", added: "{n} బిల్లులు జోడించారు", skippedDup: ", {n} ఇప్పటికే జాబితాలో ఉన్నందున వదిలేశాం", skippedOpted: ", {n} సందేశాలు వద్దన్నందున వదిలేశాం",
  },
  kn: {
    title: "ಪಾವತಿ ಜ್ಞಾಪನೆಗಳು", intro: "ಹಣ ಬರಬೇಕಾದ ಬಿಲ್‌ಗಳನ್ನು ಅಂಟಿಸಿ, Sendkar ಪ್ರತಿ ಗ್ರಾಹಕರಿಗೆ WhatsApp‌ನಲ್ಲಿ ನೆನಪಿಸುತ್ತದೆ: ಕೊನೆಯ ದಿನಾಂಕಕ್ಕೆ 3 ದಿನ ಮೊದಲು, ಆ ದಿನವೇ, ನಂತರ {days} ದಿನಗಳ ನಂತರ, ಪಾವತಿ ಲಿಂಕ್‌ನೊಂದಿಗೆ. ಅವರು ಪಾವತಿಸಿದ ತಕ್ಷಣ ಅಥವಾ STOP ಎಂದ ತಕ್ಷಣ ನಿಲ್ಲುತ್ತದೆ.",
    beforeTitle: "ಜ್ಞಾಪನೆಗಳು ಹೋಗುವ ಮೊದಲು", connectA: "ನಿಮ್ಮ WhatsApp ಸಂಖ್ಯೆಯನ್ನು ", channelsLink: "ಚಾನೆಲ್‌ಗಳು", connectB: " ನಲ್ಲಿ ಜೋಡಿಸಿ.", needTemplate: "ಕೆಳಗೆ ಅನುಮೋದಿತ ಜ್ಞಾಪನೆ ಸಂದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    gwA: "Razorpay ಅಥವಾ PayU ಜೋಡಿಸಿಲ್ಲ, ಆದ್ದರಿಂದ ಜ್ಞಾಪನೆಗಳು ಲಿಂಕ್ ನೀಡುವ ಬದಲು ಉತ್ತರಿಸಲು ಹೇಳುತ್ತವೆ. ಅದನ್ನು ", paymentsLink: "ಪಾವತಿಗಳು", gwB: " ನಲ್ಲಿ ಹೊಂದಿಸಿ.",
    outstanding: "ಬಾಕಿ", overdueLabel: "ತಡವಾದವು", collected: "ವಸೂಲಾಗಿದೆ", billOne: "1 ಬಿಲ್", billMany: "{n} ಬಿಲ್‌ಗಳು", paidSub: "{n} ಪಾವತಿಸಲಾಗಿದೆ",
    colCustomer: "ಗ್ರಾಹಕ", colAmount: "ಮೊತ್ತ", colDue: "ಕೊನೆಯ ದಿನಾಂಕ", colStatus: "ಸ್ಥಿತಿ", colReminders: "ಜ್ಞಾಪನೆಗಳು",
    stPaid: "ಪಾವತಿಸಲಾಗಿದೆ", stStopped: "ನಿಲ್ಲಿಸಲಾಗಿದೆ", stFailed: "ವಿಫಲ", stOverdue: "ತಡವಾಗಿದೆ", stOpen: "ಬಾಕಿ", allSent: "ಎಲ್ಲವನ್ನೂ ಕಳುಹಿಸಲಾಗಿದೆ", aOfB: "{b} ರಲ್ಲಿ {a}", emptyTitle: "ಇನ್ನೂ ಬಿಲ್‌ಗಳಿಲ್ಲ.", emptyHint: "ಪ್ರಾರಂಭಿಸಲು ಮೇಲೆ ನಿಮ್ಮ ಬಾಕಿ ಪಟ್ಟಿಯನ್ನು ಅಂಟಿಸಿ.",
    remindNow: "ಈಗ ನೆನಪಿಸಿ", markPaid: "ಪಾವತಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ", stop: "ನಿಲ್ಲಿಸಿ", resume: "ಮುಂದುವರಿಸಿ", reminderSent: "ಜ್ಞಾಪನೆ ಕಳುಹಿಸಲಾಗಿದೆ.",
    tplTitle: "ಜ್ಞಾಪನೆ ಸಂದೇಶ", tplHelp: "ಜ್ಞಾಪನೆಗಳು WhatsApp ಅನುಮೋದಿಸಿದ ಟೆಂಪ್ಲೇಟ್ ಆಗಿ ಹೋಗುತ್ತವೆ, ಏಕೆಂದರೆ ಗ್ರಾಹಕರು ಸಾಮಾನ್ಯವಾಗಿ ಕಳೆದ 24 ಗಂಟೆಗಳಲ್ಲಿ ನಿಮಗೆ ಬರೆದಿರುವುದಿಲ್ಲ. ನಾಲ್ಕು ವೇರಿಯಬಲ್‌ಗಳಿರುವ ಅನುಮೋದಿತ ಟೆಂಪ್ಲೇಟ್ ಆಯ್ಕೆಮಾಡಿ: {{1}} ಹೆಸರು, {{2}} ಮೊತ್ತ, {{3}} ಕೊನೆಯ ದಿನಾಂಕ, {{4}} ಪಾವತಿ ಲಿಂಕ್.",
    noTemplate: "ಟೆಂಪ್ಲೇಟ್ ಆಯ್ಕೆಮಾಡಿಲ್ಲ", tplSave: "ಉಳಿಸಿ", tplSaving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ…", tplSaved: "ಉಳಿಸಲಾಗಿದೆ.", noApprovedA: "ಇನ್ನೂ ಅನುಮೋದಿತ ಟೆಂಪ್ಲೇಟ್‌ಗಳಿಲ್ಲ. ಕೆಳಗಿನ ಪಠ್ಯದೊಂದಿಗೆ ", noApprovedB: "ಟೆಂಪ್ಲೇಟ್‌ಗಳು", noApprovedC: " ನಲ್ಲಿ ಒಂದು Utility ಟೆಂಪ್ಲೇಟ್ ರಚಿಸಿ, WhatsApp ಅನುಮೋದಿಸಿದ ಮೇಲೆ ಹಿಂತಿರುಗಿ.", templatesLink: "ಟೆಂಪ್ಲೇಟ್‌ಗಳು", suggested: "ಸೂಚಿಸಿದ ಟೆಂಪ್ಲೇಟ್ ಪಠ್ಯ", english: "ಇಂಗ್ಲಿಷ್", gujaratiCheck: "ಗುಜರಾತಿ (ತಿಳಿದವರಿಂದ ಪರಿಶೀಲಿಸಿಕೊಳ್ಳಿ)",
    pasteLabel: "ನಿಮ್ಮ ಬಾಕಿ ಪಟ್ಟಿಯನ್ನು ಅಂಟಿಸಿ", pasteHelp: "ಸಾಲುಗಳನ್ನು ನೇರವಾಗಿ Excel ಅಥವಾ Tally ವರದಿಯಿಂದ ನಕಲಿಸಿ. ಮೊದಲ ಸಾಲಿನಲ್ಲಿ Party, Mobile, Amount, Due date ಮುಂತಾದ ಶೀರ್ಷಿಕೆಗಳಿದ್ದರೆ ಕಾಲಮ್‌ಗಳು ಯಾವ ಕ್ರಮದಲ್ಲಾದರೂ ಇರಬಹುದು. ಕೊನೆಯ ದಿನಾಂಕ ಇಲ್ಲದಿದ್ದರೆ ಇಂದು ಎಂದು ಪರಿಗಣಿಸಲಾಗುತ್ತದೆ. ಒಮ್ಮೆಗೆ 500 ಸಾಲುಗಳವರೆಗೆ.",
    uploadLabel: "…ಅಥವಾ CSV ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ", langLabel: "ಗ್ರಾಹಕರ ಭಾಷೆ", select: "ಆಯ್ಕೆಮಾಡಿ…", consent: "ಈ ಗ್ರಾಹಕರು ನಮ್ಮಿಂದ WhatsApp‌ನಲ್ಲಿ ಪಾವತಿ ಜ್ಞಾಪನೆಗಳನ್ನು ಪಡೆಯಲು ಒಪ್ಪಿದ್ದಾರೆ. (WhatsApp ಇದನ್ನು ಕೇಳುತ್ತದೆ, STOP ಎಂದವರನ್ನು ತಾನಾಗಿ ತೆಗೆಯಲಾಗುತ್ತದೆ.)",
    importBtn: "ಬಿಲ್‌ಗಳನ್ನು ಸೇರಿಸಿ", importing: "ಸೇರಿಸಲಾಗುತ್ತಿದೆ…", added: "{n} ಬಿಲ್‌ಗಳನ್ನು ಸೇರಿಸಲಾಗಿದೆ", skippedDup: ", {n} ಈಗಾಗಲೇ ಪಟ್ಟಿಯಲ್ಲಿದ್ದ ಕಾರಣ ಬಿಟ್ಟಿದೆ", skippedOpted: ", {n} ಸಂದೇಶ ಬೇಡ ಎಂದಿದ್ದ ಕಾರಣ ಬಿಟ್ಟಿದೆ",
  },
};
