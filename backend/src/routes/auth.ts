import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { signJWT } from "../lib/jwt";
import { getSupabaseClient } from "../lib/supabase";

export const authRoutes = new Hono<{ Bindings: any }>();

authRoutes.post("/login", async (c) => {
  const { user_id, password } = await c.req.json();
  const supabase = getSupabaseClient(c.env);

  const { data: user, error } = await supabase
    .from("users")
    .select(`id, user_id, password_hash, profiles!inner(role)`)
    .eq("user_id", user_id)
    .single();

  if (error || !user) return c.json({ error: "Invalid credentials" }, 401);

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return c.json({ error: "Invalid credentials" }, 401);

  const token = await signJWT({ role: user.profiles.role }, c.env.JWT_SECRET, user.id);
  return c.json({ token });
});
