import { verifyJWT } from "../lib/jwt";

export type AuthUser = {
    sub: string
    role: 'admin' | 'guest'
} | null

export async function getUserFromAuthHeader(c: any) {
    const auth = c.req.header("Authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const token = auth.replace("Bearer ", "") as string;

    try {
        const payload = await verifyJWT(token, c.env.JWT_SECRET);
        if (!payload || !payload.sub) return null;
        return { sub: payload.sub, role: payload.role } as AuthUser;
    } catch (err) {
        console.error("JWT verify error:", err);
        return null;
    }
}

export function isAdmin(authUser: AuthUser) {
    return !!authUser && authUser.role === "admin";
}

export function isMember(authUser: AuthUser) {
    return !!authUser
}

export function isSelf(authUser: AuthUser, user_uuid: string) {
    return !!authUser && authUser.sub === user_uuid;
}