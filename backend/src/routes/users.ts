import bcrypt from "bcryptjs";
import { Hono } from "hono";
import { getUserFromAuthHeader, isAdmin, isMember, isSelf } from "../lib/auth";
import { getSupabaseClient } from "../lib/supabase";

export const usersRoutes = new Hono<{ Bindings: any }>();

usersRoutes.get('/', async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isAdmin(authUser)) return c.json({ error: "Forbidden" }, 403);

  const supabase = getSupabaseClient(c.env);
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id,
      user_id,
      profiles!inner(
        username,
        role
      )`);

  if (error || !users) return c.json({ error: 'Users not found' }, 404);

  return c.json(users.map(user => ({
    id: user.id,
    user_id: user.user_id,
    username: user.profiles.username,
    role: user.profiles.role,
  })));  
});

usersRoutes.post("/", async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isAdmin(authUser)) return c.json({ error: "Forbidden" }, 403);

  const { user_id, password, username, role } = await c.req.json();
  const passwordHash = await bcrypt.hash(password, 10);

  const supabase = getSupabaseClient(c.env);
  const { data: user_uuid, error } = await supabase.rpc("create_user", {
    p_user_id: user_id,
    p_password_hash: passwordHash,
    p_username: username,
    p_role: role,
  });
  
  if (error || !user_uuid) return c.json({ error: 'Failed to create a user' }, 400);

  return c.json({ user_uuid });
});

usersRoutes.get("/me", async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isMember(authUser)) return c.json({ error: 'Unauthorized' }, 401);

  const supabase = getSupabaseClient(c.env);
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id,
      user_id,
      profiles!inner(
        username,
        role
      )`)
    .eq('id', authUser!.sub)
    .single();

  if (error || !user) return c.json({ error: 'User not found' }, 404);

  return c.json({
    id: user.id,
    user_id: user.user_id,
    username: user.profiles.username,
    role: user.profiles.role,
  });
});

usersRoutes.put("/:id", async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isMember(authUser)) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const { user_id, password, username, role } = await c.req.json();
  const passwordHash = await bcrypt.hash(password, 10);

  if (!isAdmin(authUser) || !isSelf(authUser, user_id)) return c.json({ error: "Forbidden" }, 403);

  const supabase = getSupabaseClient(c.env);
  const { error } = await supabase.rpc("update_user", {
    p_user_uuid: id,
    p_user_id: user_id,
    ...(password !== '' && { p_password_hash: passwordHash }),
    p_username: username,
    p_role: role,
  });

  if (error) return c.json({ error: 'Failed to update a user' }, 400);

  return c.json({ success: true });
});

usersRoutes.delete('/:id', async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isMember(authUser)) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');

  const supabase = getSupabaseClient(c.env);
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) return c.json({ error: 'Failed to delete a user' }, 404);

  const { data: images, error: selectError } = await supabase
    .from('images')
    .select('id, storage_path')
    .eq('uploaded_by', id)

  if (selectError) return c.json({ storageError: selectError.message }, 500);

  const ids = images.map(img => img.id);
  const paths = images.map(img => img.storage_path)

  const { error: storageError } = await supabase.storage
    .from('cms_storage')
    .remove(paths);

  if (storageError) return c.json({ storageError: storageError.message }, 500);

  const { error: dbError } = await supabase
    .from('images')
    .delete()
    .in('id', ids);

  if (dbError) return c.json({ error: dbError.message }, 500);

  return c.json({ success: true });
});