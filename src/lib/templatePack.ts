/**
 * Ready-made WhatsApp templates for an Indian trader — built around a steel
 * utensil shop (festival and wedding-season offers, dealer rates, new stock,
 * bill / LR updates, payment reminders), but written so any shop or wholesaler
 * can use them. One click submits the whole pack to the business's own Meta
 * account; Meta approves per account, so these cannot be pre-approved globally.
 *
 * Hindi and Gujarati text is machine-written: have a fluent speaker read it
 * before relying on it. Every template is checked against Meta's rules in
 * templatePack.test.ts (name format, length, no variable at the start or end,
 * enough words per variable, an opt-out button on marketing).
 */

export const PACK_LANGUAGES = [
  { code: "hi", label: "Hindi" },
  { code: "gu", label: "Gujarati" },
  { code: "en", label: "English" },
] as const;

export type PackLang = (typeof PACK_LANGUAGES)[number]["code"];
export type PackCategory = "MARKETING" | "UTILITY";
export type PackStage = "campaign" | "transactional" | "nurture";

type VarKind =
  | "name" | "shop" | "festival" | "offer" | "items" | "rates" | "date"
  | "amount" | "bill" | "transport" | "lr" | "tip" | "occasion" | "link";

interface VarInfo {
  /** What the shopkeeper types or picks for this variable. */
  label: string;
  /** "name" fills from the contact; everything else is one fixed text per campaign. */
  source: "contact" | "fixed";
  example: Record<PackLang, string>;
}

export const VAR_KINDS: Record<VarKind, VarInfo> = {
  name: { label: "Customer name", source: "contact", example: { hi: "राजेश", gu: "રાજેશ", en: "Rajesh" } },
  shop: { label: "Your shop name", source: "fixed", example: { hi: "माहेश्वरी स्टील हाउस", gu: "માહેશ્વરી સ્ટીલ હાઉસ", en: "Maheshwari Steel House" } },
  festival: { label: "Festival name", source: "fixed", example: { hi: "दिवाली", gu: "દિવાળી", en: "Diwali" } },
  offer: { label: "The offer, in one line", source: "fixed", example: { hi: "स्टील थाली सेट पर 15% की छूट।", gu: "સ્ટીલ થાળી સેટ પર 15% ની છૂટ.", en: "15% off on steel thali sets." } },
  items: { label: "What arrived (items)", source: "fixed", example: { hi: "स्टील टिफिन, कुकर और कढ़ाई", gu: "સ્ટીલ ટિફિન, કુકર અને કઢાઈ", en: "steel tiffins, cookers and kadhais" } },
  rates: { label: "Today's rates, on one line", source: "fixed", example: { hi: "स्टील थाली ₹420/किलो, कढ़ाई ₹395/किलो", gu: "સ્ટીલ થાળી ₹420/કિલો, કઢાઈ ₹395/કિલો", en: "steel thali ₹420/kg, kadhai ₹395/kg" } },
  date: { label: "Date", source: "fixed", example: { hi: "15 नवंबर 2026", gu: "15 નવેમ્બર 2026", en: "15 Nov 2026" } },
  amount: { label: "Amount (numbers only)", source: "fixed", example: { hi: "12,500", gu: "12,500", en: "12,500" } },
  bill: { label: "Bill or order number", source: "fixed", example: { hi: "1042", gu: "1042", en: "1042" } },
  transport: { label: "Transport / courier name", source: "fixed", example: { hi: "शर्मा ट्रांसपोर्ट", gu: "શર્મા ટ્રાન્સપોર્ટ", en: "Sharma Transport" } },
  lr: { label: "LR / tracking number", source: "fixed", example: { hi: "LR-55821", gu: "LR-55821", en: "LR-55821" } },
  tip: { label: "The tip, one or two sentences", source: "fixed", example: { hi: "नींबू और नमक से रगड़ें, फिर साफ पानी से धोएँ।", gu: "લીંબુ અને મીઠાથી ઘસો, પછી સાફ પાણીથી ધોઈ લો.", en: "Rub with lemon and salt, then rinse with clean water." } },
  occasion: { label: "Occasion (birthday / anniversary)", source: "fixed", example: { hi: "जन्मदिन", gu: "જન્મદિવસ", en: "birthday" } },
  link: { label: "Payment link", source: "fixed", example: { hi: "https://rzp.io/i/abc123", gu: "https://rzp.io/i/abc123", en: "https://rzp.io/i/abc123" } },
};

export interface PackTemplate {
  key: string;
  title: string;
  /** When a shopkeeper would use it — shown beside the template. */
  when: string;
  category: PackCategory;
  stage: PackStage;
  vars: VarKind[];
  body: Record<PackLang, string>;
}

export const PACK_TEMPLATES: PackTemplate[] = [
  // ── Festival and offer campaigns (bulk, promotional) ──────────────────────
  {
    key: "festival_greeting",
    title: "Festival greeting",
    when: "Diwali, Dhanteras, Navratri, Holi, Eid, Raksha Bandhan — a warm wish to every customer.",
    category: "MARKETING",
    stage: "campaign",
    vars: ["name", "festival", "shop"],
    body: {
      hi: "नमस्ते {{1}} जी, आपको और आपके परिवार को {{2}} की हार्दिक शुभकामनाएँ! यह त्योहार आपके घर में सुख और समृद्धि लाए। {{3}} परिवार की ओर से आपका बहुत-बहुत धन्यवाद।",
      gu: "નમસ્તે {{1}}, આપને અને આપના પરિવારને {{2}} ની હાર્દિક શુભેચ્છાઓ! આ તહેવાર આપના ઘરમાં સુખ અને સમૃદ્ધિ લાવે. {{3}} પરિવાર તરફથી આપનો ખૂબ ખૂબ આભાર.",
      en: "Hello {{1}}, wishing you and your family a very happy {{2}}! May this festival bring prosperity and joy to your home. Greetings from all of us at {{3}}. Thank you for your trust.",
    },
  },
  {
    key: "festival_offer",
    title: "Festival offer",
    when: "A time-limited festival scheme or discount you want every customer to see.",
    category: "MARKETING",
    stage: "campaign",
    vars: ["name", "shop", "festival", "offer"],
    body: {
      hi: "नमस्ते {{1}} जी, {{2}} में {{3}} का विशेष ऑफर! {{4}} दुकान पर पधारें या इस मैसेज का जवाब देकर अपना ऑर्डर बुक करें। ऑफर सीमित समय के लिए है।",
      gu: "નમસ્તે {{1}}, {{2}} માં {{3}} ની ખાસ ઓફર! {{4}} દુકાને પધારો અથવા આ મેસેજનો જવાબ આપી તમારો ઓર્ડર બુક કરો. ઓફર મર્યાદિત સમય માટે છે.",
      en: "Hello {{1}}, {{3}} special at {{2}}! {{4}} Visit our shop or reply to this message to book your order. The offer is for a limited time only.",
    },
  },
  {
    key: "wedding_season_gifts",
    title: "Wedding-season gift sets",
    when: "Lagna season — gift sets and dinner sets for weddings and gifting.",
    category: "MARKETING",
    stage: "campaign",
    vars: ["name", "shop"],
    body: {
      hi: "नमस्ते {{1}} जी, शादी का सीज़न आ गया है! {{2}} में उपहार के लिए स्टील के बर्तनों के गिफ्ट सेट और डिनर सेट की बड़ी रेंज उपलब्ध है। दुकान पर पधारें या इस मैसेज का जवाब दें, हम आपके बजट में सबसे अच्छे विकल्प दिखाएँगे।",
      gu: "નમસ્તે {{1}}, લગ્નની સીઝન આવી ગઈ છે! {{2}} માં ભેટ માટે સ્ટીલના વાસણોના ગિફ્ટ સેટ અને ડિનર સેટની મોટી રેન્જ ઉપલબ્ધ છે. દુકાને પધારો અથવા આ મેસેજનો જવાબ આપો, અમે તમારા બજેટમાં શ્રેષ્ઠ વિકલ્પો બતાવીશું.",
      en: "Hello {{1}}, wedding season is here! {{2}} has a wide range of steel utensil gift sets and dinner sets, ideal for gifting. Visit us or reply to this message and we will show you the best options within your budget.",
    },
  },
  {
    key: "exchange_offer",
    title: "Old-for-new exchange",
    when: "Bring old utensils, get a new set — a classic steel-shop draw.",
    category: "MARKETING",
    stage: "campaign",
    vars: ["name", "shop", "offer"],
    body: {
      hi: "नमस्ते {{1}} जी, अपने पुराने बर्तन {{2}} पर लाएँ और नए स्टील के बर्तनों से बदलवाएँ। {{3}} अधिक जानकारी के लिए दुकान पर पधारें या इस मैसेज का जवाब दें।",
      gu: "નમસ્તે {{1}}, તમારા જૂના વાસણો {{2}} પર લાવો અને નવા સ્ટીલના વાસણો સાથે બદલાવો. {{3}} વધુ માહિતી માટે દુકાને પધારો અથવા આ મેસેજનો જવાબ આપો.",
      en: "Hello {{1}}, bring your old utensils to {{2}} and exchange them for new steel ware. {{3}} Visit us or reply to this message to know more.",
    },
  },
  {
    key: "new_stock",
    title: "New stock arrived",
    when: "Fresh goods in the shop — tell your regulars first.",
    category: "MARKETING",
    stage: "campaign",
    vars: ["name", "shop", "items"],
    body: {
      hi: "नमस्ते {{1}} जी, {{2}} में नया स्टॉक आ गया है: {{3}}। रेट जानने और अपना माल रिज़र्व करने के लिए इस मैसेज का जवाब दें।",
      gu: "નમસ્તે {{1}}, {{2}} માં નવો સ્ટોક આવ્યો છે: {{3}}. ભાવ જાણવા અને તમારો માલ અનામત રાખવા આ મેસેજનો જવાબ આપો.",
      en: "Hello {{1}}, fresh stock has arrived at {{2}}: {{3}}. Reply to this message for rates and to reserve yours before it sells out.",
    },
  },
  {
    key: "dealer_rates",
    title: "Today's rates for dealers",
    when: "Steel rates move — send dealers and wholesale buyers the day's price list.",
    category: "MARKETING",
    stage: "campaign",
    vars: ["name", "shop", "date", "rates"],
    body: {
      hi: "नमस्ते {{1}} जी, {{2}} के आज के रेट ({{3}} तक मान्य): {{4}}। ऑर्डर देने के लिए इस मैसेज का जवाब दें।",
      gu: "નમસ્તે {{1}}, {{2}} ના આજના ભાવ ({{3}} સુધી માન્ય): {{4}}. ઓર્ડર આપવા આ મેસેજનો જવાબ આપો.",
      en: "Hello {{1}}, here are today's rates from {{2}} (valid until {{3}}): {{4}}. Reply to this message to place your order.",
    },
  },

  // ── Right after a purchase and ongoing (transactional) ────────────────────
  {
    key: "purchase_thank_you",
    title: "Thank you for your purchase",
    when: "Sent right after a sale — the start of the follow-up journey.",
    category: "UTILITY",
    stage: "transactional",
    vars: ["name", "shop", "amount", "bill"],
    body: {
      hi: "नमस्ते {{1}} जी, {{2}} से खरीदारी करने के लिए धन्यवाद। आपकी ₹{{3}} की खरीदारी (बिल नं. {{4}}) दर्ज कर ली गई है। ऑर्डर में कोई मदद चाहिए तो इस मैसेज का जवाब दें।",
      gu: "નમસ્તે {{1}}, {{2}} માંથી ખરીદી કરવા બદલ આભાર. તમારી ₹{{3}} ની ખરીદી (બિલ નં. {{4}}) નોંધી લેવામાં આવી છે. ઓર્ડરમાં કોઈ મદદ જોઈએ તો આ મેસેજનો જવાબ આપો.",
      en: "Hello {{1}}, thank you for shopping at {{2}}. We have recorded your purchase of ₹{{3}} (bill no. {{4}}). If you need any help with your order, reply to this message.",
    },
  },
  {
    key: "payment_reminder",
    title: "Payment reminder",
    when: "Used by Payment reminders: a polite nudge with a pay link before and after the due date.",
    category: "UTILITY",
    stage: "transactional",
    vars: ["name", "amount", "date", "link"],
    body: {
      hi: "नमस्ते {{1}} जी, एक विनम्र याद: ₹{{2}} की राशि {{3}} को देय है। आप यहाँ भुगतान कर सकते हैं: {{4}}। यदि आप भुगतान कर चुके हैं तो कृपया इस मैसेज को अनदेखा करें। धन्यवाद!",
      gu: "નમસ્તે {{1}}, એક નમ્ર યાદ: ₹{{2}} ની રકમ {{3}} ના રોજ બાકી છે. અહીં ચૂકવો: {{4}}. જો તમે ચૂકવી દીધું હોય તો આ મેસેજ અવગણશો. આભાર!",
      en: "Hello {{1}}, a friendly reminder: ₹{{2}} is due on {{3}}. You can pay here: {{4}}. If you have already paid, please ignore this message. Thank you!",
    },
  },
  {
    key: "payment_received",
    title: "Payment received",
    when: "Confirms money arrived — builds trust with credit customers.",
    category: "UTILITY",
    stage: "transactional",
    vars: ["name", "amount", "shop"],
    body: {
      hi: "नमस्ते {{1}} जी, {{3}} को आपका ₹{{2}} का भुगतान प्राप्त हो गया है। समय पर भुगतान के लिए धन्यवाद।",
      gu: "નમસ્તે {{1}}, {{3}} ને તમારું ₹{{2}} નું પેમેન્ટ મળી ગયું છે. સમયસર પેમેન્ટ કરવા બદલ આભાર.",
      en: "Hello {{1}}, we have received your payment of ₹{{2}} at {{3}}. Thank you for paying on time.",
    },
  },
  {
    key: "order_dispatched",
    title: "Order dispatched (LR number)",
    when: "Goods sent by transport — share the transporter and LR number.",
    category: "UTILITY",
    stage: "transactional",
    vars: ["name", "bill", "transport", "lr"],
    body: {
      hi: "नमस्ते {{1}} जी, आपका ऑर्डर (बिल नं. {{2}}) {{3}} से भेज दिया गया है। एलआर नंबर: {{4}}। कोई प्रश्न हो तो इस मैसेज का जवाब दें।",
      gu: "નમસ્તે {{1}}, તમારો ઓર્ડર (બિલ નં. {{2}}) {{3}} દ્વારા મોકલી દેવામાં આવ્યો છે. એલઆર નંબર: {{4}}. કોઈ પ્રશ્ન હોય તો આ મેસેજનો જવાબ આપો.",
      en: "Hello {{1}}, your order (bill no. {{2}}) has been dispatched via {{3}}. LR number: {{4}}. Please reply to this message if you have any questions.",
    },
  },
  {
    key: "order_ready",
    title: "Order ready for pickup",
    when: "A custom or bulk order is packed and waiting at the shop.",
    category: "UTILITY",
    stage: "transactional",
    vars: ["name", "bill", "shop"],
    body: {
      hi: "नमस्ते {{1}} जी, आपका ऑर्डर {{2}} तैयार है और {{3}} पर लेने के लिए रखा है। यदि आप डिलीवरी चाहते हैं तो इस मैसेज का जवाब दें।",
      gu: "નમસ્તે {{1}}, તમારો ઓર્ડર {{2}} તૈયાર છે અને {{3}} પર લેવા માટે રાખેલ છે. જો તમારે ડિલિવરી જોઈતી હોય તો આ મેસેજનો જવાબ આપો.",
      en: "Hello {{1}}, your order {{2}} is ready and waiting for pickup at {{3}}. Reply to this message if you would like it delivered instead.",
    },
  },

  // ── Keeping customers close (nurture) ─────────────────────────────────────
  {
    key: "care_tips",
    title: "Care tip",
    when: "A few days after a sale — a useful tip that keeps your name in their kitchen.",
    category: "MARKETING",
    stage: "nurture",
    vars: ["name", "shop", "tip"],
    body: {
      hi: "नमस्ते {{1}} जी, {{2}} की ओर से एक छोटी सी सलाह: {{3}} इससे आपके स्टील के बर्तन सालों तक नए जैसे रहेंगे। कोई मदद चाहिए तो इस मैसेज का जवाब दें।",
      gu: "નમસ્તે {{1}}, {{2}} તરફથી એક નાની સલાહ: {{3}} આથી તમારા સ્ટીલના વાસણો વર્ષો સુધી નવા જેવા રહેશે. કોઈ મદદ જોઈએ તો આ મેસેજનો જવાબ આપો.",
      en: "Hello {{1}}, a quick tip from {{2}}: {{3}} This will keep your steel utensils looking new for years. Reply to this message if you need any help.",
    },
  },
  {
    key: "reorder_nudge",
    title: "We haven't seen you in a while",
    when: "A month or two after the last visit — bring regulars back.",
    category: "MARKETING",
    stage: "nurture",
    vars: ["name", "shop"],
    body: {
      hi: "नमस्ते {{1}} जी, आपको {{2}} पर आए काफ़ी समय हो गया है। कुछ नया लेना है या बदलवाना है? इस मैसेज का जवाब दें, हम तुरंत आपकी मदद करेंगे।",
      gu: "નમસ્તે {{1}}, તમે {{2}} પર આવ્યા ને ઘણો સમય થઈ ગયો. કંઈ નવું લેવું છે કે બદલાવવું છે? આ મેસેજનો જવાબ આપો, અમે તરત જ તમારી મદદ કરીશું.",
      en: "Hello {{1}}, it has been a while since your last visit to {{2}}. Need to restock or replace something? Reply to this message and we will help you right away.",
    },
  },
  {
    key: "birthday_anniversary",
    title: "Birthday or anniversary wish",
    when: "A personal touch on a customer's special day.",
    category: "MARKETING",
    stage: "nurture",
    vars: ["name", "occasion", "shop"],
    body: {
      hi: "नमस्ते {{1}} जी, आपको {{2}} की हार्दिक शुभकामनाएँ! {{3}} की पूरी टीम की ओर से आपको और आपके परिवार को स्वस्थ और खुशहाल जीवन की कामना। हमारे विशिष्ट ग्राहक बने रहने के लिए धन्यवाद।",
      gu: "નમસ્તે {{1}}, આપને {{2}} ની હાર્દિક શુભેચ્છાઓ! {{3}} ની આખી ટીમ તરફથી આપને અને આપના પરિવારને સ્વસ્થ અને સુખી જીવનની શુભકામનાઓ. અમારા મૂલ્યવાન ગ્રાહક રહેવા બદલ આભાર.",
      en: "Hello {{1}}, happy {{2}}! Everyone at {{3}} wishes you and your family good health and happiness this year. Thank you for being our valued customer.",
    },
  },
];

// ── Building a submittable template ────────────────────────────────────────

const FOOTER: Record<PackLang, string> = {
  hi: "रोकने के लिए Stop लिखें",
  gu: "બંધ કરવા Stop લખો",
  en: "Reply Stop to opt out",
};

export interface BuiltPackTemplate {
  /** The name registered with Meta: lowercase letters, digits and underscores. */
  metaName: string;
  displayName: string;
  language: PackLang;
  category: PackCategory;
  bodyText: string;
  footerText?: string;
  buttons?: Array<{ type: "QUICK_REPLY"; text: string }>;
  examples: string[];
  /** Same for every language of one template, so a campaign can pick each customer's language. */
  templateGroup: string;
}

export function buildPackTemplate(t: PackTemplate, language: PackLang): BuiltPackTemplate {
  const marketing = t.category === "MARKETING";
  return {
    metaName: `sk_${t.key}_${language}`,
    displayName: `${t.title} (${PACK_LANGUAGES.find((l) => l.code === language)!.label})`,
    language,
    category: t.category,
    bodyText: t.body[language],
    // Marketing carries an opt-out: the button sends the word "Stop", which the webhook already honours.
    footerText: marketing ? FOOTER[language] : undefined,
    buttons: marketing ? [{ type: "QUICK_REPLY", text: "Stop" }] : undefined,
    examples: t.vars.map((v) => VAR_KINDS[v].example[language]),
    templateGroup: `sk_${t.key}`,
  };
}

export function selectPackTemplates(opts: { keys?: string[]; stages?: PackStage[] } = {}): PackTemplate[] {
  return PACK_TEMPLATES.filter((t) => (!opts.keys || opts.keys.includes(t.key)) && (!opts.stages || opts.stages.includes(t.stage)));
}

// ── The "thank you and stay in touch" journey ──────────────────────────────

/** Steel-care tip used in the care-tip step until the shop swaps in its own. */
const DEFAULT_TIP: Record<PackLang, string> = {
  hi: "स्टील के बर्तनों को नरम स्पंज और हल्के साबुन से धोएँ और पानी के दाग से बचने के लिए अच्छी तरह सुखाएँ।",
  gu: "સ્ટીલના વાસણોને નરમ સ્પંજ અને હળવા સાબુથી ધોઈ, પાણીના ડાઘથી બચવા સારી રીતે સૂકવી લો.",
  en: "Wash steel utensils with a soft sponge and mild soap, and dry them well to avoid water marks.",
};

/** After a sale: thank them now, share a tip in a week, bring them back after six weeks. */
export const JOURNEY_STEPS: Array<{ key: string; delayMinutes: number }> = [
  { key: "purchase_thank_you", delayMinutes: 0 },
  { key: "care_tips", delayMinutes: 7 * 24 * 60 },
  { key: "reorder_nudge", delayMinutes: 45 * 24 * 60 },
];

/** Which variable gets what, for a template placed in a sale-triggered sequence. */
export function journeyMapping(t: PackTemplate, ctx: { shop: string; language: PackLang }): Record<string, string> {
  const mapping: Record<string, string> = {};
  t.vars.forEach((kind, i) => {
    const slot = String(i + 1);
    if (kind === "name") mapping[slot] = "name";
    else if (kind === "shop") mapping[slot] = `text:${ctx.shop}`;
    else if (kind === "amount") mapping[slot] = "ctx:amount_display";
    else if (kind === "bill") mapping[slot] = "ctx:bill";
    else if (kind === "tip") mapping[slot] = `text:${DEFAULT_TIP[ctx.language]}`;
  });
  return mapping;
}
