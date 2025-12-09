import { Hono } from "hono";
import { getUserFromAuthHeader, isAdmin, isMember, isSelf } from "../lib/auth";
import { getSupabaseClient } from "../lib/supabase";

export const docsRoutes = new Hono<{ Bindings: any }>();

docsRoutes.get('/', async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isMember(authUser)) return c.json({ error: 'Unauthorized' }, 401);

  const supabase = getSupabaseClient(c.env);
  const { data: docs, error } = await supabase
    .from('documents')
    .select(`
      id,
      title,
      mtg_date,
      body,
      created_by,
      users!inner (
        id,
        user_id,
        profiles (
          username
        )
      )
    `);
  
  if (error || !docs) return c.json({ error: 'Documents not found' }, 404);

  return c.json(docs.map(doc => ({
    id: doc.id,
    title: doc.title,
    mtg_date: doc.mtg_date.replaceAll('-', '.'),
    body: doc.body,
    author_uuid: doc.created_by,
    author_id: doc.users.user_id,
    author_name: doc.users.profiles?.username,
  })));  
});

docsRoutes.post("/", async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isAdmin(authUser)) return c.json({ error: "Forbidden" }, 403);

  const { title, mtg_date, body, created_by } = await c.req.json();
  const supabase = getSupabaseClient(c.env);

  const { data: doc, error } = await supabase
    .from('documents')
    .insert({ title, mtg_date, body, created_by })
    .select(`
      id,
      title,
      mtg_date,
      body,
      created_by,
      users!inner (
        id,
        user_id,
        profiles (
          username
        )
      )
    `)
    .single();

  if (error) return c.json({ error: 'Failed to create a document' }, 400);

  return c.json({
    id: doc.id,
    title: doc.title,
    mtg_date: doc.mtg_date.replaceAll('-', '.'),
    body: doc.body,
    author_uuid: doc.created_by,
    author_id: doc.users.user_id,
    author_name: doc.users.profiles?.username,
  });
});

docsRoutes.get('/:id', async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isMember(authUser)) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');

  const supabase = getSupabaseClient(c.env);
  const { data: doc, error } = await supabase
    .from('documents')
    .select(`
      id,
      title,
      mtg_date,
      body,
      created_by,
      users!inner (
        id,
        user_id,
        profiles (
          username
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !doc) return c.json({ error: 'Document not found' }, 404);

  return c.json({
    id: doc.id,
    title: doc.title,
    mtg_date: doc.mtg_date.replaceAll('-', '.'),
    body: doc.body,
    author_uuid: doc.created_by,
    author_id: doc.users.user_id,
    author_name: doc.users.profiles?.username,
  });
});

docsRoutes.put("/:id", async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isAdmin(authUser)) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param('id');
  const { title, mtg_date, body, created_by } = await c.req.json();

  if (!isSelf(authUser, created_by)) return c.json({ error: "Forbidden" }, 403);

  const supabase = getSupabaseClient(c.env);
  const { data: doc, error } = await supabase
    .from('documents')
    .update({ title, mtg_date, body })
    .eq('id', id)
    .select(`
      id,
      title,
      mtg_date,
      body,
      created_by,
      users!inner (
        id,
        user_id,
        profiles (
          username
        )
      )
    `)
    .single();

  if (error) return c.json({ error: 'Failed to update a document' }, 400);

  return c.json({
    id: doc.id,
    title: doc.title,
    mtg_date: doc.mtg_date.replaceAll('-', '.'),
    body: doc.body,
    author_uuid: doc.created_by,
    author_id: doc.users.user_id,
    author_name: doc.users.profiles?.username,
  });
});

docsRoutes.delete('/:id', async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isAdmin(authUser)) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');

  const supabase = getSupabaseClient(c.env);
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (error) return c.json({ error: 'Failed to delete a document' }, 404);

  return c.json({ success: true });
});