import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const CVDetailKorea = ({ cv }) => {
    const headerLogo = '/storage/logo/LoringMargi.png';
    const [photoData, setPhotoData] = useState(null);
    const [logoData, setLogoData] = useState(null);
    const [physPhotos, setPhysPhotos] = useState({ wajah: null, tangan: null, badan: null });

    useEffect(() => {
        fetch('/images/Logo.png')
            .then(r => r.blob())
            .then(b => {
                const rd = new FileReader();
                rd.onloadend = () => setLogoData(rd.result);
                rd.readAsDataURL(b);
            })
            .catch(() => { });

        if (cv.photo_path) {
            fetch(`/storage/${cv.photo_path}`)
                .then(r => r.blob())
                .then(b => {
                    const rd = new FileReader();
                    rd.onloadend = () => setPhotoData(rd.result);
                    rd.readAsDataURL(b);
                }).catch(()=>{});
        }
        
        // Fisik photos
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
            { key: 'elementary', label: 'Ã¬Â´Ë†Ã¬Â¡Â¸' },
            { key: 'middle', label: 'Ã¬Â¤â€˜Ã¬Â¡Â¸' },
            { key: 'highschool', label: 'ÃªÂ³Â Ã¬Â¡Â¸' },
            { key: 'diploma', label: 'Ã¬Â â€žÃ«Â¬Â¸Ã«Å’â‚¬Ã¬Â¡Â¸' },
            { key: 'bachelor', label: 'Ã«Å’â‚¬Ã¬Â¡Â¸' },
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

        // Ã¢â€â‚¬Ã¢â€â‚¬ LOGO: hanya render jika benar-benar base64
        const logoHTML = (logo && logo.startsWith('data:'))
            ? `<img src="${logo}" alt="LBS" style="width:68px;height:68px;object-fit:contain;display:block;"/>`
            : `<div style="width:68px;height:68px;border:2.5px solid #1a5276;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14pt;color:#1a5276;font-family:Arial,sans-serif;background:#eaf2fb;">LBS</div>`;

        // Ã¢â€â‚¬Ã¢â€â‚¬ FOTO: hanya render <img> jika base64 valid, fallback ke box kosong bergaris
        const photoHTML = (photo && photo.startsWith('data:'))
            ? `<img src="${photo}" alt="Foto" style="width:100%;height:100%;min-height:148px;object-fit:cover;object-position:top center;display:block;"/>`
            : `<div style="width:100%;min-height:148px;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f5f5f5;">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                <span style="margin-top:5px;font-size:7.5pt;color:#bbb;font-family:Arial;">Ã¬â€šÂ¬Ã¬Â§â€ž</span>
               </div>`;

        return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>Ã¬ÂÂ´Ã«Â Â¥Ã¬â€žÅ“ - ${data.full_name}</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body {
    font-family:'Malgun Gothic','Apple SD Gothic Neo','Ã«â€šËœÃ«Ë†â€ÃªÂ³Â Ã«â€â€¢',Arial,sans-serif;
    font-size:8.5pt; color:#000; background:#fff;
}
@page { size:A4 portrait; margin:6mm 8mm; }

.page {
    width:194mm;
    margin:0 auto;
    padding:0;
}
.page2 { page-break-before:always; padding-top:6px; }

/* Ã¢â€â‚¬Ã¢â€â‚¬ KOP Ã¢â€â‚¬Ã¢â€â‚¬ */
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

/* Ã¢â€â‚¬Ã¢â€â‚¬ Double Black line Ã¢â€â‚¬Ã¢â€â‚¬ */
.double-line { 
    border-top: 3px solid #000;
    border-bottom: 1px solid #000;
    height: 3px;
    margin: 4px 0 8px;
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ MAIN TABLE Ã¢â€â‚¬Ã¢â€â‚¬ */
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

/* Ã¢â€â‚¬Ã¢â€â‚¬ Photo cell: stretch penuh rowspan Ã¢â€â‚¬Ã¢â€â‚¬ */
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

/* Ã¢â€â‚¬Ã¢â€â‚¬ Green separator row Ã¢â€â‚¬Ã¢â€â‚¬ */
tr.green-row td {
    background:#2e7d32 !important; height:12px !important;
    padding:0 !important; border:none !important;
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Judul Ã¢â€â‚¬Ã¢â€â‚¬ */
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

/* Ã¢â€â‚¬Ã¢â€â‚¬ Page 2 Ã¢â€â‚¬Ã¢â€â‚¬ */
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

<!-- Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â HALAMAN 1 Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â -->
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
            <div class="kop-code-box">Ã¬Ë†Å“Ã«Â²Ë†</div>
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
                <div class="judul-cell" style="margin: 0 auto; display: inline-block; width: 100%; text-align: center;">Ã¬ÂÂ´ Ã«Â Â¥ Ã¬â€žÅ“</div>
                <div style="position: absolute; right: 0; bottom: 0; width: 115px; border: 1.5px solid #000; 
                    background: #fff; text-align: left; padding: 4px 8px; font-weight: bold; font-size: 11pt;">
                    Ã¬Â½â€Ã«â€œÅ“ code:
                </div>
            </td>
        </tr>

        <!-- Row 1: Ã¬â€žÂ±Ã«Âªâ€¦ + Photo rowspan=6 -->
        <tr>
            <td class="lc">Ã¬â€žÂ±Ã«Âªâ€¦</td>
            <td colspan="6">
                <span style="font-size:9.5pt;font-weight:700;letter-spacing:.5px;">${data.full_name || ''}</span>
                ${data.korean_name ? `<br><span style="font-size:8pt;color:#444;">${data.korean_name}</span>` : ''}
            </td>
            <td class="photo-cell" rowspan="6">${photoHTML}</td>
        </tr>

        <!-- Row 2: Ã¬Æ’ÂÃ«â€¦â€žÃ¬â€ºâ€Ã¬ÂÂ¼ / Ã¬â€žÂ±Ã«Â³â€ž -->
        <tr>
            <td class="lc" style="font-size:8.5pt;">Ã¬Æ’ÂÃ«â€¦â€žÃ¬â€ºâ€Ã¬ÂÂ¼</td>
            <td colspan="2" style="text-align:center;">${fmt(data.date_of_birth)}</td>
            <td class="lc" style="font-size:7.5pt;">${age(data.date_of_birth) ? age(data.date_of_birth) + ' Ã¬â€šÂ´' : ''}</td>
            <td class="lc">Ã¬â€žÂ±Ã«Â³â€ž</td>
            <td style="text-align:center;">${cb(data.gender === 'male')}&nbsp;Ã«â€šÂ¨</td>
            <td style="text-align:center;">${cb(data.gender === 'female')}&nbsp;Ã¬â€”Â¬</td>
        </tr>

        <!-- Row 3: Ã¬Â£Â¼Ã¬â€ Å’ -->
        <tr>
            <td class="lc">Ã¬Â£Â¼Ã¬â€ Å’</td>
            <td colspan="6" style="font-size:8pt;">${(data.address || '').toUpperCase()}</td>
        </tr>

        <!-- Row 4: Ã­â€šÂ¤ / Ã«ÂªÂ¸Ã«Â¬Â´ÃªÂ²Å’ -->
        <tr>
            <td class="lc">Ã­â€šÂ¤</td>
            <td colspan="3" style="text-align:center;">${data.height ? data.height : ''}</td>
            <td class="lc">Ã«ÂªÂ¸Ã«Â¬Â´ÃªÂ²Å’</td>
            <td colspan="2" style="text-align:center;">${data.weight ? data.weight : ''}</td>
        </tr>

        <!-- Row 5 & 6: Ã¬Â£Â¼Ã«Â¯Â¼Ã«â€œÂ±Ã«Â¡ÂÃ«Â²Ë†Ã­ËœÂ¸ / ÃªÂµÂ­Ã¬Â Â / Ã¬Â¢â€¦ÃªÂµÂ -->
        <tr>
            <td class="lc" rowspan="2" style="font-size:7.5pt;">Ã¬Â£Â¼Ã«Â¯Â¼Ã«â€œÂ±Ã«Â¡ÂÃ«Â²Ë†Ã­ËœÂ¸</td>
            <td colspan="3" rowspan="2" style="text-align:center;">${data.id_number || ''}</td>
            <td class="lc" style="font-size:7.5pt;">ÃªÂµÂ­Ã¬Â Â</td>
            <td colspan="2" style="text-align:center;">${data.nationality_korean || 'Ã¬ÂÂ¸Ã«Ââ€žÃ«â€žÂ¤Ã¬â€¹Å“Ã¬â€¢â€ž'}</td>
        </tr>
        <tr>
            <td class="lc" style="font-size:7.5pt;">Ã¬Â¢â€¦ÃªÂµÂ</td>
            <td colspan="2" style="text-align:center;">${data.religion_korean || 'Ã¬ÂÂ´Ã¬Å Â¬Ã«Å¾Å’'}</td>
        </tr>

        <!-- GREEN SEPARATOR -->
        <tr class="green-row"><td colspan="8"></td></tr>

        <!-- Ã­â€¢â„¢Ã«Â Â¥ -->
        <tr>
            <td class="lc">Ã­â€¢â„¢Ã«Â Â¥</td>
            <td colspan="7">
                ${eduLevels.map(e => `${cb(data.education_level === e.key)}&nbsp;${e.label}`).join('&nbsp;&nbsp;&nbsp;')}
            </td>
        </tr>

        <!-- Ã­â€¢â„¢ÃªÂµÂÃ«Âªâ€¦ -->
        <tr>
            <td class="lc">Ã­â€¢â„¢ÃªÂµÂÃ«Âªâ€¦</td>
            <td colspan="7">${(data.school_name || '').toUpperCase()}</td>
        </tr>

        <!-- Ã­â€¢â„¢ÃªÂµÂÃ¬Â£Â¼Ã¬â€ Å’ -->
        <tr>
            <td class="lc">Ã­â€¢â„¢ÃªÂµÂÃ¬Â£Â¼Ã¬â€ Å’</td>
            <td colspan="7">${(data.school_address || '').toUpperCase()}</td>
        </tr>

        <!-- Ã­ËœÂ¼Ã¬ÂÂ¸Ã¬Æ’ÂÃ­Æ’Å“ -->
        <tr>
            <td class="lc">Ã­ËœÂ¼Ã¬ÂÂ¸Ã¬Æ’ÂÃ­Æ’Å“</td>
            <td colspan="2" style="text-align:center;">${cb(data.marital_status === 'single')}&nbsp;Ã«Â¯Â¸Ã­ËœÂ¼</td>
            <td colspan="2" style="text-align:center;">${cb(data.marital_status === 'married')}&nbsp;ÃªÂ¸Â°Ã­ËœÂ¼</td>
            <td style="text-align:center;">${cb(data.marital_status === 'divorced')}&nbsp;Ã¬ÂÂ´Ã­ËœÂ¼</td>
            <td colspan="2" style="text-align:center;">${cb(data.marital_status === 'widowed')}&nbsp;Ã¬Å“Â ÃªÂ°â‚¬Ã¬Â¡Â±</td>
        </tr>

        <!-- Ã¬â€¢â€žÃ«Â²â€žÃ¬Â§â‚¬ -->
        <tr>
            <td class="lc">Ã¬â€¢â€žÃ«Â²â€žÃ¬Â§â‚¬ Ã¬â€žÂ±Ã«Âªâ€¦</td>
            <td style="font-size:8pt;">${(data.father_name || '').toUpperCase()}</td>
            <td class="lc">Ã¬Æ’ÂÃ«â€¦â€ž</td>
            <td>${data.father_birth_year || ''}</td>
            <td class="lc">Ã¬Â§ÂÃ¬â€”â€¦</td>
            <td>${data.father_occupation || ''}</td>
            <td colspan="2" style="font-size:7.5pt;">Ã¬â€”Â°Ã«ÂÂ½Ã¬Â²Ëœ&nbsp;${data.father_phone || ''}</td>
        </tr>

        <!-- Ã¬â€“Â´Ã«Â¨Â¸Ã«â€¹Ë† -->
        <tr>
            <td class="lc">Ã¬â€“Â´Ã«Â¨Â¸Ã«â€¹Ë† Ã¬â€žÂ±Ã«Âªâ€¦</td>
            <td style="font-size:8pt;">${(data.mother_name || '').toUpperCase()}</td>
            <td class="lc">Ã¬Æ’ÂÃ«â€¦â€ž</td>
            <td>${data.mother_birth_year || ''}</td>
            <td class="lc">Ã¬Â§ÂÃ¬â€”â€¦</td>
            <td>${data.mother_occupation || ''}</td>
            <td colspan="2" style="font-size:7.5pt;">Ã¬â€”Â°Ã«ÂÂ½Ã¬Â²Ëœ&nbsp;${data.mother_phone || ''}</td>
        </tr>

        <!-- Ã«Â°Â°Ã¬Å¡Â°Ã¬Å¾Â -->
        <tr>
            <td class="lc">Ã«Â°Â°Ã¬Å¡Â°Ã¬Å¾Â Ã¬â€žÂ±Ã«Âªâ€¦</td>
            <td style="font-size:8pt;">${data.spouse_name || '-'}</td>
            <td class="lc">Ã¬Æ’ÂÃ«â€¦â€ž</td>
            <td>${data.spouse_birth_year || '-'}</td>
            <td class="lc">Ã¬Â§ÂÃ¬â€”â€¦</td>
            <td>${data.spouse_occupation || '-'}</td>
            <td colspan="2" style="font-size:7.5pt;">Ã¬â€”Â°Ã«ÂÂ½Ã¬Â²Ëœ&nbsp;${data.spouse_phone || '-'}</td>
        </tr>

        <!-- Ã¬Å¾ÂÃ«â€¦â‚¬ -->
        <tr>
            <td class="lc">Ã¬Å¾ÂÃ«â€¦â‚¬</td>
            <td>${data.children_count || '0'}&nbsp;Ã«Âªâ€¦</td>
            <td class="lc" colspan="2" style="font-size:7.5pt;">Ã«Â§ÂÃ¬ÂÂ´Ã«â€šËœÃ¬ÂÂ´</td>
            <td>${data.eldest_age || '-'}</td>
            <td class="lc">Ã«Â§â€°Ã«â€šÂ´Ã«â€šËœÃ¬ÂÂ´</td>
            <td colspan="2">${data.youngest_age || '-'}</td>
        </tr>

        <!-- Ã«Ë†Ë† / Ã«Â°â€Ã«Â¥Â¸Ã¬â€ Â -->
        <tr>
            <td class="lc">Ã«Ë†Ë†</td>
            <td>${data.vision || '10/10'}</td>
            <td class="lc">Ã«Â°â€Ã«Â¥Â¸Ã¬â€ Â</td>
            <td colspan="5">
                ${cb(data.dominant_hand === 'right')}&nbsp;Ã¬ËœÂ¤Ã«Â¥Â¸Ã¬â€ Â&nbsp;&nbsp;&nbsp;&nbsp;
                ${cb(data.dominant_hand === 'left')}&nbsp;Ã¬â„¢Â¼Ã¬â€ Â
            </td>
        </tr>

        <!-- Ã«Â¬Â¸Ã¬â€¹Â  / Ã¬Ë†ËœÃ¬Ë†Â  -->
        <tr>
            <td class="lc">Ã«Â¬Â¸Ã¬â€¹Â </td>
            <td colspan="2">${cb(data.tattoo)}&nbsp;Ã¬Å¾Ë†Ã¬ÂÅ’&nbsp;&nbsp;${cb(!data.tattoo)}&nbsp;Ã¬â€”â€ Ã¬ÂÅ’</td>
            <td class="lc">Ã¬Ë†ËœÃ¬Ë†Â </td>
            <td colspan="4">${cb(data.surgery)}&nbsp;Ã¬Å¾Ë†Ã¬ÂÅ’&nbsp;&nbsp;${cb(!data.surgery)}&nbsp;Ã¬â€”â€ Ã¬ÂÅ’</td>
        </tr>

        <!-- Ã¬Å Â¹Ã¬â€žÂ ÃªÂ²Â½Ã­â€”Ëœ -->
        <tr>
            <td class="lc" style="font-size:7.5pt;">Ã¬â„¢Â¸ÃªÂµÂ­Ã¬â€”ÂÃ¬â€žÅ“<br>Ã¬Å Â¹Ã¬â€žÂ  ÃªÂ²Â½Ã­â€”Ëœ?</td>
            <td colspan="2">${cb(data.has_seafaring_exp)}&nbsp;Ã¬Å¾Ë†Ã¬ÂÅ’&nbsp;&nbsp;${cb(!data.has_seafaring_exp)}&nbsp;Ã¬â€”â€ Ã¬ÂÅ’</td>
            <td class="lc">Ã¬Å Â¹Ã¬â€žÂ ÃªÂ¸Â°ÃªÂ°â€ž</td>
            <td colspan="4"></td>
        </tr>

        <!-- Ship header -->
        <tr>
            <td class="lc">Ã¬â€žÂ Ã«Âªâ€¦</td>
            <td colspan="2" style="text-align:center;font-weight:700;font-size:8pt;background:#e0e0e0;">ÃªÂ¸Â°ÃªÂ°â€ž</td>
            <td colspan="2" style="text-align:center;font-weight:700;font-size:8pt;background:#e0e0e0;">Ã­â€¢Â´Ã¬â„¢Â¸ÃªÂµÂ­Ã¬Â Â</td>
            <td colspan="3" style="text-align:center;font-weight:700;font-size:8pt;background:#e0e0e0;">Ã¬Â¢â€¦Ã«Â¥Ëœ</td>
        </tr>

        ${shipRows}

        <!-- Ã­Ââ€°ÃªÂ°â‚¬ -->
        <tr>
            <td class="lc" rowspan="5">Ã­Ââ€°ÃªÂ°â‚¬</td>
            <td class="lc">Ã¬Â²Â´Ã«Â Â¥</td>
            <td colspan="6">
                <div style="display:flex; justify-content:space-around; align-items:center;">
                    <span>A</span><span>B</span><span>C</span><span>D</span><span>E</span>
                </div>
            </td>
        </tr>
        <tr><td class="lc">Ã­Æ’Å“Ã«Ââ€ž</td><td colspan="6"></td></tr>
        <tr><td class="lc">Ã¬ÂÂ¸Ã¬Æ’Â</td><td colspan="6"></td></tr>
        <tr><td class="lc">Ã­Å Â¹Ã¬ÂÂ´Ã¬â€šÂ¬Ã­â€¢Â­</td><td colspan="6"></td></tr>
        <tr><td class="lc">ÃªÂ¸Â°Ã¬Ë†Â </td><td colspan="6"></td></tr>

        <!-- Ã­â€¢Â©ÃªÂ²Â©Ã¬Â ÂÃ¬Ë†Ëœ -->
        <tr>
            <td colspan="8" style="text-align:center;font-size:16pt;font-weight:900;
                padding:10px 8px;background:#f0f0f0;letter-spacing:5px;">
                Ã­â€¢Â© ÃªÂ²Â© Ã¬Â Â Ã¬Ë†Ëœ
            </td>
        </tr>
    </table>
</div>

<!-- Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â HALAMAN 2 Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â -->
<div class="page page2">

    <!-- 3 Foto tes fisik -->
    <div class="photo-big-wrap">
        <div class="photo-big-row">
            <div class="photo-big-cell">
                <span class="photo-big-label">Ã¬â€šÂ¬Ã¬Â§â€ž 1</span>
                ${pp?.wajah && pp.wajah.startsWith('data:')
                ? `<img src="${pp.wajah}" alt="Wajah"/>`
                : `<div class="ph-empty"></div>`}
            </div>
            <div class="photo-big-cell">
                <span class="photo-big-label">Ã¬â€šÂ¬Ã¬Â§â€ž 2</span>
                ${pp?.tangan && pp.tangan.startsWith('data:')
                ? `<img src="${pp.tangan}" alt="Tangan"/>`
                : `<div class="ph-empty"></div>`}
            </div>
            <div class="photo-big-cell">
                <span class="photo-big-label">Ã¬â€šÂ¬Ã¬Â§â€ž 3</span>
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
                <th>Ã­Å’â€ÃªÂµÂ½Ã­Å½Â´ÃªÂ¸Â°</th>
                <td>${data.pushups ? data.pushups + ' Ã­Å¡Å’' : '-'}</td>
                <th>Ã¬Å“â€”Ã«ÂªÂ¸Ã¬ÂÂ¼Ã¬Å“Â¼Ã­â€šÂ¤ÃªÂ¸Â°</th>
                <td>${data.situps ? data.situps + ' Ã­Å¡Å’' : '-'}</td>
                <th>Ã¬ËœÂ¤Ã«Â¥Â¸Ã«Â°Å“ÃªÂ·Â Ã­Ëœâ€¢</th>
                <td>${data.right_balance || 'Ã­â€¢Â©ÃªÂ²Â©'}</td>
                <th>Ã¬â€¢Å¾ÃªÂµÂ¬Ã«Â¶â‚¬Ã«Â¦Â¬ÃªÂ¸Â°</th>
                <td>${data.forward_bend || 'Ã­â€¢Â©ÃªÂ²Â©'}</td>
            </tr>
            <tr>
                <th>Ã«â€™Â¤Ã«Â¡Å“ÃªÂµÂ¬Ã«Â¶â‚¬Ã«Â¦Â¬ÃªÂ¸Â°</th>
                <td>${data.backward_bend || 'Ã­â€¢Â©ÃªÂ²Â©'}</td>
                <th>Ã«Â§Â¤Ã«â€¹Â¬Ã«Â¦Â¬ÃªÂ¸Â°</th>
                <td>${data.hanging_seconds ? data.hanging_seconds + ' Ã¬Â´Ë†' : '-'}</td>
                <th>Ã¬ËœÂ¤Ã«Â¥Â¸Ã¬â€ ÂÃ¬â€¢â€¦Ã«Â Â¥</th>
                <td>${data.right_grip || '-'}</td>
                <th>Ã¬â„¢Â¼Ã¬â€ ÂÃ¬â€¢â€¦Ã«Â Â¥</th>
                <td>${data.left_grip || '-'}</td>
            </tr>
            <tr>
                <th colspan="2" style="text-align:left; padding-left:12px;">ÃªÂ¸Â°Ã«Â§Ë†Ã¬Å¾ÂÃ¬â€žÂ¸Ã¬ËœÂ¤Ã«Å¾ËœÃ«Â²â€žÃ­â€¹Â°ÃªÂ¸Â°</th>
                <td colspan="2" style="text-align:center; background:#fff;">${data.horse_stance_seconds ? data.horse_stance_seconds + ' Ã¬Â´Ë†' : '-'}</td>
                <td colspan="4" style="border:none;"></td>
            </tr>
        </tbody>
    </table>
</div>

</body>
</html>`;
    };

    const printPDF = () => {
        // Need to pass the cv data to the generator, but map it to match formData structure
        const dataForPdf = { ...cv };
        // Ensure ship_experiences is an array
        dataForPdf.ship_experiences = dataForPdf.ship_experiences || [];
        
        // Fix up boolean fields
        dataForPdf.tattoo = !!dataForPdf.tattoo;
        dataForPdf.surgery = !!dataForPdf.surgery;
        dataForPdf.has_seafaring_exp = !!dataForPdf.has_seafaring_exp;

        const html = generateKoreaCVHTML(dataForPdf, photoData, logoData, physPhotos);
        
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '210mm';
        iframe.style.height = '297mm';
        document.body.appendChild(iframe);

        iframe.contentDocument.open();
        iframe.contentDocument.write(html);
        iframe.contentDocument.close();

        setTimeout(() => {
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 800);
    };

    const InfoRow = ({ label, value }) => (
        <div className="info-row">
            <span className="info-label">{label}</span>
            <span className="info-value">{value || <span style={{ color: '#ccc' }}>&mdash;</span>}</span>
        </div>
    );

    return (
        <div className="detail-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                .detail-page {
                    min-height: 100vh;
                    background: #fafafa;
                    font-family: 'Poppins', sans-serif;
                    color: #111;
                }
                @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                .section-card {
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 16px;
                    margin-bottom: 16px;
                    animation: fadeIn 0.5s ease-out both;
                }
                .section-card:nth-child(2) { animation-delay: 0.06s; }
                .section-card:nth-child(3) { animation-delay: 0.12s; }
                .section-card:nth-child(4) { animation-delay: 0.18s; }
                .section-card:nth-child(5) { animation-delay: 0.24s; }
                .section-card:nth-child(6) { animation-delay: 0.30s; }
                .section-head {
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: #111;
                    padding: 24px 28px 0;
                    margin-bottom: 16px;
                }
                .info-row {
                    display: flex;
                    padding: 10px 28px;
                    border-bottom: 1px solid #f5f5f5;
                    transition: background 0.15s;
                }
                .info-row:last-child { border-bottom: none; }
                .info-row:hover { background: #fafafa; }
                .info-label {
                    width: 180px;
                    flex-shrink: 0;
                    font-size: 13px;
                    color: #999;
                    font-weight: 500;
                }
                .info-value {
                    font-size: 13px;
                    color: #111;
                    font-weight: 500;
                }
                .top-bar {
                    position: sticky;
                    top: 0;
                    z-index: 40;
                    background: rgba(250,250,250,0.85);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-bottom: 1px solid #eee;
                }
                .top-bar-inner {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 12px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 8px 16px; border-radius: 10px; font-size: 13px;
                    font-weight: 600; text-decoration: none; border: none;
                    cursor: pointer; transition: all 0.2s;
                }
                .btn-ghost { background: transparent; color: #666; }
                .btn-ghost:hover { background: #f0f0f0; color: #111; }
                .btn-dark { background: #111; color: white; }
                .btn-dark:hover { background: #222; }
                .btn-gold { background: linear-gradient(135deg, #BF9952, #D4AF6A); color: white; box-shadow: 0 4px 16px rgba(191,153,82,0.25); }
                .btn-gold:hover { box-shadow: 0 6px 24px rgba(191,153,82,0.35); transform: translateY(-1px); }
                .family-card {
                    padding: 16px;
                    background: #fafafa;
                    border-radius: 12px;
                    border: 1px solid #f0f0f0;
                }
                .family-card h4 {
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                    color: #999;
                    margin-bottom: 10px;
                }
                .family-card p {
                    font-size: 13px;
                    color: #111;
                    margin-bottom: 3px;
                }
                .stat-box {
                    padding: 12px;
                    background: #fafafa;
                    border-radius: 10px;
                    border: 1px solid #f0f0f0;
                    text-align: center;
                }
                .stat-box .stat-label { font-size: 11px; color: #999; margin-bottom: 4px; }
                .stat-box .stat-value { font-size: 16px; font-weight: 700; color: #111; }
            `}</style>

            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-inner">
                    <Link href="/dashboard?tab=korea" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={headerLogo} alt="Logo" style={{ height: 32, objectFit: 'contain' }} />
                    </Link>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link href="/dashboard?tab=korea" className="btn btn-ghost">Back</Link>
                        <Link href={`/dashboard/korea/${cv.id}/edit`} className="btn btn-dark">Edit</Link>
                        <button onClick={printPDF} className="btn btn-gold">Print PDF</button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

                {/* Profile Header */}
                <div className="section-card" style={{ overflow: 'hidden' }}>
                    <div style={{ background: '#111', padding: '36px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
                        {cv.photo_path ? (
                            <img src={`/storage/${cv.photo_path}`} alt={cv.full_name} style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.15)' }} />
                        ) : (
                            <div style={{ width: 64, height: 64, borderRadius: 14, background: 'linear-gradient(135deg,#BF9952,#D4AF6A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700 }}>
                                {cv.full_name?.charAt(0) || '?'}
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>{cv.full_name}</h1>
                            {cv.korean_name && <p style={{ color: '#D4AF6A', fontSize: 13, marginTop: 4, fontWeight: 500 }}>{cv.korean_name}</p>}
                            {cv.id_number && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 4 }}>{cv.id_number}</p>}
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div className="section-head">Personal Details</div>
                    <div style={{ columns: 2, columnGap: 0, paddingBottom: 16 }}>
                        <InfoRow label="Date of Birth" value={cv.date_of_birth ? String(cv.date_of_birth).split('T')[0] : ''} />
                        <InfoRow label="Place of Birth" value={cv.place_of_birth} />
                        <InfoRow label="Nationality" value={cv.nationality_korean || 'Indonesia'} />
                        <InfoRow label="Gender" value={cv.gender === 'female' ? 'Wanita (Ã¬â€”Â¬)' : 'Pria (Ã«â€šÂ¨)'} />
                        <InfoRow label="Religion" value={cv.religion_korean} />
                        <InfoRow label="Height" value={cv.height ? `${cv.height} cm` : ''} />
                        <InfoRow label="Weight" value={cv.weight ? `${cv.weight} kg` : ''} />
                        <InfoRow label="Vision" value={cv.vision} />
                        <InfoRow label="Dominant Hand" value={cv.dominant_hand === 'left' ? 'Kiri (Ã¬â„¢Â¼Ã¬â€ Â)' : 'Kanan (Ã¬ËœÂ¤Ã«Â¥Â¸Ã¬â€ Â)'} />
                        <InfoRow label="Marital Status" value={cv.marital_status} />
                    </div>
                    {cv.address && (
                        <div className="info-row" style={{ borderTop: '1px solid #f0f0f0', paddingBottom: 20 }}>
                            <span className="info-label">Address</span>
                            <span className="info-value">{cv.address}</span>
                        </div>
                    )}
                    <div className="info-row" style={{ borderTop: '1px solid #f0f0f0', paddingBottom: 20 }}>
                        <span className="info-label">Physical Condition</span>
                        <span className="info-value">
                            Tato: {cv.tattoo ? 'Ã¬Å¾Ë†Ã¬ÂÅ’' : 'Ã¬â€”â€ Ã¬ÂÅ’'} Ã‚Â· Operasi: {cv.surgery ? 'Ã¬Å¾Ë†Ã¬ÂÅ’' : 'Ã¬â€”â€ Ã¬ÂÅ’'}
                        </span>
                    </div>
                </div>

                {/* Family */}
                <div className="section-card">
                    <div className="section-head">Family Information</div>
                    <div style={{ padding: '0 28px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div className="family-card">
                            <h4>Father</h4>
                            <p style={{ fontWeight: 600 }}>{cv.father_name || 'Ã¢â‚¬â€'}</p>
                            {cv.father_birth_year && <p style={{ color: '#888', fontSize: 12 }}>Born {cv.father_birth_year}</p>}
                            {cv.father_occupation && <p style={{ color: '#888', fontSize: 12 }}>{cv.father_occupation}</p>}
                        </div>
                        <div className="family-card">
                            <h4>Mother</h4>
                            <p style={{ fontWeight: 600 }}>{cv.mother_name || 'Ã¢â‚¬â€'}</p>
                            {cv.mother_birth_year && <p style={{ color: '#888', fontSize: 12 }}>Born {cv.mother_birth_year}</p>}
                            {cv.mother_occupation && <p style={{ color: '#888', fontSize: 12 }}>{cv.mother_occupation}</p>}
                        </div>
                        <div className="family-card">
                            <h4>Spouse</h4>
                            <p style={{ fontWeight: 600 }}>{cv.spouse_name || 'Ã¢â‚¬â€'}</p>
                            {cv.spouse_birth_year && <p style={{ color: '#888', fontSize: 12 }}>Born {cv.spouse_birth_year}</p>}
                            {cv.children_count && <p style={{ color: '#888', fontSize: 12 }}>{cv.children_count} children</p>}
                        </div>
                    </div>
                </div>

                {/* Education & Ships */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="section-card">
                        <div className="section-head">Education</div>
                        <div style={{ padding: '0 28px 20px' }}>
                            <p style={{ fontWeight: 600, fontSize: 15 }}>{cv.school_name || 'Ã¢â‚¬â€'}</p>
                            {cv.school_address && <p style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{cv.school_address}</p>}
                        </div>
                    </div>

                    <div className="section-card">
                        <div className="section-head">Ship Experience</div>
                        <div style={{ padding: '0 28px 20px' }}>
                            <p style={{ fontSize: 13 }}>
                                <span style={{ color: '#999' }}>Experience:</span>{' '}
                                <span style={{ fontWeight: 600 }}>{cv.has_seafaring_exp ? 'Yes' : 'No'}</span>
                            </p>
                            {cv.ship_experiences?.filter(s => s.ship_name).map((s, idx) => (
                                <div key={idx} style={{ marginTop: 10, padding: 10, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                                    <p style={{ fontWeight: 600, fontSize: 13 }}>{s.ship_name}</p>
                                    <p style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{s.period} Ã‚Â· {s.type}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Physical Tests */}
                <div className="section-card">
                    <div className="section-head">Physical Tests (Ã¬â€¹Â Ã¬Â²Â´ ÃªÂ²â‚¬Ã¬â€šÂ¬)</div>
                    <div style={{ padding: '0 28px 24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                        <div className="stat-box"><p className="stat-label">Push-ups</p><p className="stat-value">{cv.pushups || '-'}</p></div>
                        <div className="stat-box"><p className="stat-label">Sit-ups</p><p className="stat-value">{cv.situps || '-'}</p></div>
                        <div className="stat-box"><p className="stat-label">Balance</p><p className="stat-value">{cv.right_balance || '-'}</p></div>
                        <div className="stat-box"><p className="stat-label">R. Grip</p><p className="stat-value">{cv.right_grip || '-'}</p></div>
                        <div className="stat-box"><p className="stat-label">L. Grip</p><p className="stat-value">{cv.left_grip || '-'}</p></div>
                    </div>
                </div>

                {/* Photos */}
                {(cv.wajah_path || cv.tangan_path || cv.badan_path) && (
                    <div className="section-card">
                        <div className="section-head">Physical Test Photos</div>
                        <div style={{ padding: '0 28px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            {cv.wajah_path && (
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Photo 1</p>
                                    <img src={`/storage/${cv.wajah_path}`} style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 12, border: '1px solid #eee' }} alt="Face" />
                                </div>
                            )}
                            {cv.tangan_path && (
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Photo 2</p>
                                    <img src={`/storage/${cv.tangan_path}`} style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 12, border: '1px solid #eee' }} alt="Hands" />
                                </div>
                            )}
                            {cv.badan_path && (
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Photo 3</p>
                                    <img src={`/storage/${cv.badan_path}`} style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 12, border: '1px solid #eee' }} alt="Body" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #eee', padding: '24px', textAlign: 'center', marginTop: 40 }}>
                <p style={{ fontSize: 11, color: '#bbb' }}>&copy; 2025 Loring Margi International &middot; Powered by <span style={{ fontWeight: 600, color: '#999' }}>CyberLabs</span></p>
            </div>
        </div>
    );
};

export default CVDetailKorea;

