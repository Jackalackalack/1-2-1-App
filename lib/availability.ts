import { config } from "./config";

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// Finds the UTC offset (in minutes) for a given timezone at a given UTC instant.
function offsetMinutesAt(utcDate: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  });
  const parts = formatter.formatToParts(utcDate);
  const tzPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const match = tzPart.match(/GMT([+-]\d+)(?::(\d+))?/);
  if (!match) return 0;
  const hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  return hours * 60 + (hours < 0 ? -minutes : minutes);
}

// Builds a UTC Date from a wall-clock date + time in a given timezone.
function zonedToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  const guessUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offset = offsetMinutesAt(guessUtc, timeZone);
  return new Date(guessUtc.getTime() - offset * 60000);
}

function dateStrInZone(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date); // yyyy-mm-dd
}

export type BusyInterval = { start: string; end: string };
export type Window = { start: number; end: number }; // epoch ms

// Builds bookable windows from the recurring weekly workingHours pattern
// in lib/config.ts. Used when availabilityCalendarId is not set.
export function windowsFromWorkingHours(daysAhead: number): Window[] {
  const { timezone, workingHours } = config;
  const now = new Date();
  const windows: Window[] = [];

  for (let dayOffset = 0; dayOffset <= daysAhead; dayOffset++) {
    const dayDate = new Date(now.getTime() + dayOffset * 86400000);
    const dateStr = dateStrInZone(dayDate, timezone);
    const [y, m, d] = dateStr.split("-").map(Number);
    const weekday = DAY_NAMES[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
    const hours = workingHours[weekday];
    if (!hours) continue;

    windows.push({
      start: zonedToUtc(dateStr, hours.start, timezone).getTime(),
      end: zonedToUtc(dateStr, hours.end, timezone).getTime(),
    });
  }

  return windows;
}

// True if the given instant falls on a blacked-out date, in config's timezone.
export function isBlackedOut(instant: number): boolean {
  const dateStr = dateStrInZone(new Date(instant), config.timezone);
  return config.blackoutDates.some((b) => dateStr >= b.start && dateStr <= b.end);
}

// Slices a set of bookable windows into fixed-length slots, removing
// anything too soon, blacked out, or overlapping a busy interval (with buffer).
export function computeAvailableSlots(windows: Window[], busy: BusyInterval[]): string[] {
  const { durationMinutes, bufferMinutes, minNoticeHours } = config;

  const busyIntervals = busy.map((b) => ({
    start: new Date(b.start).getTime() - bufferMinutes * 60000,
    end: new Date(b.end).getTime() + bufferMinutes * 60000,
  }));

  const earliestStart = Date.now() + minNoticeHours * 3600000;
  const slots: string[] = [];

  for (const w of windows) {
    for (
      let slotStart = w.start;
      slotStart + durationMinutes * 60000 <= w.end;
      slotStart += durationMinutes * 60000
    ) {
      const slotEnd = slotStart + durationMinutes * 60000;
      if (slotStart < earliestStart) continue;
      if (isBlackedOut(slotStart)) continue;

      const overlaps = busyIntervals.some(
        (b) => slotStart < b.end && slotEnd > b.start
      );
      if (!overlaps) {
        slots.push(new Date(slotStart).toISOString());
      }
    }
  }

  return slots;
}
