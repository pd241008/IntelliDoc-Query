import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const baseResponse = {
    timestamp: new Date().toISOString(),
  };

  if (!backendUrl) {
    return NextResponse.json(
      {
        ok: false,
        status: "down",
        backend: { reachable: false },
        error: "Backend API URL not configured",
        ...baseResponse,
      },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${backendUrl}/health`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          status: "down",
          backend: {
            reachable: true,
            statusCode: res.status,
          },
          error: "Backend health check failed",
          ...data,
          ...baseResponse,
        },
        { status: res.status },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        status: data.status || "up",
        backend: {
          reachable: true,
          statusCode: res.status,
        },
        ...data,
        ...baseResponse,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: "down",
        backend: { reachable: false },
        error: "Backend unreachable",
        ...baseResponse,
      },
      { status: 503 },
    );
  }
}
