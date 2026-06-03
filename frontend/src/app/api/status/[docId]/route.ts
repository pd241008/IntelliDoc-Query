import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

const auth0 = new Auth0Client();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ docId: string }> }
) {
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { docId } = await params;

  // The FastAPI backend handles the ingestion pipeline status
  const backendUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  try {
    const backendRes = await fetch(`${backendUrl}/status/${docId}`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await backendRes.json();

    return NextResponse.json(data, {
      status: backendRes.status,
    });
  } catch (error) {
    console.error("Status API error:", error);
    return NextResponse.json(
      { error: "Backend status unavailable" },
      { status: 503 }
    );
  }
}
