import { NextResponse } from "next/server";
import { getMsAuthUrl } from "@/lib/microsoft";

export const dynamic = "force-dynamic";

export async function GET() {
  // Once set up, lock the route so it doesn't sit open on the live site.
  if (process.env.MS_REFRESH_TOKEN) {
    return new NextResponse("Already configured. This setup route is now disabled.", {
      status: 404,
    });
  }

  try {
    const url = getMsAuthUrl();
    return NextResponse.redirect(url);
  } catch (err: any) {
    return new NextResponse(
      `Setup can't continue yet: ${err.message ?? "unknown error"}\n\n` +
        "Check Vercel > Settings > Environment Variables (or your local .env.local), " +
        "then redeploy after adding or fixing anything.",
      { status: 500, headers: { "Content-Type": "text/plain" } }
    );
  }
}
