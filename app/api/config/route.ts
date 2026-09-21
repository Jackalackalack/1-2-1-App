import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Exposes the active calendar provider to the client.
// No credentials or secrets are included — just the provider name.
export async function GET() {
  const raw = (process.env.CALENDAR_PROVIDER ?? "google").toLowerCase();
  const provider: "google" | "microsoft" = raw === "microsoft" ? "microsoft" : "google";

  return NextResponse.json({
    provider,
    meetingFormat: provider === "microsoft" ? "Microsoft Teams" : "Google Meet",
  });
}
