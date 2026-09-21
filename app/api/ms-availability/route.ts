import { NextResponse } from "next/server";
import { getMsAvailabilityWindows, getMsBusyPeriods } from "@/lib/microsoft";
import { computeAvailableSlots, windowsFromWorkingHours, Window } from "@/lib/availability";
import { config } from "@/lib/config";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(`ms-availability:${ip}`, 30, 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const timeMin = new Date();
    const timeMax = new Date(Date.now() + config.daysAhead * 86400000);

    let windows: Window[];

    if (config.msAvailabilityCalendarId) {
      // Windows come from events on your dedicated Outlook availability calendar.
      windows = await getMsAvailabilityWindows(config.msAvailabilityCalendarId, timeMin, timeMax);
    } else {
      // Windows come from the recurring weekly pattern in lib/config.ts.
      windows = windowsFromWorkingHours(config.daysAhead);
    }

    const busy = await getMsBusyPeriods(timeMin, timeMax);

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
