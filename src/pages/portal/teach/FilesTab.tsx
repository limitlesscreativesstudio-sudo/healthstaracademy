// @ts-nocheck — legacy schema mismatches; flagged for refactor
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './AuthContext';
import { uploadViaXhr } from './uploadViaXhr';
import ContentViewer, { type ContentSource } from '@/components/portal/ContentViewer';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', success:'#127A1B', error:'#C0392B', warn:'#E67E22' } as const;

const DEFAULT_FOLDERS = ['Course Files','Handouts','Presentations','Recordings','Uploaded Media'];
const fileIcon = (t: string) => ({ pdf:'📄', pptx:'📊', ppt:'📊', docx:'📝', doc:'📝', mp4:'🎥', mov:'🎥', jpg:'🖼️', png:'🖼️', xlsx:'📈' }[t.toLowerCase()] ?? '📎');
const fmtSize  = (b: number) => b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;

interface CourseFile { id: string; file_name: string; file_url: string; file_type: string; file_size: number; folder: string; created_at: string; }
interface Props { courseId?: string; canEdit?: boolean; }

const FilesTab: React.FC<Props> = ({ courseId, canEdit }) => {
  const [files,      setFiles]      = useState<CourseFile[]>([]);
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [folder,     setFolder]     = useState('All');
  const [dragging,   setDragging]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [uploadPct,  setUploadPct]  = useState(0);
  const [selFolder,  setSelFolder]  = useState(DEFAULT_FOLDERS[0]);
  const [error,      setError]      = useState('');
  const [viewer, setViewer] = useState<{ src: ContentSource; name: string; type: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pathFromUrl = (url: string): string | null => {
    const m = url.split('/course-files/')[1];
    return m ? decodeURIComponent(m.split('?')[0]) : null;
  };
  const openFile = (f: CourseFile) => {
    const path = pathFromUrl(f.file_url);
    if (path) setViewer({ src: { bucket: 'course-files', path }, name: f.file_name, type: f.file_type });
    else setViewer({ src: { url: f.file_url }, name: f.file_name, type: f.file_type });
  };

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    setLoading(true);
    const [{ data }, { data: folders }] = await Promise.all([
      supabase.from('lms_files').select('*').eq('course_id', courseId).order('created_at', { ascending:false }),
      supabase.from('lms_folders').select('name').eq('course_id', courseId).is('parent_id', null),
    ]);
    if (data) setFiles(data);
    setCustomFolders((folders ?? []).map((f:any) => f.name));
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  const allFolders = React.useMemo(() => {
    const set = new Set<string>([...DEFAULT_FOLDERS, ...customFolders]);
    // include folders referenced by existing files so nothing gets orphaned
    files.forEach(f => f.folder && set.add(f.folder));
    return Array.from(set);
  }, [customFolders, files]);

  const createFolder = async () => {
    if (!courseId) return;
    const name = prompt('New folder name');
    if (!name?.trim()) return;
    const clean = name.trim();
    if (allFolders.includes(clean)) return setError('Folder already exists');
    const { error: err } = await supabase.from('lms_folders').insert({ course_id: courseId, name: clean });
    if (err) return setError(err.message);
    setCustomFolders(p => [...p, clean]);
    setSelFolder(clean);
    setFolder(clean);
  };

  const createDoc = async () => {
    if (!courseId) return;
    const name = prompt('Document name (e.g. "Session notes")');
    if (!name?.trim()) return;
    const body = prompt('Document content (leave blank to fill in later)') ?? '';
    const safe = name.trim().replace(/[^\w.\-]+/g, '_');
    const filename = safe.endsWith('.txt') ? safe : `${safe}.txt`;
    const path = `${courseId}/${Date.now()}_${filename}`;
    const blob = new Blob([body], { type:'text/plain' });
    const { error: upErr } = await uploadViaXhr('course-files', path, blob as any);
    if (upErr) return setError(upErr.message);
    const { data: { publicUrl } } = supabase.storage.from('course-files').getPublicUrl(path);
    const { data: row } = await supabase.from('lms_files').insert({
      course_id: courseId, file_name: filename, file_url: publicUrl,
      file_type: 'txt', file_size: blob.size, folder: selFolder,
    }).select().single();
    if (row) setFiles(p => [row as any, ...p]);
  };

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList || !courseId) return;
    setUploading(true); setError('');
    const newFiles: CourseFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadPct(Math.round(((i) / fileList.length) * 100));
      const ext  = file.name.split('.').pop() ?? '';
      const safeName = file.name.replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_');
      const path = `${courseId}/${Date.now()}_${safeName}`;
      const { error: upErr } = await uploadViaXhr('course-files', path, file, { onProgress: (p) => setUploadPct(p) });
      if (upErr) { setError(`Failed to upload ${file.name}: ${upErr.message}`); continue; }
      const { data: { publicUrl } } = supabase.storage.from('course-files').getPublicUrl(path);
      const { data: row } = await supabase.from('lms_files').insert({
        course_id: courseId, file_name: file.name, file_url: publicUrl,
        file_type: ext, file_size: file.size, folder: selFolder,
      }).select().single();
      if (row) newFiles.push(row);
    }
    setFiles(p => [...newFiles, ...p]);
    setUploading(false); setUploadPct(0);
  };

  const deleteFile = async (id: string, fileUrl: string) => {
    if (!confirm('Delete this file? This cannot be undone.')) return;
    setFiles(p => p.filter(f => f.id !== id));
    await supabase.from('lms_files').delete().eq('id', id);
    // Also remove from storage
    const path = fileUrl.split('/course-files/')[1];
    if (path) await supabase.storage.from('course-files').remove([decodeURIComponent(path)]);
  };

  const visible = folder === 'All' ? files : files.filter(f => f.folder === folder);
  const sidebarFolders = ['All', ...allFolders];
  const usedMB = files.reduce((s, f) => s + (f.file_size ?? 0), 0) / 1048576;

  return (
    <div style={{ display:'flex', height:'100%' }}>
      {/* Sidebar */}
      <div style={{ width:220, borderRight:`1px solid ${C.border}`, padding:16, flexShrink:0, background:C.white }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, fontFamily:'sans-serif', marginBottom:10 }}>
          {courseId ? 'Course Files' : 'Select a course'}
        </div>
        {sidebarFolders.map(f => (
          <div key={f} onClick={() => setFolder(f)}
            style={{ padding:'7px 10px', borderRadius:5, cursor:'pointer', fontSize:12, fontFamily:'sans-serif',
              background: folder === f ? '#EDE8F7' : 'transparent',
              color: folder === f ? C.primary : C.text, fontWeight: folder === f ? 600 : 400,
              marginBottom:2, display:'flex', alignItems:'center', gap:6 }}>
            <span>{f === 'All' ? '📁' : '📂'}</span>
            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f}</span>
          </div>
        ))}
        {canEdit && courseId && (
          <button onClick={createFolder}
            style={{ marginTop:6, width:'100%', padding:'6px 8px', border:`1px dashed ${C.border}`, borderRadius:5, background:'transparent', color:C.primary, fontSize:11, cursor:'pointer', fontFamily:'sans-serif' }}>
            + New Folder
          </button>
        )}
        <div style={{ marginTop:16, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
          <div style={{ height:6, background:C.border, borderRadius:3, overflow:'hidden', marginBottom:4 }}>
            <div style={{ height:'100%', width:`${Math.min((usedMB / 500) * 100, 100)}%`, background:C.primary, borderRadius:3 }}/>
          </div>
          <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>
            {usedMB.toFixed(1)} MB of 500 MB used
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, padding:20, overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:C.text, fontFamily:'sans-serif' }}>
            Files {folder !== 'All' && `— ${folder}`}
          </h2>
          {canEdit && (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <select value={selFolder} onChange={e => setSelFolder(e.target.value)}
                style={{ border:`1px solid ${C.border}`, borderRadius:5, padding:'6px 8px', fontSize:12, fontFamily:'sans-serif', maxWidth:200 }}>
                {FOLDERS.map(f => <option key={f}>{f}</option>)}
              </select>
              <button onClick={() => fileRef.current?.click()}
                style={{ padding:'7px 14px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', fontWeight:600 }}>
                📤 Upload
              </button>
              <input ref={fileRef} type="file" multiple style={{ display:'none' }}
                onChange={e => uploadFiles(e.target.files)}/>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background:'#fdecea', border:'1px solid #f5c6c6', borderRadius:6, padding:'10px 14px', marginBottom:14, fontSize:12, color:C.error, fontFamily:'sans-serif' }}>{error}</div>
        )}

        {/* Drop zone */}
        {canEdit && (
          <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
            style={{ border:`2px dashed ${dragging ? C.primary : C.border}`, borderRadius:8,
              padding:'20px', textAlign:'center', marginBottom:16, cursor:'pointer',
              background: dragging ? '#EDE8F7' : C.bg, transition:'all .2s' }}>
            {uploading ? (
              <div>
                <div style={{ fontSize:13, color:C.primary, fontFamily:'sans-serif', marginBottom:6 }}>Uploading… {uploadPct}%</div>
                <div style={{ height:4, background:C.border, borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${uploadPct}%`, background:C.primary, transition:'width .3s' }}/>
                </div>
              </div>
            ) : (
              <div style={{ fontSize:13, color: dragging ? C.primary : C.muted, fontFamily:'sans-serif' }}>
                📁 {dragging ? 'Drop to upload!' : 'Drag & drop files here, or click to select'}
              </div>
            )}
          </div>
        )}

        {/* Files table */}
        {loading ? (
          <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>Loading files…</div>
        ) : visible.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:C.muted, fontFamily:'sans-serif' }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
            <div style={{ fontSize:14 }}>No files in {folder === 'All' ? 'this course' : folder} yet.</div>
          </div>
        ) : (
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'sans-serif' }}>
              <thead>
                <tr style={{ background:'#F0EDF7', borderBottom:`1px solid ${C.border}` }}>
                  {['Name','Folder','Size','Date',''].map(h => (
                    <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:C.text }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((f, i) => (
                  <tr key={f.id} style={{ borderBottom: i < visible.length-1 ? `1px solid ${C.border}` : 'none' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#faf9fc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.white}>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <span style={{ fontSize:18 }}>{fileIcon(f.file_type)}</span>
                        <button onClick={() => openFile(f)}
                          style={{ background:'none', border:'none', padding:0, fontSize:13, color:C.primary, fontWeight:500, textDecoration:'none', cursor:'pointer', textAlign:'left' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}>
                          {f.file_name}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:11, color:C.muted, maxWidth:160 }}>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>{f.folder}</span>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:12, color:C.muted }}>{fmtSize(f.file_size ?? 0)}</td>
                    <td style={{ padding:'10px 14px', fontSize:12, color:C.muted }}>{new Date(f.created_at).toLocaleDateString()}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => openFile(f)}
                          style={{ padding:'4px 10px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:11, cursor:'pointer', color:C.text }}>
                          👁 Preview
                        </button>
                        {canEdit && (
                          <button onClick={() => deleteFile(f.id, f.file_url)}
                            style={{ padding:'4px 8px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:11, cursor:'pointer', color:C.error }}>✕</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ContentViewer
        open={!!viewer}
        onClose={() => setViewer(null)}
        source={viewer?.src ?? null}
        fileName={viewer?.name}
        fileType={viewer?.type}
      />
    </div>
  );
};

export default FilesTab;
