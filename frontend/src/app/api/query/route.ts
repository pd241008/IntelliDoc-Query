import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

const auth0 = new Auth0Client();

export async function POST(req: Request) {
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.sub;

  const backendUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  try {
    const payload = await req.json();
    
    // Inject client_id into payload
    payload.client_id = userId;

    const backendRes = await fetch(`${backendUrl}/query/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!backendRes.ok || !backendRes.body) {
       return NextResponse.json(
        { error: "Failed to fetch from backend" },
        { status: backendRes.status }
      );
    }

    // Since the backend returns NDJSON streaming response, 
    // we can return the readable stream directly to the client
    return new Response(backendRes.body, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Transfer-Encoding": "chunked",
      },
      status: backendRes.status,
    });
  } catch (error) {
    console.error("Query API error:", error);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
