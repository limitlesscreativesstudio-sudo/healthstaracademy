import React, { useState, useRef } from 'react';

const C = { primary:'#7B4DB5', accent:'#5BC8E8', bg:'#F4F2FA', white:'#FFFFFF', border:'#D4C8E8', text:'#2D1B4E', muted:'#8878A8', error:'#C0392B' } as const;

interface FileItem { id:number; name:string; ext:string; size:string; folder:string; created:string; modified:string; published:boolean; }

// Folder names from the real Canvas Files view
const FOLDERS = ['CA NATP ALS Power Point Presentations','CA State Curriculum Learning Resources','CDPH & School contact information','Uploaded Media','Uploaded Media 2'];

const INIT_FILES: FileItem[] = [
  { id:1,  name:'Module01_PowerPoint',      ext:'pptx', size:'5.8 MB', folder:'CA NATP ALS Power Point Presentations', created:'Dec 23, 2024', modified:'Jan 15',    published:true  },
  { id:2,  name:'Module02_PowerPoint',      ext:'pptx', size:'4.6 MB', folder:'CA NATP ALS Power Point Presentations', created:'Dec 23, 2024', modified:'Jan 22',    published:true  },
  { id:3,  name:'Module03_PowerPoint',      ext:'pptx', size:'6.1 MB', folder:'CA NATP ALS Power Point Presentations', created:'Dec 23, 2024', modified:'Feb 1',     published:true  },
  { id:4,  name:'Module04_PowerPoint',      ext:'pptx', size:'5.2 MB', folder:'CA NATP ALS Power Point Presentations', created:'Dec 23, 2024', modified:'Feb 8',     published:true  },
  { id:5,  name:'Module05_PowerPoint',      ext:'pptx', size:'4.9 MB', folder:'CA NATP ALS Power Point Presentations', created:'Dec 23, 2024', modified:'Feb 15',    published:true  },
  { id:6,  name:'California Module 1',      ext:'pdf',  size:'3.2 MB', folder:'CA State Curriculum Learning Resources',created:'Dec 23, 2024', modified:'Jan 15',    published:true  },
  { id:7,  name:'California Module 2',      ext:'pdf',  size:'2.9 MB', folder:'CA State Curriculum Learning Resources',created:'Dec 23, 2024', modified:'Jan 22',    published:true  },
  { id:8,  name:'California Module 3',      ext:'pdf',  size:'3.4 MB', folder:'CA State Curriculum Learning Resources',created:'Dec 23, 2024', modified:'Feb 1',     published:true  },
  { id:9,  name:'California Module 4',      ext:'pdf',  size:'3.1 MB', folder:'CA State Curriculum Learning Resources',created:'Dec 23, 2024', modified:'Feb 8',     published:true  },
  { id:10, name:'State Exam Student Handbook',ext:'pdf',size:'890 KB', folder:'CDPH & School contact information',    created:'Dec 23, 2024', modified:'Jan 10',    published:true  },
  { id:11, name:'CDPH School Contact Sheet', ext:'pdf', size:'210 KB', folder:'CDPH & School contact information',    created:'Mar 19, 2025', modified:'Mar 19',    published:true  },
  { id:12, name:'Student Handbook',          ext:'pdf', size:'1.2 MB', folder:'CDPH & School contact information',    created:'Dec 23, 2024', modified:'Jan 10',    published:true  },
  { id:13, name:'Lecture Recording Day 1',   ext:'mp4', size:'820 MB', folder:'Uploaded Media',                      created:'Dec 23, 2024', modified:'Feb 20',    published:false },
  { id:14, name:'Lecture Recording Day 2',   ext:'mp4', size:'750 MB', folder:'Uploaded Media 2',                    created:'Dec 31, 2024', modified:'Feb 27',    published:false },
];

const extIcon = (e:string) => ({ pdf:'📄', pptx:'📊', docx:'📝', mp4:'🎥', xlsx:'📋', zip:'🗜️' }[e] ?? '📁');
const extColor = (e:string) => ({ pdf:'#c0392b', pptx:'#d35400', docx:'#2980b9', mp4:'#8e44ad' }[e] ?? C.muted);

const FilesTab: React.FC = () => {
  const [files, setFiles]       = useState<FileItem[]>(INIT_FILES);
  const [selFolder, setSelFolder] = useState<string>('all');
  const [search, setSearch]     = useState('');
  const [dragging, setDragging] = useState(false);
  const [view, setView]         = useState<'list'|'grid'>('list');
  const [sel, setSel]           = useState<number[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const visibleFolders = ['all', ...FOLDERS];
  const visible = files.filter(f =>
    (selFolder === 'all' || f.folder === selFolder) &&
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    const newFiles = dropped.map((f, i) => ({
      id:Date.now()+i, name:f.name.replace(/\.[^.]+$/,''),
      ext:f.name.split('.').pop()??'file',
      size:`${(f.size/1024).toFixed(0)} KB`,
      folder:selFolder==='all'?'CA State Curriculum Learning Resources':selFolder,
      created:'Today', modified:'Today', published:false,
    }));
    setFiles(p => [...p, ...newFiles]);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const picked = Array.from(e.target.files);
    const newFiles = picked.map((f,i) => ({
      id:Date.now()+i, name:f.name.replace(/\.[^.]+$/,''),
      ext:f.name.split('.').pop()??'file',
      size:`${(f.size/1024).toFixed(0)} KB`,
      folder:selFolder==='all'?'CA State Curriculum Learning Resources':selFolder,
      created:'Today', modified:'Today', published:false,
    }));
    setFiles(p => [...p, ...newFiles]);
  };

  const usedMB = 21; // 4% of 500MB
  const usedPct = (usedMB / 500) * 100;

  return (
    <div style={{ display:'flex', height:'100%' }}>
      {/* Left folder tree */}
      <div style={{ width:240, background:C.white, borderRight:`1px solid ${C.border}`, flexShrink:0, overflowY:'auto' }}>
        <div style={{ padding:'10px 14px', borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, fontFamily:'sans-serif', marginBottom:6 }}>Course Files</div>
        </div>
        {FOLDERS.map(f => (
          <div key={f} onClick={() => setSelFolder(f)}
            style={{ padding:'8px 14px', display:'flex', alignItems:'center', gap:8, cursor:'pointer', background:selFolder===f?'#EDE8F7':'transparent', borderLeft:selFolder===f?`3px solid ${C.primary}`:'3px solid transparent', fontSize:13, fontFamily:'sans-serif', color:selFolder===f?C.primary:C.text }}>
            <span style={{ fontSize:14 }}>📁</span>
            <span style={{ fontSize:12, lineHeight:1.35 }}>{f}</span>
          </div>
        ))}
        {/* Storage bar */}
        <div style={{ padding:'14px', borderTop:`1px solid ${C.border}`, marginTop:8 }}>
          <div style={{ height:4, borderRadius:2, background:C.border, marginBottom:5, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${usedPct}%`, background:C.primary }}/>
          </div>
          <div style={{ fontSize:11, color:C.muted, fontFamily:'sans-serif' }}>{usedPct.toFixed(0)}% of 500 MB used</div>
        </div>
      </div>

      {/* Right content */}
      <div style={{ flex:1, padding:20, overflowY:'auto' }}>
        {/* Toolbar */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:C.white, border:`1px solid ${C.border}`, borderRadius:5, padding:'7px 12px', flex:1, maxWidth:340 }}>
            <span>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for files"
              style={{ border:'none', outline:'none', flex:1, fontSize:13, fontFamily:'sans-serif', color:C.text }}/>
          </div>
          <span style={{ fontSize:12, color:C.muted, fontFamily:'sans-serif' }}>{sel.length > 0 ? `${sel.length} selected` : `${visible.length} items`}</span>
          <div style={{ display:'flex', gap:4 }}>
            <button onClick={() => fileRef.current?.click()}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', border:'none', borderRadius:5, background:C.primary, color:'white', fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>
              ↑ Upload
            </button>
            <button style={{ padding:'7px 14px', border:`1px solid ${C.border}`, borderRadius:5, background:C.white, fontSize:13, fontFamily:'sans-serif', cursor:'pointer' }}>+ Folder</button>
          </div>
          <input ref={fileRef} type="file" multiple onChange={handleInput} style={{ display:'none' }}/>
        </div>

        {/* Drop zone */}
        <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{ border:`2px dashed ${dragging?C.primary:C.border}`, borderRadius:6, padding:'16px 20px', textAlign:'center', marginBottom:14, background:dragging?'#EDE8F7':C.bg, transition:'all .2s', cursor:'pointer' }}>
          <div style={{ fontSize:20, marginBottom:4 }}>☁️</div>
          <div style={{ fontSize:12, color:dragging?C.primary:C.muted, fontFamily:'sans-serif' }}>
            {dragging ? 'Drop to upload' : 'Drag & drop to upload, or click'}
          </div>
        </div>

        {/* File table */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:6, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'sans-serif' }}>
            <thead>
              <tr style={{ background:'#F0EDF7', borderBottom:`1px solid ${C.border}` }}>
                <th style={{ padding:'8px 12px', width:30 }}>
                  <input type="checkbox" onChange={e => setSel(e.target.checked ? visible.map(f=>f.id) : [])}
                    checked={sel.length === visible.length && visible.length > 0} style={{ accentColor:C.primary }}/>
                </th>
                {['Name','Date Created','Date Modified','Size',''].map(h => (
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:700, color:C.text }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((f, i) => (
                <tr key={f.id} style={{ borderBottom:`1px solid ${C.border}` }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#faf9fc'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=C.white}>
                  <td style={{ padding:'9px 12px' }}>
                    <input type="checkbox" checked={sel.includes(f.id)} onChange={e=>setSel(p=>e.target.checked?[...p,f.id]:p.filter(x=>x!==f.id))} style={{ accentColor:C.primary }}/>
                  </td>
                  <td style={{ padding:'9px 12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <span style={{ fontSize:18 }}>{extIcon(f.ext)}</span>
                      <div>
                        <div style={{ fontSize:13, color:C.primary, fontWeight:500 }}>{f.name}.{f.ext}</div>
                        <div style={{ fontSize:10, color:C.muted }}>{f.folder}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'9px 12px', fontSize:12, color:C.muted }}>{f.created}</td>
                  <td style={{ padding:'9px 12px', fontSize:12, color:C.muted }}>{f.modified}</td>
                  <td style={{ padding:'9px 12px', fontSize:12, color:C.muted }}>{f.size}</td>
                  <td style={{ padding:'9px 12px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button style={{ padding:'3px 10px', border:`1px solid ${C.border}`, borderRadius:3, background:C.white, fontSize:11, cursor:'pointer' }}>↓</button>
                      <button onClick={()=>setFiles(p=>p.filter(x=>x.id!==f.id))}
                        style={{ padding:'3px 10px', border:`1px solid ${C.error}33`, borderRadius:3, background:C.white, fontSize:11, cursor:'pointer', color:C.error }}>✕</button>
                      <span style={{ fontSize:16, cursor:'pointer' }} title={f.published?'Published':'Unpublished'}>
                        {f.published?'🟢':'🔘'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div style={{ padding:32, textAlign:'center', color:C.muted, fontFamily:'sans-serif', fontSize:13 }}>No files found in this folder.</div>
          )}
        </div>
        {sel.length > 0 && (
          <div style={{ marginTop:10, padding:'10px 14px', background:C.white, border:`1px solid ${C.border}`, borderRadius:5, display:'flex', gap:10, alignItems:'center' }}>
            <span style={{ fontSize:12, color:C.text, fontFamily:'sans-serif' }}>{sel.length} items selected</span>
            <button onClick={()=>setSel([])} style={{ padding:'4px 12px', border:`1px solid ${C.border}`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer' }}>Deselect</button>
            <button onClick={()=>{setFiles(p=>p.filter(f=>!sel.includes(f.id)));setSel([]);}} style={{ padding:'4px 12px', border:`1px solid ${C.error}33`, borderRadius:4, background:C.white, fontSize:12, cursor:'pointer', color:C.error }}>Delete Selected</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesTab;
