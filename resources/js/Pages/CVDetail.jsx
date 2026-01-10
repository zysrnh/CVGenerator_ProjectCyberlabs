
import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const CVDetail = ({ cv }) => {
    const headerLogo1 = '/storage/logo/LoringMargi.png';
    const headerLogo2 = '/storage/logo/Patika.jpeg';
    const [companyLogoData, setCompanyLogoData] = useState(null);
    const [patikaLogoData, setPatikaLogoData] = useState(null);
    const [photoData, setPhotoData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const loadImages = async () => {
            try {
                // Load company logo
                try {
                    const response1 = await fetch('/storage/logo/LoringMargi.png');
                    const blob1 = await response1.blob();
                    const reader1 = new FileReader();
                    reader1.onloadend = () => setCompanyLogoData(reader1.result);
                    reader1.readAsDataURL(blob1);
                } catch (err) {
                    console.log('Company logo not found');
                }

                // Load patika logo
                try {
                    const response2 = await fetch('/storage/logo/Patika.jpeg');
                    const blob2 = await response2.blob();
                    const reader2 = new FileReader();
                    reader2.onloadend = () => setPatikaLogoData(reader2.result);
                    reader2.readAsDataURL(blob2);
                } catch (err) {
                    console.log('Patika logo not found');
                }

                // Load CV photo
                if (cv.photo_path) {
                    try {
                        const response3 = await fetch(`/storage/${cv.photo_path}`);
                        const blob3 = await response3.blob();
                        const reader3 = new FileReader();
                        reader3.onloadend = () => setPhotoData(reader3.result);
                        reader3.readAsDataURL(blob3);
                    } catch (err) {
                        console.log('Photo not found');
                    }
                }
            } catch (error) {
                console.error('Failed to load images:', error);
            }
        };
        loadImages();
    }, [cv.photo_path]);

    const generateCVHTML = (person, photoData, companyLogo, patikaLogo) => {
        const workRows = person.work_experiences?.map(work =>
            `<tr><td>${work.employer || ''}</td><td>${work.position || ''}</td><td class="center-text">${work.start_date || ''}</td><td class="center-text">${work.leaving_date || ''}</td></tr>`
        ).join('') || '<tr><td colspan="4" class="center-text">No work experience</td></tr>';

        const eduRows = person.educations?.map(edu =>
            `<tr><td>${edu.school || ''}</td><td>${edu.study || ''}</td><td class="center-text">${edu.start_date || ''}</td><td class="center-text">${edu.graduation_date || ''}</td></tr>`
        ).join('') || '<tr><td colspan="4" class="center-text">No education</td></tr>';

        const langCols = person.languages?.map(lang => `<th>${lang.name}</th>`).join('') || '<th>English</th><th>Russian</th>';
        const langVals = person.languages?.map(lang => `<td class="center-text">${lang.level}</td>`).join('') || '<td class="center-text">-</td><td class="center-text">-</td>';
        const pcRows = person.pc_skills?.map(skill => `<tr><td>${skill.name}</td><td class="center-text">${skill.level}</td></tr>`).join('') || '<tr><td>MS Word</td><td class="center-text">-</td></tr><tr><td>MS Excel</td><td class="center-text">-</td></tr>';
        const otherSkillsText = person.other_skills?.map(s => s.skill).filter(s => s).join(', ') || '-';

        return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>CV - ${person.full_name || ''}</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:0}*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Montserrat',sans-serif;margin:0;padding:0;font-size:8pt;background:#fff;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.page{width:210mm;min-height:297mm;padding:8mm 12mm;margin:0 auto;background:white;page-break-after:always}.page:last-child{page-break-after:auto}.header{display:flex;align-items:stretch;border:2px solid #000;margin-bottom:6px;height:100px}.header-left{display:flex;align-items:stretch;flex:1}.photo-container{width:85px;border-right:2px solid #000;overflow:hidden;background:#f0f0f0;display:flex;align-items:center;justify-content:center;flex-shrink:0}.photo-container img{width:100%;height:100%;object-fit:cover}.header-text{flex:1;display:flex;flex-direction:column}.header-text table{width:100%;border-collapse:collapse;height:100%}.header-text td{border:1px solid #000;padding:3px 8px;font-size:8pt;vertical-align:middle}.header-text .label-col{width:180px;background:#e0e0e0;font-weight:600;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.header-right{width:200px;display:flex;flex-direction:column;border-left:2px solid #000;flex-shrink:0}.logo-box{display:flex;align-items:center;justify-content:center;border-bottom:2px solid #000}.logo-box:last-child{border-bottom:none}.logo-box:first-child{height:30px;background:#000;padding:5px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.logo-box:nth-child(2){height:30px;background:#fff;padding:5px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.logo-box:last-child{height:40px;background:#fff;padding:6px;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.logo-box img{max-width:100%;max-height:100%;object-fit:contain}.company-text{text-align:center;font-weight:700;font-size:7.5pt;line-height:1.2;color:#000}.section-title{background:#e0e0e0;border:2px solid #000;padding:3px;font-weight:700;text-align:center;margin-top:4px;margin-bottom:0;font-size:8.5pt;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}table.data-table{width:100%;border-collapse:collapse;margin-bottom:0}.data-table td,.data-table th{border:1px solid #000;padding:2px 5px;font-size:8pt;vertical-align:middle}.data-table th{background:#e0e0e0;font-weight:700;text-align:center;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.data-table .label-col{width:160px;background:#e0e0e0;font-weight:600;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.center-text{text-align:center}
</style>
</head>
<body>
<div class="page">
<div class="header"><div class="header-left"><div class="photo-container">${photoData ? `<img src="${photoData}" alt="Photo"/>` : '<div style="font-size:10pt;font-weight:700;color:#666;">PHOTO</div>'}</div><div class="header-text"><table><tr><td class="label-col">FULL NAME / ADI SOYADI</td><td><strong>${person.full_name || ''}</strong></td></tr><tr><td class="label-col">OBJECTIVE / HEDEF</td><td>${person.objective || ''}</td></tr><tr><td class="label-col">POSITION APPLIED FOR / BAŞVURULAN POZİSYON</td><td>${person.position_applied || ''}</td></tr></table></div></div><div class="header-right"><div class="logo-box">${companyLogo ? `<img src="${companyLogo}" alt="Logo"/>` : ''}</div><div class="logo-box">${patikaLogo ? `<img src="${patikaLogo}" alt="Patika"/>` : ''}</div><div class="logo-box"><div class="company-text">PT. LORING MARGI<br/>INTERNASIONAL</div></div></div></div>
<div class="section-title">PERSONAL DETAILS / KİŞİSEL BİLGİLER</div><table class="data-table"><tr><td class="label-col">AGE / YAŞ</td><td>${person.age || ''}</td></tr><tr><td class="label-col">SEX / CİNSİYET</td><td>${person.sex || ''}</td></tr><tr><td class="label-col">HEIGHT / BOY</td><td>${person.height || ''}</td></tr><tr><td class="label-col">WEIGHT / KİLO</td><td>${person.weight || ''}</td></tr><tr><td class="label-col">ADDRESS / ADRES</td><td>${person.address || ''}</td></tr><tr><td class="label-col">MOBILE PHONE / CEP TELEFONU</td><td>${person.mobile_phone || ''}</td></tr><tr><td class="label-col">EMAIL ADDRESS / EMAİL ADRESİ</td><td>${person.email_address || ''}</td></tr><tr><td class="label-col">PLACE OF BIRTH / DOĞUM YERİ</td><td>${person.place_of_birth || ''}</td></tr><tr><td class="label-col">DATE OF BIRTH / DOĞUM TARİHİ</td><td>${person.date_of_birth || ''}</td></tr><tr><td class="label-col">NATIONALITY / MİLLİYETİ</td><td>${person.nationality || ''}</td></tr><tr><td class="label-col">MARITAL STATUS / MEDENİ DURUMU</td><td>${person.marital_status || ''}</td></tr><tr><td class="label-col">PASSPORT NUMBER / PASAPORT NUMARASI</td><td>${person.passport_number || ''}</td></tr><tr><td class="label-col">PASSPORT EXPIRY DATE / PASAPORT GEÇERLİLİK TARİHİ</td><td>${person.passport_expiry_date || ''}</td></tr></table>
<div class="section-title">WORK EXPERIENCES / İŞ TECRÜBELERİ</div><table class="data-table"><thead><tr><th style="width:35%;">NAME OF EMPLOYER / İŞVERENİN ADI</th><th style="width:35%;">POSITION & RESPONSIBILITIES / GÖREV VE SORUMLULUKLAR</th><th style="width:15%;">STARTING DATE / BAŞLANGIÇ TARİHİ</th><th style="width:15%;">LEAVING DATE / AYRILIŞ TARİHİ</th></tr></thead><tbody>${workRows}</tbody></table>
<div class="section-title">EDUCATION HISTORY / EĞİTİM DURUMU</div><table class="data-table"><thead><tr><th style="width:40%;">SCHOOL NAME / OKULUN ADI</th><th style="width:30%;">STUDY / BÖLÜM</th><th style="width:15%;">STARTING DATE / BAŞLANGIÇ TARİHİ</th><th style="width:15%;">GRADUATION DATE / AYRILIŞ TARİHİ</th></tr></thead><tbody>${eduRows}</tbody></table>
<div class="section-title">QUALIFICATION & SKILLS / YETKİNLİK VE YETENEKLER</div><table class="data-table"><thead><tr><th style="width:20%;">LANGUAGE SKILLS / YABANCI DİL</th>${langCols}</tr></thead><tbody><tr><td class="center-text">Fluent - Good - Beginner</td>${langVals}</tr></tbody></table>
<table class="data-table" style="margin-top:6px;"><thead><tr><th style="width:30%;">PC SKILLS / BİLGİSAYAR</th><th>SKILL LEVEL</th></tr></thead><tbody>${pcRows}</tbody></table>
<table class="data-table" style="margin-top:6px;"><thead><tr><th>OTHER SKILLS / DİĞER</th></tr></thead><tbody><tr><td>${otherSkillsText}</td></tr></tbody></table>
</div></body></html>`;
    };

    const downloadPDF = async () => {
        setIsGenerating(true);

        try {
            const cvData = {
                full_name: cv.full_name,
                objective: cv.objective,
                position_applied: cv.position_applied,
                age: cv.age,
                sex: cv.sex,
                height: cv.height,
                weight: cv.weight,
                address: cv.address,
                mobile_phone: cv.mobile_phone,
                email_address: cv.email_address,
                place_of_birth: cv.place_of_birth,
                date_of_birth: cv.date_of_birth,
                nationality: cv.nationality,
                marital_status: cv.marital_status,
                passport_number: cv.passport_number,
                passport_expiry_date: cv.passport_expiry_date,
                work_experiences: cv.work_experiences || [],
                educations: cv.educations || [],
                languages: cv.languages || [],
                pc_skills: cv.pc_skills || [],
                other_skills: cv.other_skills || []
            };

            const html = generateCVHTML(cvData, photoData, companyLogoData, patikaLogoData);

            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.left = '-9999px';
            iframe.style.width = '210mm';
            iframe.style.height = '297mm';
            document.body.appendChild(iframe);

            iframe.contentDocument.open();
            iframe.contentDocument.write(html);
            iframe.contentDocument.close();

            await new Promise(resolve => setTimeout(resolve, 500));

            iframe.contentWindow.print();

            setTimeout(() => document.body.removeChild(iframe), 1000);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
                .animate-scale-in { animation: scaleIn 0.5s ease-out; }
                .animate-slide-in-left { animation: slideInLeft 0.5s ease-out; }
                
                .card-elegant {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    background: white;
                }
                
                .card-elegant:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                }
                
                .btn-back {
                    position: relative;
                    padding: 12px 24px;
                    border-radius: 12px;
                    background: white;
                    border: 2px solid #e5e7eb;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }
                
                .btn-back::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(191, 153, 82, 0.1), transparent);
                    transition: left 0.5s;
                }
                
                .btn-back:hover::before {
                    left: 100%;
                }
                
                .btn-back:hover {
                    border-color: #BF9952;
                    box-shadow: 0 4px 15px rgba(191, 153, 82, 0.2);
                    transform: translateX(-5px);
                }
                
                .btn-print {
                    background: #03C500;
                    transition: all 0.3s cubic-bezic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 15px rgba(3, 197, 0, 0.3);
                }
                
                .btn-print:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(3, 197, 0, 0.4);
                    background: #02b000;
                }
                
                .btn-print:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .section-title {
                    position: relative;
                    padding-left: 20px;
                }
                
                .section-title::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 4px;
                    height: 32px;
                    background: linear-gradient(180deg, #BF9952 0%, #D4AF6A 100%);
                    border-radius: 2px;
                }
                
                .info-card {
                    border-left: 4px solid #BF9952;
                    padding-left: 16px;
                    transition: all 0.3s;
                }
                
                .info-card:hover {
                    border-left-color: #D4AF6A;
                    transform: translateX(4px);
                }
            `}</style>

            {/* Header */}
            <div className="bg-white border-b shadow-sm animate-fade-in-up">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
                    <Link href="/dashboard" className="w-32 sm:w-40 transform transition hover:scale-105">
                        <img src={headerLogo1} alt="Loring Margi" className="w-full h-auto" />
                    </Link>
                    <div className="w-32 sm:w-40 transform transition hover:scale-105">
                        <img src={headerLogo2} alt="Patika" className="w-full h-auto" />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between gap-4 mb-6 animate-slide-in-left">
                    <Link
                        href="/dashboard"
                        className="btn-back inline-flex items-center gap-2 text-gray-700 font-bold"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center gap-3">
                        {/* 🆕 TOMBOL EDIT */}
                        <Link
                            href={`/dashboard/${cv.id}/edit`}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit CV
                        </Link>

                        <button
                            onClick={downloadPDF}
                            disabled={isGenerating}
                            className="btn-print px-6 py-3 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Profile Header Card */}
                <div className="card-elegant rounded-3xl shadow-2xl p-8 md:p-12 mb-6 animate-scale-in">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Photo Section */}
                        <div className="flex-shrink-0">
                            {cv.photo_path ? (
                                <img
                                    src={`/storage/${cv.photo_path}`}
                                    alt={cv.full_name}
                                    className="w-48 h-48 rounded-2xl object-cover shadow-lg ring-4 ring-gray-100"
                                />
                            ) : (
                                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-[#BF9952] to-[#D4AF6A] flex items-center justify-center text-white text-6xl font-bold shadow-lg">
                                    {cv.full_name?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">{cv.full_name}</h1>
                                <p className="text-xl text-[#BF9952] font-semibold mb-1">{cv.position_applied || 'Position not specified'}</p>
                                {cv.objective && (
                                    <p className="text-gray-600 italic">{cv.objective}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="p-2 bg-gradient-to-br from-[#BF9952] to-[#D4AF6A] rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">{cv.email_address || 'No email'}</span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="p-2 bg-gradient-to-br from-[#BF9952] to-[#D4AF6A] rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">{cv.mobile_phone || 'No phone'}</span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="p-2 bg-gradient-to-br from-[#BF9952] to-[#D4AF6A] rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">{cv.nationality || 'Unknown'}</span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-700">
                                    <div className="p-2 bg-gradient-to-br from-[#BF9952] to-[#D4AF6A] rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium">{cv.date_of_birth || 'No DOB'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Details Card */}
                <div className="card-elegant rounded-3xl shadow-2xl p-8 md:p-12 mb-6 animate-scale-in">
                    <h2 className="section-title text-3xl font-bold text-gray-900 mb-8">
                        Personal Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="info-card">
                            <p className="text-sm text-gray-600 font-semibold mb-1">Place of Birth</p>
                            <p className="text-gray-900 font-medium text-lg">{cv.place_of_birth || '-'}</p>
                        </div>

                        <div className="info-card">
                            <p className="text-sm text-gray-600 font-semibold mb-1">Marital Status</p>
                            <p className="text-gray-900 font-medium text-lg">{cv.marital_status || '-'}</p>
                        </div>

                        <div className="info-card">
                            <p className="text-sm text-gray-600 font-semibold mb-1">Passport Number</p>
                            <p className="text-gray-900 font-medium text-lg">{cv.passport_number || '-'}</p>
                        </div>

                        <div className="info-card">
                            <p className="text-sm text-gray-600 font-semibold mb-1">Passport Expiry</p>
                            <p className="text-gray-900 font-medium text-lg">{cv.passport_expiry_date || '-'}</p>
                        </div>

                        <div className="info-card md:col-span-2">
                            <p className="text-sm text-gray-600 font-semibold mb-1">Address</p>
                            <p className="text-gray-900 font-medium text-lg">{cv.address || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Work Experience Card */}
                {cv.work_experiences?.length > 0 && (
                    <div className="card-elegant rounded-3xl shadow-2xl p-8 md:p-12 mb-6 animate-scale-in">
                        <h2 className="section-title text-3xl font-bold text-gray-900 mb-8">
                            Work Experience
                        </h2>

                        <div className="space-y-8">
                            {cv.work_experiences.map((work, idx) => (
                                <div key={idx} className="info-card pb-8 border-b last:border-b-0 last:pb-0">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className="text-2xl font-bold text-gray-900">{work.position}</h3>
                                        <span className="px-4 py-2 bg-gradient-to-r from-[#BF9952] to-[#D4AF6A] text-white rounded-lg text-sm font-semibold whitespace-nowrap">
                                            {work.start_date} - {work.leaving_date}
                                        </span>
                                    </div>
                                    <p className="text-lg text-gray-700 font-medium">{work.employer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education Card */}
                {cv.educations?.length > 0 && (
                    <div className="card-elegant rounded-3xl shadow-2xl p-8 md:p-12 mb-6 animate-scale-in">
                        <h2 className="section-title text-3xl font-bold text-gray-900 mb-8">
                            Education History
                        </h2>

                        <div className="space-y-8">
                            {cv.educations.map((edu, idx) => (
                                <div key={idx} className="info-card pb-8 border-b last:border-b-0 last:pb-0">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className="text-2xl font-bold text-gray-900">{edu.school}</h3>
                                        <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold whitespace-nowrap">
                                            {edu.start_date} - {edu.graduation_date}
                                        </span>
                                    </div>
                                    <p className="text-lg text-gray-700 font-medium">{edu.study}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills Grid - Languages & PC Skills */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Languages Card */}
                    {cv.languages?.length > 0 && (
                        <div className="card-elegant rounded-3xl shadow-2xl p-8 md:p-12 animate-scale-in">
                            <h2 className="section-title text-3xl font-bold text-gray-900 mb-8">
                                Languages
                            </h2>

                            <div className="space-y-4">
                                {cv.languages.map((lang, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-[#BF9952] transition-all">
                                        <span className="font-bold text-gray-900 text-lg">{lang.name}</span>
                                        <span className="px-5 py-2.5 bg-gradient-to-r from-[#BF9952] to-[#D4AF6A] text-white rounded-lg text-sm font-bold shadow-md">
                                            {lang.level}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PC Skills Card */}
                    {cv.pc_skills?.length > 0 && (
                        <div className="card-elegant rounded-3xl shadow-2xl p-8 md:p-12 animate-scale-in">
                            <h2 className="section-title text-3xl font-bold text-gray-900 mb-8">
                                PC Skills
                            </h2>

                            <div className="space-y-4">
                                {cv.pc_skills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-500 transition-all">
                                        <span className="font-bold text-gray-900 text-lg">{skill.name}</span>
                                        <span className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-bold shadow-md">
                                            {skill.level}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Other Skills Card */}
                {cv.other_skills?.length > 0 && (
                    <div className="card-elegant rounded-3xl shadow-2xl p-8 md:p-12 mb-6 animate-scale-in">
                        <h2 className="section-title text-3xl font-bold text-gray-900 mb-8">
                            Other Skills
                        </h2>

                        <div className="flex flex-wrap gap-4">
                            {cv.other_skills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all text-base border-2 border-gray-300"
                                >
                                    {skill.skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-[#BF9952] via-[#D4AF6A] to-[#BF9952] text-white py-8 mt-16 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-2">
                    <p className="text-sm font-light">Copyright © 2025 Loring Margi International</p>
                    <p className="text-xs opacity-90">Powered by <span className="font-semibold">CyberLabs</span></p>
                </div>
            </div>
        </div>
    );
};

export default CVDetail;