import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_ACCESS_TOKEN: string;
  SUPABASE_PROJECT_ID: string;
  SUPABASE_STORAGE_NAME: string;
}

// export function getSupabaseClient(env: Env, jwt?: string) {
//   return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
//     global: {
//       headers: jwt ? { Authorization: `Bearer ${jwt}` } : {}
//     }
//   });
// }

export function getSupabaseClient(env: Env) {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

export async function getSupabaseStorageUsage(env: Env) {
  const url = `https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_ID}/storage/buckets/${env.SUPABASE_STORAGE_NAME}/usage`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`,
      Accept: 'application/json',
    },
  });
  const json = await res.json() as any;
    
  if (!res.ok) throw new Error(json.error);
  return json;
}