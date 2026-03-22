import React, { useState, useRef, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';

const CVImportGeneratorKorea = () => {
    const [isDragging, setIsDragging]     = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // null | 'parsing' | 'success' | 'error'
    const [errorMsg, setErrorMsg]         = useState('');
    const [parsedData, setParsedData]     = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [photoData, setPhotoData]       = useState(null);
    const [logoData, setLogoData]         = useState(null);
    const [macImageData, setMacImageData] = useState(null);
    const [physPhotos, setPhysPhotos]     = useState({ wajah: null, tangan: null, badan: null });

    const fileInputRef  = useRef(null);
    const photoInputRef = useRef(null);
    const physInputRefs = { wajah: useRef(null), tangan: useRef(null), badan: useRef(null) };
    const headerLogo    = '/storage/logo/LoringMargi.png';

    useEffect(() => {
        // Load LBS Logo
        fetch('/images/Logo.png')
            .then(r => r.blob())
            .then(b => { const rd = new FileReader(); rd.onloadend = () => setLogoData(rd.result); rd.readAsDataURL(b); })
            .catch(() => {});

        // Load Mac image (sama seperti Slokavia)
        fetch('/storage/logo/Mac.png')
            .then(r => r.blob())
            .then(b => { const rd = new FileReader(); rd.onloadend = () => setMacImageData(rd.result); rd.readAsDataURL(b); })
            .catch(() => {});

        // Restore cache
        try {
            const cached = sessionStorage.getItem('cv_import_korea_cache');
            if (cached) {
                const { data, photo } = JSON.parse(cached);
                if (data) { setParsedData(data); setUploadStatus('success'); }
                if (photo) setPhotoData(photo);
            }
        } catch { /* silent */ }
    }, []);

    // ── Image Compressor ─────────────────────────────────────────
    const compressImage = (base64, maxSize = 400, quality = 0.7) => new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            if (width > height && width > maxSize) { height = height * maxSize / width; width = maxSize; }
            else if (height > maxSize) { width = width * maxSize / height; height = maxSize; }
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = base64;
    });

    // ── Notification (sama persis Slokavia) ──────────────────────
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
        const ok     = type === 'success';
        const accent = ok ? '#BF9952' : '#ef4444';
        const accentL = ok ? 'rgba(191,153,82,0.12)' : 'rgba(239,68,68,0.10)';
        const bar    = ok ? '#D4AF6A' : '#f87171';
        const icon   = ok ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12';
        const el = document.createElement('div');
        el.setAttribute('data-notif', '1');
        el.style.cssText = `
            position:fixed;top:16px;right:16px;width:360px;max-width:90%;
            background:#fff;border:1px solid #e5e7eb;border-left:4px solid ${accent};
            border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.12);z-index:99999;
            font-family:'Poppins',sans-serif;overflow:hidden;box-sizing:border-box;
            animation:nIn .35s cubic-bezier(.34,1.56,.64,1) both;
        `;
        el.innerHTML = `
            <div style="padding:16px 16px 14px;display:flex;align-items:flex-start;gap:12px;">
                <div style="flex-shrink:0;width:38px;height:38px;background:${accentL};border-radius:10px;display:flex;align-items:center;justify-content:center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="${icon}"/></svg>
                </div>
                <div style="flex:1;min-width:0;padding-top:2px;">
                    <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${title}</p>
                    <p style="margin:5px 0 0;font-size:12.5px;color:#6b7280;">${message}</p>
                </div>
                <button class="nc" onclick="var p=this.closest('[data-notif]');p.style.animation='nOut .28s ease forwards';setTimeout(()=>p.remove(),280);"
                    style="flex-shrink:0;background:none;border:none;cursor:pointer;color:#9ca3af;padding:4px;border-radius:6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div style="height:3px;background:#f3f4f6;"><div style="height:100%;background:${bar};animation:nProg 3s linear forwards;"></div></div>
        `;
        document.body.appendChild(el);
        setTimeout(() => {
            if (el.parentNode) { el.style.animation = 'nOut .28s ease forwards'; setTimeout(() => el.remove(), 280); }
        }, 3000);
    };

    // ── SheetJS ──────────────────────────────────────────────────
    const loadSheetJS = () => new Promise(resolve => {
        if (window.XLSX) return resolve(window.XLSX);
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        s.onload = () => resolve(window.XLSX);
        document.head.appendChild(s);
    });

    // ── Parse Excel ──────────────────────────────────────────────
    const parseExcel = async (file) => {
        setUploadStatus('parsing'); setErrorMsg(''); setParsedData(null);
        try {
            const XLSX = await loadSheetJS();
            const wb   = XLSX.read(await file.arrayBuffer(), { type: 'array' });
            const ws   = wb.Sheets['1. Personal'];
            if (!ws) throw new Error('Sheet "1. Personal" tidak ditemukan.');
            const g = (r, c) => {
                const cell = ws[XLSX.utils.encode_cell({ r: r - 1, c: c - 1 })];
                if (!cell) return '';
                // Handle Excel date serial numbers (typically > 20000 for recent dates)
                // If it looks like a numeric date, format it to YYYY-MM-DD
                if (cell.t === 'n' && typeof cell.v === 'number' && cell.v > 10000 && cell.v < 80000 && (!cell.w || /^\d+$/.test(cell.w))) {
                    try {
                        const date = new Date(Math.round((cell.v - 25569) * 86400 * 1000));
                        return date.toISOString().split('T')[0]; // format to YYYY-MM-DD
                    } catch(e) { /* ignore */ }
                }
                
                let val = cell.w !== undefined ? String(cell.w) : String(cell.v);
                
                // Cegah angka eksponensial untuk NIK/Telepon yang terlalu panjang
                if (cell.t === 'n' && (val.includes('E+') || val.includes('e+'))) {
                    try { val = BigInt(cell.v).toString(); } catch(e) { /* ignore */ }
                }
                
                // Bersihkan artifact timestamp dari database lokal yang mungkin tercopy
                val = val.trim();
                if (val.includes('T00:00')) val = val.split('T')[0];

                return val;
            };
            const toRows = (name, range) => { const s = wb.Sheets[name]; return s ? XLSX.utils.sheet_to_json(s, { header: 1, range, defval: '' }) : []; };
            const boolVal = (v) => { const s = String(v).toLowerCase().trim(); return s === 'ya' || s === 'yes' || s === 'true'; };

            if (!g(3, 2)) throw new Error('Nama Lengkap wajib diisi di kolom B3 sheet "1. Personal".');

            const shipRows = toRows('2. Kapal', 2).map(r => ({
                ship_name: String(r[1] || '').trim(),
                period: String(r[2] || '').trim(),
                ship_nationality: String(r[3] || '').trim(),
                type: String(r[4] || '').trim()
            })).filter(s => s.ship_name);

            const formData = {
                full_name: g(3, 2), korean_name: g(4, 2), date_of_birth: g(5, 2),
                gender: g(6, 2) === '여' ? 'female' : 'male',
                address: g(7, 2), id_number: g(8, 2),
                nationality: g(9, 2) || 'Indonesia', religion: g(10, 2) || 'Islam',
                height: g(3, 5), weight: g(4, 5), vision: g(5, 5) || '10/10',
                dominant_hand: g(6, 5) === '왼손' ? 'left' : 'right',
                tattoo: boolVal(g(7, 5)), surgery: boolVal(g(8, 5)),
                marital_status: ({ '미혼': 'single', '기혼': 'married', '이혼': 'divorced', '유가족': 'widowed' })[g(9, 5)] || 'single',
                father_name: g(12, 2), father_birth_year: g(12, 4), father_occupation: g(12, 6), father_phone: g(12, 8),
                mother_name: g(13, 2), mother_birth_year: g(13, 4), mother_occupation: g(13, 6), mother_phone: g(13, 8),
                spouse_name: g(14, 2), spouse_birth_year: g(14, 4), spouse_occupation: g(14, 6), spouse_phone: g(14, 8),
                children_count: g(15, 2), eldest_age: g(15, 4), youngest_age: g(15, 6),
                education_level: ({ '초졸': 'elementary', '중졸': 'middle', '고졸': 'highschool', '전문대졸': 'diploma', '대졸': 'bachelor' })[g(18, 2)] || 'highschool',
                school_name: g(19, 2), school_address: g(20, 2),
                has_seafaring_exp: shipRows.length > 0,
                ship_experiences: shipRows.length > 0 ? shipRows : [{ ship_name: '', period: '', ship_nationality: '', type: '' }],
                pushups: '', situps: '', right_balance: '합격', forward_bend: '합격',
                backward_bend: '합격', hanging_seconds: '', right_grip: '', left_grip: '', horse_stance_seconds: ''
            };

            sessionStorage.setItem('cv_import_korea', JSON.stringify(formData));
            sessionStorage.setItem('cv_import_korea_cache', JSON.stringify({ data: formData, photo: null }));
            setParsedData(formData);
            setUploadStatus('success');
        } catch (err) {
            setUploadStatus('error');
            setErrorMsg(err.message || 'Format file tidak didukung / rusak.');
        }
    };

    const handleFile = (file) => {
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls'].includes(ext)) { setUploadStatus('error'); setErrorMsg('Hanya .xlsx atau .xls yang didukung.'); return; }
        parseExcel(file);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        if (file.size > 5 * 1024 * 1024) return showNotification('error', 'File terlalu besar', 'Max file size 5MB');
        const rd = new FileReader();
        rd.onload = async ev => {
            const compressed = await compressImage(ev.target.result, 800, 0.85);
            setPhotoData(compressed);
            try {
                const cached = sessionStorage.getItem('cv_import_korea_cache');
                if (cached) sessionStorage.setItem('cv_import_korea_cache', JSON.stringify({ ...JSON.parse(cached), photo: compressed }));
            } catch { /* silent */ }
        };
        rd.readAsDataURL(file);
    };

    const handlePhysPhotoUpload = (key) => async (e) => {
        const file = e.target.files[0]; if (!file) return;
        const rd = new FileReader();
        rd.onload = async ev => {
            const compressed = await compressImage(ev.target.result, 600, 0.8);
            setPhysPhotos(p => ({ ...p, [key]: compressed }));
        };
        rd.readAsDataURL(file);
    };

    const handlePhysTestChange = (field, val) => {
        setParsedData(prev => prev ? { ...prev, [field]: val } : prev);
    };

    // ── Generate 이력서 HTML ──────────────────────────────────────
    const generateKoreaCVHTML = (data, photo, logo, pp) => {
        const cb = c => c ? '■' : '□';
        const age = d => {
            if (!d) return '';
            const bd = new Date(d);
            if (isNaN(bd)) return '';
            return Math.floor((new Date() - bd) / (1000 * 60 * 60 * 24 * 365.25));
        };
        const fmt = d => {
            if (!d) return '';
            const str = String(d).split('T')[0].trim();
            // Validasi split YYYY-MM-DD
            if (str.includes('-')) {
                const parts = str.split('-');
                if (parts.length === 3) return `${parts[0]}.${parts[1]}.${parts[2]}`;
            }
            // Fallback kalau cuma ada teks biasa / tahun
            return str;
        };
        const edu = [
            { key: 'elementary', label: '초졸' }, { key: 'middle', label: '중졸' },
            { key: 'highschool', label: '고졸' }, { key: 'diploma', label: '전문대졸' },
            { key: 'bachelor', label: '대졸' },
        ];
        const mm = { single: '미혼', married: '기혼', divorced: '이혼', widowed: '유가족' };

        return `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>이력서 - ${data.full_name}</title>
<style>
@page{size:A4;margin:8mm 10mm}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Malgun Gothic','Apple SD Gothic Neo',Arial,sans-serif;font-size:8pt;color:#000;background:#fff;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
.page{width:190mm;margin:0 auto}
/* ── KOP ── */
.kop { display:table; width:100%; padding-bottom:3px; }
.kop-logo { display:table-cell; width:72px; vertical-align:middle; padding-right:6px; }
.kop-body { display:table-cell; vertical-align:middle; text-align:center; }
.kop-code { display:table-cell; width:66px; vertical-align:middle; }
.company-name  { font-size:12.5pt; font-weight:900; letter-spacing:0.2px; margin-bottom:0px; }
.company-sub   { font-size:8pt; font-weight:700; margin-bottom:2px; }
.company-addr  { font-size:6.5pt; line-height:1.6; color:#222; }
.company-email { font-size:6.5pt; color:#0000cc; text-decoration:underline; }
.kop-code-box  { border:1.5px solid #333; padding:4px 3px; font-size:7.5pt; text-align:center; font-weight:700; min-height:40px; display:flex; align-items:center; justify-content:center; }
.double-line { border-top: 3px solid #000; border-bottom: 1px solid #000; height: 3px; margin: 4px 0 8px; }

/* ── MAIN TABLE ── */
table.main { width:100%; border-collapse:collapse; table-layout:fixed; }
table.main col:nth-child(1) { width:86px;  }
table.main col:nth-child(2) { width:110px; }
table.main col:nth-child(3) { width:46px;  }
table.main col:nth-child(4) { width:84px;  }
table.main col:nth-child(5) { width:50px;  }
table.main col:nth-child(6) { width:84px;  }
table.main col:nth-child(7) { width:auto;  }
table.main col:nth-child(8) { width:115px; }

table.main td { border:1px solid #000; padding:2px 5px; vertical-align:middle; font-size:8pt; line-height:1.35; word-wrap:break-word; }
.lc { background:#e0e0e0; font-weight:700; text-align:center; white-space:nowrap; font-size:7.5pt; }

/* ── Photo cell ── */
.photo-cell { border:1px solid #000 !important; padding:0 !important; overflow:hidden; vertical-align:stretch; }
.photo-cell > img, .photo-cell > div { width:100%; height:100%; min-height:148px; display:block; }
.photo-cell > img { object-fit:cover; }
.photo-cell > div { display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f5f5f5; }

tr.green-row td { background:#2e7d32 !important; height:12px !important; padding:0 !important; border:none !important; }
.judul-cell { border:none !important; background:none !important; text-align:center; padding:5px 0 3px; font-size:24pt; font-weight:900; letter-spacing:15px; font-family:'Malgun Gothic','Apple SD Gothic Neo',Arial,sans-serif; }

/* ── Page 2 ── */
table.phys{width:100%;border-collapse:collapse;margin-top:8px}
table.phys th{background:#e0e0e0;border:1px solid #000;padding:4px 2px;font-weight:700;font-size:7pt;text-align:center;line-height:1.4}
table.phys td{border:1px solid #000;padding:5px 3px;text-align:center;font-size:8.5pt;font-weight:600;vertical-align:middle}
.photo-big-wrap{border:1.5px solid #999;width:100%}
.photo-big-row{display:table;width:100%;table-layout:fixed}
.photo-big-cell{display:table-cell;width:33.33%;vertical-align:top;border-right:1px solid #bbb;padding:6px;text-align:center}
.photo-big-cell:last-child{border-right:none}
.photo-big-cell img{width:100%;height:320px;object-fit:cover;object-position:top center;display:block;border:1px solid #ccc}
.photo-big-cell .ph-empty{width:100%;height:320px;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:8.5pt;background:#fafafa}
.photo-big-label{display:block;font-size:7.5pt;font-weight:600;color:#444;margin-bottom:4px;letter-spacing:.3px}
@media print{.pb{page-break-before:always}}
</style></head><body>
<div class="page">
    <div class="kop">
        <div class="kop-logo">${logo ? `<img src="${logo}" alt="LBS" style="width:68px;height:68px;object-fit:contain;display:block;"/>` : `<div style="width:68px;height:68px;border:2.5px solid #1a5276;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14pt;color:#1a5276;font-family:Arial,sans-serif;background:#eaf2fb;">LBS</div>`}</div>
        <div class="kop-body">
            <div class="company-name">PT. LAWANG BANYU SEJAHTERA</div>
            <div class="company-sub">MANPOWER SUPPLY COMPANY</div>
            <div class="company-addr">
                Jl. Raya Karangampel - Jatibarang Desa Karangampel No.01 Rt.02 Rw.01<br>
                Kec. Karangampel Kab. Indramayu Jawa Barat<br>
                Tlp : (+62 234) 7137506 &nbsp;/&nbsp; +62 877 2714 1479 &nbsp;/&nbsp; +62 812 2277 2174
            </div>
            <div class="company-email">lawangbanyusejahtera@gmail.com</div>
        </div>
        <div class="kop-code"><div class="kop-code-box">순번</div></div>
    </div>
    <div class="double-line"></div>
    <table class="main">
        <colgroup>
            <col/><col/><col/><col/>
            <col/><col/><col/><col/>
        </colgroup>
        <tr>
            <td colspan="8" style="padding: 10px 0 15px; position: relative;">
                <div class="judul-cell" style="margin: 0 auto; display: inline-block; width: 100%; text-align: center;">이 력 서</div>
                <div style="position: absolute; right: 0; bottom: 0; width: 115px; border: 1.5px solid #000; background: #fff; text-align: left; padding: 4px 8px; font-weight: bold; font-size: 11pt;">코드 code:</div>
            </td>
        </tr>
        <tr>
            <td class="lc">성명</td>
            <td colspan="6">
                <span style="font-size:9.5pt;font-weight:700;letter-spacing:.5px;">${data.full_name || ''}</span>
                ${data.korean_name ? `<br><span style="font-size:8pt;color:#444;">${data.korean_name}</span>` : ''}
            </td>
            <td class="photo-cell" rowspan="6">${photo ? `<img src="${photo}" alt="Foto" style="width:100%;height:100%;min-height:148px;object-fit:cover;object-position:top center;display:block;"/>` : `<div style="width:100%;min-height:148px;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f5f5f5;"><span style="font-size:7.5pt;color:#bbb;">사진</span></div>`}</td>
        </tr>
        <tr>
            <td class="lc" style="font-size:8.5pt;">생년월일</td>
            <td colspan="2" style="text-align:center;">${fmt(data.date_of_birth)}</td>
            <td class="lc" style="font-size:7.5pt;">${age(data.date_of_birth) ? age(data.date_of_birth) + ' 살' : ''}</td>
            <td class="lc">성별</td>
            <td style="text-align:center;">${cb(data.gender === 'male')}&nbsp;남</td>
            <td style="text-align:center;">${cb(data.gender === 'female')}&nbsp;여</td>
        </tr>
        <tr>
            <td class="lc">주소</td>
            <td colspan="6" style="font-size:8pt;">${(data.address || '').toUpperCase()}</td>
        </tr>
        <tr>
            <td class="lc">키</td>
            <td colspan="3" style="text-align:center;">${data.height || ''}</td>
            <td class="lc">몸무게</td>
            <td colspan="2" style="text-align:center;">${data.weight || ''}</td>
        </tr>
        <tr>
            <td class="lc" rowspan="2" style="font-size:7.5pt;">주민등록번호</td>
            <td colspan="3" rowspan="2" style="text-align:center;">${data.id_number || ''}</td>
            <td class="lc" style="font-size:7.5pt;">국적</td>
            <td colspan="2" style="text-align:center;">${data.nationality || '인도네시아'}</td>
        </tr>
        <tr>
            <td class="lc" style="font-size:7.5pt;">종교</td>
            <td colspan="2" style="text-align:center;">${data.religion || '이슬람'}</td>
        </tr>
        <tr class="green-row"><td colspan="8"></td></tr>
        <tr>
            <td class="lc">학력</td>
            <td colspan="7">
                ${edu.map(e => `${cb(data.education_level === e.key)}&nbsp;${e.label}`).join('&nbsp;&nbsp;&nbsp;')}
            </td>
        </tr>
        <tr><td class="lc">학교명</td><td colspan="7">${(data.school_name || '').toUpperCase()}</td></tr>
        <tr><td class="lc">학교주소</td><td colspan="7">${(data.school_address || '').toUpperCase()}</td></tr>
        <tr>
            <td class="lc">혼인상태</td>
            <td colspan="2" style="text-align:center;">${cb(data.marital_status === 'single')}&nbsp;미혼</td>
            <td colspan="2" style="text-align:center;">${cb(data.marital_status === 'married')}&nbsp;기혼</td>
            <td style="text-align:center;">${cb(data.marital_status === 'divorced')}&nbsp;이혼</td>
            <td colspan="2" style="text-align:center;">${cb(data.marital_status === 'widowed')}&nbsp;유가족</td>
        </tr>
        <tr>
            <td class="lc">아버지 성명</td><td style="font-size:8pt;">${(data.father_name || '').toUpperCase()}</td>
            <td class="lc">생년</td><td>${data.father_birth_year || ''}</td>
            <td class="lc">직업</td><td>${data.father_occupation || ''}</td>
            <td colspan="2" style="font-size:7.5pt;">연락처&nbsp;${data.father_phone || ''}</td>
        </tr>
        <tr>
            <td class="lc">어머니 성명</td><td style="font-size:8pt;">${(data.mother_name || '').toUpperCase()}</td>
            <td class="lc">생년</td><td>${data.mother_birth_year || ''}</td>
            <td class="lc">직업</td><td>${data.mother_occupation || ''}</td>
            <td colspan="2" style="font-size:7.5pt;">연락처&nbsp;${data.mother_phone || ''}</td>
        </tr>
        <tr>
            <td class="lc">배우자 성명</td><td style="font-size:8pt;">${data.spouse_name || '-'}</td>
            <td class="lc">생년</td><td>${data.spouse_birth_year || '-'}</td>
            <td class="lc">직업</td><td>${data.spouse_occupation || '-'}</td>
            <td colspan="2" style="font-size:7.5pt;">연락처&nbsp;${data.spouse_phone || '-'}</td>
        </tr>
        <tr>
            <td class="lc">자녀</td><td>${data.children_count || '0'}&nbsp;명</td>
            <td class="lc" colspan="2" style="font-size:7.5pt;">맏이나이</td><td>${data.eldest_age || '-'}</td>
            <td class="lc">막내나이</td><td colspan="2">${data.youngest_age || '-'}</td>
        </tr>
        <tr>
            <td class="lc">눈</td><td>${data.vision || '10/10'}</td>
            <td class="lc">바른손</td><td colspan="5">
                ${cb(data.dominant_hand === 'right')}&nbsp;오른손&nbsp;&nbsp;&nbsp;&nbsp;
                ${cb(data.dominant_hand === 'left')}&nbsp;왼손
            </td>
        </tr>
        <tr>
            <td class="lc">문신</td><td colspan="2">${cb(data.tattoo)}&nbsp;있음&nbsp;&nbsp;${cb(!data.tattoo)}&nbsp;없음</td>
            <td class="lc">수술</td><td colspan="4">${cb(data.surgery)}&nbsp;있음&nbsp;&nbsp;${cb(!data.surgery)}&nbsp;없음</td>
        </tr>
        <tr>
            <td class="lc" style="font-size:7.5pt;">외국에서<br>승선 경험?</td>
            <td colspan="2">${cb(data.has_seafaring_exp)}&nbsp;있음&nbsp;&nbsp;${cb(!data.has_seafaring_exp)}&nbsp;없음</td>
            <td class="lc">승선기간</td><td colspan="4"></td>
        </tr>
        <tr>
            <td class="lc">선명</td>
            <td colspan="2" style="text-align:center;font-weight:700;font-size:8pt;background:#e0e0e0;">기간</td>
            <td colspan="2" style="text-align:center;font-weight:700;font-size:8pt;background:#e0e0e0;">해외국적</td>
            <td colspan="3" style="text-align:center;font-weight:700;font-size:8pt;background:#e0e0e0;">종류</td>
        </tr>
        ${data.ship_experiences && data.ship_experiences.some(s => s.ship_name)
            ? data.ship_experiences.filter(s => s.ship_name).map(s => `
            <tr>
                <td style="padding:4px 6px;border:1px solid #000;">${s.ship_name}</td>
                <td colspan="2" style="text-align:center;border:1px solid #000;">${s.period}</td>
                <td colspan="2" style="text-align:center;border:1px solid #000;">${s.ship_nationality}</td>
                <td colspan="3" style="text-align:center;border:1px solid #000;">${s.type}</td>
            </tr>`).join('')
            : `<tr>
                <td style="border:1px solid #000;height:24px;"></td>
                <td colspan="2" style="border:1px solid #000;"></td>
                <td colspan="2" style="border:1px solid #000;"></td>
                <td colspan="3" style="border:1px solid #000;"></td>
               </tr>`
        }
        <tr>
            <td class="lc" rowspan="5">평가</td>
            <td class="lc">체력</td>
            <td colspan="6">
                <div style="display:flex; justify-content:space-around; align-items:center;">
                    <span>A</span><span>B</span><span>C</span><span>D</span><span>E</span>
                </div>
            </td>
        </tr>
        <tr><td class="lc">태도</td><td colspan="6"></td></tr>
        <tr><td class="lc">인상</td><td colspan="6"></td></tr>
        <tr><td class="lc">특이사항</td><td colspan="6"></td></tr>
        <tr><td class="lc">기술</td><td colspan="6"></td></tr>
        <tr>
            <td colspan="8" style="text-align:center;font-size:16pt;font-weight:900;padding:10px 8px;background:#f0f0f0;letter-spacing:5px;">
                합 격 점 수
            </td>
        </tr>
    </table>
<div class="page pb">
    <div class="photo-big-wrap">
        <div class="photo-big-row">
            <div class="photo-big-cell">
                <span class="photo-big-label">사진 1</span>
                ${pp?.wajah && pp.wajah.startsWith('data:') ? `<img src="${pp.wajah}" alt="Wajah"/>` : `<div class="ph-empty"></div>`}
            </div>
            <div class="photo-big-cell">
                <span class="photo-big-label">사진 2</span>
                ${pp?.tangan && pp.tangan.startsWith('data:') ? `<img src="${pp.tangan}" alt="Tangan"/>` : `<div class="ph-empty"></div>`}
            </div>
            <div class="photo-big-cell">
                <span class="photo-big-label">사진 3</span>
                ${pp?.badan && pp.badan.startsWith('data:') ? `<img src="${pp.badan}" alt="Badan"/>` : `<div class="ph-empty"></div>`}
            </div>
        </div>
    </div>

    <!-- Tabel nilai 물리 (Physical) -->
    <table class="phys">
        <colgroup>
            <col style="width:16%;" />
            <col style="width:9%;" />
            <col style="width:16%;" />
            <col style="width:9%;" />
            <col style="width:16%;" />
            <col style="width:9%;" />
            <col style="width:16%;" />
            <col style="width:9%;" />
        </colgroup>
        <tbody>
            <tr>
                <th>팔굽펴기</th>
                <td>${data.pushups ? data.pushups + ' 회' : '-'}</td>
                <th>윗몸일으키기</th>
                <td>${data.situps ? data.situps + ' 회' : '-'}</td>
                <th>오른발균형</th>
                <td>${data.right_balance || '합격'}</td>
                <th>앞구부리기</th>
                <td>${data.forward_bend || '합격'}</td>
            </tr>
            <tr>
                <th>뒤로구부리기</th>
                <td>${data.backward_bend || '합격'}</td>
                <th>매달리기</th>
                <td>${data.hanging_seconds ? data.hanging_seconds + ' 초' : '-'}</td>
                <th>오른손악력</th>
                <td>${data.right_grip || '-'}</td>
                <th>왼손악력</th>
                <td>${data.left_grip || '-'}</td>
            </tr>
            <tr>
                <th colspan="2" style="text-align:left; padding-left:12px;">기마자세오래버티기</th>
                <td colspan="2" style="text-align:center; background:#fff;">${data.horse_stance_seconds ? data.horse_stance_seconds + ' 초' : '-'}</td>
                <td colspan="4" style="border:none;"></td>
            </tr>
        </tbody>
    </table>
</div></body></html>`;
    };

    // ── Actions ───────────────────────────────────────────────────
    const previewCV = () => {
        if (!parsedData) return;
        const w = window.open();
        w.document.write(generateKoreaCVHTML(parsedData, photoData, logoData, physPhotos));
        w.document.close();
    };

    const downloadPDF = async () => {
        if (!parsedData) return;
        setIsGenerating(true);

        // 1. Save DB
        try {
            const res = await fetch('/cv-submissions-korea', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Inertia': 'false',
                },
                body: JSON.stringify({ ...parsedData, photo: photoData, physPhotos }),
            });
            const result = await res.json().catch(() => ({}));
            if (result.success) showNotification('success', 'Data Tersimpan!', `${parsedData.full_name} — berhasil disimpan ke database`);
            else showNotification('error', 'Gagal Simpan DB', result.error || result.message || `HTTP ${res.status}`);
        } catch (err) { showNotification('error', 'Gagal Simpan DB', `Network error: ${err.message}`); }

        // 2. Generate PDF
        try {
            const html = generateKoreaCVHTML(parsedData, photoData, logoData, physPhotos);
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.left = '-9999px';
            iframe.style.width = '210mm';
            iframe.style.height = '297mm';
            document.body.appendChild(iframe);

            iframe.contentDocument.open();
            iframe.contentDocument.write(html);
            iframe.contentDocument.close();

            await new Promise(resolve => setTimeout(resolve, 800));

            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
            
            showNotification('success', 'PDF Siap Disimpan', `Print dialog terbuka untuk ${parsedData.full_name}`);
        } catch (err) {
            showNotification('error', 'PDF Gagal', `Terjadi kesalahan saat generate PDF: ${err.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100"
            style={{ fontFamily: "'Poppins',sans-serif", display: 'flex', flexDirection: 'column' }}>
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

            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
                    <img src={headerLogo} alt="Loring Margi" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 flex-1">

                <Link href="/" className="btn-back inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold text-sm mb-8">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali
                </Link>

                {/* Title */}
                <div className="text-center mb-10">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                        <img src="/images/KoranF.png" alt="Korea" style={{ width: 64, height: 42, objectFit: 'cover', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                    </div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">이력서 Generator Korea</h1>
                    <p className="text-xs sm:text-base text-gray-500 font-light max-w-2xl mx-auto px-2">
                        Upload Excel atau isi form manual — Generate CV format PT. Lawang Banyu Sejahtera
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

                    {/* ═══ KIRI: Excel Upload ═══ */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-5">

                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Upload Excel
                            </h2>
                            <a href="/template/CV_Template_Korea.xlsx" download
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-300 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Template
                            </a>
                        </div>

                        {/* Drop zone */}
                        <div
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
                            onClick={() => uploadStatus !== 'parsing' && fileInputRef.current?.click()}
                            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer
                                ${isDragging ? 'border-[#BF9952] bg-amber-50 drop-active'
                                    : uploadStatus === 'success' ? 'border-green-400 bg-green-50'
                                        : uploadStatus === 'error' ? 'border-red-400 bg-red-50'
                                            : uploadStatus === 'parsing' ? 'border-[#BF9952] bg-amber-50 cursor-wait'
                                                : 'border-gray-300 bg-gray-50 hover:border-[#BF9952] hover:bg-amber-50'}`}
                            style={{ minHeight: 150 }}>
                            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => handleFile(e.target.files[0])} />

                            {uploadStatus === 'parsing' && (
                                <><svg className="spin w-10 h-10 text-[#BF9952] mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg><p className="font-semibold text-[#BF9952] text-sm">Membaca file Excel…</p></>
                            )}
                            {uploadStatus === 'success' && (
                                <><div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2"><svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></div><p className="font-bold text-green-700">Berhasil dibaca!</p><p className="text-xs text-green-600 mt-0.5"><strong>{parsedData?.full_name}</strong></p><p className="text-xs text-gray-400 mt-2">Klik untuk upload file lain</p></>
                            )}
                            {uploadStatus === 'error' && (
                                <><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2"><svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></div><p className="font-bold text-red-600 text-sm">Gagal membaca file</p><p className="text-xs text-red-500 mt-1 max-w-xs">{errorMsg}</p><p className="text-xs text-gray-400 mt-2">Klik untuk coba lagi</p></>
                            )}
                            {!uploadStatus && (
                                <><div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2"><svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg></div><p className="font-semibold text-gray-600 text-sm">Drag & drop atau klik untuk pilih file</p><span className="mt-2 text-xs text-gray-400 bg-gray-100 px-3 py-0.5 rounded-full">.xlsx</span></>
                            )}
                        </div>

                        {/* ── FOTO UPLOAD ── */}
                        {uploadStatus === 'success' && (
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    Foto Profil <span className="font-normal normal-case">(opsional)</span>
                                </p>
                                <div className="flex items-center gap-4">
                                    <div
                                        onClick={() => photoInputRef.current?.click()}
                                        className="photo-ring w-20 h-20 flex-shrink-0 overflow-hidden flex items-center justify-center cursor-pointer"
                                        style={{ background: photoData ? 'transparent' : '#f9fafb' }}>
                                        {photoData
                                            ? <img src={photoData} alt="Foto" className="w-full h-full object-cover rounded-full" />
                                            : <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <button onClick={() => photoInputRef.current?.click()}
                                            className="w-full py-2 px-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-[#BF9952] hover:text-[#BF9952] transition flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {photoData ? 'Ganti Foto' : 'Upload Foto'}
                                        </button>
                                        <p className="text-xs text-gray-400 mt-1.5 text-center">JPG, PNG — max 5MB · auto-compressed</p>
                                        {photoData && <button onClick={() => setPhotoData(null)} className="w-full mt-1 text-xs text-red-400 hover:text-red-600 transition">Hapus foto</button>}
                                    </div>
                                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                </div>
                            </div>
                        )}

                        {/* ── FOTO FISIK (wajah/tangan/badan) ── */}
                        {uploadStatus === 'success' && (
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    Foto Tes Fisik <span className="font-normal normal-case">(opsional — untuk halaman 2 PDF)</span>
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                    {[{ key: 'wajah', label: '사진 1 · Wajah' }, { key: 'tangan', label: '사진 2 · Tangan' }, { key: 'badan', label: '사진 3 · Badan' }].map(({ key, label }) => (
                                        <div key={key} className="flex flex-col items-center gap-2">
                                            <div
                                                onClick={() => physInputRefs[key].current?.click()}
                                                className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-[#BF9952] transition flex items-center justify-center bg-white"
                                            >
                                                {physPhotos[key]
                                                    ? <img src={physPhotos[key]} alt={key} className="w-full h-full object-cover" />
                                                    : <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                }
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-medium tracking-wide text-center">{label}</span>
                                            {physPhotos[key] && <button onClick={() => setPhysPhotos(p => ({ ...p, [key]: null }))} className="text-xs text-red-400 hover:text-red-600">Hapus</button>}
                                            <input ref={physInputRefs[key]} type="file" accept="image/*" className="hidden" onChange={handlePhysPhotoUpload(key)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── HASIL TES FISIK MANUAL ── */}
                        {uploadStatus === 'success' && (
                            <div className="border-2 border-solid border-gray-200 rounded-2xl p-4 bg-white shadow-sm mt-4">
                                <p className="text-xs font-semibold text-[#BF9952] uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                    Input Hasil Tes Fisik <span className="text-gray-400 font-normal normal-case">(opsional)</span>
                                </p>
                                <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                    <label className="flex flex-col gap-1 text-gray-600">
                                        <span className="text-xs font-medium">Push Up (kali)</span>
                                        <input type="number" value={parsedData?.pushups || ''} onChange={e => handlePhysTestChange('pushups', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#BF9952] focus:ring-1 focus:ring-[#BF9952] transition w-full" placeholder="Contoh: 30" />
                                    </label>
                                    <label className="flex flex-col gap-1 text-gray-600">
                                        <span className="text-xs font-medium">Sit Up (kali)</span>
                                        <input type="number" value={parsedData?.situps || ''} onChange={e => handlePhysTestChange('situps', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#BF9952] focus:ring-1 focus:ring-[#BF9952] transition w-full" placeholder="Contoh: 30" />
                                    </label>
                                    <label className="flex flex-col gap-1 text-gray-600">
                                        <span className="text-xs font-medium">Bergantung (detik)</span>
                                        <input type="number" value={parsedData?.hanging_seconds || ''} onChange={e => handlePhysTestChange('hanging_seconds', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#BF9952] focus:ring-1 focus:ring-[#BF9952] transition w-full" placeholder="Contoh: 60" />
                                    </label>
                                    <label className="flex flex-col gap-1 text-gray-600">
                                        <span className="text-xs font-medium">Kuda-kuda (detik)</span>
                                        <input type="number" value={parsedData?.horse_stance_seconds || ''} onChange={e => handlePhysTestChange('horse_stance_seconds', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#BF9952] focus:ring-1 focus:ring-[#BF9952] transition w-full" placeholder="Contoh: 120" />
                                    </label>
                                    <label className="flex flex-col gap-1 text-gray-600">
                                        <span className="text-xs font-medium">Kekuatan Tangan Kanan</span>
                                        <input type="text" value={parsedData?.right_grip || ''} onChange={e => handlePhysTestChange('right_grip', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#BF9952] focus:ring-1 focus:ring-[#BF9952] transition w-full" placeholder="Contoh: 45" />
                                    </label>
                                    <label className="flex flex-col gap-1 text-gray-600">
                                        <span className="text-xs font-medium">Kekuatan Tangan Kiri</span>
                                        <input type="text" value={parsedData?.left_grip || ''} onChange={e => handlePhysTestChange('left_grip', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#BF9952] focus:ring-1 focus:ring-[#BF9952] transition w-full" placeholder="Contoh: 40" />
                                    </label>
                                    <label className="flex flex-col gap-1 text-gray-600 col-span-2 shadow-sm">
                                        <span className="text-xs font-medium">Keseimbangan & Kelenturan</span>
                                        <div className="flex gap-4 mt-1">
                                            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-full hover:bg-gray-100 transition">
                                                <input type="checkbox" checked={parsedData?.right_balance !== '불합격'} onChange={e => handlePhysTestChange('right_balance', e.target.checked ? '합격' : '불합격')} className="w-4 h-4 text-[#BF9952]" />
                                                <span className="text-sm">Keseimbangan Kanan Lulus</span>
                                            </label>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* ── ACTION BUTTONS ── */}
                        {uploadStatus === 'success' && (
                            <div className="flex flex-col gap-3">
                                <button onClick={downloadPDF} disabled={isGenerating}
                                    className="btn-gold w-full py-3 sm:py-3.5 text-white rounded-xl font-semibold flex items-center justify-center gap-2 text-sm sm:text-base">
                                    {isGenerating
                                        ? <><div className="spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Generating PDF…</>
                                        : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>Download 이력서 PDF</>
                                    }
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={previewCV}
                                        className="py-2.5 bg-gray-100 border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-gray-200 transition">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        Preview
                                    </button>
                                    <button onClick={() => router.visit('/form/korea')}
                                        className="py-2.5 bg-gray-100 border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-gray-200 transition">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        Edit di Form
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Hint */}
                        {!uploadStatus && (
                            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-xs text-blue-700">Download template terlebih dahulu, isi datanya, lalu upload kembali di sini.</p>
                            </div>
                        )}
                    </div>

                    {/* ═══ KANAN: Form Manual ═══ */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Isi Form Manual
                        </h2>
                        <div className="flex flex-col items-center justify-center h-full gap-6 py-4">
                            {macImageData
                                ? <img src={macImageData} alt="Computer" className="w-full max-w-xs h-auto drop-shadow-2xl" />
                                : <div className="w-full max-w-xs h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-sm shimmer">Mac Image</div>
                            }
                            <Link href="/form/korea" className="btn-gold px-10 py-4 text-white rounded-xl font-semibold flex items-center gap-3">
                                Masuk ke Form
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div style={{ background: 'linear-gradient(135deg,#BF9952 0%,#D4AF6A 50%,#BF9952 100%)', color: 'white', textAlign: 'center', padding: '28px 24px', marginTop: 'auto' }}>
                <p style={{ fontSize: 13, fontWeight: 300, marginBottom: 4 }}>Copyright © 2025 Loring Margi International</p>
                <p style={{ fontSize: 12, opacity: .9 }}>Powered by <span style={{ fontWeight: 600 }}>CyberLabs</span></p>
            </div>
        </div>
    );
};

export default CVImportGeneratorKorea;