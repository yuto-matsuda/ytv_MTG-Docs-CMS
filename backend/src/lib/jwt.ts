import { JWTPayload, SignJWT, jwtVerify } from "jose";

export async function signJWT(
  payload: Record<string, unknown>, 
  secret: string, 
  subject?: string
) {
  let jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d");
  
  if (subject) jwt = jwt.setSubject(subject);
  return jwt.sign(new TextEncoder().encode(secret));
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch {
    return null;
  }
}
