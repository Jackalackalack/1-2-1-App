import { NextResponse } from "next/server";
import { isMsSlotBusy, createMsEvent } from "@/lib/microsoft";
import { isBlackedOut } from "@/lib/availability";
import { config } from "@/lib/config";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_NOTES_LENGTH = 2000;

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(`ms-book:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many booking attempts. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, startTime, notes, company } = body as {
      name?: string;
      email?: string;
      startTime?: string;
      notes?: string;
      company?: string; // honeypot
    };

    // Honeypot: silently succeed so bots don't know they were blocked.
    if (company && company.trim().length > 0) {
      return NextResponse.json({ success: true, teamsLink: null, eventLink: null });
    }

    if (!name || !email || !startTime) {
      return NextResponse.json(
        { error: "Missing name, email or startTime" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedNotes = (notes ?? "").trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      return NextResponse.json({ error: "That doesn't look like a valid email." }, { status: 400 });
    }
    if (trimmedName.length === 0 || trimmedName.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be between 1 and ${MAX_NAME_LENGTH} characters.` },
        { status: 400 }
      );
    }
    if (trimmedNotes.length > MAX_NOTES_LENGTH) {
      return NextResponse.json(
        { error: `Notes must be under ${MAX_NOTES_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: "Invalid start time." }, { status: 400 });
    }
    const end = new Date(start.getTime() + config.durationMinutes * 60000);

    if (isBlackedOut(start.getTime())) {
      return NextResponse.json(
        { error: "That date isn't available for booking." },
        { status: 409 }
      );
    }

    // Recheck the slot is still free immediately before creating the event.
    const busy = await isMsSlotBusy(start, end);
    if (busy) {
      return NextResponse.json(
        { error: "That slot was just taken. Please pick another time." },
        { status: 409 }
      );
    }

    const descriptionParts = [
      `Booked by ${trimmedName} (${trimmedEmail}) via the booking page.`,
    ];
    if (trimmedNotes.length > 0) {
      descriptionParts.push(
        "",
        "Agenda / questions / documents shared ahead of the call:",
        trimmedNotes
      );
    } else {
      descriptionParts.push("", "No agenda or documents were shared ahead of this call.");
    }

    const event = await createMsEvent({
      subject: `${config.meetingTitle} - ${trimmedName}`,
      description: descriptionParts.join("\n"),
      start,
      end,
      attendeeEmail: trimmedEmail,
      attendeeName: trimmedName,
      timezone: config.timezone,
    });

    const teamsLink = event.onlineMeeting?.joinUrl ?? null;

    return NextResponse.json({ success: true, teamsLink, eventLink: event.webLink });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Failed to create booking" },
      { status: 500 }
    );
  }
}
