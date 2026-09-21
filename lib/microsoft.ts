// Microsoft Graph API helpers — parallel to lib/google.ts
// Uses MSAL-style OAuth2 directly via fetch, no extra SDK needed.

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

function getMsConfig() {
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  const tenantId = process.env.MS_TENANT_ID ?? "common";
  const redirectUri = process.env.MS_REDIRECT_URI;

  const missing = [
    !clientId && "MS_CLIENT_ID",
    !clientSecret && "MS_CLIENT_SECRET",
    !redirectUri && "MS_REDIRECT_URI",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing environment variable(s): ${missing.join(", ")}`);
  }

  return { clientId: clientId!, clientSecret: clientSecret!, tenantId, redirectUri: redirectUri! };
}

// Build the Azure AD authorization URL for the one-time setup flow.
export function getMsAuthUrl(): string {
  const { clientId, tenantId, redirectUri } = getMsConfig();
  const scopes = [
    "offline_access",
    "Calendars.Read",
    "Calendars.ReadWrite",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: scopes,
    prompt: "consent", // forces a refresh token even on repeat visits
  });

  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params}`;
}

// Exchange an authorization code for tokens (one-time setup).
export async function exchangeCodeForTokens(
  code: string
): Promise<{ access_token: string; refresh_token?: string; expires_in: number }> {
  const { clientId, clientSecret, tenantId, redirectUri } = getMsConfig();

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        scope: "offline_access Calendars.Read Calendars.ReadWrite",
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  return res.json();
}

// Get a fresh access token using the stored refresh token.
// Called on every request — tokens last 1 hour but serverless can't cache them.
async function getAccessToken(): Promise<string> {
  const refreshToken = process.env.MS_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error(
      "MS_REFRESH_TOKEN is not set. Run the one-time setup at /api/ms-oauth first."
    );
  }

  const { clientId, clientSecret, tenantId } = getMsConfig();

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        scope: "offline_access Calendars.Read Calendars.ReadWrite",
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${text}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export interface GraphEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  isOnlineMeeting?: boolean;
  onlineMeeting?: { joinUrl: string };
  webLink?: string;
}

// Internal: GET a Graph endpoint, returning UTC-normalised datetimes via Prefer header.
async function graphGet<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Forces all dateTime values in the response to be UTC,
      // matching the way Google Calendar returns them.
      "Prefer": 'outlook.timezone="UTC"',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph API error ${res.status}: ${text}`);
  }
  return res.json();
}

// Internal: GET, following @odata.nextLink pagination until all pages are collected.
async function graphGetAll<T extends { value: GraphEvent[]; "@odata.nextLink"?: string }>(
  path: string
): Promise<GraphEvent[]> {
  const token = await getAccessToken();
  const events: GraphEvent[] = [];
  let url: string | null = `${GRAPH_BASE}${path}`;

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Prefer": 'outlook.timezone="UTC"',
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Graph API error ${res.status}: ${text}`);
    }
    const data = await res.json() as T;
    events.push(...data.value);
    url = data["@odata.nextLink"] ?? null;
  }

  return events;
}

// Internal: POST a Graph endpoint.
async function graphPost<T>(path: string, body: unknown): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph API error ${res.status}: ${text}`);
  }
  return res.json();
}

// Parse a Graph dateTime string (returned as UTC with the Prefer header) to a timestamp.
// The API returns "2026-09-21T09:00:00.0000000" without a 'Z', so we append it.
function parseGraphDate(dt: string): number {
  return new Date(dt.endsWith("Z") ? dt : dt + "Z").getTime();
}

// ─── Public helpers ──────────────────────────────────────────────────────────

// Events from a dedicated availability calendar → bookable windows.
export async function getMsAvailabilityWindows(
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<{ start: number; end: number }[]> {
  const start = timeMin.toISOString();
  const end = timeMax.toISOString();

  const events = await graphGetAll(
    `/me/calendars/${encodeURIComponent(calendarId)}/calendarView` +
      `?startDateTime=${start}&endDateTime=${end}&$select=start,end`
  );

  return events
    .filter((e) => e.start?.dateTime && e.end?.dateTime)
    .map((e) => ({
      start: parseGraphDate(e.start.dateTime),
      end: parseGraphDate(e.end.dateTime),
    }));
}

// Events from the primary calendar → busy periods to subtract from windows.
export async function getMsBusyPeriods(
  timeMin: Date,
  timeMax: Date
): Promise<{ start: string; end: string }[]> {
  const start = timeMin.toISOString();
  const end = timeMax.toISOString();

  const events = await graphGetAll(
    `/me/calendarView?startDateTime=${start}&endDateTime=${end}&$select=start,end`
  );

  return events
    .filter((e) => e.start?.dateTime && e.end?.dateTime)
    .map((e) => ({
      start: new Date(parseGraphDate(e.start.dateTime)).toISOString(),
      end: new Date(parseGraphDate(e.end.dateTime)).toISOString(),
    }));
}

// Check whether a specific time slot has any existing events (for the booking double-check).
export async function isMsSlotBusy(slotStart: Date, slotEnd: Date): Promise<boolean> {
  const start = slotStart.toISOString();
  const end = slotEnd.toISOString();

  const events = await graphGetAll(
    `/me/calendarView?startDateTime=${start}&endDateTime=${end}&$top=1&$select=id`
  );

  return events.length > 0;
}

export interface CreateMsEventParams {
  subject: string;
  description: string;
  start: Date;
  end: Date;
  attendeeEmail: string;
  attendeeName: string;
  timezone: string;
}

// Create an Outlook calendar event with a Teams meeting link.
export async function createMsEvent(params: CreateMsEventParams): Promise<GraphEvent> {
  // Graph expects dateTime without the trailing 'Z' when timeZone is specified separately.
  const fmt = (d: Date) => d.toISOString().replace("Z", "");

  return graphPost<GraphEvent>("/me/events", {
    subject: params.subject,
    body: {
      contentType: "text",
      content: params.description,
    },
    start: {
      dateTime: fmt(params.start),
      timeZone: params.timezone,
    },
    end: {
      dateTime: fmt(params.end),
      timeZone: params.timezone,
    },
    attendees: [
      {
        emailAddress: {
          address: params.attendeeEmail,
          name: params.attendeeName,
        },
        type: "required",
      },
    ],
    isOnlineMeeting: true,
    onlineMeetingProvider: "teamsForBusiness",
  });
}
