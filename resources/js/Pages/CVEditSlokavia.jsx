import React, { useState, useEffect } from 'react';
import { router, Link } from '@inertiajs/react';

const CVEditSlokavia = ({ cv }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [photoData, setPhotoData] = useState(null);
    const [euLogoData, setEuLogoData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const headerLogo1 = '/storage/logo/LoringMargi.png';

    // ── Load existing profile photo ─────────────────
    useEffect(() => {
        if (cv.photo_path) {
            fetch(`/storage/${cv.photo_path}`)
                .then(r => r.blob())
                .then(b => {
                    const rd = new FileReader();
                    rd.onloadend = () => setPhotoData(rd.result);
                    rd.readAsDataURL(b);
                }).catch(()=>{});
        }
    }, [cv]);

    // ── Baca data import dari Excel (jika ada) ─────────────────
    useEffect(() => {
        const raw = sessionStorage.getItem('cv_import_slokavia');
        if (!raw) return;
        try {
            const imported = JSON.parse(raw);
            setFormData(prev => ({ ...prev, ...imported }));
            sessionStorage.removeItem('cv_import_slokavia');
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        const loadEuLogo = async () => {
            try {
                const response = await fetch('/images/European.jpg');
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => setEuLogoData(reader.result);
                reader.readAsDataURL(blob);
            } catch (err) {
                console.log('EU logo not found');
            }
        };
        loadEuLogo();
    }, []);

    const [formData, setFormData] = useState({
        destination_country: cv.destination_country || '',
        full_name: cv.full_name || '',
        about_me: cv.about_me || '',
        date_of_birth: cv.date_of_birth || '',
        nationality: cv.nationality || '',
        gender: cv.gender || '',
        address: cv.address || '',
        mobile_phone: cv.mobile_phone || '',
        email_address: cv.email_address || '',
        place_of_birth: cv.place_of_birth || '',
        mother_tongue: cv.mother_tongue || '',
        workExperiences: cv.work_experiences?.length > 0 ? cv.work_experiences.map(w => ({...w, responsibilities: w.responsibilities ? w.responsibilities.split('||') : ['']})) : [
            { employer: '', position: '', start_date: '', leaving_date: '', responsibilities: [''] }
        ],
        educations: cv.educations?.length > 0 ? cv.educations : [
            { school: '', field_of_study: '', start_date: '', graduation_date: '' }
        ],
        languages: cv.languages?.length > 0 ? cv.languages : [
            { name: 'English', listening: 'A2', reading: 'A2', spoken_production: 'A2', spoken_interaction: 'A2', writing: 'A2' },
        ],
        certifications: cv.certifications?.length > 0 ? cv.certifications : [
            { year: '', title: '', description: '', mode: '' }
        ],
        skills: cv.skills?.length > 0 ? cv.skills.map(s => s.skill) : [''],
    });

    // ── NOTIFICATION (clean white card style) ──────────────────────────────
    const showNotification = (type, title, message) => {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes notifIn {
                    from { opacity: 0; transform: translateY(-14px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0)    scale(1);    }
                }
                @keyframes notifOut {
                    from { opacity: 1; transform: translateY(0)    scale(1);    }
                    to   { opacity: 0; transform: translateY(-14px) scale(0.95); }
                }
                @keyframes progressShrink {
                    from { width: 100%; }
                    to   { width: 0%;   }
                }
                [data-notif] .notif-close:hover { color: #374151 !important; background: #f3f4f6 !important; }
            `;
            document.head.appendChild(style);
        }

        const isSuccess = type === 'success';
        const accent      = isSuccess ? '#BF9952'               : '#ef4444';
        const accentLight = isSuccess ? 'rgba(191,153,82,0.12)' : 'rgba(239,68,68,0.10)';
        const accentBar   = isSuccess ? '#D4AF6A'               : '#f87171';
        const iconPath    = isSuccess ? 'M5 13l4 4L19 7'        : 'M6 18L18 6M6 6l12 12';

        const el = document.createElement('div');
        el.setAttribute('data-notif', '1');
        el.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            min-width: 320px;
            max-width: 400px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-left: 4px solid ${accent};
            border-radius: 14px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
            z-index: 9999;
            font-family: 'Poppins', sans-serif;
            overflow: hidden;
            animation: notifIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
        `;

        el.innerHTML = `
            <div style="padding: 16px 16px 14px; display: flex; align-items: flex-start; gap: 12px;">
                <div style="
                    flex-shrink: 0;
                    width: 38px; height: 38px;
                    background: ${accentLight};
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                ">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                         stroke="${accent}" stroke-width="2.5"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="${iconPath}"/>
                    </svg>
                </div>
                <div style="flex: 1; min-width: 0; padding-top: 2px;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827; line-height: 1.3;">
                        ${title}
                    </p>
                    <p style="margin: 5px 0 0; font-size: 12.5px; color: #6b7280; line-height: 1.45;">
                        ${message}
                    </p>
                </div>
                <button
                    class="notif-close"
                    onclick="var p=this.closest('[data-notif]');p.style.animation='notifOut 0.28s ease forwards';setTimeout(()=>p.remove(),280);"
                    style="
                        flex-shrink: 0;
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: #9ca3af;
                        padding: 4px;
                        margin-top: -2px;
                        border-radius: 6px;
                        transition: color 0.15s, background 0.15s;
                        display: flex; align-items: center; justify-content: center;
                    "
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2.5"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div style="height: 3px; background: #f3f4f6;">
                <div style="
                    height: 100%;
                    background: ${accentBar};
                    border-radius: 0 0 0 4px;
                    animation: progressShrink 3s linear forwards;
                "></div>
            </div>
        `;

        document.body.appendChild(el);

        setTimeout(() => {
            if (el.parentNode) {
                el.style.animation = 'notifOut 0.28s ease forwards';
                setTimeout(() => el.remove(), 280);
            }
        }, 3000);
    };
    // ──────────────────────────────────────────────────────────────────────

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => setPhotoData(evt.target.result);
        reader.readAsDataURL(file);
    };

    const handleArrayChange = (arrayName, index, field, value) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleResponsibilityChange = (workIdx, respIdx, value) => {
        setFormData(prev => ({
            ...prev,
            workExperiences: prev.workExperiences.map((work, i) => {
                if (i !== workIdx) return work;
                const newResp = [...work.responsibilities];
                newResp[respIdx] = value;
                return { ...work, responsibilities: newResp };
            })
        }));
    };

    const addResponsibility = (workIdx) => {
        setFormData(prev => ({
            ...prev,
            workExperiences: prev.workExperiences.map((work, i) =>
                i === workIdx ? { ...work, responsibilities: [...work.responsibilities, ''] } : work
            )
        }));
    };

    const removeResponsibility = (workIdx, respIdx) => {
        setFormData(prev => ({
            ...prev,
            workExperiences: prev.workExperiences.map((work, i) => {
                if (i !== workIdx) return work;
                return { ...work, responsibilities: work.responsibilities.filter((_, ri) => ri !== respIdx) };
            })
        }));
    };

    const addField = (arrayName) => {
        const templates = {
            workExperiences: { employer: '', position: '', start_date: '', leaving_date: '', responsibilities: [''] },
            educations: { school: '', field_of_study: '', start_date: '', graduation_date: '' },
            languages: { name: '', listening: 'A2', reading: 'A2', spoken_production: 'A2', spoken_interaction: 'A2', writing: 'A2' },
            certifications: { year: '', title: '', description: '', mode: '' },
            skills: '',
        };
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], templates[arrayName]]
        }));
    };

    const removeField = (arrayName, index) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index)
        }));
    };

    const cefrOptions = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'];

    const generateCVHTML = (person, photo, euLogo) => {
        const formatDOB = (dob) => {
            if (!dob) return '';
            if (dob.includes('-')) {
                const [y, m, d] = dob.split('-');
                return `${d}/${m}/${y}`;
            }
            return dob;
        };

        const workSection = person.workExperiences.map(work => {
            const respItems = (Array.isArray(work.responsibilities) ? work.responsibilities : [])
                .filter(r => r && r.trim());
            return `
            <div class="section-block">
                <div class="job-title">${work.position || ''} - <span class="employer">${work.employer || ''}</span></div>
                <div class="date-range">${work.start_date || ''}${work.leaving_date ? ' \u2013 ' + work.leaving_date : ' \u2013 Present'}</div>
                ${respItems.length > 0 ? `<ul class="bullet-list">${respItems.map(r => `<li>${r.trim()}</li>`).join('')}</ul>` : ''}
            </div>`;
        }).join('');

        const eduSection = person.educations.map(edu => `
            <div class="section-block">
                <div class="date-range">${edu.start_date || ''}${edu.graduation_date ? ' \u2013 ' + edu.graduation_date : ''}</div>
                <div class="edu-school">${edu.school || ''}</div>
                ${edu.field_of_study ? `<div class="field-study"><strong>Field of study:</strong> ${edu.field_of_study}</div>` : ''}
            </div>
        `).join('');

        const langRows = person.languages.map(lang => `
            <tr>
                <td class="lang-name"><strong>${lang.name || ''}</strong></td>
                <td class="cefr-cell">${lang.listening || ''}</td>
                <td class="cefr-cell">${lang.reading || ''}</td>
                <td class="cefr-cell">${lang.spoken_production || ''}</td>
                <td class="cefr-cell">${lang.spoken_interaction || ''}</td>
                <td class="cefr-cell">${lang.writing || ''}</td>
            </tr>
        `).join('');

        const certSection = person.certifications.filter(c => c.title).map(cert => `
            <div class="section-block">
                <div class="cert-year">${cert.year || ''}</div>
                <div class="cert-title">${cert.title || ''}</div>
                ${cert.description ? `<p class="cert-desc">${cert.description}</p>` : ''}
                ${cert.mode ? `<div class="field-study"><strong>Mode of learning:</strong> ${cert.mode}</div>` : ''}
            </div>
        `).join('');

        const skillsText = person.skills.filter(s => s).join(' | ');

        return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title></title>
<style>
@page { size: A4; margin: 15mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #111111; background: #fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
.ep-header { display: flex; align-items: flex-start; gap: 18px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 2px solid #cccccc; page-break-inside: avoid; }
.ep-photo-wrap { flex-shrink: 0; width: 90px; height: 90px; min-width: 90px; min-height: 90px; border-radius: 50%; overflow: hidden; border: 2px solid #ccc; background: #f0f0f0; display: flex; align-items: center; justify-content: center; }
.ep-photo-wrap img { width: 90px !important; height: 90px !important; min-width: 90px; min-height: 90px; max-width: 90px; max-height: 90px; object-fit: cover; border-radius: 50%; display: block; }
.ep-header-info { flex: 1; padding-top: 4px; }
.ep-name { font-size: 18pt; font-weight: 700; color: #111111; line-height: 1.1; margin-bottom: 8px; }
.ep-meta-row { font-size: 8.5pt; color: #222222; margin-bottom: 3px; display: flex; align-items: center; flex-wrap: wrap; }
.ep-meta-item { display: inline-flex; align-items: center; gap: 4px; }
.ep-meta-divider { width: 1px; height: 11px; background: #aaa; margin: 0 10px; display: inline-block; }
.ep-meta-row strong { color: #111111; }
.ep-meta-contact { font-size: 8pt; color: #222222; margin-top: 5px; }
.ep-meta-contact span { margin-right: 16px; }
.ep-logo-area { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-start; gap: 8px; padding-top: 4px; }
.ep-europass-logo { display: flex; align-items: center; gap: 8px; }
.ep-europass-text { font-size: 16pt; font-weight: 400; color: #5a4fcf; font-family: Arial, sans-serif; letter-spacing: 0.5px; }
.section-title-ep { font-size: 9pt; font-weight: 700; color: #1c3557; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1.5px solid #1c3557; padding-bottom: 3px; margin: 14px 0 8px 0; page-break-after: avoid; }
.section-content { padding-left: 2px; }
.section-block { margin-bottom: 10px; page-break-inside: avoid; }
.job-title { font-size: 9pt; font-weight: 700; color: #111111; }
.employer { font-weight: 700; color: #1c3557; font-style: italic; }
.date-range { font-size: 8pt; color: #333333; margin: 2px 0; }
.bullet-list { margin: 4px 0 0 14px; }
.bullet-list li { font-size: 8.5pt; color: #111111; margin-bottom: 2px; }
.edu-school { font-size: 9pt; font-weight: 700; color: #111111; }
.field-study { font-size: 8.5pt; color: #222222; margin-top: 3px; }
.mother-tongue-row { font-size: 8.5pt; color: #111111; margin-bottom: 8px; }
.mother-tongue-row span { font-weight: 700; }
.lang-table { width: 100%; border-collapse: collapse; font-size: 8pt; page-break-inside: avoid; }
.lang-table th { background: #f2f4f7; color: #1c3557; font-weight: 700; text-align: center; padding: 4px 6px; border: 1px solid #dde2ea; font-size: 7.5pt; }
.lang-table td { border: 1px solid #dde2ea; padding: 4px 6px; text-align: center; color: #111111; }
.lang-name { text-align: left !important; width: 140px; }
.cefr-cell { width: 60px; }
.lang-note { font-size: 7pt; color: #555555; margin-top: 4px; font-style: italic; }
.lang-group-header { background: #e8ecf2 !important; font-size: 7pt !important; color: #333333 !important; }
.cert-year { font-size: 8pt; color: #333333; }
.cert-title { font-size: 9pt; font-weight: 700; color: #1c3557; margin: 2px 0; }
.cert-desc { font-size: 8.5pt; color: #222222; margin-top: 3px; line-height: 1.4; }
.skills-text { font-size: 8.5pt; color: #111111; line-height: 1.6; }
.about-text { font-size: 8.5pt; color: #111111; line-height: 1.55; }
</style>
</head>
<body>
<div class="ep-header">
    <div class="ep-photo-wrap">
        ${photo
          ? `<img src="${photo}" alt="Photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;"/>`
          : `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
        }
    </div>
    <div class="ep-header-info">
        <div class="ep-name">${person.full_name || ''}</div>
        <div class="ep-meta-row">
            ${person.date_of_birth ? `<span class="ep-meta-item"><strong>Date of birth:</strong>&nbsp;${formatDOB(person.date_of_birth)}</span>` : ''}
            ${person.nationality ? `<span class="ep-meta-divider"></span><span class="ep-meta-item"><strong>Nationality:</strong>&nbsp;${person.nationality}</span>` : ''}
            ${person.gender ? `<span class="ep-meta-divider"></span><span class="ep-meta-item"><strong>Gender:</strong>&nbsp;${person.gender}</span>` : ''}
        </div>
        ${(person.address || person.mobile_phone || person.email_address) ? `
        <div class="ep-meta-contact">
            ${person.address ? `<span>${person.address}</span>` : ''}
            ${person.mobile_phone ? `<span>${person.mobile_phone}</span>` : ''}
            ${person.email_address ? `<span>${person.email_address}</span>` : ''}
        </div>` : ''}
    </div>
    <div class="ep-logo-area">
        <div class="ep-europass-logo">
            ${euLogo ? `<img src="${euLogo}" alt="EU" style="width:36px;height:24px;object-fit:contain;display:inline-block;"/>` : ''}
            <span class="ep-europass-text">europass</span>
        </div>
    </div>
</div>

${person.about_me ? `<div class="section-title-ep">About Me</div><div class="section-content"><p class="about-text">${person.about_me}</p></div>` : ''}

<div class="section-title-ep">Work Experience</div>
<div class="section-content">${workSection}</div>

<div class="section-title-ep">Education and Training</div>
<div class="section-content">${eduSection}</div>

<div class="section-title-ep">Language Skills</div>
<div class="section-content">
    ${person.mother_tongue ? `<div class="mother-tongue-row">Mother tongue(s): <span>${person.mother_tongue}</span></div>` : ''}
    ${person.languages.length > 0 ? `
    <div style="font-size:8pt;color:#333;margin-bottom:4px;">Other language(s):</div>
    <table class="lang-table">
        <thead>
            <tr>
                <th rowspan="2" class="lang-name" style="text-align:left;">Language</th>
                <th colspan="2" class="lang-group-header">UNDERSTANDING</th>
                <th colspan="2" class="lang-group-header">SPEAKING</th>
                <th class="lang-group-header">WRITING</th>
            </tr>
            <tr>
                <th>Listening</th><th>Reading</th><th>Spoken production</th><th>Spoken interaction</th><th>Writing</th>
            </tr>
        </thead>
        <tbody>${langRows}</tbody>
    </table>
    <div class="lang-note">Levels: A1 and A2: Basic user; B1 and B2: Independent user; C1 and C2: Proficient user</div>
    ` : ''}
</div>

${person.certifications.some(c => c.title) ? `<div class="section-title-ep">Certifications</div><div class="section-content">${certSection}</div>` : ''}
${skillsText ? `<div class="section-title-ep">Skills</div><div class="section-content"><p class="skills-text">${skillsText}</p></div>` : ''}

</body>
</html>`;
    };

    const downloadHTML = () => {
        const html = generateCVHTML(formData, photoData, euLogoData);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CV_${formData.full_name || 'unnamed'}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const saveChanges = async () => {
        if (!formData.full_name.trim()) {
            showNotification('error', 'Validation Error', 'Nama wajib diisi!');
            return;
        }
        setIsGenerating(true);
        const safeDOB = formData.date_of_birth && /^\d{4}-\d{2}-\d{2}$/.test(formData.date_of_birth) ? formData.date_of_birth : null;

        const dataToSubmit = { ...formData, date_of_birth: safeDOB, photo: photoData, _method: 'PUT' };
        
        router.post(`/dashboard/slokavia/${cv.id}`, dataToSubmit, {
            preserveScroll: true,
            onSuccess: () => {
                showNotification('success', 'Berhasil', 'CV Slokavia berhasil diupdate');
                setIsGenerating(false);
                setTimeout(() => router.visit(`/dashboard/slokavia/${cv.id}`), 1000);
            },
            onError: () => {
                showNotification('error', 'Gagal', 'Terjadi kesalahan saat menyimpan data');
                setIsGenerating(false);
            }
        });
    };

    const previewCV = () => {
        const html = generateCVHTML(formData, photoData, euLogoData);
        const newWindow = window.open();
        newWindow.document.write(html);
        newWindow.document.close();
    };

    const nextStep = () => { if (currentStep < 5) setCurrentStep(currentStep + 1); };
    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
        else router.visit(`/dashboard/slokavia/${cv.id}`);
    };

    const formStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
        .animate-scale-in { animation: scaleIn 0.5s ease-out; }
        .animate-slide-in-left { animation: slideInLeft 0.5s ease-out; }
        .form-input { width: 100%; padding: 12px 16px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 14px; transition: all 0.3s; background: white; font-family: 'Poppins', sans-serif; }
        .form-input:focus { outline: none; border-color: #BF9952; box-shadow: 0 0 0 3px rgba(191,153,82,0.1); }
        .btn-primary { background: linear-gradient(135deg, #BF9952 0%, #D4AF6A 100%); transition: all 0.3s cubic-bezier(0.4,0,0.2,1); box-shadow: 0 4px 15px rgba(191,153,82,0.3); }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(191,153,82,0.4); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-back { position: relative; padding: 10px 20px; border-radius: 12px; background: white; border: 2px solid #e5e7eb; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); overflow: hidden; }
        .btn-back:hover { border-color: #BF9952; box-shadow: 0 4px 15px rgba(191,153,82,0.2); transform: translateX(-5px); }
        .step-indicator { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 32px; }
        .step-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; transition: all 0.3s; }
        .step-dot.active { background: linear-gradient(135deg, #BF9952, #D4AF6A); color: white; box-shadow: 0 4px 12px rgba(191,153,82,0.4); }
        .step-dot.done { background: #1a1a1a; color: white; }
        .step-dot.inactive { background: #f3f4f6; color: #9ca3af; border: 2px solid #e5e7eb; }
        .step-line { flex: 1; max-width: 40px; height: 2px; background: #e5e7eb; }
        .step-line.done { background: #1a1a1a; }
        .section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #BF9952; margin-bottom: 16px; }
        .remove-btn { padding: 4px 10px; background: #fee2e2; color: #dc2626; border-radius: 6px; font-size: 12px; border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .remove-btn:hover { background: #fecaca; }
        .resp-row { display: flex; gap: 8px; align-items: center; }
        .resp-number { flex-shrink: 0; width: 24px; height: 24px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: #6b7280; }
    `;

    const stepLabels = ['Profile', 'Work Exp', 'Education', 'Languages', 'Skills & More'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <style>{formStyles}</style>

            {/* Header */}
            <div className="bg-white border-b shadow-sm animate-fade-in-up">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <img src={headerLogo1} alt="Loring Margi" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <button onClick={prevStep} className="btn-back flex items-center gap-2 text-gray-700 font-bold mb-6 animate-slide-in-left">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>

                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-scale-in">

                    {/* Step Indicator */}
                    <div className="step-indicator">
                        {stepLabels.map((label, i) => {
                            const step = i + 1;
                            const state = step === currentStep ? 'active' : step < currentStep ? 'done' : 'inactive';
                            return (
                                <React.Fragment key={step}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div className={`step-dot ${state}`}>{step < currentStep ? '✓' : step}</div>
                                        <div style={{ fontSize: '9px', marginTop: '4px', color: state === 'active' ? '#BF9952' : '#9ca3af', fontWeight: state === 'active' ? '600' : '400' }}>{label}</div>
                                    </div>
                                    {i < stepLabels.length - 1 && <div className={`step-line ${step < currentStep ? 'done' : ''}`} />}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* ── STEP 1: PROFILE ── */}
                    {currentStep === 1 && (
                        <>
                            <h1 className="text-3xl font-bold mb-1">Edit CV Slokavia</h1>
                            <p className="text-gray-500 mb-8">Step 1 — Personal Profile</p>

                            <div className="section-label">Basic Info</div>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Full Name</label>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="form-input" placeholder="Full Name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">About Me</label>
                                    <textarea name="about_me" value={formData.about_me} onChange={handleInputChange} className="form-input" rows="4" placeholder="Describe yourself, your experience, and what you bring to the role..." />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Date of Birth</label>
                                        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="form-input" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Place of Birth</label>
                                        <input type="text" name="place_of_birth" value={formData.place_of_birth} onChange={handleInputChange} className="form-input" placeholder="City" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="form-input">
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Nationality</label>
                                    <select name="nationality" value={formData.nationality} onChange={handleInputChange} className="form-input">
                                        <option value="">Select Nationality</option>
                                        <option value="Indonesian">Indonesian</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="section-label mt-8">Contact</div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} className="form-input" rows="2" placeholder="Full address" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Mobile Phone</label>
                                        <input type="text" name="mobile_phone" value={formData.mobile_phone} onChange={handleInputChange} className="form-input" placeholder="+62 ..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Email Address</label>
                                        <input type="email" name="email_address" value={formData.email_address} onChange={handleInputChange} className="form-input" placeholder="email@example.com" />
                                    </div>
                                </div>
                            </div>

                            <div className="section-label mt-8">Profile Picture</div>
                            <button onClick={() => document.getElementById('photo').click()} className="w-full py-3 bg-gray-100 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition font-medium">
                                {photoData ? 'Photo selected — click to change' : 'Upload Photo'}
                            </button>
                            <input id="photo" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            {photoData && <img src={photoData} alt="Preview" className="mt-4 w-24 h-24 object-cover rounded-full border-2 border-gray-300" />}
                        </>
                    )}

                    {/* ── STEP 2: WORK EXPERIENCE ── */}
                    {currentStep === 2 && (
                        <>
                            <h1 className="text-3xl font-bold mb-1">Work Experience</h1>
                            <p className="text-gray-500 mb-8">Step 2 — List your work history</p>
                            <div className="space-y-6">
                                {formData.workExperiences.map((work, idx) => (
                                    <div key={idx} className="p-5 border-2 border-gray-100 rounded-xl space-y-3 bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-sm text-gray-600">Experience #{idx + 1}</span>
                                            {formData.workExperiences.length > 1 && (
                                                <button className="remove-btn" onClick={() => removeField('workExperiences', idx)}>Remove</button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input type="text" value={work.employer} onChange={(e) => handleArrayChange('workExperiences', idx, 'employer', e.target.value)} className="form-input" placeholder="Employer / Company Name" />
                                            <input type="text" value={work.position} onChange={(e) => handleArrayChange('workExperiences', idx, 'position', e.target.value)} className="form-input" placeholder="Position / Job Title" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" value={work.start_date} onChange={(e) => handleArrayChange('workExperiences', idx, 'start_date', e.target.value)} className="form-input" placeholder="Start Date (e.g. 05/2023)" />
                                            <input type="text" value={work.leaving_date} onChange={(e) => handleArrayChange('workExperiences', idx, 'leaving_date', e.target.value)} className="form-input" placeholder="End Date / Current" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-2">
                                                Responsibilities <span className="font-normal text-gray-400">(one per row)</span>
                                            </label>
                                            <div className="space-y-2">
                                                {work.responsibilities.map((resp, ri) => (
                                                    <div key={ri} className="resp-row">
                                                        <div className="resp-number">{ri + 1}</div>
                                                        <input type="text" value={resp} onChange={(e) => handleResponsibilityChange(idx, ri, e.target.value)} className="form-input" placeholder={`Responsibility ${ri + 1}`} />
                                                        {work.responsibilities.length > 1 && (
                                                            <button className="remove-btn" onClick={() => removeResponsibility(idx, ri)}>✕</button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={() => addResponsibility(idx)} className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                Add Row
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addField('workExperiences')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                    Add Experience
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── STEP 3: EDUCATION ── */}
                    {currentStep === 3 && (
                        <>
                            <h1 className="text-3xl font-bold mb-1">Education and Training</h1>
                            <p className="text-gray-500 mb-8">Step 3 — Your educational background</p>
                            <div className="space-y-6">
                                {formData.educations.map((edu, idx) => (
                                    <div key={idx} className="p-5 border-2 border-gray-100 rounded-xl space-y-3 bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-sm text-gray-600">Education #{idx + 1}</span>
                                            {formData.educations.length > 1 && (
                                                <button className="remove-btn" onClick={() => removeField('educations', idx)}>Remove</button>
                                            )}
                                        </div>
                                        <input type="text" value={edu.school} onChange={(e) => handleArrayChange('educations', idx, 'school', e.target.value)} className="form-input" placeholder="School / Institution Name" />
                                        <input type="text" value={edu.field_of_study} onChange={(e) => handleArrayChange('educations', idx, 'field_of_study', e.target.value)} className="form-input" placeholder="Field of Study / Major" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" value={edu.start_date} onChange={(e) => handleArrayChange('educations', idx, 'start_date', e.target.value)} className="form-input" placeholder="Start Year (e.g. 2015)" />
                                            <input type="text" value={edu.graduation_date} onChange={(e) => handleArrayChange('educations', idx, 'graduation_date', e.target.value)} className="form-input" placeholder="Graduation Year (e.g. 2018)" />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addField('educations')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                    Add Education
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── STEP 4: LANGUAGES ── */}
                    {currentStep === 4 && (
                        <>
                            <h1 className="text-3xl font-bold mb-1">Language Skills</h1>
                            <p className="text-gray-500 mb-8">Step 4 — CEFR level for each language</p>

                            <div className="section-label">Mother Tongue</div>
                            <div className="mb-6">
                                <input type="text" name="mother_tongue" value={formData.mother_tongue} onChange={handleInputChange} className="form-input" placeholder="e.g. Indonesian, Javanese" />
                            </div>

                            <div className="section-label">Other Languages</div>
                            <div className="space-y-5">
                                {formData.languages.map((lang, idx) => (
                                    <div key={idx} className="p-5 border-2 border-gray-100 rounded-xl bg-gray-50 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-sm text-gray-600">Language #{idx + 1}</span>
                                            {formData.languages.length > 1 && (
                                                <button className="remove-btn" onClick={() => removeField('languages', idx)}>Remove</button>
                                            )}
                                        </div>
                                        <input type="text" value={lang.name} onChange={(e) => handleArrayChange('languages', idx, 'name', e.target.value)} className="form-input" placeholder="Language (e.g. English)" />
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                            {[
                                                { key: 'listening', label: 'Listening' },
                                                { key: 'reading', label: 'Reading' },
                                                { key: 'spoken_production', label: 'Spoken Prod.' },
                                                { key: 'spoken_interaction', label: 'Spoken Inter.' },
                                                { key: 'writing', label: 'Writing' },
                                            ].map(({ key, label }) => (
                                                <div key={key}>
                                                    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                                                    <select value={lang[key]} onChange={(e) => handleArrayChange('languages', idx, key, e.target.value)} className="form-input" style={{ padding: '10px' }}>
                                                        {cefrOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addField('languages')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                    Add Language
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── STEP 5: SKILLS & CERTIFICATIONS ── */}
                    {currentStep === 5 && (
                        <>
                            <h1 className="text-3xl font-bold mb-1">Skills & Certifications</h1>
                            <p className="text-gray-500 mb-8">Step 5 — Final step!</p>

                            <div className="section-label">Certifications</div>
                            <div className="space-y-5 mb-8">
                                {formData.certifications.map((cert, idx) => (
                                    <div key={idx} className="p-5 border-2 border-gray-100 rounded-xl bg-gray-50 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-sm text-gray-600">Certification #{idx + 1}</span>
                                            {formData.certifications.length > 1 && (
                                                <button className="remove-btn" onClick={() => removeField('certifications', idx)}>Remove</button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <input type="text" value={cert.year} onChange={(e) => handleArrayChange('certifications', idx, 'year', e.target.value)} className="form-input" placeholder="Year (e.g. 2022)" />
                                            <div className="col-span-2">
                                                <input type="text" value={cert.title} onChange={(e) => handleArrayChange('certifications', idx, 'title', e.target.value)} className="form-input" placeholder="Certificate Title" />
                                            </div>
                                        </div>
                                        <textarea value={cert.description} onChange={(e) => handleArrayChange('certifications', idx, 'description', e.target.value)} className="form-input" rows="3" placeholder="Brief description of the training/certification..." />
                                        <input type="text" value={cert.mode} onChange={(e) => handleArrayChange('certifications', idx, 'mode', e.target.value)} className="form-input" placeholder="Mode of learning (e.g. Work based, Online)" />
                                    </div>
                                ))}
                                <button onClick={() => addField('certifications')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                    Add Certification
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>

                            <div className="section-label">Skills</div>
                            <div className="space-y-3 mb-8">
                                <p className="text-xs text-gray-500">List your key skills (one per field, will be separated by " | " on the CV)</p>
                                {formData.skills.map((skill, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text" value={skill}
                                            onChange={(e) => {
                                                const newSkills = [...formData.skills];
                                                newSkills[idx] = e.target.value;
                                                setFormData(prev => ({ ...prev, skills: newSkills }));
                                            }}
                                            className="form-input" placeholder="e.g. Operation of 2-Needle industrial sewing machine"
                                        />
                                        {formData.skills.length > 1 && (
                                            <button className="remove-btn" onClick={() => removeField('skills', idx)}>✕</button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={() => addField('skills')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                    Add Skill
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>

                            <button onClick={saveChanges} disabled={isGenerating} className="w-full py-4 text-white rounded-lg transition font-semibold mb-4 flex items-center justify-center gap-2" style={{ backgroundColor: "#03C500" }}>
                                {isGenerating
                                    ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />Menyimpan...</>
                                    : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>Print PDF</>
                                }
                            </button>
                            
                        </>
                    )}

                    {currentStep < 5 && (
                        <button onClick={nextStep} className="w-full mt-10 py-4 btn-primary text-white rounded-lg font-semibold flex items-center justify-center gap-2">
                            Next
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-gradient-to-r from-[#BF9952] via-[#D4AF6A] to-[#BF9952] text-white py-8 mt-16 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
                    <p className="text-sm font-light">Copyright &copy; 2025 Loring Margi International</p>
                    <p className="text-xs opacity-90">Powered by <span className="font-semibold">CyberLabs</span></p>
                </div>
            </div>
        </div>
    );
};

export default CVEditSlokavia;