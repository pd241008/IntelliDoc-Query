import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://127.0.0.1:8000";
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || "";

export async function GET() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ADMIN_API_SECRET) {
    return NextResponse.json(
      { error: "Admin API secret not configured" },
      { status: 503 }
    );
  }

  try {
    const backendRes = await fetch(`${BACKEND_URL}/admin/settings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ADMIN_API_SECRET}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("Admin settings API error:", error);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
