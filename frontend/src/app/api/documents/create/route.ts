import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

const auth0 = new Auth0Client();

export async function POST(req: Request) {
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth0Id = session.user.sub;

  const body = await req.json();

  const expressUrl = process.env.EXPRESS_API_URL || "http://localhost:5000";

  const response = await fetch(`${expressUrl}/api/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth0Id,
      ...body,
    }),
  });

  const data = await response.json();

  return NextResponse.json(data);
}
