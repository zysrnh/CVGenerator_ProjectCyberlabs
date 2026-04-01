import React from 'react';
import { Link } from '@inertiajs/react';

const CVDetailSlokavia = ({ cv }) => {
    const headerLogo1 = '/storage/logo/LoringMargi.png';

    const generateCVHTML = () => {
        const formatDOB = (dob) => {
            if (!dob) return '';
            if (dob.includes('-')) {
                const [y, m, d] = dob.split('-');
                return `${d}/${m}/${y}`;
            }
            return dob;
        };

        const workSection = (cv.work_experiences || []).map(work => {
            const respItems = work.responsibilities
                ? work.responsibilities.split('||').filter(r => r.trim())
                : [];
            return `<div class="section-block">
                <div class="job-title">${work.position || ''} - <span class="employer">${work.employer || ''}</span></div>
                <div class="date-range">${work.start_date || ''}${work.leaving_date ? ' Ã¢â‚¬â€œ ' + work.leaving_date : ' Ã¢â‚¬â€œ Present'}</div>
                ${respItems.length > 0 ? `<ul class="bullet-list">${respItems.map(r => `<li>${r.trim()}</li>`).join('')}</ul>` : ''}
            </div>`;
        }).join('');

        const eduSection = (cv.educations || []).map(edu => `
            <div class="section-block">
                <div class="date-range">${edu.start_date || ''}${edu.graduation_date ? ' Ã¢â‚¬â€œ ' + edu.graduation_date : ''}</div>
                <div class="edu-school">${edu.school || ''}</div>
                ${edu.field_of_study ? `<div class="field-study"><strong>Field of study:</strong> ${edu.field_of_study}</div>` : ''}
            </div>`).join('');

        const langRows = (cv.languages || []).map(lang => `
            <tr>
                <td class="lang-name"><strong>${lang.name || ''}</strong></td>
                <td class="cefr-cell">${lang.listening || ''}</td>
                <td class="cefr-cell">${lang.reading || ''}</td>
                <td class="cefr-cell">${lang.spoken_production || ''}</td>
                <td class="cefr-cell">${lang.spoken_interaction || ''}</td>
                <td class="cefr-cell">${lang.writing || ''}</td>
            </tr>`).join('');

        const certSection = (cv.certifications || []).filter(c => c.title).map(cert => `
            <div class="section-block">
                <div class="cert-year">${cert.year || ''}</div>
                <div class="cert-title">${cert.title || ''}</div>
                ${cert.description ? `<p class="cert-desc">${cert.description}</p>` : ''}
                ${cert.mode ? `<div class="field-study"><strong>Mode of learning:</strong> ${cert.mode}</div>` : ''}
            </div>`).join('');

        const skillsText = (cv.skills || []).map(s => s.skill).filter(Boolean).join(' | ');
        const photoSrc = cv.photo_path ? `/storage/${cv.photo_path}` : null;

        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>CV - ${cv.full_name}</title>
<style>
@page{size:A4;margin:15mm;margin-top:10mm;margin-bottom:10mm}@media print{html,body{margin:0;padding:0;}}*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,Helvetica,sans-serif;font-size:9pt;color:#111;background:#fff;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
.ep-header{display:flex;align-items:flex-start;gap:18px;margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid #ccc}
.ep-photo-wrap{flex-shrink:0;width:90px;height:90px;border-radius:50%;overflow:hidden;border:2px solid #ccc;background:#eee;display:flex;align-items:center;justify-content:center}
.ep-photo-wrap img{width:100%;height:100%;object-fit:cover;border-radius:50%}
.ep-photo-placeholder{font-size:7.5pt;color:#999;text-align:center}
.ep-header-info{flex:1;padding-top:4px}
.ep-name{font-size:18pt;font-weight:700;color:#111;line-height:1.1;margin-bottom:8px}
.ep-meta-row{font-size:8.5pt;color:#222;margin-bottom:3px;display:flex;align-items:center;flex-wrap:wrap}
.ep-meta-item{display:inline-flex;align-items:center;gap:4px}
.ep-meta-divider{width:1px;height:11px;background:#aaa;margin:0 10px;display:inline-block}
.ep-meta-contact{font-size:8pt;color:#222;margin-top:5px}
.ep-meta-contact span{margin-right:16px}
.ep-logo-area{flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-start;gap:8px;padding-top:4px}
.ep-europass-logo{display:flex;align-items:center;gap:8px}
.ep-europass-text{font-size:16pt;font-weight:400;color:#5a4fcf;font-family:Arial,sans-serif}
.ep-country-tag{font-size:7pt;color:#555;background:#f0f0f0;border:1px solid #ddd;border-radius:3px;padding:2px 7px;text-align:right}
.section-title-ep{font-size:9pt;font-weight:700;color:#1c3557;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1.5px solid #1c3557;padding-bottom:3px;margin:14px 0 8px 0}
.section-block{margin-bottom:10px}
.job-title{font-size:9pt;font-weight:700;color:#111}
.employer{font-weight:700;color:#1c3557;font-style:italic}
.date-range{font-size:8pt;color:#333;margin:2px 0}
.bullet-list{margin:4px 0 0 14px}
.bullet-list li{font-size:8.5pt;color:#111;margin-bottom:2px}
.edu-school{font-size:9pt;font-weight:700;color:#111}
.field-study{font-size:8.5pt;color:#222;margin-top:3px}
.mother-tongue-row{font-size:8.5pt;color:#111;margin-bottom:8px}
.mother-tongue-row span{font-weight:700}
.lang-table{width:100%;border-collapse:collapse;font-size:8pt}
.lang-table th{background:#f2f4f7;color:#1c3557;font-weight:700;text-align:center;padding:4px 6px;border:1px solid #dde2ea;font-size:7.5pt}
.lang-table td{border:1px solid #dde2ea;padding:4px 6px;text-align:center;color:#111}
.lang-name{text-align:left!important;width:140px}
.cefr-cell{width:60px}
.lang-note{font-size:7pt;color:#555;margin-top:4px;font-style:italic}
.lang-group-header{background:#e8ecf2!important;font-size:7pt!important;color:#333!important}
.cert-year{font-size:8pt;color:#333}
.cert-title{font-size:9pt;font-weight:700;color:#1c3557;margin:2px 0}
.cert-desc{font-size:8.5pt;color:#222;margin-top:3px;line-height:1.4}
.skills-text{font-size:8.5pt;color:#111;line-height:1.6}
.about-text{font-size:8.5pt;color:#111;line-height:1.55}
</style></head><body>
<div class="ep-header">
    <div class="ep-photo-wrap">${photoSrc ? `<img src="${photoSrc}" alt="Photo"/>` : `<div class="ep-photo-placeholder">NO<br/>PHOTO</div>`}</div>
    <div class="ep-header-info">
        <div class="ep-name">${cv.full_name || ''}</div>
        <div class="ep-meta-row">
            ${cv.date_of_birth ? `<span class="ep-meta-item"><strong>Date of birth:</strong>&nbsp;${formatDOB(cv.date_of_birth)}</span>` : ''}
            ${cv.nationality ? `<span class="ep-meta-divider"></span><span class="ep-meta-item"><strong>Nationality:</strong>&nbsp;${cv.nationality}</span>` : ''}
            ${cv.gender ? `<span class="ep-meta-divider"></span><span class="ep-meta-item"><strong>Gender:</strong>&nbsp;${cv.gender}</span>` : ''}
        </div>
        ${(cv.address || cv.mobile_phone || cv.email_address) ? `<div class="ep-meta-contact">
            ${cv.address ? `<span>${cv.address}</span>` : ''}
            ${cv.mobile_phone ? `<span>${cv.mobile_phone}</span>` : ''}
            ${cv.email_address ? `<span>${cv.email_address}</span>` : ''}
        </div>` : ''}
    </div>
    <div class="ep-logo-area">
        <div class="ep-europass-logo">
            <img src="/storage/logo/euro.png" alt="EUROPASS" style="width:130px;height:auto;object-fit:contain;"/>
        </div>
    </div>
</div>
${cv.about_me ? `<div class="section-title-ep">About Me</div><p class="about-text">${cv.about_me}</p>` : ''}
<div class="section-title-ep">Work Experience</div>${workSection}
<div class="section-title-ep">Education and Training</div>${eduSection}
<div class="section-title-ep">Language Skills</div>
${cv.mother_tongue ? `<div class="mother-tongue-row">Mother tongue(s): <span>${cv.mother_tongue}</span></div>` : ''}
${(cv.languages || []).length > 0 ? `
<div style="font-size:8pt;color:#333;margin-bottom:4px;">Other language(s):</div>
<table class="lang-table"><thead><tr>
    <th rowspan="2" class="lang-name" style="text-align:left;">Language</th>
    <th colspan="2" class="lang-group-header">UNDERSTANDING</th>
    <th colspan="2" class="lang-group-header">SPEAKING</th>
    <th class="lang-group-header">WRITING</th>
</tr><tr>
    <th>Listening</th><th>Reading</th><th>Spoken production</th><th>Spoken interaction</th><th>Writing</th>
</tr></thead><tbody>${langRows}</tbody></table>
<div class="lang-note">Levels: A1/A2: Basic user; B1/B2: Independent user; C1/C2: Proficient user</div>` : ''}
${(cv.certifications || []).some(c => c.title) ? `<div class="section-title-ep">Certifications</div>${certSection}` : ''}
${skillsText ? `<div class="section-title-ep">Skills</div><p class="skills-text">${skillsText}</p>` : ''}
</body></html>`;
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

    const cefrColor = (level) => {
        if (!level) return { bg: '#f5f5f5', color: '#999' };
        if (['C1','C2'].includes(level)) return { bg: '#e8f5e9', color: '#2e7d32' };
        if (['B1','B2'].includes(level)) return { bg: '#e3f2fd', color: '#1565c0' };
        return { bg: '#fff8e1', color: '#f57f17' };
    };

    const InfoRow = ({ label, value }) => (
        <div className="info-row">
            <span className="info-label">{label}</span>
            <span className="info-value">{value || <span style={{ color: '#ccc' }}>â€”</span>}</span>
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
                .btn-accent { background: #1c3557; color: white; box-shadow: 0 4px 16px rgba(28,53,87,0.2); }
                .btn-accent:hover { box-shadow: 0 6px 24px rgba(28,53,87,0.3); transform: translateY(-1px); }
                .cefr-badge {
                    display: inline-block;
                    padding: 3px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                }
            `}</style>

            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-inner">
                    <Link href="/dashboard?tab=slokavia" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={headerLogo1} alt="Logo" style={{ height: 32, objectFit: 'contain' }} />
                    </Link>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Link href="/dashboard?tab=slokavia" className="btn btn-ghost">Back</Link>
                        <Link href={`/dashboard/slokavia/${cv.id}/edit`} className="btn btn-dark">Edit</Link>
                        <button onClick={printPDF} className="btn btn-accent">Print Europass PDF</button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

                {/* Profile Header */}
                <div className="section-card" style={{ overflow: 'hidden' }}>
                    <div style={{ background: '#1c3557', padding: '36px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
                        {cv.photo_path ? (
                            <img src={`/storage/${cv.photo_path}`} alt={cv.full_name} style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.15)' }} />
                        ) : (
                            <div style={{ width: 64, height: 64, borderRadius: 14, background: 'linear-gradient(135deg,#5a4fcf,#7c6ff7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700 }}>
                                {cv.full_name?.charAt(0) || '?'}
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>{cv.full_name}</h1>
                                <span style={{ fontSize: 14, color: 'rgba(168,184,240,0.7)', fontWeight: 300, fontStyle: 'italic' }}>europass</span>
                            </div>
                            {cv.about_me && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{cv.about_me}</p>}
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div className="section-head">Personal Details</div>
                    <div style={{ columns: 2, columnGap: 0, paddingBottom: 16 }}>
                        <InfoRow label="Date of Birth" value={cv.date_of_birth ? String(cv.date_of_birth).split('T')[0] : ''} />
                        <InfoRow label="Place of Birth" value={cv.place_of_birth} />
                        <InfoRow label="Nationality" value={cv.nationality} />
                        <InfoRow label="Gender" value={cv.gender} />
                        <InfoRow label="Mobile Phone" value={cv.mobile_phone} />
                        <InfoRow label="Email" value={cv.email_address} />
                        <InfoRow label="Mother Tongue" value={cv.mother_tongue} />
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
                        {cv.work_experiences.map((work, idx) => {
                            const resps = work.responsibilities ? work.responsibilities.split('||').filter(r => r.trim()) : [];
                            return (
                                <div key={idx} className="exp-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 14 }}>{work.position || 'Ã¢â‚¬â€'}</p>
                                            <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{work.employer || 'Ã¢â‚¬â€'}</p>
                                        </div>
                                        <span style={{ fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>{work.start_date || '?'} Ã¢â‚¬â€ {work.leaving_date || 'Present'}</span>
                                    </div>
                                    {resps.length > 0 && (
                                        <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                                            {resps.map((r, ri) => (
                                                <li key={ri} style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>{r}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Education */}
                {cv.educations?.length > 0 && (
                    <div className="section-card">
                        <div className="section-head">Education and Training</div>
                        {cv.educations.map((edu, idx) => (
                            <div key={idx} className="exp-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: 14 }}>{edu.school || 'Ã¢â‚¬â€'}</p>
                                        {edu.field_of_study && <p style={{ color: '#888', fontSize: 13, marginTop: 2 }}>{edu.field_of_study}</p>}
                                    </div>
                                    <span style={{ fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>{edu.start_date || '?'} Ã¢â‚¬â€ {edu.graduation_date || '?'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Languages CEFR */}
                {cv.languages?.length > 0 && (
                    <div className="section-card">
                        <div className="section-head">Language Skills</div>
                        <div style={{ overflowX: 'auto', padding: '0 28px 20px' }}>
                            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600, color: '#555', fontSize: 12 }}>Language</th>
                                        {['Listening','Reading','Spoken Prod.','Spoken Inter.','Writing'].map(h => (
                                            <th key={h} style={{ textAlign: 'center', padding: '8px 6px', fontWeight: 600, color: '#555', fontSize: 11 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {cv.languages.map((lang, idx) => (
                                        <tr key={idx} style={{ borderTop: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '10px 0', fontWeight: 600 }}>{lang.name}</td>
                                            {['listening','reading','spoken_production','spoken_interaction','writing'].map(k => {
                                                const c = cefrColor(lang[k]);
                                                return (
                                                    <td key={k} style={{ textAlign: 'center', padding: '10px 4px' }}>
                                                        <span className="cefr-badge" style={{ background: c.bg, color: c.color }}>{lang[k] || 'Ã¢â‚¬â€'}</span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p style={{ fontSize: 11, color: '#bbb', marginTop: 8, fontStyle: 'italic' }}>A1/A2: Basic Ã‚Â· B1/B2: Independent Ã‚Â· C1/C2: Proficient</p>
                        </div>
                    </div>
                )}

                {/* Certifications & Skills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {cv.certifications?.some(c => c.title) && (
                        <div className="section-card">
                            <div className="section-head">Certifications</div>
                            {cv.certifications.filter(c => c.title).map((cert, idx) => (
                                <div key={idx} className="exp-item">
                                    {cert.year && <span style={{ fontSize: 11, color: '#999' }}>{cert.year}</span>}
                                    <p style={{ fontWeight: 600, fontSize: 14 }}>{cert.title}</p>
                                    {cert.description && <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{cert.description}</p>}
                                    {cert.mode && <p style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Mode: {cert.mode}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                    {cv.skills?.length > 0 && (
                        <div className="section-card">
                            <div className="section-head">Skills</div>
                            <div style={{ padding: '0 28px 20px', display: 'flex', flexWrap: 'wrap' }}>
                                {cv.skills.map((s, idx) => (
                                    <span key={idx} className="skill-tag">{s.skill}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #eee', padding: '24px', textAlign: 'center', marginTop: 40 }}>
                <p style={{ fontSize: 11, color: '#bbb' }}>&copy; 2025 Loring Margi International &middot; Powered by <span style={{ fontWeight: 600, color: '#999' }}>CyberLabs</span></p>
            </div>
        </div>
    );
};

export default CVDetailSlokavia;

