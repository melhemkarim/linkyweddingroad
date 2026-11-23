# Wedding invitation — Linky (THE ROAD version)

One website, one link, made to be scrolled. A drawn coast opens the page and a gold road leads from one end to the other. Then the wedding date appears **made of the couple's two childhood photos**: his half and her half slide together and lock into one date. After that: the day and time, a countdown (one pearl per day left), the two places (the groom's side and the bride's side, each with a road that draws itself), the dress code, a reply section and a wish table.

## 0. The two photos
Put the couple's childhood photos in `public/photos/` as **`him.jpg`** and **`her.jpg`** (any size, a clear face works best). The names of the files are set in `site.config.ts` (`photoHim`, `photoHer`). If the faces look cut off inside the date, tell Linky and the picture position is adjusted in `app/globals.css` (`.drL .drBg`, `.drR .drBg`).

## 1. Change it for a new wedding

Open **`site.config.ts`**. Everything is there: names (also in Arabic), date and time, the two places, dress code, the story, and all the words.

### The reply (RSVP) goes to WhatsApp
- In `site.config.ts` change **`whatsapp`** to the number that should receive the replies. Digits only, with the country code and no zero at the start. Lebanon example: `96170123456`.
- The guest chooses **Accept** or **Decline**, writes their name, and (if they accept) picks how many plus ones. Then they press and hold the round seal. WhatsApp opens with the message already written, they only press send. The message looks like this:

```
Hello! 💌
RSVP for Karim & Dana's wedding — 5 June 2027

Name: Layla Haddad
Reply: ✅ Accepts
Plus ones: 2
Total coming: 3
```
- You can change the words of that message in `site.config.ts` (`rsvpMessage`). Nothing is saved on a server; the replies live in your WhatsApp.

### The two places
`locations` has two places: the groom and the bride. For each one: the place name, the town, the time and one short line. Add `kind: "hotel"` to show a hotel icon instead of a church icon. For the map button either add `lat` and `lng`, or paste a Google Maps link in `mapsUrl`. If you do neither, the button searches the church name and town.

### The picture shown when the link is shared
The small picture people see in WhatsApp or Instagram when the link is sent is `public/photos/her.jpg`. To use another picture, change the name in `app/layout.tsx` (`openGraph.images`).

## 2. Put it online (free)

1. Make a **private** repository on GitHub and upload this whole folder.
2. On Netlify: **Add new site → Import an existing project →** pick that repository. Do not change anything, it knows what to do.
3. Wait about two minutes. Your link is ready.

Before step 3 is finished the site already works in **demo mode**: wishes and photos stay only on the phone that made them. That is fine for looking around, not for guests.

## 3. Turn on saving (Supabase, free)

Only needed so wishes and photos really reach the couple.

1. Go to supabase.com, make a new project.
2. **SQL Editor → New query**, paste everything from `supabase/schema.sql`, press **Run**.
3. **Project Settings → API**: copy the **Project URL** and the **service_role** key (the secret one).
4. On Netlify: **Site configuration → Environment variables**, add these three:
   - `SUPABASE_URL` = the Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = the service_role key
   - `COUPLE_PASSWORD` = any password the couple will remember
5. **Deploys → Trigger deploy → Deploy site.**

The demo-mode notes disappear on their own once it is connected.

## 4. What the couple see

Open **your-link/couple**, type the password. They see every wish and can download the wishes as a text file. Guests can only add, never read.

The address `/couple` is not linked from anywhere. To change it, rename the folder `app/couple` to anything you like.

## Good to know

- Each phone can send 3 wishes and take 3 photos. It is counted per phone, so someone who clears their browser could send more. For a wedding that is fine.
- The colours are at the bottom of `app/globals.css` (`--paper` is the blue of the page, `--gold` is the soft gold, flowers are white).
- Guests' photos are stored privately. Nobody can open them without the couple's password.
- The `service_role` key is a secret. Keep it only in Netlify, never in the repository.
- No sound anywhere.

Created by Linky.


## The opening and the walk
- **Shutters:** the first screen is two closed shutters with the names on them. Touch to open. (`components/Shutters.tsx`, text in `site.config.ts`: `shutterHint`)
- **The walk:** after the first screen, the two of them walk toward each other as you scroll and meet under an arch. The drawings are in `components/Couple.tsx` (hair, clothes, skin colour can be changed there). The three lines on top are `walkLines` in `site.config.ts`.
