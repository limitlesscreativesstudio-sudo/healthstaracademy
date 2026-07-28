// Uploads to Supabase Storage via XHR instead of fetch.
// The Lovable preview injects a fetch proxy that can swallow some POST bodies
// (only OPTIONS preflight is seen by the network). XHR bypasses that proxy.
import { supabase } from './AuthContext';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export async function uploadViaXhr(
  bucket: string,
  path: string,
  file: File,
  opts: { upsert?: boolean; onProgress?: (pct: number) => void } = {},
): Promise<{ error: Error | null }> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) return { error: new Error('Not signed in') };

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    // Encode each path segment so filenames with spaces, #, ?, &, etc. don't break the URL
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodedPath}`;
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string);
    xhr.setRequestHeader('x-upsert', opts.upsert ? 'true' : 'false');
    if (file.type) xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) opts.onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve({ error: null });
      else resolve({ error: new Error(`Upload failed (${xhr.status}): ${xhr.responseText || xhr.statusText}`) });
    };
    xhr.onerror = () => resolve({ error: new Error('Network error during upload') });
    xhr.send(file);
  });
}
