import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  try {
    const formData = await req.formData();

    const backendRes = await fetch(`${backendUrl}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || "Backend upload failed" },
        { status: backendRes.status },
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: "Connect ECONNREFUSED: Backend is offline" },
      { status: 503 },
    );
  }
}
