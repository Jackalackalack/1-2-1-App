import { NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/microsoft";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (process.env.MS_REFRESH_TOKEN) {
    return new NextResponse("Already configured. This setup route is now disabled.", {
      status: 404,
    });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    return new NextResponse(
      `Microsoft returned an error: ${error}\n${errorDescription ?? ""}`,
      { status: 400, headers: { "Content-Type": "text/plain" } }
    );
  }

  if (!code) {
    return new NextResponse("Missing code from Microsoft.", { status: 400 });
  }

  const tokens = await exchangeCodeForTokens(code);
  const refreshToken = tokens.refresh_token;

  const html = `
    <!doctype html>
    <html>
      <body style="font-family: system-ui; max-width: 640px; margin: 60px auto; line-height: 1.6;">
        <h1>Microsoft Calendar connected</h1>
        ${
          refreshToken
            ? `<p>Copy this refresh token and add it as <code>MS_REFRESH_TOKEN</code> in your
               environment variables (Vercel project settings, or your local .env.local):</p>
               <textarea style="width:100%; height:80px;" readonly>${refreshToken}</textarea>
               <p>Once saved, redeploy (or restart the dev server) — the app will now read your
               Outlook Calendar and create Teams meetings for new bookings.</p>
               <p>This setup page locks itself once the variable is set, so you don't need
               to delete the route.</p>`
            : `<p>No refresh token came back. This usually means you had already granted access
               before. Go to
               <a href="https://myapps.microsoft.com" target="_blank">myapps.microsoft.com</a>
               (or My Account > Privacy > Apps &amp; services), remove this app's access,
               then visit <code>/api/ms-oauth</code> again.</p>`
        }
      </body>
    </html>
  `;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
