import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

const auth0 = new Auth0Client();

export async function GET(req: Request) {
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.sub;
  const backendUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || "http://127.0.0.1:5000";

  try {
    const backendRes = await fetch(`${backendUrl}/api/userdocretrieval/documents/${encodeURIComponent(userId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await backendRes.json();

    return NextResponse.json(data, {
      status: backendRes.status,
    });
  } catch (error) {
    console.error("Documents API error:", error);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
