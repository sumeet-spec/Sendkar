# SIM day: connect Sendkar's own WhatsApp number and prove it works

Goal for the day: a real message and a real card sent from a real number, Sendkar's own system number connected,
and one stranger able to connect their own number. Do the steps in order; each one unlocks the next.

Tick each box only when you have seen it work, not when you have clicked the button.

## 0. Before you start (10 minutes)

- [ ] The SIM is active and can receive an SMS or a call (Meta verifies the number this way).
- [ ] That number has **never** been used with WhatsApp, or you have deleted WhatsApp on it first.
      (If it is already on the WhatsApp Business app, you can use "coexistence" instead of deleting. See step 3.)
- [ ] You can log in to the Meta business account that owns the Sendkar app (`NEXT_PUBLIC_META_APP_ID`).
- [ ] Documents for business verification at hand: registered business name, address, GST or incorporation
      certificate, a utility bill or bank statement with the same name and address.

## 1. Meta business verification (start first, it takes days)

Business Settings, then Security centre, then Start verification. Do it today even if nothing else is ready.
Without it, the number is held to a low daily limit and onboarding other businesses can be refused.

- [ ] Business verification submitted. Status: ______ (submitted / in review / verified)

## 2. Make sure the app can onboard strangers

In the Meta developer dashboard, open the Sendkar app and check each line. These decide whether a shopkeeper can
connect their own number with one tap.

- [ ] App mode is **Live** (not Development). Needs a privacy policy URL (`https://www.sendkar.shop/privacy`),
      terms URL, app icon and category.
- [ ] WhatsApp product added.
- [ ] Permissions `whatsapp_business_management` and `whatsapp_business_messaging` show **Advanced access**.
      If not: App Review, then Permissions and features, then Request. Meta wants a screen recording of the
      connect flow in your app. Start this today, review can take days or weeks.
- [ ] Embedded Signup configuration exists (its id is `NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID`).
- [ ] Enrolled as a **Tech Provider** (Business Settings, then Partners/Tech provider), if the dashboard asks for it.

If any of these is not done, a stranger cannot connect yet. You can still onboard pilot shops by hand.

## 3. Put the SIM on the WhatsApp Business Platform

WhatsApp Manager, then Account tools, then Phone numbers, then Add phone number.

- [ ] Number added, verified by the SMS or call code.
- [ ] Display name submitted (use "Sendkar"). Approval can take a few hours.
- [ ] Note the three values you will need: **Phone number ID**, **WhatsApp Business Account ID**, and a token (step 4).

## 4. A token that does not expire

Business Settings, then Users, then System users, then Add. Role: Admin.

- [ ] Assign it the Sendkar app and the WhatsApp account, with both `whatsapp_business_management` and
      `whatsapp_business_messaging`.
- [ ] Generate token, with no expiry. Keep it somewhere safe. Do not paste it into chat.

## 5. Connect it in Sendkar and point the system sender at it

1. Make a Sendkar account for the company itself (not your personal one), called "Sendkar System".
2. In its Onboarding, enter Phone number ID, Business Account ID and the token.
3. In Supabase SQL editor, give that workspace a plan so nothing is blocked (replace the id):

   ```sql
   update workspaces set plan = 'scale', trial_ends_at = null where id = 'PASTE_WORKSPACE_ID';
   ```

4. On Vercel, set `SYSTEM_SENDER_WORKSPACE_ID` to that workspace id. Redeploy.

- [ ] The webhook is set: callback `https://www.sendkar.shop/api/whatsapp/webhook`, verify token equals the
      `WHATSAPP_WEBHOOK_VERIFY_TOKEN` on Vercel, and the `messages` and `message_template_status_update`
      fields are subscribed.
- [ ] Send yourself a message from the number. See it arrive in Sendkar's inbox. Reply from Sendkar, see it arrive.

## 6. The two system templates (create in WhatsApp Manager, not in Sendkar)

Authentication templates have a special format, so make this one in WhatsApp Manager, Message templates, Create.

| Name | Type | Text |
| --- | --- | --- |
| `sendkar_password_reset_otp` | Authentication, with a "Copy code" button | the standard "{{1}} is your verification code" |
| `sendkar_daily_summary` | Utility | `Yesterday on Sendkar: {{1}} messages sent, {{2}} replies, {{3}} new customers. Open your dashboard to see more.` Examples for the variables: 120, 14, 6 |

- [ ] Both approved. Then on Vercel set `SIGNUP_OTP_REQUIRED=true` and `DAILY_SUMMARY_WHATSAPP=true`, redeploy.
- [ ] Test: sign up a new account with a number you own. The code arrives on WhatsApp and unlocks the account.

## 7. The tests that prove the product

Do these in a normal customer account (yours, with the trial), not the system one.

1. [ ] Connect a number the way a customer would, from the onboarding screen.
2. [ ] Submit one starter template and one **image-header** template. Wait for approval. Note any rejection reason.
3. [ ] Make a Diwali card in the library and send it to your own number. It arrives as a picture.
4. [ ] Create a campaign to 3 numbers of people who agreed. Press **Send now**. Watch the progress bar. All 3 arrive.
5. [ ] Print the counter poster, scan it with another phone, tick the box. The count on the permission page goes up.
6. [ ] Buy the lowest plan with a real card. The plan activates, the receipt arrives. (Refund it after if you like.)
7. [ ] **A stranger connects.** Ask a friend with a business number to connect through the embedded sign-up on their
      own phone. If it works, you can open it to everyone.

## 8. Things to write down as you go

- What Meta charged for each message type (marketing, utility, authentication) in the billing page, so the cost
  note in campaigns can be checked against reality.
- Any template rejection reasons, exactly as Meta words them.
- Where a friend got stuck. That is the next thing to fix.

## Limits to remember

- A new number can message only a small number of **new** people a day until verified and in good standing (the
  first tier is a few hundred). The sender will hold and carry on the next day.
- If many messages fail, the campaign pauses itself to protect the number. That is by design.
- Never send demo messages to anyone who has not agreed.
