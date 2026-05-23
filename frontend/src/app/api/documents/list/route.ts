import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

const auth0 = new Auth0Client();

export async function GET() {
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth0Id = session.user.sub;

  const expressUrl = process.env.EXPRESS_API_URL || "http://localhost:5000";

  const res = await fetch(`${expressUrl}/api/documents/${auth0Id}`);

  const data = await res.json();

  return NextResponse.json(data);
}
