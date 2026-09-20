import { NextResponse } from "next/server";
import { getCalendarClient } from "@/lib/google";
import { computeAvailableSlots, windowsFromWorkingHours, Window } from "@/lib/availability";
import { config } from "@/lib/config";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    // Max 30 requests per minute per IP, generous for normal browsing.
    if (isRateLimited(`availability:${ip}`, 30, 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const calendar = getCalendarClient();

    const timeMin = new Date();
    const timeMax = new Date(Date.now() + config.daysAhead * 86400000);

    let windows: Window[];

    if (config.availabilityCalendarId) {
      // Windows come from events on your dedicated availability calendar.
      const events = await calendar.events.list({
        calendarId: config.availabilityCalendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      windows = (events.data.items ?? [])
        .filter((e) => e.start?.dateTime && e.end?.dateTime)
        .map((e) => ({
          start: new Date(e.start!.dateTime as string).getTime(),
          end: new Date(e.end!.dateTime as string).getTime(),
        }));
    } else {
      // Windows come from the recurring weekly pattern in lib/config.ts.
      windows = windowsFromWorkingHours(config.daysAhead);
    }

    const freebusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: config.calendarId }],
      },
    });

    const busy =
      freebusy.data.calendars?.[config.calendarId]?.busy?.map((b) => ({
        start: b.start as string,
        end: b.end as string,
      })) ?? [];

    const slots = computeAvailableSlots(windows, busy);

    return NextResponse.json({
      slots,
      timezone: config.timezone,
      durationMinutes: config.durationMinutes,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Failed to load availability" },
      { status: 500 }
    );
  }
}
