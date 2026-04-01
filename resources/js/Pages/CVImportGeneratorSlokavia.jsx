import React, { useState, useRef, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';

const CVImportGeneratorSlokavia = () => {
  const [macImageData, setMacImageData] = useState(null);
  const [euLogoData, setEuLogoData]     = useState(null);
  const [isDragging, setIsDragging]     = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'parsing' | 'success' | 'error'
  const [errorMsg, setErrorMsg]         = useState('');
  const [parsedData, setParsedData]     = useState(null);
  const [photoData, setPhotoData]       = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef  = useRef(null);
  const photoInputRef = useRef(null);
  const headerLogo1   = '/storage/logo/LoringMargi.png';

  useEffect(() => {
    fetch('/storage/logo/Mac.png').then(r=>r.blob()).then(b=>{
      const rd=new FileReader(); rd.onloadend=()=>setMacImageData(rd.result); rd.readAsDataURL(b);
    }).catch(()=>{});
    fetch('/storage/logo/euro.png').then(r=>r.blob()).then(b=>{
      const rd=new FileReader(); rd.onloadend=()=>setEuLogoData(rd.result); rd.readAsDataURL(b);
    }).catch(()=>{});

    try {
      const cached = sessionStorage.getItem('cv_import_slokavia_cache');
      if (cached) {
        const { data, photo } = JSON.parse(cached);
        if (data) { setParsedData(data); setUploadStatus('success'); }
        if (photo) setPhotoData(photo);
      }
    } catch { /* silent */ }
  }, []);

  // ── Image Compressor ─────────────────────────────────────────
  const compressImage = (base64, maxSize = 400, quality = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = base64;
    });
  };

  // ── Notification ─────────────────────────────────────────────
  const showNotification = (type, title, message) => {
    if (!document.getElementById('notif-styles')) {
      const s = document.createElement('style');
      s.id = 'notif-styles';
      s.textContent = `
        @keyframes nIn{from{opacity:0;transform:translateY(-14px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes nOut{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(-14px) scale(0.95)}}
        @keyframes nProg{from{width:100%}to{width:0%}}
        [data-notif] .nc:hover{color:#374151!important;background:#f3f4f6!important}
      `;
      document.head.appendChild(s);
    }
    const ok=type==='success';
    const accent=ok?'#BF9952':'#ef4444';
    const accentL=ok?'rgba(191,153,82,0.12)':'rgba(239,68,68,0.10)';
    const bar=ok?'#D4AF6A':'#f87171';
    const icon=ok?'M5 13l4 4L19 7':'M6 18L18 6M6 6l12 12';
    const el=document.createElement('div');
    el.setAttribute('data-notif','1');
    el.style.cssText=`
      position:fixed;
      top:16px;
      right:16px;
      width:360px;
      max-width:90%;
      background:#fff;
      border:1px solid #e5e7eb;
      border-left:4px solid ${accent};
      border-radius:14px;
      box-shadow:0 10px 40px rgba(0,0,0,.12);
      z-index:99999;
      font-family:'Poppins',sans-serif;
      overflow:hidden;
      box-sizing:border-box;
      animation:nIn .35s cubic-bezier(.34,1.56,.64,1) both;
    `;
    el.innerHTML=`<div style="padding:16px 16px 14px;display:flex;align-items:flex-start;gap:12px;"><div style="flex-shrink:0;width:38px;height:38px;background:${accentL};border-radius:10px;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="${icon}"/></svg></div><div style="flex:1;min-width:0;padding-top:2px;"><p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${title}</p><p style="margin:5px 0 0;font-size:12.5px;color:#6b7280;">${message}</p></div><button class="nc" onclick="var p=this.closest('[data-notif]');p.style.animation='nOut .28s ease forwards';setTimeout(()=>p.remove(),280);" style="flex-shrink:0;background:none;border:none;cursor:pointer;color:#9ca3af;padding:4px;border-radius:6px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div><div style="height:3px;background:#f3f4f6;"><div style="height:100%;background:${bar};animation:nProg 3s linear forwards;"></div></div>`;
    document.body.appendChild(el);
    setTimeout(()=>{ if(el.parentNode){ el.style.animation='nOut .28s ease forwards'; setTimeout(()=>el.remove(),280); } },3000);
  };

  // ── SheetJS ──────────────────────────────────────────────────
  const loadSheetJS = () => new Promise(resolve => {
    if (window.XLSX) return resolve(window.XLSX);
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload=()=>resolve(window.XLSX);
    document.head.appendChild(s);
  });

  // ── Parse Excel ──────────────────────────────────────────────
  const parseExcel = async (file) => {
    setUploadStatus('parsing'); setErrorMsg(''); setParsedData(null); setPhotoData(null);
    try {
      const XLSX = await loadSheetJS();
      const wb   = XLSX.read(await file.arrayBuffer(), { type:'array' });

      const ws1 = wb.Sheets['1. Personal Info'];
      if (!ws1) throw new Error('Sheet "1. Personal Info" tidak ditemukan.');
      const g = (r,c) => { const cell=ws1[XLSX.utils.encode_cell({r:r-1,c:c-1})]; return cell?String(cell.v).trim():''; };

      const personal = {
        full_name:g(5,2), date_of_birth:g(6,2), place_of_birth:g(7,2),
        gender:g(8,2), nationality:g(9,2), mother_tongue:g(10,2),
        destination_country:g(11,2), address:g(5,4), mobile_phone:g(6,4),
        email_address:g(7,4), about_me:g(8,4),
      };
      if (!personal.full_name) throw new Error('Nama Lengkap wajib diisi di sheet "1. Personal Info".');

      const toRows = (name, range) => {
        const ws=wb.Sheets[name];
        return ws ? XLSX.utils.sheet_to_json(ws,{header:1,range,defval:''}) : [];
      };

      const workExperiences = toRows('2. Work Experience',2)
        .filter(r=>String(r[1]||'').trim())
        .map(r=>({ employer:String(r[1]||'').trim(), position:String(r[2]||'').trim(),
          start_date:String(r[3]||'').trim(), leaving_date:String(r[4]||'').trim(),
          responsibilities:String(r[5]||'').split('|').map(s=>s.trim()).filter(Boolean) }));

      const educations = toRows('3. Education',2)
        .filter(r=>String(r[1]||'').trim())
        .map(r=>({ school:String(r[1]||'').trim(), field_of_study:String(r[2]||'').trim(),
          start_date:String(r[3]||'').trim(), graduation_date:String(r[4]||'').trim() }));

      const cefrV=['A1','A2','B1','B2','C1','C2','Native'];
      const nv = v=>{ const s=String(v||'').trim(); return cefrV.includes(s)?s:'A2'; };
      const languages = toRows('4. Languages',3)
        .filter(r=>String(r[1]||'').trim())
        .map(r=>({ name:String(r[1]||'').trim(), listening:nv(r[2]), reading:nv(r[3]),
          spoken_production:nv(r[4]), spoken_interaction:nv(r[5]), writing:nv(r[6]) }));

      const certifications = toRows('5. Certifications & Skills',2).slice(0,8)
        .filter(r=>String(r[2]||'').trim())
        .map(r=>({ year:String(r[1]||'').trim(), title:String(r[2]||'').trim(),
          description:String(r[3]||'').trim(), mode:String(r[4]||'').trim() }));

      const skills = toRows('5. Certifications & Skills',13)
        .map(r=>String(r[0]||'').trim()).filter(Boolean);

      const formData = {
        ...personal,
        workExperiences: workExperiences.length?workExperiences:[{employer:'',position:'',start_date:'',leaving_date:'',responsibilities:['']}],
        educations:      educations.length?educations:[{school:'',field_of_study:'',start_date:'',graduation_date:''}],
        languages:       languages.length?languages:[{name:'English',listening:'A2',reading:'A2',spoken_production:'A2',spoken_interaction:'A2',writing:'A2'}],
        certifications:  certifications.length?certifications:[{year:'',title:'',description:'',mode:''}],
        skills:          skills.length?skills:[''],
      };

      sessionStorage.setItem('cv_import_slokavia', JSON.stringify(formData));
      sessionStorage.setItem('cv_import_slokavia_cache', JSON.stringify({ data: formData, photo: null }));
      setParsedData(formData);
      setUploadStatus('success');
    } catch(err) {
      setUploadStatus('error');
      setErrorMsg(err.message||'Gagal membaca file. Pastikan format sesuai template.');
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    const ext=file.name.split('.').pop().toLowerCase();
    if (!['xlsx','xls'].includes(ext)) { setUploadStatus('error'); setErrorMsg('Hanya file .xlsx atau .xls yang didukung.'); return; }
    parseExcel(file);
  };

  // ── Photo Upload dengan Compression ──────────────────────────
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const rd = new FileReader();
    rd.onload = async (ev) => {
      const compressed = await compressImage(ev.target.result);
      setPhotoData(compressed);
      try {
        const cached = sessionStorage.getItem('cv_import_slokavia_cache');
        if (cached) {
          const obj = JSON.parse(cached);
          sessionStorage.setItem('cv_import_slokavia_cache', JSON.stringify({ ...obj, photo: compressed }));
        }
      } catch { /* silent */ }
    };
    rd.readAsDataURL(file);
  };

  // ── Generate CV HTML ──────────────────────────────────────────
  const generateCVHTML = (person, photo, euLogo) => {
    const fmtDOB = d => { if(!d)return''; if(d.includes('-')){const[y,m,dd]=d.split('-');return`${dd}/${m}/${y}`;}return d; };
    const workSection = person.workExperiences.map(w=>{
      const resp=(Array.isArray(w.responsibilities)?w.responsibilities:[]).filter(r=>r&&r.trim());
      return `<div class="section-block"><div class="job-title">${w.position||''} - <span class="employer">${w.employer||''}</span></div><div class="date-range">${w.start_date||''}${w.leaving_date?' \u2013 '+w.leaving_date:' \u2013 Present'}</div>${resp.length?`<ul class="bullet-list">${resp.map(r=>`<li>${r.trim()}</li>`).join('')}</ul>`:''}</div>`;
    }).join('');
    const eduSection = person.educations.map(e=>`<div class="section-block"><div class="date-range">${e.start_date||''}${e.graduation_date?' \u2013 '+e.graduation_date:''}</div><div class="edu-school">${e.school||''}</div>${e.field_of_study?`<div class="field-study"><strong>Field of study:</strong> ${e.field_of_study}</div>`:''}</div>`).join('');
    const langRows = person.languages.map(l=>`<tr><td class="lang-name"><strong>${l.name||''}</strong></td><td class="cefr-cell">${l.listening||''}</td><td class="cefr-cell">${l.reading||''}</td><td class="cefr-cell">${l.spoken_production||''}</td><td class="cefr-cell">${l.spoken_interaction||''}</td><td class="cefr-cell">${l.writing||''}</td></tr>`).join('');
    const certSection = person.certifications.filter(c=>c.title).map(c=>`<div class="section-block"><div class="cert-year">${c.year||''}</div><div class="cert-title">${c.title||''}</div>${c.description?`<p class="cert-desc">${c.description}</p>`:''}${c.mode?`<div class="field-study"><strong>Mode of learning:</strong> ${c.mode}</div>`:''}</div>`).join('');
    const skillsText = person.skills.filter(s=>s).join(' | ');

    const photoHTML = photo
      ? `<img src="${photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;"/>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title></title><style>
@page{size:A4;margin:15mm}*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;font-size:9pt;color:#111;background:#fff;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
.ep-header{display:flex;align-items:flex-start;gap:18px;margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid #ccc}
.ep-photo-wrap{flex-shrink:0;width:90px;height:90px;border-radius:50%;overflow:hidden;border:2px solid #ccc;background:#f0f0f0;display:flex;align-items:center;justify-content:center}
.ep-header-info{flex:1;padding-top:4px}
.ep-name{font-size:18pt;font-weight:700;color:#111;line-height:1.1;margin-bottom:8px}
.ep-meta-row{font-size:8.5pt;color:#222;margin-bottom:3px;display:flex;align-items:center;flex-wrap:wrap}
.ep-meta-item{display:inline-flex;align-items:center;gap:4px}
.ep-meta-divider{width:1px;height:11px;background:#aaa;margin:0 10px;display:inline-block}
.ep-meta-contact{font-size:8pt;color:#222;margin-top:5px}
.ep-meta-contact span{margin-right:16px}
.ep-logo-area{flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-start;gap:8px;padding-top:4px}
.ep-europass-logo{display:flex;align-items:center;gap:8px}
.ep-europass-text{font-size:16pt;font-weight:400;color:#5a4fcf;letter-spacing:.5px}
.section-title-ep{font-size:9pt;font-weight:700;color:#1c3557;text-transform:uppercase;letter-spacing:.5px;border-bottom:1.5px solid #1c3557;padding-bottom:3px;margin:14px 0 8px 0}
.section-content{padding-left:2px}.section-block{margin-bottom:10px}
.job-title{font-size:9pt;font-weight:700;color:#111}.employer{font-weight:700;color:#1c3557;font-style:italic}
.date-range{font-size:8pt;color:#333;margin:2px 0}.bullet-list{margin:4px 0 0 14px}.bullet-list li{font-size:8.5pt;color:#111;margin-bottom:2px}
.edu-school{font-size:9pt;font-weight:700;color:#111}.field-study{font-size:8.5pt;color:#222;margin-top:3px}
.mother-tongue-row{font-size:8.5pt;color:#111;margin-bottom:8px}.mother-tongue-row span{font-weight:700}
.lang-table{width:100%;border-collapse:collapse;font-size:8pt}
.lang-table th{background:#f2f4f7;color:#1c3557;font-weight:700;text-align:center;padding:4px 6px;border:1px solid #dde2ea;font-size:7.5pt}
.lang-table td{border:1px solid #dde2ea;padding:4px 6px;text-align:center;color:#111}
.lang-name{text-align:left!important;width:140px}.cefr-cell{width:60px}
.lang-note{font-size:7pt;color:#555;margin-top:4px;font-style:italic}
.lang-group-header{background:#e8ecf2!important;font-size:7pt!important;color:#333!important}
.cert-year{font-size:8pt;color:#333}.cert-title{font-size:9pt;font-weight:700;color:#1c3557;margin:2px 0}
.cert-desc{font-size:8.5pt;color:#222;margin-top:3px;line-height:1.4}
.skills-text{font-size:8.5pt;color:#111;line-height:1.6}.about-text{font-size:8.5pt;color:#111;line-height:1.55}
</style></head><body>
<div class="ep-header">
  <div class="ep-photo-wrap">${photoHTML}</div>
  <div class="ep-header-info">
    <div class="ep-name">${person.full_name||''}</div>
    <div class="ep-meta-row">
      ${person.date_of_birth?`<span class="ep-meta-item"><strong>Date of birth:</strong>&nbsp;${fmtDOB(person.date_of_birth)}</span>`:''}
      ${person.nationality?`<span class="ep-meta-divider"></span><span class="ep-meta-item"><strong>Nationality:</strong>&nbsp;${person.nationality}</span>`:''}
      ${person.gender?`<span class="ep-meta-divider"></span><span class="ep-meta-item"><strong>Gender:</strong>&nbsp;${person.gender}</span>`:''}
    </div>
    ${(person.address||person.mobile_phone||person.email_address)?`<div class="ep-meta-contact">${person.address?`<span>${person.address}</span>`:''}${person.mobile_phone?`<span>${person.mobile_phone}</span>`:''}${person.email_address?`<span>${person.email_address}</span>`:''}</div>`:''}
  </div>
  <div class="ep-logo-area">
    <div class="ep-europass-logo">${euLogo ? `<img src="${euLogo}" alt="EUROPASS" style="width:130px;height:auto;object-fit:contain;"/>` : ''}</div>
  </div>
</div>
${person.about_me?`<div class="section-title-ep">About Me</div><div class="section-content"><p class="about-text">${person.about_me}</p></div>`:''}
<div class="section-title-ep">Work Experience</div><div class="section-content">${workSection}</div>
<div class="section-title-ep">Education and Training</div><div class="section-content">${eduSection}</div>
<div class="section-title-ep">Language Skills</div>
<div class="section-content">
  ${person.mother_tongue?`<div class="mother-tongue-row">Mother tongue(s): <span>${person.mother_tongue}</span></div>`:''}
  ${person.languages.length?`<div style="font-size:8pt;color:#333;margin-bottom:4px;">Other language(s):</div><table class="lang-table"><thead><tr><th rowspan="2" class="lang-name" style="text-align:left;">Language</th><th colspan="2" class="lang-group-header">UNDERSTANDING</th><th colspan="2" class="lang-group-header">SPEAKING</th><th class="lang-group-header">WRITING</th></tr><tr><th>Listening</th><th>Reading</th><th>Spoken production</th><th>Spoken interaction</th><th>Writing</th></tr></thead><tbody>${langRows}</tbody></table><div class="lang-note">Levels: A1 and A2: Basic user; B1 and B2: Independent user; C1 and C2: Proficient user</div>`:''}
</div>
${person.certifications.some(c=>c.title)?`<div class="section-title-ep">Certifications</div><div class="section-content">${certSection}</div>`:''}
${skillsText?`<div class="section-title-ep">Skills</div><div class="section-content"><p class="skills-text">${skillsText}</p></div>`:''}
</body></html>`;
  };

  // ── Actions ───────────────────────────────────────────────────
  const previewCV = () => {
    if (!parsedData) return;
    const w=window.open(); w.document.write(generateCVHTML(parsedData,photoData,euLogoData)); w.document.close();
  };

  const downloadPDF = async () => {
    if (!parsedData) return;
    setIsGenerating(true);

    // 1. Simpan ke database (foto sudah compressed, aman dikirim)
    try {
      const safeDOB = parsedData.date_of_birth && /^\d{4}-\d{2}-\d{2}$/.test(parsedData.date_of_birth)
        ? parsedData.date_of_birth
        : null;

      const payload = {
        ...parsedData,
        date_of_birth: safeDOB,
        photo: photoData || null, // compressed, ~50-150KB — aman
      };

      const res = await fetch('/cv-submissions-slokavia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'X-Inertia': 'false',
        },
        body: JSON.stringify(payload),
      });

      let result = {};
      try { result = await res.json(); } catch { /* bukan JSON */ }

      if (result.success) {
        showNotification('success', 'Data Tersimpan!', `${parsedData.full_name} — berhasil disimpan ke database`);
      } else {
        const errMsg = result.error || result.message || `HTTP ${res.status}`;
        showNotification('error', 'Gagal Simpan DB', errMsg);
        console.error('DB error detail:', result);
      }
    } catch (err) {
      showNotification('error', 'Gagal Simpan DB', `Network error: ${err.message}`);
    }

    // 2. Generate PDF via iframe print
    try {
      const html = generateCVHTML(parsedData, photoData, euLogoData);
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:absolute;left:-9999px;width:210mm;height:297mm;';
      document.body.appendChild(iframe);
      iframe.contentDocument.open();
      iframe.contentDocument.write(html);
      iframe.contentDocument.close();
      await new Promise(r => setTimeout(r, 500));
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    } catch (err) {
      showNotification('error', 'PDF Gagal', `Terjadi kesalahan saat generate PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100"
      style={{fontFamily:"'Poppins',sans-serif",display:'flex',flexDirection:'column'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        html { overflow-y: scroll; }
        .btn-gold{background:linear-gradient(135deg,#BF9952 0%,#D4AF6A 100%);transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 4px 15px rgba(191,153,82,.3);}
        .btn-gold:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 25px rgba(191,153,82,.4);}
        .btn-gold:disabled{opacity:.6;cursor:not-allowed;}
        .btn-back{transition:all .3s cubic-bezier(.4,0,.2,1);}
        .btn-back:hover{border-color:#BF9952!important;box-shadow:0 4px 15px rgba(191,153,82,.2);transform:translateX(-4px);}
        @keyframes shimmer{0%{background-position:-1000px 0}100%{background-position:1000px 0}}
        .shimmer{background:linear-gradient(90deg,transparent,rgba(191,153,82,.1),transparent);background-size:200% 100%;animation:shimmer 2s infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spin{animation:spin 1s linear infinite;}
        @keyframes pulse-border{0%,100%{border-color:#BF9952}50%{border-color:#D4AF6A}}
        .drop-active{animation:pulse-border 1s ease infinite;}
        .photo-ring{transition:all .3s;border:3px dashed #d1d5db;border-radius:50%;}
        .photo-ring:hover{border-color:#BF9952;background:rgba(191,153,82,.05);}
      `}</style>

      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <img src={headerLogo1} alt="Loring Margi" style={{height:48,width:'auto',objectFit:'contain'}}/>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 flex-1">
        <Link href="/" className="btn-back inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold text-sm mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Kembali
        </Link>

        <div className="text-center mb-10">
          <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
            <img src="/images/European.jpg" alt="EUROPASS" style={{ width: 64, height: 42, objectFit: 'cover', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">CV Generator EUROPASS</h1>
          <p className="text-xs sm:text-base text-gray-500 font-light max-w-2xl mx-auto px-2">Upload Excel atau isi form manual &mdash; Generate CV format Europass PT. Loring Margi International</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Upload Excel
              </h2>
              <a href="/template/CV_Template_Slokavia.xlsx" download className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-300 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Template
              </a>
            </div>
            <div onDragOver={e=>{e.preventDefault();setIsDragging(true);}} onDragLeave={()=>setIsDragging(false)} onDrop={e=>{e.preventDefault();setIsDragging(false);handleFile(e.dataTransfer.files[0]);}} onClick={()=>uploadStatus!=='parsing'&&fileInputRef.current?.click()} className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer ${isDragging?'border-[#BF9952] bg-amber-50 drop-active':uploadStatus==='success'?'border-green-400 bg-green-50':uploadStatus==='error'?'border-red-400 bg-red-50':uploadStatus==='parsing'?'border-[#BF9952] bg-amber-50 cursor-wait':'border-gray-300 bg-gray-50 hover:border-[#BF9952] hover:bg-amber-50'}`} style={{minHeight:150}}>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e=>handleFile(e.target.files[0])}/>
              {uploadStatus==='parsing' && (<><svg className="spin w-10 h-10 text-[#BF9952] mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg><p className="font-semibold text-[#BF9952] text-sm">Membaca file Excel&hellip;</p></>)}
              {uploadStatus==='success' && (<><div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2"><svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg></div><p className="font-bold text-green-700">Berhasil dibaca!</p><p className="text-xs text-green-600 mt-0.5"><strong>{parsedData?.full_name}</strong></p><p className="text-xs text-gray-400 mt-2">Klik untuk upload file lain</p></>)}
              {uploadStatus==='error' && (<><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2"><svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></div><p className="font-bold text-red-600 text-sm">Gagal membaca file</p><p className="text-xs text-red-500 mt-1 max-w-xs">{errorMsg}</p><p className="text-xs text-gray-400 mt-2">Klik untuk coba lagi</p></>)}
              {!uploadStatus && (<><div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2"><svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg></div><p className="font-semibold text-gray-600 text-sm">Drag &amp; drop atau klik untuk pilih file</p><span className="mt-2 text-xs text-gray-400 bg-gray-100 px-3 py-0.5 rounded-full">.xlsx</span></>)}
            </div>
            {uploadStatus==='success' && (<div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50"><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Foto Profil <span className="font-normal normal-case">(opsional)</span></p><div className="flex items-center gap-4"><div onClick={()=>photoInputRef.current?.click()} className="photo-ring w-20 h-20 flex-shrink-0 overflow-hidden flex items-center justify-center cursor-pointer" style={{background:photoData?'transparent':'#f9fafb'}}>{photoData ? <img src={photoData} alt="Foto" className="w-full h-full object-cover rounded-full"/> : <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}</div><div className="flex-1"><button onClick={()=>photoInputRef.current?.click()} className="w-full py-2 px-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-[#BF9952] hover:text-[#BF9952] transition flex items-center justify-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>{photoData?'Ganti Foto':'Upload Foto'}</button><p className="text-xs text-gray-400 mt-1.5 text-center">JPG, PNG &mdash; max 5MB</p>{photoData && <button onClick={()=>setPhotoData(null)} className="w-full mt-1 text-xs text-red-400 hover:text-red-600 transition">Hapus foto</button>}</div><input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/></div></div>)}
            {uploadStatus==='success' && (<div className="flex flex-col gap-3"><button onClick={downloadPDF} disabled={isGenerating} className="btn-gold w-full py-3 sm:py-3.5 text-white rounded-xl font-semibold flex items-center justify-center gap-2 text-sm sm:text-base">{isGenerating ? <><div className="spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>Generating PDF&hellip;</> : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>Download CV PDF</>}</button><div className="grid grid-cols-2 gap-3"><button onClick={previewCV} className="py-2.5 bg-gray-100 border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-gray-200 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>Preview</button><button onClick={()=>router.visit('/form/slokavia')} className="py-2.5 bg-gray-100 border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-gray-200 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>Edit di Form</button></div></div>)}
            {!uploadStatus && (<div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl"><svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><p className="text-xs text-blue-700">Download template terlebih dahulu, isi datanya, lalu upload kembali di sini.</p></div>)}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Isi Form Manual
            </h2>
            <div className="flex flex-col items-center justify-center h-full gap-6 py-4">
              {macImageData ? <img src={macImageData} alt="Computer" className="w-full max-w-xs h-auto drop-shadow-2xl"/> : <div className="w-full max-w-xs h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-sm shimmer">Mac Image</div>}
              <Link href="/form/slokavia" className="btn-gold px-10 py-4 text-white rounded-xl font-semibold flex items-center gap-3">
                Masuk ke Form
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{background:'linear-gradient(135deg,#BF9952 0%,#D4AF6A 50%,#BF9952 100%)',color:'white',textAlign:'center',padding:'28px 24px',marginTop:'auto'}}>
        <p style={{fontSize:13,fontWeight:300,marginBottom:4}}>Copyright &copy; 2025 Loring Margi International</p>
        <p style={{fontSize:12,opacity:.9}}>Powered by <span style={{fontWeight:600}}>CyberLabs</span></p>
      </div>
    </div>
  );
};

export default CVImportGeneratorSlokavia;