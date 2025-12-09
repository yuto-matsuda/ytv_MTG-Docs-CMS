import { Hono } from "hono";
import pLimit from 'p-limit';
import { getUserFromAuthHeader, isAdmin, isMember } from "../lib/auth";
import { getSupabaseClient, getSupabaseStorageUsage } from "../lib/supabase";

export const imagesRoutes = new Hono<{ Bindings: any }>();

const urlExpiration = 60 * 60 * 4;  // 4h

imagesRoutes.get('/', async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isMember(authUser)) return c.json({ error: "Forbidden" }, 403);

  const user_uuid = authUser.sub;

  const supabase = getSupabaseClient(c.env);
  const { data: images, error: dbError } = await supabase
    .from('images')
    .select('id, storage_path')
    .eq('uploaded_by', user_uuid)
    .order('created_at', { ascending: false });
console.log('dbError:', dbError)
  if (dbError) return c.json({ error: dbError.message }, 500);
  if (images.length === 0) return c.json([]);

  let storageError = false;
//   const results = await Promise.all(
//     images.map(async (img) => {
//       const { data, error } = await supabase.storage
//         .from("cms_storage")
//         .createSignedUrl(img.storage_path, urlExpiration);
// console.log('storageError:', error)
//       if (error || !data) storageError = true;

//       return { id: img.id, path: img.storage_path, url: data!.signedUrl };
//     })
//   );
  const limit = pLimit(45); // 一度に実行する並行処理を45に制限

  const results = await Promise.all(
    images.map((img) => limit(async () => {
      const { data, error } = await supabase.storage
        .from("cms_storage")
        .createSignedUrl(img.storage_path, urlExpiration);
      console.log('storageError:', error)
      if (error || !data) storageError = true;

      return { id: img.id, path: img.storage_path, url: data!.signedUrl };
    }))
  );
  
  if (storageError) return c.json({ error: 'Upload error' }, 500);

  return c.json(results);
});

imagesRoutes.post('/', async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isAdmin(authUser)) return c.json({ error: "Forbidden" }, 403);

  const formData = await c.req.formData();
  const files = formData.getAll('files[]') as File[];
  const names = formData.getAll('names[]') as string[];
  const userId = formData.get('userId') as string | null;
  const user_uuid = authUser!.sub;

  if (!files.length || !userId) return c.json({ error: 'Invalid Request' }, 400);

  const supabase = getSupabaseClient(c.env);
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const name = names[i];
    const parts = name.split(".");
    const ext = parts.pop();
    const base = parts.join(".");
    const { data, error: selectError } = await supabase
      .from('images')
      .select('id, name')
      .eq('uploaded_by', user_uuid)
      .like("name", `${base}%`);

// console.log('selectError:', selectError)
    if (selectError) return c.json({ error: selectError.message }, 500);

    const regex = new RegExp(`^${base}(\\(\\d+\\))?\\.${ext}$`);
    const duplicatedNames = data.filter(img => regex.test(img.name)).map(img => img.name);
    const imageName = duplicatedNames.length > 0 ? `${base}(${duplicatedNames.length}).${ext}` : name;
    const storagePath = `${userId}/${imageName}`;

    const { error: uploadError } = await supabase.storage
      .from('cms_storage')
      .upload(storagePath, file, {
        contentType: file.type,
      });
// console.log('uploadError:', uploadError)
    if (uploadError) return c.json({ error: uploadError.message }, 500);

    const { data: storageData, error: storageError } = await supabase.storage
      .from('cms_storage')
      .createSignedUrl(storagePath, urlExpiration);
// console.log('storageError:', storageError)
    if (storageError) return c.json({ error: storageError.message }, 500);

    const { data: dbData, error: dbError } = await supabase
      .from('images')
      .insert({
        name: imageName,
        storage_path: storagePath,
        uploaded_by: user_uuid,
      })
      .select('id')
      .single();
// console.log('dbError:', dbError)
    if (dbError) return c.json({ error: dbError.message }, 500);

    results.push({ id: dbData.id, path: storagePath, url: storageData.signedUrl });
  }

  return c.json(results);
});

imagesRoutes.get('/:path', async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isMember(authUser)) return c.json({ error: "Forbidden" }, 403);

  const path = decodeURIComponent(c.req.param('path'));
  if (!path) return c.json({ error: 'Invalid Request' }, 400);

  const [authorId, name] = path.split('/');
// console.log('author:', authorId)
// console.log('name:', name)

  const supabase = getSupabaseClient(c.env);
  const { data: author, error: authorError } = await supabase
      .from('users')
      .select('id')
      .eq('user_id', authorId)
      .single();
// console.log('dbError:', dbError)
  if (authorError || !author) return c.json({ error: authorError.message }, 500);

  const { data: image, error: dbError } = await supabase
      .from('images')
      .select('id, storage_path')
      .eq('uploaded_by', author.id)
      .eq('name', name)
      .single();
// console.log('dbError:', dbError)
  if (dbError) return c.json({ error: dbError.message }, 500);
  if (!image) return c.json({ error: "Image not found" }, 404);

  const { data, error } = await supabase.storage
    .from("cms_storage")
    .createSignedUrl(image.storage_path, urlExpiration);
// console.log('storageError:', error)
  if (error || !data) return c.json({ error: error.message }, 500);

  return c.json({ id: image.id, path: image.storage_path, url: data.signedUrl });
});

imagesRoutes.put('/:id', async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isAdmin(authUser)) return c.json({ error: "Forbidden" }, 403);

  const user_uuid = authUser!.sub;
  const id = c.req.param('id');
  const { name } = await c.req.json();
  if (!id || !name) return c.json({ error: 'Invalid Request' }, 400);

  const supabase = getSupabaseClient(c.env);

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('user_id')
    .eq('id', user_uuid)
    .single();

console.log('userError:', userError)
  if (userError || !user) return c.json({ error: 'User not found' }, 404);

  const { data: image, error: selectError1 } = await supabase
    .from('images')
    .select('storage_path')
    .eq('id', id)
    .single();
console.log('selectError1:', selectError1)
  if (selectError1 || !image) return c.json({ error: 'Image not found' }, 404);

  const oldPath = image.storage_path;

  const { data: fileData, error: downloadError } = await supabase.storage
    .from('cms_storage')
    .download(oldPath);

  if (downloadError) return c.json({ error: downloadError.message }, 500);

  const parts = name.split(".");
  const ext = parts.pop();
  const base = parts.join(".");
  const { data, error: selectError2 } = await supabase
    .from('images')
    .select('id, name')
    .eq('uploaded_by', user_uuid)
    .like("name", `${base}%`);
console.log('selectError2:', selectError2)
  if (selectError2) return c.json({ error: selectError2.message }, 500);

  const regex = new RegExp(`^${base}(\\(\\d+\\))?\\.${ext}$`);
  const duplicatedNames = data.filter(img => regex.test(img.name)).map(img => img.name);
  const imageName = duplicatedNames.length > 0 ? `${base}(${duplicatedNames.length}).${ext}` : name;
  const newPath = `${user.user_id}/${imageName}`;

  const arrayBuffer = await fileData.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from('cms_storage')
    .upload(newPath, uint8Array, {
      contentType: fileData.type || "application/octet-stream",
    });
console.log('uploadError:', uploadError)
  if (uploadError) return c.json({ error: uploadError.message }, 500);

  const { error: removeError } = await supabase.storage
    .from('cms_storage')
    .remove([oldPath]);
console.log('removeError:', removeError)
  if (removeError) return c.json({ error: removeError.message }, 500);

  const { error: dbError } = await supabase
    .from('images')
    .update({ name: imageName, storage_path: newPath })
    .eq('id', id);
console.log('dbError:', dbError)
  if (dbError) return c.json({ error: dbError.message }, 500);

  const { data: storageData, error: storageError } = await supabase.storage
    .from("cms_storage")
    .createSignedUrl(newPath, urlExpiration);
console.log('storageError:', storageError)
  if (storageError) return c.json({ error: storageError.message }, 500);

  return c.json({ id, path: newPath, url: storageData.signedUrl });
});

imagesRoutes.delete('/:id', async (c) => {
  const authUser = await getUserFromAuthHeader(c);
  if (!isAdmin(authUser)) return c.json({ error: "Forbidden" }, 403);

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Invalid Request' }, 400);

  const supabase = getSupabaseClient(c.env);
  const { data: image, error: selectError } = await supabase
      .from('images')
      .select('storage_path')
      .eq('id', id)
      .single();

  if (selectError || !image) return c.json({ error: 'Image not found' }, 404);

  const path = image.storage_path;

  const { error: storageError } = await supabase.storage
    .from('cms_storage')
    .remove([path]);

  if (storageError) return c.json({ storageError: storageError.message }, 500);

  const { error: dbError } = await supabase
    .from('images')
    .delete()
    .eq('id', id);

  if (dbError) return c.json({ error: dbError.message }, 500);

  return c.json({ success: true });
});

imagesRoutes.get('/storage-usage', async (c) => {
  try {
    const res = await getSupabaseStorageUsage(c.env);
    return c.json(res);
  } catch (error) {
    console.error(error);
    return c.json({ error });
  }
});
