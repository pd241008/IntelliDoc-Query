import { auth0 } from "@/lib/auth0";

export default async function AuthSync() {
  const session = await auth0.getSession();

  if (!session?.user) return null;

  try {
    const { token } = await auth0.getAccessToken();

    console.log(
      "🛠️ Token Type Check:",
      token.startsWith("eyJ") ? "JWT ✅" : "Opaque ❌",
    );

    const authApiBaseUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || "http://localhost:5000";
    
    const res = await fetch(`${authApiBaseUrl}/api/auth/sync-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: session.user.email,
        name: session.user.name,
      }),
      cache: "no-store",
    });

    if (res.ok) {
      console.log("✅ [AuthSync] User synced to MongoDB");
    } else {
      console.log("❌ [AuthSync] Sync rejected:", res.status);
    }
  } catch (error) {
    console.log("⚠️ [AuthSync] Sync failed:", error);
  }

  return null;
}
