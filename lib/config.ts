// Everything here is safe to edit. No code changes needed elsewhere.

export const config = {
  // Your timezone. Used to interpret working hours below.
  timezone: "Europe/London",

  // What the meeting is called and how long it runs.
  meetingTitle: "Meeting with Jack Abraham",
  durationMinutes: 30,

  // Minutes of breathing room before and after any existing event.
  bufferMinutes: 15,

  // How much notice you need. Someone can't book a slot starting sooner than this.
  minNoticeHours: 12,

  // How many days ahead the booking page shows slots for.
  daysAhead: 60,

  // Working hours per weekday, 24h format, in your timezone.
  // Leave a day out (or set to null) to mark it unavailable.
  workingHours: {
    monday: { start: "09:00", end: "17:00" },
    tuesday: { start: "09:00", end: "17:00" },
    wednesday: { start: "09:00", end: "17:00" },
    thursday: { start: "09:00", end: "17:00" },
    friday: { start: "09:00", end: "15:00" },
    saturday: null,
    sunday: null,
  } as Record<string, { start: string; end: string } | null>,

  // The calendar to check for conflicts and to book new meetings on.
  // "primary" is your main calendar.
  calendarId: "primary",

  // Optional. If set, bookable windows come from events on THIS calendar
  // instead of the recurring workingHours pattern above. Create a separate
  // calendar (e.g. "Bookable Hours"), add events to it for whenever you
  // want to be bookable, and put that calendar's ID here. Find the ID in
  // Google Calendar > Settings > [calendar name] > Integrate calendar >
  // Calendar ID. Leave as null to just use workingHours instead.
  availabilityCalendarId: "c1556377917879a161d18a38ccfc147963947ec0fcb0f9f98a1126ddea74694f@group.calendar.google.com",

  // Same as availabilityCalendarId, but for the Microsoft version (/api/ms-availability).
  // Get your Outlook calendar ID from the Microsoft Graph Explorer:
  //   https://developer.microsoft.com/en-us/graph/graph-explorer
  //   → GET /me/calendars  (find the "id" field for your "Bookable Hours" calendar)
  // Leave as null to use workingHours instead.
  msAvailabilityCalendarId: null as string | null,

  // Date ranges where no bookings are allowed at all, regardless of
  // workingHours or availabilityCalendarId. Inclusive, YYYY-MM-DD.
  // Example: { start: "2026-12-22", end: "2027-01-02" }
  blackoutDates: [] as { start: string; end: string }[],
};
