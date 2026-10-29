# Newspaper and print plan

The idea: business owners read newspapers, so reach them there with something they can use at once. The ad does not
ask them to "learn about software". It offers a free festival card with their own shop name, and a QR code to get it.

## What is in this folder

| File | Use |
| --- | --- |
| `pamphlet-A5-gu / hi / en -colour.png` | A5 pamphlet for inserting in newspapers or handing out. 148 x 210 mm at 300 dpi. |
| `pamphlet-A5-... -bw.png` | The same in pure black and white, for one-colour printing. |
| `newspaper-2col-10cm-... -colour.png` | A small display ad, about 2 columns wide and 10 cm tall (992 x 1181 px at 300 dpi). |
| `newspaper-2col-10cm-... -bw.png` | The same for black-and-white newsprint. |

Gujarati (`gu`) first. Hindi (`hi`) for Hindi papers. English (`en`) for English business pages. Marathi, Tamil, Telugu and
Kannada versions can be made the same way once the wording has been read by a native speaker.

The picture of the card on the phone is a real card made with the same tool people will use, with a sample shop name.

## How people reach it, and how you count them

- The **QR code** opens the free card page in the right language with the tag `src=paper`.
- The **short address** under it (`sendkar.shop/gu`, `/hi`, `/mr`, `/ta`, `/te`, `/kn`) is for people who type. It tags `src=print`.
- To tell newspapers apart, ask for a different QR per paper. Change `src=paper` to, for example, `src=paper-sandesh` in the
  QR link and re-render. Every card downloaded and every number left is recorded with its tag.

To see the results in Supabase:

```sql
select source, count(*) as cards, count(phone) as numbers_left
from free_card_leads
group by source
order by cards desc;
```

## Where to put it (cheapest first)

1. **A short press note to the business desks. Costs nothing.** Editors like a useful, local story: "Free festival cards
   for shopkeepers, in Gujarati." Send it to the business and city pages of Gujarat Samachar, Sandesh, Divya Bhaskar and the
   English dailies, and to the trade magazines. A draft is below. Add the QR and one sample card as the picture.
2. **Trade and market bodies' newsletters and notice boards.** Chambers of commerce, traders' associations, cloth and
   hardware market committees, CA and tax-practitioner associations. Many have a monthly bulletin and WhatsApp groups. Often free or
   very cheap, and the readers are exactly the shop owners.
3. **Pamphlet inserts** in the newspaper. Priced per thousand copies and by edition or area. Ask each paper for its
   **insert rate card** and the area split, so you can choose the localities where shops cluster. Get quotes from at least three.
4. **Small display ads** on the business or city pages. Ask for the rate per column-centimetre, and for the "city
   edition" and "zone" prices, which are much lower than the full edition.
5. **Hand out** the A5 pamphlet at one market on a weekend, with a phone showing a card made with the owner's own shop name.

I have no rate card for any paper, so I have not put prices here. Rates change with the edition, day and page.

## What to ask the newspaper

- Column width in cm, so the ad fits exactly. Mine is sized for 2 columns of about 4.2 cm; if theirs differs, tell me and I will re-render.
- Is the page printed in colour or black and white? Use the matching file.
- What file do they want (PNG, JPG or PDF), and at what resolution? These are 300 dpi. Ask them to confirm the colour
  conversion, because the green can look a little different when printed.
- Booking deadline. Display ads often need 2 to 3 days. Inserts usually need a week or more.
- Whether the QR will print large enough: it should be at least 2.5 cm across. In the small ad it is about 2.5 cm.

## Draft press note (English; Gujarati can follow)

> **Free festival cards for shopkeepers, in their own language**
>
> Sendkar, a WhatsApp tool for small businesses, is offering shopkeepers a free festival card with their own shop name, in
> Gujarati, Hindi and other Indian languages. A shopkeeper picks a festival, types the shop name, and shares the card on
> WhatsApp within a minute. No signup is needed. New designs are added ahead of each festival, from Diwali to Uttarayan
> and Navratri.
>
> The same tool lets a shop send offers to all its customers on WhatsApp and collect their permission through a counter QR code.
> Shopkeepers can try it free for 7 days at sendkar.shop. Sendkar will be at Tech Expo Gujarat on 27 to 29 November.
>
> Contact: hello@sendkar.shop

Keep the wording factual. Do not add numbers you cannot show.

## Cautions

- Do not promise results ("double your sales"). Say what it does.
- Do not name other products or compare.
- Check the QR by scanning the **printed proof** before the full run, not only the screen file.
- Dates: newspaper ads for Diwali (8 November) need to be booked now. For later festivals, the same files still work,
  because the ad is about the tool, not one festival.
