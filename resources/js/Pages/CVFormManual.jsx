import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const CVFormManual = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [companyLogoData, setCompanyLogoData] = useState(null);
    const [patikaLogoData, setPatikaLogoData] = useState(null);
    const [photoData, setPhotoData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const headerLogo1 = '/storage/logo/LoringMargi.png';
    const headerLogo2 = '/storage/logo/Patika.jpeg';

    useEffect(() => {
        const loadImages = async () => {
            try {
                try {
                    const response1 = await fetch('/storage/logo/LoringMargi.png');
                    const blob1 = await response1.blob();
                    const reader1 = new FileReader();
                    reader1.onloadend = () => setCompanyLogoData(reader1.result);
                    reader1.readAsDataURL(blob1);
                } catch (err) {
                    console.log('Company logo not found');
                }

                try {
                    const response2 = await fetch('/storage/logo/Patika.jpeg');
                    const blob2 = await response2.blob();
                    const reader2 = new FileReader();
                    reader2.onloadend = () => setPatikaLogoData(reader2.result);
                    reader2.readAsDataURL(blob2);
                } catch (err) {
                    console.log('Patika logo not found');
                }
            } catch (error) {
                console.error('Failed to load images:', error);
            }
        };
        loadImages();
    }, []);

    const [formData, setFormData] = useState({
        full_name: '', objective: '', position_applied: '', age: '', sex: '',
        height: '', weight: '', address: '', mobile_phone: '', email_address: '',
        place_of_birth: '', date_of_birth: '', nationality: '', marital_status: '',
        passport_number: '', passport_expiry_date: '',
        workExperiences: [
            { employer: '', position: '', start_date: '', leaving_date: '' }
        ],
        educations: [
            { school: '', study: '', start_date: '', graduation_date: '' }
        ],
        languages: [
            { name: 'English', level: '' },
            { name: 'Russian', level: '' }
        ],
        pcSkills: [
            { name: 'MS Word', level: '' },
            { name: 'MS Excel', level: '' }
        ],
        otherSkills: ['']
    });

    // 🎨 FUNCTION UNTUK SHOW NOTIFICATION (SAMA SEPERTI IMPORT EXCEL)
    const showNotification = (type, title, message) => {
        const notification = document.createElement('div');
        
        const isSuccess = type === 'success';
        const gradientBg = isSuccess 
            ? 'linear-gradient(135deg, #BF9952 0%, #D4AF6A 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        const shadowColor = isSuccess 
            ? 'rgba(191, 153, 82, 0.4)'
            : 'rgba(239, 68, 68, 0.4)';
        
        notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: ${gradientBg};
            color: white;
            padding: 20px 24px;
            border-radius: 16px;
            box-shadow: 0 20px 60px ${shadowColor};
            z-index: 9999;
            font-family: 'Poppins', sans-serif;
            animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        const icon = isSuccess 
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="
                    background: rgba(255, 255, 255, 0.2);
                    padding: 10px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${icon}
                    </svg>
                </div>
                <div>
                    <p style="font-weight: 600; font-size: 16px; margin: 0; letter-spacing: 0.3px;">${title}</p>
                    <p style="font-size: 13px; margin: 4px 0 0 0; opacity: 0.95;">${message}</p>
                </div>
            </div>
        `;

        // Tambahkan animasi keyframe jika belum ada
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100px) scale(0.9);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Animasi keluar sebelum remove
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 1, 1)';
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    };

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

    const addField = (arrayName) => {
        const templates = {
            workExperiences: { employer: '', position: '', start_date: '', leaving_date: '' },
            educations: { school: '', study: '', start_date: '', graduation_date: '' },
            languages: { name: '', level: '' },
            pcSkills: { name: '', level: '' },
            otherSkills: ''
        };
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], templates[arrayName]]
        }));
    };

    const generateCVHTML = (person, photoData, companyLogo, patikaLogo) => {
        const workRows = person.workExperiences.map(work =>
            `<tr><td>${work.employer}</td><td>${work.position}</td><td class="center-text">${work.start_date}</td><td class="center-text">${work.leaving_date}</td></tr>`
        ).join('');

        const eduRows = person.educations.map(edu =>
            `<tr><td>${edu.school}</td><td>${edu.study}</td><td class="center-text">${edu.start_date}</td><td class="center-text">${edu.graduation_date}</td></tr>`
        ).join('');

        const langCols = person.languages.map(lang => `<th>${lang.name}</th>`).join('');
        const langVals = person.languages.map(lang => `<td class="center-text">${lang.level}</td>`).join('');
        const pcRows = person.pcSkills.map(skill => `<tr><td>${skill.name}</td><td class="center-text">${skill.level}</td></tr>`).join('');
        const otherSkillsText = person.otherSkills.filter(s => s).join(', ');

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

    const downloadHTML = () => {
        const html = generateCVHTML(formData, photoData, companyLogoData, patikaLogoData);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CV_${formData.full_name || 'unnamed'}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // 🎯 UPDATED downloadPDF dengan NOTIFIKASI YANG SAMA
    const downloadPDF = async () => {
        if (!formData.full_name.trim()) {
            showNotification('error', 'Validation Error', 'Please fill in your full name before generating PDF!');
            return;
        }

        setIsGenerating(true);
        
        const dataToSubmit = {
            ...formData,
            photo: photoData,
        };

        // Submit ke database dengan notifikasi
        router.post('/cv-submissions', dataToSubmit, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (response) => {
                console.log('✅ CV saved to database successfully!', response);
                showNotification('success', 'CV Saved Successfully!', `${formData.full_name} - Your data has been securely stored`);
            },
            onError: (errors) => {
                console.error('❌ Failed to save:', errors);
                showNotification('error', 'Unable to Save CV', 'Please check your connection and try again');
            }
        });

        // Generate PDF (jalan bersamaan)
        try {
            const html = generateCVHTML(formData, photoData, companyLogoData, patikaLogoData);
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
            showNotification('error', 'PDF Generation Failed', 'An error occurred while generating PDF');
        } finally {
            setIsGenerating(false);
        }
    };

    const previewCV = () => {
        const html = generateCVHTML(formData, photoData, companyLogoData, patikaLogoData);
        const newWindow = window.open();
        newWindow.document.write(html);
        newWindow.document.close();
    };

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
        else window.location.href = '/';
    };

    // PART 2 - UI RENDER (Lanjutan dari Part 1)

// Masukkan semua logic dari Part 1 di atas, lalu tambahkan return statement ini:

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
            
            .form-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.3s;
                background: white;
            }
            .form-input:focus {
                outline: none;
                border-color: #BF9952;
                box-shadow: 0 0 0 3px rgba(191, 153, 82, 0.1);
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #BF9952 0%, #D4AF6A 100%);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 15px rgba(191, 153, 82, 0.3);
            }
            
            .btn-primary:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(191, 153, 82, 0.4);
            }

            .btn-primary:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .btn-back {
                position: relative;
                padding: 10px 20px;
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
            
            .card-elegant {
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                background: white;
            }
        `}</style>

        {/* Header */}
        <div className="bg-white border-b shadow-sm animate-fade-in-up">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
                <div className="w-32 sm:w-40 transform transition hover:scale-105">
                    <img src={headerLogo1} alt="Loring Margi" className="w-full h-auto" />
                </div>
                <div className="w-32 sm:w-40 transform transition hover:scale-105">
                    <img src={headerLogo2} alt="Patika" className="w-full h-auto" />
                </div>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
            <button
                onClick={prevStep}
                className="btn-back flex items-center gap-2 text-gray-700 font-bold mb-6 animate-slide-in-left"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            
            <div className="card-elegant rounded-3xl shadow-2xl p-8 md:p-12 animate-scale-in">
                {/* Step 1: Profile */}
                {currentStep === 1 && (
                    <>
                        <h1 className="text-3xl font-bold mb-2">Complete the form below!</h1>
                        <h2 className="text-xl font-semibold mb-6">Profile</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Full Name</label>
                                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="form-input" placeholder="Full Name" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Objective</label>
                                    <input type="text" name="objective" value={formData.objective} onChange={handleInputChange} className="form-input" placeholder="Objective" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Position Applied For</label>
                                    <input type="text" name="position_applied" value={formData.position_applied} onChange={handleInputChange} className="form-input" placeholder="Position Applied For" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Age</label>
                                    <input type="text" name="age" value={formData.age} onChange={handleInputChange} className="form-input" placeholder="Age" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Sex</label>
                                    <select name="sex" value={formData.sex} onChange={handleInputChange} className="form-input">
                                        <option value="">Sex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Height</label>
                                    <input type="text" name="height" value={formData.height} onChange={handleInputChange} className="form-input" placeholder="Height" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Weight</label>
                                    <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} className="form-input" placeholder="Weight" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Address</label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} className="form-input" rows="3" placeholder="Address"></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Mobile Phone</label>
                                    <input type="text" name="mobile_phone" value={formData.mobile_phone} onChange={handleInputChange} className="form-input" placeholder="Mobile Phone" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Email Address</label>
                                    <input type="email" name="email_address" value={formData.email_address} onChange={handleInputChange} className="form-input" placeholder="Email Address" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Place of Birth</label>
                                    <input type="text" name="place_of_birth" value={formData.place_of_birth} onChange={handleInputChange} className="form-input" placeholder="Place of Birth" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Date of Birth</label>
                                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="form-input" placeholder="Date of Birth" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Nationality</label>
                                    <select name="nationality" value={formData.nationality} onChange={handleInputChange} className="form-input">
                                        <option value="">Nationality</option>
                                        <option value="Indonesian">Indonesian</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Marital Status</label>
                                    <input type="text" name="marital_status" value={formData.marital_status} onChange={handleInputChange} className="form-input" placeholder="Marital Status" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Passport Number</label>
                                    <input type="text" name="passport_number" value={formData.passport_number} onChange={handleInputChange} className="form-input" placeholder="Passport Number" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Passport Expired Date</label>
                                    <input type="text" name="passport_expiry_date" value={formData.passport_expiry_date} onChange={handleInputChange} className="form-input" placeholder="Passport Expired Date" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Profile Picture</label>
                                <button onClick={() => document.getElementById('photo').click()} className="w-full py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium">
                                    Choose File
                                </button>
                                <input id="photo" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                {photoData && <img src={photoData} alt="Preview" className="mt-4 w-24 h-24 object-cover rounded-lg border-2 border-gray-300" />}
                            </div>
                        </div>
                    </>
                )}

                {/* Step 2: Work Experience */}
                {currentStep === 2 && (
                    <>
                        <h1 className="text-3xl font-bold mb-6">Work Experience</h1>
                        <div className="space-y-6">
                            {formData.workExperiences.map((work, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <input type="text" value={work.employer} onChange={(e) => handleArrayChange('workExperiences', idx, 'employer', e.target.value)} className="form-input" placeholder="Name of Employer" />
                                    <input type="text" value={work.position} onChange={(e) => handleArrayChange('workExperiences', idx, 'position', e.target.value)} className="form-input" placeholder="Position & Responsibility" />
                                    <input type="text" value={work.start_date} onChange={(e) => handleArrayChange('workExperiences', idx, 'start_date', e.target.value)} className="form-input" placeholder="Starting Date" />
                                    <input type="text" value={work.leaving_date} onChange={(e) => handleArrayChange('workExperiences', idx, 'leaving_date', e.target.value)} className="form-input" placeholder="Leaving Date" />
                                </div>
                            ))}
                            <button onClick={() => addField('workExperiences')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                Add More Field
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    </>
                )}

                {/* Step 3: Education */}
                {currentStep === 3 && (
                    <>
                        <h1 className="text-3xl font-bold mb-6">Education History</h1>
                        <div className="space-y-6">
                            {formData.educations.map((edu, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <input type="text" value={edu.school} onChange={(e) => handleArrayChange('educations', idx, 'school', e.target.value)} className="form-input" placeholder="School Name" />
                                    <input type="text" value={edu.study} onChange={(e) => handleArrayChange('educations', idx, 'study', e.target.value)} className="form-input" placeholder="Study" />
                                    <input type="text" value={edu.start_date} onChange={(e) => handleArrayChange('educations', idx, 'start_date', e.target.value)} className="form-input" placeholder="Starting Date" />
                                    <input type="text" value={edu.graduation_date} onChange={(e) => handleArrayChange('educations', idx, 'graduation_date', e.target.value)} className="form-input" placeholder="Graduation Date" />
                                </div>
                            ))}
                            <button onClick={() => addField('educations')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                Add More Field
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    </>
                )}

                {/* Step 4: Skills */}
                {currentStep === 4 && (
                    <>
                        <h1 className="text-3xl font-bold mb-6">Qualification & Skills</h1>

                        <h3 className="text-lg font-semibold mb-4">Language Skill</h3>
                        <div className="space-y-4 mb-8">
                            {formData.languages.map((lang, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" value={lang.name} onChange={(e) => handleArrayChange('languages', idx, 'name', e.target.value)} className="form-input" placeholder="Language Skill" />
                                    <select value={lang.level} onChange={(e) => handleArrayChange('languages', idx, 'level', e.target.value)} className="form-input">
                                        <option value="">Beginner</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Good">Good</option>
                                        <option value="Fluent">Fluent</option>
                                    </select>
                                </div>
                            ))}
                            <button onClick={() => addField('languages')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                Add More Field
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>

                        <h3 className="text-lg font-semibold mb-4">PC Skill</h3>
                        <div className="space-y-4 mb-8">
                            {formData.pcSkills.map((skill, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" value={skill.name} onChange={(e) => handleArrayChange('pcSkills', idx, 'name', e.target.value)} className="form-input" placeholder="MS Word" />
                                    <select value={skill.level} onChange={(e) => handleArrayChange('pcSkills', idx, 'level', e.target.value)} className="form-input">
                                        <option value="">Beginner</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Expert">Expert</option>
                                    </select>
                                </div>
                            ))}
                            <button onClick={() => addField('pcSkills')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                Add More Field
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>

                        <h3 className="text-lg font-semibold mb-4">Other Skill</h3>
                        <div className="space-y-4 mb-8">
                            {formData.otherSkills.map((skill, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    value={skill}
                                    onChange={(e) => {
                                        const newSkills = [...formData.otherSkills];
                                        newSkills[idx] = e.target.value;
                                        setFormData(prev => ({ ...prev, otherSkills: newSkills }));
                                    }}
                                    className="form-input"
                                    placeholder="Lorem Ipsum"
                                />
                            ))}
                            <button onClick={() => addField('otherSkills')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                Add More Field
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>

                        {/* 🎯 UPDATED Print PDF Button dengan Notifikasi */}
                        <button
                            onClick={downloadPDF}
                            disabled={isGenerating}
                            className="w-full py-4 text-white rounded-lg transition font-semibold mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ backgroundColor: "#03C500" }}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Generating PDF...
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

                        {/* Preview & Download HTML Button */}
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={previewCV} className="py-3 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Preview
                            </button>
                            
                            <button onClick={downloadHTML} className="py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download HTML
                            </button>
                        </div>
                    </>
                )}

                {/* Navigation */}
                {currentStep < 4 && (
                    <button onClick={nextStep} className="w-full mt-8 py-4 btn-primary text-white rounded-lg font-semibold flex items-center justify-center gap-2">
                        Next
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                )}
            </div>
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
export default CVFormManual;