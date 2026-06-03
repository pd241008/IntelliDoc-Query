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
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3000";

  try {
    const incomingFormData = await req.formData();
    const newFormData = new FormData();
    
    // attach client_id
    newFormData.append("client_id", userId);

    // attach file explicitly with its filename
    const file = incomingFormData.get("file");
    if (file && typeof file === "object" && "name" in file) {
      newFormData.append("file", file, file.name);
    } else if (file) {
      newFormData.append("file", file);
    }

    const backendRes = await fetch(`${backendUrl}/upload`, {
      method: "POST",
      body: newFormData,
    });

    const data = await backendRes.json();

    return NextResponse.json(data, {
      status: backendRes.status,
    });
  } catch (error) {
    console.error("Upload API error:", error);

    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
