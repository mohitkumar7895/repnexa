import * as jose from "jose";
import { cookies } from "next/headers";

function sessionSecret() {
  const secret = process.env.JWT_SECRET || "";
  if (secret.length >= 16) return new TextEncoder().encode(secret);
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required.");
  }
  return new TextEncoder().encode("fallback-secret-key-do-not-use-in-production-123456");
}

export async function signToken(payload: any) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(sessionSecret());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, sessionSecret());
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
