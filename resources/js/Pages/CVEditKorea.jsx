import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

const CVEditKorea = ({ cv }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [photoData, setPhotoData] = useState(null);
    const [logoData, setLogoData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const [physPhotos, setPhysPhotos] = useState({ wajah: null, tangan: null, badan: null });
    const physRefs = {
        wajah: useRef(null),
        tangan: useRef(null),
        badan: useRef(null),
    };

    const headerLogo = '/storage/logo/LoringMargi.png';

    useEffect(() => {
        // Load profile photo
        if (cv.photo_path) {
            fetch(`/storage/${cv.photo_path}`)
                .then(r => r.blob())
                .then(b => {
                    const rd = new FileReader();
                    rd.onloadend = () => setPhotoData(rd.result);
                    rd.readAsDataURL(b);
                }).catch(()=>{});
        }
        // Load physical test photos
        ['wajah', 'tangan', 'badan'].forEach(phys => {
            const key = phys + '_path';
            if (cv[key]) {
                fetch(`/storage/${cv[key]}`)
                    .then(r => r.blob())
                    .then(b => {
                        const rd = new FileReader();
                        rd.onloadend = () => setPhysPhotos(p => ({ ...p, [phys]: rd.result }));
                        rd.readAsDataURL(b);
                    }).catch(()=>{});
            }
        });
    }, [cv]);

    useEffect(() => {
        const raw = sessionStorage.getItem('cv_import_korea');
        if (!raw) return;
        try {
            const imported = JSON.parse(raw);
            setFormData(prev => ({ ...prev, ...imported }));
            sessionStorage.removeItem('cv_import_korea');
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        fetch('/images/Logo.png')
            .then(r => r.blob())
            .then(b => {
                const rd = new FileReader();
                rd.onloadend = () => setLogoData(rd.result);
                rd.readAsDataURL(b);
            })
            .catch(() => { });
    }, []);

    const [formData, setFormData] = useState({
        full_name: cv.full_name || '', korean_name: cv.korean_name || '', date_of_birth: cv.date_of_birth || '', gender: cv.gender || 'male',
        address: cv.address || '', id_number: cv.id_number || '', nationality_korean: cv.nationality_korean || 'Indonesia', religion_korean: cv.religion_korean || 'Islam',
        height: cv.height || '', weight: cv.weight || '', vision: cv.vision || '10/10', dominant_hand: cv.dominant_hand || 'right',
        tattoo: !!cv.tattoo, surgery: !!cv.surgery, marital_status: cv.marital_status || 'single',
        father_name: cv.father_name || '', father_birth_year: cv.father_birth_year || '', father_occupation: cv.father_occupation || '', father_phone: cv.father_phone || '',
        mother_name: cv.mother_name || '', mother_birth_year: cv.mother_birth_year || '', mother_occupation: cv.mother_occupation || '', mother_phone: cv.mother_phone || '',
        spouse_name: cv.spouse_name || '', spouse_birth_year: cv.spouse_birth_year || '', spouse_occupation: cv.spouse_occupation || '', spouse_phone: cv.spouse_phone || '',
        children_count: cv.children_count || '', eldest_age: cv.eldest_age || '', youngest_age: cv.youngest_age || '',
        education_level: cv.education_level || 'highschool', school_name: cv.school_name || '', school_address: cv.school_address || '',
        has_seafaring_exp: !!cv.has_seafaring_exp,
        ship_experiences: cv.ship_experiences?.length > 0 ? cv.ship_experiences : [{ ship_name: '', period: '', ship_nationality: '', type: '' }],
        pushups: cv.pushups || '', situps: cv.situps || '', right_balance: cv.right_balance || '합격', forward_bend: cv.forward_bend || '합격',
        backward_bend: cv.backward_bend || '합격', hanging_seconds: cv.hanging_seconds || '', right_grip: cv.right_grip || '', left_grip: cv.left_grip || '',
        horse_stance_seconds: cv.horse_stance_seconds || '',
    });

    const showNotification = (type, title, message) => {
        const ok = type === 'success';
        const accent = ok ? '#BF9952' : '#ef4444';
        const el = document.createElement('div');
        el.style.cssText = `
            position:fixed;top:24px;right:24px;min-width:320px;max-width:400px;
            background:#fff;border:1px solid #e5e7eb;border-left:4px solid ${accent};
            border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.10);z-index:9999;
            font-family:'Poppins',sans-serif;overflow:hidden;
        `;
        el.innerHTML = `
            <div style="padding:16px 16px 14px;display:flex;align-items:flex-start;gap:12px;">
                <div style="width:38px;height:38px;background:${ok ? 'rgba(191,153,82,.12)' : 'rgba(239,68,68,.10)'};border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="${ok ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}"/>
                    </svg>
                </div>
                <div style="flex:1;padding-top:2px;">
                    <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${title}</p>
                    <p style="margin:4px 0 0;font-size:12.5px;color:#6b7280;">${message}</p>
                </div>
            </div>
            <div style="height:3px;background:#f3f4f6;">
                <div id="nb" style="height:100%;background:${accent};width:100%;transition:width 3s linear;"></div>
            </div>
        `;
        document.body.appendChild(el);
        setTimeout(() => { const b = el.querySelector('#nb'); if (b) b.style.width = '0%'; }, 50);
        setTimeout(() => el.remove(), 3200);
    };

    const compressImage = (base64, maxSize = 800, quality = 0.90) => new Promise(resolve => {
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

    const handleInput = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handlePhysPhoto = async (key, e) => {
        const file = e.target.files[0]; if (!file) return;
        const rd = new FileReader();
        rd.onload = async (ev) => {
            const compressed = await compressImage(ev.target.result, 600);
            setPhysPhotos(prev => ({ ...prev, [key]: compressed }));
        };
        rd.readAsDataURL(file);
    };

    const handleShipChange = (idx, field, value) => setFormData(prev => ({
        ...prev,
        ship_experiences: prev.ship_experiences.map((s, i) => i === idx ? { ...s, [field]: value } : s)
    }));

    const addShip = () => setFormData(prev => ({ ...prev, ship_experiences: [...prev.ship_experiences, { ship_name: '', period: '', ship_nationality: '', type: '' }] }));
    const removeShip = (idx) => setFormData(prev => ({ ...prev, ship_experiences: prev.ship_experiences.filter((_, i) => i !== idx) }));

    const generateKoreaCVHTML = (data, photo, logo, pp) => {
        const cb = (c) => c ? '&#9632;' : '&#9633;';
        const age = (d) => {
            if (!d) return '';
            return Math.floor((new Date() - new Date(d)) / (1000 * 60 * 60 * 24 * 365.25));
        };
        const fmt = (d) => {
            if (!d) return '';
            const [y, m, dd] = d.split('-');
            return `${y}.${m}.${dd}`;
        };

        const eduLevels = [
            { key: 'elementary', label: '초졸' },
            { key: 'middle', label: '중졸' },
            { key: 'highschool', label: '고졸' },
            { key: 'diploma', label: '전문대졸' },
            { key: 'bachelor', label: '대졸' },
        ];

        const shipRows = data.ship_experiences && data.ship_experiences.some(s => s.ship_name)
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
               </tr>`;

        // ── LOGO: hanya render jika benar-benar base64
        const logoHTML = (logo && logo.startsWith('data:'))
            ? `<img src="${logo}" alt="LBS" style="width:68px;height:68px;object-fit:contain;display:block;"/>`
            : `<div style="width:68px;height:68px;border:2.5px solid #1a5276;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14pt;color:#1a5276;font-family:Arial,sans-serif;background:#eaf2fb;">LBS</div>`;

        // ── FOTO: hanya render <img> jika base64 valid, fallback ke box kosong bergaris
        const photoHTML = (photo && photo.startsWith('data:'))
            ? `<img src="${photo}" alt="Foto" style="width:100%;height:100%;min-height:148px;object-fit:cover;object-position:top center;display:block;"/>`
            : `<div style="width:100%;min-height:148px;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f5f5f5;">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                <span style="margin-top:5px;font-size:7.5pt;color:#bbb;font-family:Arial;">사진</span>
               </div>`;

        return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>이력서 - ${data.full_name}</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body {
    font-family:'Malgun Gothic','Apple SD Gothic Neo','나눔고딕',Arial,sans-serif;
    font-size:8.5pt; color:#000; background:#fff;
}
@page { size:A4 portrait; margin:6mm 8mm; }

.page {
    width:194mm;
    margin:0 auto;
    padding:0;
}
.page2 { page-break-before:always; padding-top:6px; }

/* ── KOP ── */
.kop { display:table; width:100%; padding-bottom:3px; }
.kop-logo { display:table-cell; width:72px; vertical-align:middle; padding-right:6px; }
.kop-body { display:table-cell; vertical-align:middle; text-align:center; }
.kop-code { display:table-cell; width:66px; vertical-align:middle; }
.company-name  { font-size:12.5pt; font-weight:900; letter-spacing:0.2px; margin-bottom:0px; }
.company-sub   { font-size:8pt; font-weight:700; margin-bottom:2px; }
.company-addr  { font-size:6.5pt; line-height:1.6; color:#222; }
.company-email { font-size:6.5pt; color:#0000cc; text-decoration:underline; }
.kop-code-box  {
    border:1.5px solid #333; padding:4px 3px; font-size:7.5pt;
    text-align:center; font-weight:700; min-height:40px;
    display:flex; align-items:center; justify-content:center;
}

/* ── Double Black line ── */
.double-line { 
    border-top: 3px solid #000;
    border-bottom: 1px solid #000;
    height: 3px;
    margin: 4px 0 8px;
}

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

table.main td {
    border:1px solid #000;
    padding:2px 5px;
    vertical-align:middle;
    font-size:8pt;
    line-height:1.35;
    word-wrap:break-word;
}
.lc {
    background:#e0e0e0; font-weight:700;
    text-align:center; white-space:nowrap; font-size:7.5pt;
}

/* ── Photo cell: stretch penuh rowspan ── */
.photo-cell {
    border:1px solid #000 !important;
    padding:0 !important;
    overflow:hidden;
    vertical-align:stretch;
}
.photo-cell > img,
.photo-cell > div {
    width:100%;
    height:100%;
    min-height:148px;
    display:block;
}
.photo-cell > img {
    object-fit:cover;
}
.photo-cell > div {
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    background:#f5f5f5;
}

/* ── Green separator row ── */
tr.green-row td {
    background:#2e7d32 !important; height:12px !important;
    padding:0 !important; border:none !important;
}

/* ── Judul ── */
.judul-cell {
    border:none !important; background:none !important;
    text-align:center; padding:5px 0 3px;
    font-size:24pt; font-weight:900; letter-spacing:15px;
    font-family:'Malgun Gothic','Apple SD Gothic Neo',Arial,sans-serif;
}
.code-cell {
    border:none !important; background:none !important;
    padding:0 0 3px 0 !important; vertical-align:bottom;
}

/* ── Page 2 ── */
table.phys { width:100%; border-collapse:collapse; margin-top:8px; }
table.phys th {
    background:#e0e0e0; border:1px solid #000; padding:4px 2px;
    font-weight:700; font-size:7pt; text-align:center; line-height:1.4;
}
table.phys td {
    border:1px solid #000; padding:5px 3px;
    text-align:center; font-size:8.5pt; font-weight:600; vertical-align:middle;
}

.photo-big-wrap { border:1.5px solid #999; width:100%; }
.photo-big-row  { display:table; width:100%; table-layout:fixed; }
.photo-big-cell {
    display:table-cell; width:33.33%; vertical-align:top;
    border-right:1px solid #bbb; padding:6px; text-align:center;
}
.photo-big-cell:last-child { border-right:none; }
.photo-big-cell img {
    width:100%; height:320px; object-fit:cover; object-position:top center; display:block; border:1px solid #ccc;
}
.photo-big-cell .ph-empty {
    width:100%; height:320px; border:1px dashed #ccc;
    display:flex; align-items:center; justify-content:center;
    color:#bbb; font-size:8.5pt; background:#fafafa;
}
.photo-big-label {
    display:block; font-size:7.5pt; font-weight:600;
    color:#444; margin-bottom:4px; letter-spacing:.3px;
}
</style>
</head>
<body>

<!-- ════ HALAMAN 1 ════ -->
<div class="page">

    <!-- KOP -->
    <div class="kop">
        <div class="kop-logo">${logoHTML}</div>
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
        <div class="kop-code">
            <div class="kop-code-box">순번</div>
        </div>
    </div>

    <!-- DOUBLE LINE -->
    <div class="double-line"></div>

    <!-- MAIN TABLE -->
    <table class="main">
        <colgroup>
            <col/><col/><col/><col/>
            <col/><col/><col/><col/>
        </colgroup>

        <!-- Row 0: Title & Code -->
        <tr>
            <td colspan="8" style="padding: 10px 0 15px; position: relative;">
                <div class="judul-cell" style="margin: 0 auto; display: inline-block; width: 100%; text-align: center;">이 력 서</div>
                <div style="position: absolute; right: 0; bottom: 0; width: 115px; border: 1.5px solid #000; 
                    background: #fff; text-align: left; padding: 4px 8px; font-weight: bold; font-size: 11pt;">
                    코드 code:
                </div>
            </td>
        </tr>

        <!-- Row 1: 성명 + Photo rowspan=6 -->
        <tr>
            <td class="lc">성명</td>
            <td colspan="6">
                <span style="font-size:9.5pt;font-weight:700;letter-spacing:.5px;">${data.full_name || ''}</span>
                ${data.korean_name ? `<br><span style="font-size:8pt;color:#444;">${data.korean_name}</span>` : ''}
            </td>
            <td class="photo-cell" rowspan="6">${photoHTML}</td>
        </tr>

        <!-- Row 2: 생년월일 / 성별 -->
        <tr>
            <td class="lc" style="font-size:8.5pt;">생년월일</td>
            <td colspan="2" style="text-align:center;">${fmt(data.date_of_birth)}</td>
            <td class="lc" style="font-size:7.5pt;">${age(data.date_of_birth) ? age(data.date_of_birth) + ' 살' : ''}</td>
            <td class="lc">성별</td>
            <td style="text-align:center;">${cb(data.gender === 'male')}&nbsp;남</td>
            <td style="text-align:center;">${cb(data.gender === 'female')}&nbsp;여</td>
        </tr>

        <!-- Row 3: 주소 -->
        <tr>
            <td class="lc">주소</td>
            <td colspan="6" style="font-size:8pt;">${(data.address || '').toUpperCase()}</td>
        </tr>

        <!-- Row 4: 키 / 몸무게 -->
        <tr>
            <td class="lc">키</td>
            <td colspan="3" style="text-align:center;">${data.height ? data.height : ''}</td>
            <td class="lc">몸무게</td>
            <td colspan="2" style="text-align:center;">${data.weight ? data.weight : ''}</td>
        </tr>

        <!-- Row 5 & 6: 주민등록번호 / 국적 / 종교 -->
        <tr>
            <td class="lc" rowspan="2" style="font-size:7.5pt;">주민등록번호</td>
            <td colspan="3" rowspan="2" style="text-align:center;">${data.id_number || ''}</td>
            <td class="lc" style="font-size:7.5pt;">국적</td>
            <td colspan="2" style="text-align:center;">${data.nationality_korean || '인도네시아'}</td>
        </tr>
        <tr>
            <td class="lc" style="font-size:7.5pt;">종교</td>
            <td colspan="2" style="text-align:center;">${data.religion_korean || '이슬람'}</td>
        </tr>

        <!-- GREEN SEPARATOR -->
        <tr class="green-row"><td colspan="8"></td></tr>

        <!-- 학력 -->
        <tr>
            <td class="lc">학력</td>
            <td colspan="7">
                ${eduLevels.map(e => `${cb(data.education_level === e.key)}&nbsp;${e.label}`).join('&nbsp;&nbsp;&nbsp;')}
            </td>
        </tr>

        <!-- 학교명 -->
        <tr>
            <td class="lc">학교명</td>
            <td colspan="7">${(data.school_name || '').toUpperCase()}</td>
        </tr>

        <!-- 학교주소 -->
        <tr>
            <td class="lc">학교주소</td>
            <td colspan="7">${(data.school_address || '').toUpperCase()}</td>
        </tr>

        <!-- 혼인상태 -->
        <tr>
            <td class="lc">혼인상태</td>
            <td colspan="2" style="text-align:center;">${cb(data.marital_status === 'single')}&nbsp;미혼</td>
            <td colspan="2" style="text-align:center;">${cb(data.marital_status === 'married')}&nbsp;기혼</td>
            <td style="text-align:center;">${cb(data.marital_status === 'divorced')}&nbsp;이혼</td>
            <td colspan="2" style="text-align:center;">${cb(data.marital_status === 'widowed')}&nbsp;유가족</td>
        </tr>

        <!-- 아버지 -->
        <tr>
            <td class="lc">아버지 성명</td>
            <td style="font-size:8pt;">${(data.father_name || '').toUpperCase()}</td>
            <td class="lc">생년</td>
            <td>${data.father_birth_year || ''}</td>
            <td class="lc">직업</td>
            <td>${data.father_occupation || ''}</td>
            <td colspan="2" style="font-size:7.5pt;">연락처&nbsp;${data.father_phone || ''}</td>
        </tr>

        <!-- 어머니 -->
        <tr>
            <td class="lc">어머니 성명</td>
            <td style="font-size:8pt;">${(data.mother_name || '').toUpperCase()}</td>
            <td class="lc">생년</td>
            <td>${data.mother_birth_year || ''}</td>
            <td class="lc">직업</td>
            <td>${data.mother_occupation || ''}</td>
            <td colspan="2" style="font-size:7.5pt;">연락처&nbsp;${data.mother_phone || ''}</td>
        </tr>

        <!-- 배우자 -->
        <tr>
            <td class="lc">배우자 성명</td>
            <td style="font-size:8pt;">${data.spouse_name || '-'}</td>
            <td class="lc">생년</td>
            <td>${data.spouse_birth_year || '-'}</td>
            <td class="lc">직업</td>
            <td>${data.spouse_occupation || '-'}</td>
            <td colspan="2" style="font-size:7.5pt;">연락처&nbsp;${data.spouse_phone || '-'}</td>
        </tr>

        <!-- 자녀 -->
        <tr>
            <td class="lc">자녀</td>
            <td>${data.children_count || '0'}&nbsp;명</td>
            <td class="lc" colspan="2" style="font-size:7.5pt;">맏이나이</td>
            <td>${data.eldest_age || '-'}</td>
            <td class="lc">막내나이</td>
            <td colspan="2">${data.youngest_age || '-'}</td>
        </tr>

        <!-- 눈 / 바른손 -->
        <tr>
            <td class="lc">눈</td>
            <td>${data.vision || '10/10'}</td>
            <td class="lc">바른손</td>
            <td colspan="5">
                ${cb(data.dominant_hand === 'right')}&nbsp;오른손&nbsp;&nbsp;&nbsp;&nbsp;
                ${cb(data.dominant_hand === 'left')}&nbsp;왼손
            </td>
        </tr>

        <!-- 문신 / 수술 -->
        <tr>
            <td class="lc">문신</td>
            <td colspan="2">${cb(data.tattoo)}&nbsp;있음&nbsp;&nbsp;${cb(!data.tattoo)}&nbsp;없음</td>
            <td class="lc">수술</td>
            <td colspan="4">${cb(data.surgery)}&nbsp;있음&nbsp;&nbsp;${cb(!data.surgery)}&nbsp;없음</td>
        </tr>

        <!-- 승선경험 -->
        <tr>
            <td class="lc" style="font-size:7.5pt;">외국에서<br>승선 경험?</td>
            <td colspan="2">${cb(data.has_seafaring_exp)}&nbsp;있음&nbsp;&nbsp;${cb(!data.has_seafaring_exp)}&nbsp;없음</td>
            <td class="lc">승선기간</td>
            <td colspan="4"></td>
        </tr>

        <!-- Ship header -->
        <tr>
            <td class="lc">선명</td>
            <td colspan="2" style="text-align:center;font-weight:700;font-size:8pt;background:#e0e0e0;">기간</td>
            <td colspan="2" style="text-align:center;font-weight:700;font-size:8pt;background:#e0e0e0;">해외국적</td>
            <td colspan="3" style="text-align:center;font-weight:700;font-size:8pt;background:#e0e0e0;">종류</td>
        </tr>

        ${shipRows}

        <!-- 평가 -->
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

        <!-- 합격점수 -->
        <tr>
            <td colspan="8" style="text-align:center;font-size:16pt;font-weight:900;
                padding:10px 8px;background:#f0f0f0;letter-spacing:5px;">
                합 격 점 수
            </td>
        </tr>
    </table>
</div>

<!-- ════ HALAMAN 2 ════ -->
<div class="page page2">

    <!-- 3 Foto tes fisik -->
    <div class="photo-big-wrap">
        <div class="photo-big-row">
            <div class="photo-big-cell">
                <span class="photo-big-label">사진 1</span>
                ${pp?.wajah && pp.wajah.startsWith('data:')
                ? `<img src="${pp.wajah}" alt="Wajah"/>`
                : `<div class="ph-empty"></div>`}
            </div>
            <div class="photo-big-cell">
                <span class="photo-big-label">사진 2</span>
                ${pp?.tangan && pp.tangan.startsWith('data:')
                ? `<img src="${pp.tangan}" alt="Tangan"/>`
                : `<div class="ph-empty"></div>`}
            </div>
            <div class="photo-big-cell">
                <span class="photo-big-label">사진 3</span>
                ${pp?.badan && pp.badan.startsWith('data:')
                ? `<img src="${pp.badan}" alt="Badan"/>`
                : `<div class="ph-empty"></div>`}
            </div>
        </div>
    </div>

    <!-- Tabel nilai fisik -->
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
</div>

</body>
</html>`;
    };

    const previewCV = () => {
        const html = generateKoreaCVHTML(formData, photoData, logoData, physPhotos);
        const w = window.open('', '_blank');
        if (!w) return;
        w.document.open();
        w.document.write(html);
        w.document.close();
    };

    const saveChanges = async () => {
        if (!formData.full_name.trim()) {
            showNotification('error', 'Validasi Gagal', 'Nama wajib diisi!');
            return;
        }
        setIsGenerating(true);
        const dataToSubmit = { ...formData, photo: photoData, ...physPhotos, _method: 'PUT' };
        
        router.post(`/dashboard/korea/${cv.id}`, dataToSubmit, {
            preserveScroll: true,
            onSuccess: () => {
                showNotification('success', 'Berhasil', 'CV Korea berhasil diupdate');
                setIsGenerating(false);
                setTimeout(() => router.visit(`/dashboard/korea/${cv.id}`), 1000);
            },
            onError: () => {
                showNotification('error', 'Gagal', 'Terjadi kesalahan saat menyimpan data');
                setIsGenerating(false);
            }
        });
    };

    const nextStep = () => { if (currentStep < 5) setCurrentStep(s => s + 1); };
    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(s => s - 1);
        else router.visit(`/dashboard/korea/${cv.id}`);
    };

    const stepLabels = ['Profil', 'Fisik & Status', 'Keluarga', 'Pendidikan', 'Tes Fisik'];

    const formStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(.95)}       to{opacity:1;transform:scale(1)}      }
        .animate-fade-in-up { animation:fadeInUp .6s ease-out; }
        .animate-scale-in   { animation:scaleIn  .5s ease-out; }
        .form-input { width:100%;padding:11px 14px;border:2px solid #d1d5db;border-radius:8px;font-size:14px;transition:all .3s;background:white;font-family:'Poppins',sans-serif;outline:none; }
        .form-input:focus { border-color:#BF9952;box-shadow:0 0 0 3px rgba(191,153,82,.1); }
        .btn-gold { background:linear-gradient(135deg,#BF9952,#D4AF6A);transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 4px 15px rgba(191,153,82,.3); }
        .btn-gold:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 8px 25px rgba(191,153,82,.4); }
        .btn-gold:disabled { opacity:.6;cursor:not-allowed; }
        .btn-back { background:white;border:2px solid #e5e7eb;border-radius:12px;padding:10px 20px;transition:all .3s;cursor:pointer; }
        .btn-back:hover { border-color:#BF9952;transform:translateX(-4px); }
        .step-dot { width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;transition:all .3s; }
        .step-dot.active   { background:linear-gradient(135deg,#BF9952,#D4AF6A);color:white;box-shadow:0 4px 12px rgba(191,153,82,.4); }
        .step-dot.done     { background:#1a1a1a;color:white; }
        .step-dot.inactive { background:#f3f4f6;color:#9ca3af;border:2px solid #e5e7eb; }
        .step-line      { flex:1;max-width:40px;height:2px;background:#e5e7eb; }
        .step-line.done { background:#1a1a1a; }
        .section-label { font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:#BF9952;margin-bottom:14px;margin-top:24px; }
        .card-inner { background:#f9fafb;border:2px solid #f3f4f6;border-radius:12px;padding:16px; }
        .remove-btn { padding:4px 10px;background:#fee2e2;color:#dc2626;border-radius:6px;font-size:12px;border:none;cursor:pointer; }
        .remove-btn:hover { background:#fecaca; }
        .toggle-btn { flex:1;padding:10px;border-radius:8px;border:2px solid #e5e7eb;background:white;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;font-family:'Poppins',sans-serif; }
        .toggle-btn.active { border-color:#BF9952;background:rgba(191,153,82,.08);color:#BF9952;font-weight:600; }
        .phys-photo-box { border:2px dashed #d1d5db;border-radius:12px;cursor:pointer;transition:all .3s;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f9fafb;overflow:hidden;position:relative; }
        .phys-photo-box:hover  { border-color:#BF9952;background:#fffbf0; }
        .phys-photo-box.filled { border-style:solid;border-color:#BF9952;padding:0; }
        .phys-photo-box.filled img { width:100%;height:100%;object-fit:cover;display:block;position:absolute;top:0;left:0; }
    `;

    const radioToggle = (name, value, label) => (
        <button type="button"
            className={`toggle-btn ${formData[name] === value ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, [name]: value }))}>
            {label}
        </button>
    );

    const PhysPhotoBox = ({ photoKey, label }) => (
        <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 8, textAlign: 'center' }}>{label}</p>
            <div className={`phys-photo-box ${physPhotos[photoKey] ? 'filled' : ''}`} style={{ height: 170 }}
                onClick={() => physRefs[photoKey].current?.click()}>
                {physPhotos[photoKey]
                    ? <img src={physPhotos[photoKey]} alt={label} />
                    : <>
                        <svg style={{ width: 32, height: 32, color: '#d1d5db', marginBottom: 8 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Klik untuk upload</p>
                    </>
                }
            </div>
            {physPhotos[photoKey] && (
                <button onClick={(e) => { e.stopPropagation(); setPhysPhotos(prev => ({ ...prev, [photoKey]: null })); }}
                    style={{ width: '100%', marginTop: 4, fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Hapus foto
                </button>
            )}
            <input ref={physRefs[photoKey]} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => handlePhysPhoto(photoKey, e)} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <style>{formStyles}</style>

            <div className="bg-white border-b shadow-sm animate-fade-in-up">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <img src={headerLogo} alt="Loring Margi" style={{ height: 48, objectFit: 'contain' }} />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <button onClick={prevStep} className="btn-back flex items-center gap-2 text-gray-700 font-bold mb-6">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Kembali
                </button>

                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-scale-in">

                    {/* Step Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
                        {stepLabels.map((label, i) => {
                            const step = i + 1;
                            const state = step === currentStep ? 'active' : step < currentStep ? 'done' : 'inactive';
                            return (
                                <React.Fragment key={step}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div className={`step-dot ${state}`}>{step < currentStep ? '✓' : step}</div>
                                        <div style={{ fontSize: 9, marginTop: 4, color: state === 'active' ? '#BF9952' : '#9ca3af', fontWeight: state === 'active' ? 600 : 400 }}>{label}</div>
                                    </div>
                                    {i < stepLabels.length - 1 && <div className={`step-line ${step < currentStep ? 'done' : ''}`} />}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* ── STEP 1 ── */}
                    {currentStep === 1 && (<>
                        <h1 className="text-3xl font-bold mb-1">Profil Dasar</h1>
                        <p className="text-gray-500 mb-6">Step 1 — Informasi personal</p>
                        <div className="section-label">Nama</div>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-semibold mb-2">Nama Lengkap (Latin) *</label><input type="text" name="full_name" value={formData.full_name} onChange={handleInput} className="form-input" placeholder="AJI BAKHRUL ULUM" /></div>
                            <div><label className="block text-sm font-semibold mb-2">Nama Korea <span className="font-normal text-gray-400">— opsional</span></label><input type="text" name="korean_name" value={formData.korean_name} onChange={handleInput} className="form-input" placeholder="아지 바크룰 울룸" /></div>
                        </div>
                        <div className="section-label">Data Diri</div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-semibold mb-2">Tanggal Lahir</label><input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInput} className="form-input" /></div>
                                <div><label className="block text-sm font-semibold mb-2">Jenis Kelamin</label><div style={{ display: 'flex', gap: 8 }}>{radioToggle('gender', 'male', '남 Pria')}{radioToggle('gender', 'female', '여 Wanita')}</div></div>
                            </div>
                            <div><label className="block text-sm font-semibold mb-2">Alamat Lengkap</label><textarea name="address" value={formData.address} onChange={handleInput} className="form-input" rows="3" placeholder="Nama desa, RT/RW, Kecamatan, Kabupaten, Provinsi" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-semibold mb-2">No. KTP / NIK</label><input type="text" name="id_number" value={formData.id_number} onChange={handleInput} className="form-input" placeholder="16 digit NIK" maxLength={16} /></div>
                                <div><label className="block text-sm font-semibold mb-2">Agama (종교)</label><select name="religion" value={formData.religion} onChange={handleInput} className="form-input">{['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map(r => <option key={r}>{r}</option>)}</select></div>
                            </div>
                        </div>
                        <div className="section-label">Foto Profil (사진)</div>
                        <button onClick={() => document.getElementById('photo-profil-korea').click()} className="w-full py-3 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition font-medium">
                            {photoData ? '✓ Foto dipilih — klik untuk ganti' : '📷 Upload Foto Profil (3×4 atau 4×6)'}
                        </button>
                        <input id="photo-profil-korea" type="file" className="hidden" accept="image/*" onChange={async (e) => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = async ev => { setPhotoData(await compressImage(ev.target.result, 400, .92)) }; rd.readAsDataURL(f); }} />
                        {photoData && (<div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={photoData} alt="Preview" style={{ width: 72, height: 90, objectFit: 'cover', borderRadius: 8, border: '2px solid #d1d5db' }} />
                            <div><p style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Foto berhasil diupload</p><p style={{ fontSize: 12, color: '#6b7280' }}>Akan tampil di CV sebagai foto 3×4</p></div>
                        </div>)}
                    </>)}

                    {/* ── STEP 2 ── */}
                    {currentStep === 2 && (<>
                        <h1 className="text-3xl font-bold mb-1">Fisik & Status</h1>
                        <p className="text-gray-500 mb-6">Step 2 — Data fisik dan status pernikahan</p>
                        <div className="section-label">Data Fisik</div>
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="block text-sm font-semibold mb-2">Tinggi (키) cm</label><input type="text" name="height" value={formData.height} onChange={handleInput} className="form-input" placeholder="161" /></div>
                            <div><label className="block text-sm font-semibold mb-2">Berat (몸무게) kg</label><input type="text" name="weight" value={formData.weight} onChange={handleInput} className="form-input" placeholder="49" /></div>
                            <div><label className="block text-sm font-semibold mb-2">Penglihatan (눈)</label><input type="text" name="vision" value={formData.vision} onChange={handleInput} className="form-input" placeholder="10/10" /></div>
                        </div>
                        <div className="section-label">Tangan Dominan (바른손)</div>
                        <div style={{ display: 'flex', gap: 8 }}>{radioToggle('dominant_hand', 'right', '오른손 Kanan')}{radioToggle('dominant_hand', 'left', '왼손 Kiri')}</div>
                        <div className="section-label">Kondisi Fisik</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-semibold mb-2">Tato (문신)</label><div style={{ display: 'flex', gap: 8 }}>{radioToggle('tattoo', true, '있음 Ada')}{radioToggle('tattoo', false, '없음 Tidak')}</div></div>
                            <div><label className="block text-sm font-semibold mb-2">Operasi (수술)</label><div style={{ display: 'flex', gap: 8 }}>{radioToggle('surgery', true, '있음 Ada')}{radioToggle('surgery', false, '없음 Tidak')}</div></div>
                        </div>
                        <div className="section-label">Status Pernikahan (혼인상태)</div>
                        <div className="grid grid-cols-2 gap-3">
                            {[{ val: 'single', label: '미혼 Belum Menikah' }, { val: 'married', label: '기혼 Menikah' }, { val: 'divorced', label: '이혼 Cerai' }, { val: 'widowed', label: '유가족 Janda/Duda' }].map(m => (
                                <button key={m.val} type="button" className={`toggle-btn ${formData.marital_status === m.val ? 'active' : ''}`} onClick={() => setFormData(p => ({ ...p, marital_status: m.val }))}>{m.label}</button>
                            ))}
                        </div>
                    </>)}

                    {/* ── STEP 3 ── */}
                    {currentStep === 3 && (<>
                        <h1 className="text-3xl font-bold mb-1">Data Keluarga</h1>
                        <p className="text-gray-500 mb-6">Step 3 — Informasi keluarga</p>
                        {[{ prefix: 'father', label: '아버지 Ayah' }, { prefix: 'mother', label: '어머니 Ibu' }, { prefix: 'spouse', label: '배우자 Pasangan' }].map(({ prefix, label }) => (
                            <div key={prefix} className="card-inner mb-4">
                                <p className="font-semibold text-sm text-gray-600 mb-3">{label}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" name={`${prefix}_name`} value={formData[`${prefix}_name`]} onChange={handleInput} className="form-input" placeholder="Nama / 성명" />
                                    <input type="text" name={`${prefix}_birth_year`} value={formData[`${prefix}_birth_year`]} onChange={handleInput} className="form-input" placeholder="Tahun Lahir / 생년" />
                                    <input type="text" name={`${prefix}_occupation`} value={formData[`${prefix}_occupation`]} onChange={handleInput} className="form-input" placeholder="Pekerjaan / 직업" />
                                    <input type="text" name={`${prefix}_phone`} value={formData[`${prefix}_phone`]} onChange={handleInput} className="form-input" placeholder="No. HP / 연락처" />
                                </div>
                            </div>
                        ))}
                        <div className="section-label">Anak (자녀)</div>
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="block text-sm font-semibold mb-2">Jumlah Anak</label><input type="text" name="children_count" value={formData.children_count} onChange={handleInput} className="form-input" placeholder="0" /></div>
                            <div><label className="block text-sm font-semibold mb-2">Usia Sulung (맏이)</label><input type="text" name="eldest_age" value={formData.eldest_age} onChange={handleInput} className="form-input" placeholder="-" /></div>
                            <div><label className="block text-sm font-semibold mb-2">Usia Bungsu (막내)</label><input type="text" name="youngest_age" value={formData.youngest_age} onChange={handleInput} className="form-input" placeholder="-" /></div>
                        </div>
                    </>)}

                    {/* ── STEP 4 ── */}
                    {currentStep === 4 && (<>
                        <h1 className="text-3xl font-bold mb-1">Pendidikan & Pengalaman</h1>
                        <p className="text-gray-500 mb-6">Step 4 — Riwayat pendidikan dan kapal</p>
                        <div className="section-label">Tingkat Pendidikan (학력)</div>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[{ val: 'elementary', label: '초졸 SD' }, { val: 'middle', label: '중졸 SMP' }, { val: 'highschool', label: '고졸 SMA/SMK' }, { val: 'diploma', label: '전문대졸 D3' }, { val: 'bachelor', label: '대졸 S1' }].map(e => (
                                <button key={e.val} type="button" className={`toggle-btn ${formData.education_level === e.val ? 'active' : ''}`} onClick={() => setFormData(p => ({ ...p, education_level: e.val }))}>{e.label}</button>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <input type="text" name="school_name" value={formData.school_name} onChange={handleInput} className="form-input" placeholder="Nama Sekolah / 학교명" />
                            <input type="text" name="school_address" value={formData.school_address} onChange={handleInput} className="form-input" placeholder="Kota – Provinsi / 학교주소" />
                        </div>
                        <div className="section-label">Pengalaman Kapal (승선 경험)</div>
                        <div style={{ display: 'flex', gap: 8 }} className="mb-4">{radioToggle('has_seafaring_exp', false, '없음 Tidak Ada')}{radioToggle('has_seafaring_exp', true, '있음 Ada')}</div>
                        {formData.has_seafaring_exp && (
                            <div className="space-y-4">
                                {formData.ship_experiences.map((ship, idx) => (
                                    <div key={idx} className="card-inner">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-semibold text-sm text-gray-600">Kapal #{idx + 1}</span>
                                            {formData.ship_experiences.length > 1 && <button className="remove-btn" onClick={() => removeShip(idx)}>Hapus</button>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" value={ship.ship_name} onChange={e => handleShipChange(idx, 'ship_name', e.target.value)} className="form-input" placeholder="Nama Kapal / 선명" />
                                            <input type="text" value={ship.period} onChange={e => handleShipChange(idx, 'period', e.target.value)} className="form-input" placeholder="Periode (2020-2024)" />
                                            <input type="text" value={ship.ship_nationality} onChange={e => handleShipChange(idx, 'ship_nationality', e.target.value)} className="form-input" placeholder="Kewarganegaraan / 해외국적" />
                                            <input type="text" value={ship.type} onChange={e => handleShipChange(idx, 'type', e.target.value)} className="form-input" placeholder="Jenis / 종류" />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addShip} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                    Tambah Kapal
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        )}
                    </>)}

                    {/* ── STEP 5 ── */}
                    {currentStep === 5 && (<>
                        <h1 className="text-3xl font-bold mb-1">Hasil Tes Fisik</h1>
                        <p className="text-gray-500 mb-6">Step 5 — 신체 검사 결과 (Edit)</p>
                        <div className="section-label">Nilai Tes</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                            {[
                                { name: 'pushups', label: '팔굽펴기', unit: '회' },
                                { name: 'situps', label: '윗몸일으키기', unit: '회' },
                                { name: 'right_balance', label: '오른발균형', unit: '' },
                                { name: 'forward_bend', label: '앞구부리기', unit: '' },
                                { name: 'backward_bend', label: '뒤로구부리기', unit: '' },
                                { name: 'hanging_seconds', label: '매달리기', unit: '초' },
                                { name: 'right_grip', label: '오른손악력', unit: '' },
                                { name: 'left_grip', label: '왼손악력', unit: '' },
                                { name: 'horse_stance_seconds', label: '기마자세', unit: '초' },
                            ].map(({ name, label, unit }) => (
                                <div key={name}>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 leading-tight">{label}</label>
                                    <div className="flex items-center gap-1">
                                        <input type="text" name={name} value={formData[name]} onChange={handleInput} className="form-input" placeholder="-" />
                                        {unit && <span className="text-sm text-gray-400 whitespace-nowrap">{unit}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="section-label">📸 Foto Tes Fisik — Halaman 2</div>
                        <p className="text-xs text-gray-400 mb-5">Upload 3 foto tes fisik. Akan tampil di halaman 2 PDF.</p>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
                            <PhysPhotoBox photoKey="wajah" label="사진 1 — Foto Wajah" />
                            <PhysPhotoBox photoKey="tangan" label="사진 2 — Foto Tangan" />
                            <PhysPhotoBox photoKey="badan" label="사진 3 — Foto Badan" />
                        </div>
                        <div className="space-y-3">
                            <button onClick={saveChanges} disabled={isGenerating} className="w-full py-4 btn-gold text-white rounded-lg font-semibold flex items-center justify-center gap-2">
                                {isGenerating
                                    ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> Generating PDF...</>
                                    : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg> Download 이력서 PDF</>
                                }
                            </button>
                            
                        </div>
                    </>)}

                    {currentStep < 5 && (
                        <button onClick={nextStep} className="w-full mt-10 py-4 btn-gold text-white rounded-lg font-semibold flex items-center justify-center gap-2">
                            Selanjutnya
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    )}
                </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg,#BF9952,#D4AF6A,#BF9952)', color: 'white', textAlign: 'center', padding: '28px 24px', marginTop: 'auto' }}>
                <p style={{ fontSize: 13, fontWeight: 300, marginBottom: 4 }}>Copyright © 2025 Loring Margi International</p>
                <p style={{ fontSize: 12, opacity: .9 }}>Powered by <span style={{ fontWeight: 600 }}>CyberLabs</span></p>
            </div>
        </div>
    );
};

export default CVEditKorea;