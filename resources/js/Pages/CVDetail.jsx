import React from 'react';
import { Link, router } from '@inertiajs/react';

const CVDetail = ({ cv }) => {
    const headerLogo1 = '/images/Logo-Lorin.jpeg';

    const generateCVHTML = () => {
        const workRows = (cv.work_experiences || []).map(work =>
            `<tr><td>${work.employer || ''}</td><td>${work.position || ''}</td><td class="center-text">${work.start_date || ''}</td><td class="center-text">${work.leaving_date || ''}</td></tr>`
        ).join('');
        const eduRows = (cv.educations || []).map(edu =>
            `<tr><td>${edu.school || ''}</td><td>${edu.study || ''}</td><td class="center-text">${edu.start_date || ''}</td><td class="center-text">${edu.graduation_date || ''}</td></tr>`
        ).join('');
        const langCols = (cv.languages || []).map(l => `<th>${l.name}</th>`).join('');
        const langVals = (cv.languages || []).map(l => `<td class="center-text">${l.level || ''}</td>`).join('');
        const pcRows = (cv.pc_skills || []).map(s => `<tr><td>${s.name}</td><td class="center-text">${s.level || ''}</td></tr>`).join('');
        const otherSkills = (cv.other_skills || []).map(s => s.skill).filter(Boolean).join(', ');
        const photoSrc = cv.photo_path ? `/storage/${cv.photo_path}` : null;

        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>CV - ${cv.full_name}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:0}*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Montserrat',sans-serif;font-size:8pt;background:#fff;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.page{width:210mm;min-height:297mm;padding:8mm 12mm;margin:0 auto;background:white}.header{display:flex;align-items:stretch;border:2px solid #000;margin-bottom:6px;height:100px}.header-left{display:flex;align-items:stretch;flex:1}.photo-container{width:85px;border-right:2px solid #000;overflow:hidden;background:#f0f0f0;display:flex;align-items:center;justify-content:center;flex-shrink:0}.photo-container img{width:100%;height:100%;object-fit:cover}.header-text{flex:1;display:flex;flex-direction:column}.header-text table{width:100%;border-collapse:collapse;height:100%}.header-text td{border:1px solid #000;padding:3px 8px;font-size:8pt;vertical-align:middle}.header-text .label-col{width:180px;background:#e0e0e0;font-weight:600;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.header-right{width:200px;display:flex;flex-direction:column;border-left:2px solid #000;flex-shrink:0}.logo-box{display:flex;align-items:center;justify-content:center;border-bottom:2px solid #000}.logo-box:last-child{border-bottom:none}.logo-box:first-child{height:40px;background:#000;padding:6px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.logo-box:last-child{height:60px;background:#fff;padding:6px}.logo-box img{max-width:100%;max-height:100%;object-fit:contain}.company-text{text-align:center;font-weight:700;font-size:7.5pt;line-height:1.2;color:#000}.section-title{background:#e0e0e0;border:2px solid #000;padding:3px;font-weight:700;text-align:center;margin-top:4px;font-size:8.5pt;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}table.data-table{width:100%;border-collapse:collapse}.data-table td,.data-table th{border:1px solid #000;padding:2px 5px;font-size:8pt;vertical-align:middle}.data-table th{background:#e0e0e0;font-weight:700;text-align:center;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.data-table .label-col{width:160px;background:#e0e0e0;font-weight:600;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.center-text{text-align:center}
</style></head><body><div class="page">
<div class="header"><div class="header-left"><div class="photo-container">${photoSrc ? `<img src="${photoSrc}" alt="Photo"/>` : '<div style="font-size:10pt;font-weight:700;color:#666;">PHOTO</div>'}</div><div class="header-text"><table><tr><td class="label-col">FULL NAME / ADI SOYADI</td><td><strong>${cv.full_name || ''}</strong></td></tr><tr><td class="label-col">OBJECTIVE / HEDEF</td><td>${cv.objective || ''}</td></tr><tr><td class="label-col">POSITION APPLIED FOR / BAŞVURULAN POZİSYON</td><td>${cv.position_applied || ''}</td></tr></table></div></div><div class="header-right"><div class="logo-box"><img src="/images/Logo-Lorin.jpeg" alt="Logo"/></div><div class="logo-box"><div class="company-text">PT. LORING MARGI<br/>INTERNASIONAL</div></div></div></div>
<div class="section-title">PERSONAL DETAILS / KİŞİSEL BİLGİLER</div><table class="data-table"><tr><td class="label-col">AGE / YAŞ</td><td>${cv.age || ''}</td></tr><tr><td class="label-col">SEX / CİNSİYET</td><td>${cv.sex || ''}</td></tr><tr><td class="label-col">HEIGHT / BOY</td><td>${cv.height || ''}</td></tr><tr><td class="label-col">WEIGHT / KİLO</td><td>${cv.weight || ''}</td></tr><tr><td class="label-col">ADDRESS / ADRES</td><td>${cv.address || ''}</td></tr><tr><td class="label-col">MOBILE PHONE / CEP TELEFONU</td><td>${cv.mobile_phone || ''}</td></tr><tr><td class="label-col">EMAIL ADDRESS / EMAİL ADRESİ</td><td>${cv.email_address || ''}</td></tr><tr><td class="label-col">PLACE OF BIRTH / DOĞUM YERİ</td><td>${cv.place_of_birth || ''}</td></tr><tr><td class="label-col">DATE OF BIRTH / DOĞUM TARİHİ</td><td>${cv.date_of_birth || ''}</td></tr><tr><td class="label-col">NATIONALITY / MİLLİYETİ</td><td>${cv.nationality || ''}</td></tr><tr><td class="label-col">MARITAL STATUS / MEDENİ DURUMU</td><td>${cv.marital_status || ''}</td></tr><tr><td class="label-col">PASSPORT NUMBER / PASAPORT NUMARASI</td><td>${cv.passport_number || ''}</td></tr><tr><td class="label-col">PASSPORT EXPIRY DATE / PASAPORT GEÇERLİLİK TARİHİ</td><td>${cv.passport_expiry_date || ''}</td></tr></table>
<div class="section-title">WORK EXPERIENCES / İŞ TECRÜBELERİ</div><table class="data-table"><thead><tr><th style="width:35%;">NAME OF EMPLOYER / İŞVERENİN ADI</th><th style="width:35%;">POSITION & RESPONSIBILITIES</th><th style="width:15%;">STARTING DATE</th><th style="width:15%;">LEAVING DATE</th></tr></thead><tbody>${workRows}</tbody></table>
<div class="section-title">EDUCATION HISTORY / EĞİTİM DURUMU</div><table class="data-table"><thead><tr><th style="width:40%;">SCHOOL NAME / OKULUN ADI</th><th style="width:30%;">STUDY / BÖLÜM</th><th style="width:15%;">STARTING DATE</th><th style="width:15%;">GRADUATION DATE</th></tr></thead><tbody>${eduRows}</tbody></table>
<div class="section-title">QUALIFICATION & SKILLS / YETKİNLİK VE YETENEKLER</div><table class="data-table"><thead><tr><th style="width:20%;">LANGUAGE SKILLS</th>${langCols}</tr></thead><tbody><tr><td class="center-text">Fluent - Good - Beginner</td>${langVals}</tr></tbody></table>
<table class="data-table" style="margin-top:6px;"><thead><tr><th style="width:30%;">PC SKILLS</th><th>SKILL LEVEL</th></tr></thead><tbody>${pcRows}</tbody></table>
<table class="data-table" style="margin-top:6px;"><thead><tr><th>OTHER SKILLS</th></tr></thead><tbody><tr><td>${otherSkills}</td></tr></tbody></table>
</div></body></html>`;
    };

    const printPDF = () => {
        const html = generateCVHTML();
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:absolute;left:-9999px;width:210mm;height:297mm;';
        document.body.appendChild(iframe);
        iframe.contentDocument.open();
        iframe.contentDocument.write(html);
        iframe.contentDocument.close();
        setTimeout(() => {
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 500);
    };

    const InfoRow = ({ label, value }) => (
        <div className="info-row">
            <span className="info-label">{label}</span>
            <span className="info-value">{value || <span style={{ color: '#ccc' }}>—</span>}</span>
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
                .exp-item {
                    padding: 16px 28px;
                    border-bottom: 1px solid #f5f5f5;
                    transition: background 0.15s;
                }
                .exp-item:last-child { border-bottom: none; }
                .exp-item:hover { background: #fafafa; }
                .skill-tag {
                    display: inline-block;
                    padding: 6px 14px;
                    background: #f5f5f5;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #555;
                    margin: 3px;
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
            `}</style>

            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-inner">
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={headerLogo1} alt="Logo" style={{ height: 32, objectFit: 'contain' }} />
                    </Link>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link href="/dashboard" className="btn btn-ghost">Back</Link>
                        <Link href={`/dashboard/${cv.id}/edit`} className="btn btn-dark">Edit</Link>
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
                            {cv.position_applied && <p style={{ color: '#D4AF6A', fontSize: 13, marginTop: 4, fontWeight: 500 }}>{cv.position_applied}</p>}
                            {cv.objective && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>{cv.objective}</p>}
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div className="section-head">Personal Details</div>
                    <div style={{ columns: 2, columnGap: 0, paddingBottom: 16 }}>
                        <InfoRow label="Age" value={cv.age} />
                        <InfoRow label="Sex" value={cv.sex} />
                        <InfoRow label="Height" value={cv.height} />
                        <InfoRow label="Weight" value={cv.weight} />
                        <InfoRow label="Nationality" value={cv.nationality} />
                        <InfoRow label="Marital Status" value={cv.marital_status} />
                        <InfoRow label="Place of Birth" value={cv.place_of_birth} />
                        <InfoRow label="Date of Birth" value={cv.date_of_birth ? String(cv.date_of_birth).split('T')[0] : ''} />
                        <InfoRow label="Mobile Phone" value={cv.mobile_phone} />
                        <InfoRow label="Email" value={cv.email_address} />
                        <InfoRow label="Passport No." value={cv.passport_number} />
                        <InfoRow label="Passport Expiry" value={cv.passport_expiry_date ? String(cv.passport_expiry_date).split('T')[0] : ''} />
                    </div>
                    {cv.address && (
                        <div className="info-row" style={{ borderTop: '1px solid #f0f0f0', paddingBottom: 20 }}>
                            <span className="info-label">Address</span>
                            <span className="info-value">{cv.address}</span>
                        </div>
                    )}
                </div>

                {/* Work Experience */}
                {cv.work_experiences?.length > 0 && (
                    <div className="section-card">
                        <div className="section-head">Work Experience</div>
                        {cv.work_experiences.map((work, idx) => (
                            <div key={idx} className="exp-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: 14 }}>{work.position || '—'}</p>
                                        <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{work.employer || '—'}</p>
                                    </div>
                                    <span style={{ fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>{work.start_date || '?'} — {work.leaving_date || 'Present'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Education */}
                {cv.educations?.length > 0 && (
                    <div className="section-card">
                        <div className="section-head">Education</div>
                        {cv.educations.map((edu, idx) => (
                            <div key={idx} className="exp-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: 14 }}>{edu.school || '—'}</p>
                                        {edu.study && <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{edu.study}</p>}
                                    </div>
                                    <span style={{ fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>{edu.start_date || '?'} — {edu.graduation_date || '?'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Languages & PC Skills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {cv.languages?.length > 0 && (
                        <div className="section-card">
                            <div className="section-head">Languages</div>
                            {cv.languages.map((lang, idx) => (
                                <div key={idx} className="info-row">
                                    <span className="info-label">{lang.name}</span>
                                    <span className="info-value">{lang.level || '—'}</span>
                                </div>
                            ))}
                            <div style={{ height: 12 }} />
                        </div>
                    )}

                    {cv.pc_skills?.length > 0 && (
                        <div className="section-card">
                            <div className="section-head">PC Skills</div>
                            {cv.pc_skills.map((skill, idx) => (
                                <div key={idx} className="info-row">
                                    <span className="info-label">{skill.name}</span>
                                    <span className="info-value">{skill.level || '—'}</span>
                                </div>
                            ))}
                            <div style={{ height: 12 }} />
                        </div>
                    )}
                </div>

                {/* Other Skills */}
                {cv.other_skills?.length > 0 && (
                    <div className="section-card">
                        <div className="section-head">Other Skills</div>
                        <div style={{ padding: '0 28px 20px', display: 'flex', flexWrap: 'wrap' }}>
                            {cv.other_skills.map((skill, idx) => (
                                <span key={idx} className="skill-tag">{skill.skill}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #eee', padding: '24px', textAlign: 'center', marginTop: 40 }}>
                <p style={{ fontSize: 11, color: '#bbb' }}>© 2025 Loring Margi International · Powered by <span style={{ fontWeight: 600, color: '#999' }}>CyberLabs</span></p>
            </div>
        </div>
    );
};

export default CVDetail;