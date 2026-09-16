import { NextResponse } from "next/server";
import { getSetupOAuthClient } from "@/lib/google";
export const dynamic = "force-dynamic"; 

// Narrowest scopes that cover what this app actually does:
// - calendar.readonly: checking free/busy
// - calendar.events: creating the booked meeting
// Deliberately not requesting the full "calendar" scope, which would also
// allow managing calendar settings and sharing, more than this app needs.
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];

export async function GET() {
  // Once set up, this route has no further purpose. Locking it once a
  // refresh token exists means it isn't sitting open on the live site
  // indefinitely.
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    return new NextResponse("Already configured. This setup route is now disabled.", {
      status: 404,
    });
  }

  const client = getSetupOAuthClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // forces a refresh token even on repeat visits
    scope: SCOPES,
  });
  return NextResponse.redirect(url);
}
