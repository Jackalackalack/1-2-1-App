# Jack Abraham — 1-2-1 Booking App

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Jackalackalack/1-2-1-App)

A single-page booking tool. Visitors pick a free slot, it checks your Google
Calendar for conflicts, then creates the event with a Google Meet link and
emails everyone the invite. There is a notes field on the form so people can
share an agenda or documents before the call, that text is added straight
into the calendar event description.

Everything you'd want to tweak (working hours, meeting length, buffer time,
minimum notice, timezone) lives in `lib/config.ts`. No other file needs
touching for day-to-day changes.

Built by **[Jack Abraham](https://jackabraham.studio)** — [GitHub](https://github.com/Jackalackalack) · [LinkedIn](https://www.linkedin.com/in/jackcabraham/)

## 1. Google Cloud setup (one time)

1. Go to https://console.cloud.google.com and create a project (or use an existing one).
2. Enable the **Google Calendar API** for it (APIs & Services > Library).
3. Go to APIs & Services > OAuth consent screen. Choose **External**, fill in
   the basics, and add your own Google account as a test user. This keeps it
   private, only you can authorize it.
4. Go to APIs & Services > Credentials > Create Credentials > OAuth client ID.
   - Application type: **Web application**
   - Authorized redirect URIs: add both
     - `http://localhost:3000/api/oauth/callback`
     - `https://YOUR-VERCEL-DOMAIN/api/oauth/callback` (add this once you know the domain, see step 4 below)
5. Copy the **Client ID** and **Client Secret**.

## 2. Run it locally

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with the client ID, secret, and:
```
GOOGLE_REDIRECT_URI=http://localhost:3000/api/oauth/callback
```

Leave `GOOGLE_REFRESH_TOKEN` blank for now, then:

```bash
npm run dev
```

Visit `http://localhost:3000/api/oauth`, sign in with your own Google
account, and approve access. The page that follows shows a refresh token,
copy it into `.env.local` as `GOOGLE_REFRESH_TOKEN`, restart `npm run dev`,
and the booking page at `http://localhost:3000` will start showing real
availability from your calendar.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com, import the repo.
3. In the project's Environment Variables, add `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` set to
   `https://YOUR-VERCEL-DOMAIN/api/oauth/callback`. Deploy.
4. Add that same redirect URI back in the Google Cloud Console credential
   from step 1 (the domain only exists after the first deploy).
5. Visit `https://YOUR-VERCEL-DOMAIN/api/oauth` once, approve access, copy
   the refresh token shown, and add it as `GOOGLE_REFRESH_TOKEN` in Vercel's
   environment variables. Redeploy.

Your booking page is now live at `https://YOUR-VERCEL-DOMAIN`. That is the
link to share.

## Setting your availability

There are two ways to control when people can book, pick whichever suits you.

### Option A: a weekly pattern (default, no setup needed)

Edit `workingHours` in `lib/config.ts`. It repeats every week until you
change it again, see the comments in that file.

### Option B: a dedicated calendar (more granular, no code needed after setup)

1. In Google Calendar, create a new calendar, e.g. call it "Bookable Hours"
   (Settings > Add calendar > Create new calendar).
2. Whenever you want to be bookable, add an event to that calendar covering
   the window, e.g. "Tue 9-11am". You can do this from your phone, add as
   many or as few as you like, different every week if you want.
3. Get that calendar's ID: Settings > click the calendar's name on the left
   > scroll to "Integrate calendar" > copy the Calendar ID (looks like an
   email address).
4. In `lib/config.ts`, set `availabilityCalendarId` to that ID.

Once that's set, `workingHours` is ignored entirely, your bookable windows
come straight from that calendar's events. This is the option to use if you
want real week-to-week control without touching code again.

### Blackout dates (works with either option above)

For date ranges where nobody should be able to book at all, regardless of
your usual pattern, add them to `blackoutDates` in `lib/config.ts`:

```ts
blackoutDates: [
  { start: "2026-12-22", end: "2027-01-02" },
],
```

This is enforced on both the page (blacked-out dates never show as
options) and the server (a direct booking attempt for a blacked-out date is
rejected), so it can't be bypassed.

## Security measures already built in

- **OAuth scope is narrowed** to just `calendar.readonly` and `calendar.events`, not full calendar management. If the refresh token ever leaked, the blast radius is limited to checking availability and creating events, not deleting calendars or changing sharing settings.
- **The setup route locks itself.** Once `GOOGLE_REFRESH_TOKEN` is set, visiting `/api/oauth` returns a 404 instead of staying open indefinitely on the live site.
- **Server-side validation** on every booking: email format is checked, name and notes have length limits, and the requested time is checked against blackout dates and re-checked against your calendar before the event is created.
- **A honeypot field** on the form (invisible to real visitors, irresistible to basic bots) quietly discards spam submissions instead of creating junk events.
- **Rate limiting** on both endpoints, 5 booking attempts per 15 minutes and 30 availability checks per minute, per IP address. Worth knowing: since this runs on serverless functions, the limit resets whenever a fresh instance spins up, so it is a solid deterrent against casual abuse rather than a bulletproof cap under sustained attack. If that ever becomes a real concern, swapping in a shared store like Upstash Redis would make it fully reliable.

One thing this does **not** do yet: verify that the email address someone enters actually belongs to them before sending a calendar invite to it. At low volume for a personal booking page this is a reasonable trade-off, but if you ever see it abused, the fix is an email-confirmation step before the event is created.

## Notes on how it works

- **Booking window** is set by `daysAhead` in `lib/config.ts` (currently 60
  days). People browse it with a real month calendar, not just a short row
  of days, so they can navigate forward to any month within that window.
- **Availability** is calculated by combining your working hours
  (`lib/config.ts`) with your calendar's free/busy data, it does not need to
  read event details, only whether a time is busy.
- **Double-booking** is guarded against by re-checking the slot immediately
  before creating the event. Not bulletproof under simultaneous clicks to the
  exact same second, but solid for normal use, since a single person is
  hosting and volume is low.
- **The agenda/notes field is text only, not a file upload.** There is no
  file storage anywhere in this project. Whatever someone types (including a
  pasted link) goes straight into the calendar event's description, so it
  shows up in the invite email and the event itself. This is deliberate: see
  the "On file uploads" note below before adding one.
- **No database** is used. Google Calendar is the single source of truth,
  which is enough for a one-person tool like this.

## On file uploads

This project intentionally does not accept file uploads, only a text field
where people can paste a link. Real file upload is a meaningfully bigger
piece of work than it looks, and worth thinking through before adding:

- **Storage**: files need to live somewhere private (e.g. Vercel Blob or an
  S3 bucket with no public access), not just dropped in this repo.
- **Access control**: only you should ever be able to open what's uploaded,
  which means signed, expiring links, not public URLs.
- **Abuse and malware**: an open upload field on a public page will
  eventually get spam or malicious files. Needs size limits, file-type
  checks, and ideally scanning.
- **Privacy and liability**: once you're storing other people's documents,
  you're responsible for keeping them secure and for a reasonable retention
  policy (how long files are kept, how they're deleted).

None of that is impossible for a personal tool, but it is real work and a
real ongoing responsibility, not a quick add-on. The current text-only
approach sidesteps all of it: a Google Drive or Dropbox link (with sharing
restricted to your email) gives the same result, someone sends you
something to read before the call, without this project ever touching or
storing the file itself.

## License

MIT — see [LICENSE](LICENSE). Free to use, modify and share, including for
teaching, mentoring, or your own booking needs; just keep the copyright
notice attached to any copies.
