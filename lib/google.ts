import { google } from "googleapis";

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET or GOOGLE_REDIRECT_URI env vars."
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

// Client used for the one-time setup flow (getting a refresh token).
export function getSetupOAuthClient() {
  return getOAuthClient();
}

// Client used for every real request, authenticated as you via the stored refresh token.
export function getAuthorizedClient() {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error(
      "GOOGLE_REFRESH_TOKEN is not set. Run the one-time setup at /api/oauth first."
    );
  }
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

export function getCalendarClient() {
  const auth = getAuthorizedClient();
  return google.calendar({ version: "v3", auth });
}
