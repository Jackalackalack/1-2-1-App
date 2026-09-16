import { NextResponse } from "next/server";
import { getSetupOAuthClient } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    return new NextResponse("Already configured. This setup route is now disabled.", {
      status: 404,
    });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new NextResponse("Missing code from Google.", { status: 400 });
  }

  const client = getSetupOAuthClient();
  const { tokens } = await client.getToken(code);

  const refreshToken = tokens.refresh_token;

  const html = `
    <!doctype html>
    <html>
      <body style="font-family: system-ui; max-width: 640px; margin: 60px auto; line-height: 1.6;">
        <h1>Connected</h1>
        ${
          refreshToken
            ? `<p>Copy this refresh token and add it as <code>GOOGLE_REFRESH_TOKEN</code> in your environment variables (Vercel project settings, or your local .env.local):</p>
               <textarea style="width:100%; height:80px;" readonly>${refreshToken}</textarea>
               <p>Once it's saved, redeploy (or restart the dev server) and this setup page is no longer needed.</p>`
            : `<p>No refresh token came back. This usually means you'd already granted access before.
               Go to <a href="https://myaccount.google.com/permissions" target="_blank">Google Account permissions</a>,
               remove access for this app, then visit <code>/api/oauth</code> again.</p>`
        }
      </body>
    </html>
  `;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
