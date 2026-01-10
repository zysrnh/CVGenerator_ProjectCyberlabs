import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';

const CVEdit = ({ cv }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [companyLogoData, setCompanyLogoData] = useState(null);
    const [patikaLogoData, setPatikaLogoData] = useState(null);
    const [photoData, setPhotoData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const headerLogo1 = '/storage/logo/LoringMargi.png';
    const headerLogo2 = '/storage/logo/Patika.jpeg';

    // 🔥 Pre-fill form dengan data dari database
    const [formData, setFormData] = useState({
        full_name: cv.full_name || '',
        objective: cv.objective || '',
        position_applied: cv.position_applied || '',
        age: cv.age || '',
        sex: cv.sex || '',
        height: cv.height || '',
        weight: cv.weight || '',
        address: cv.address || '',
        mobile_phone: cv.mobile_phone || '',
        email_address: cv.email_address || '',
        place_of_birth: cv.place_of_birth || '',
        date_of_birth: cv.date_of_birth || '',
        nationality: cv.nationality || '',
        marital_status: cv.marital_status || '',
        passport_number: cv.passport_number || '',
        passport_expiry_date: cv.passport_expiry_date || '',
        workExperiences: cv.work_experiences?.length > 0 ? cv.work_experiences : [
            { employer: '', position: '', start_date: '', leaving_date: '' }
        ],
        educations: cv.educations?.length > 0 ? cv.educations : [
            { school: '', study: '', start_date: '', graduation_date: '' }
        ],
        languages: cv.languages?.length > 0 ? cv.languages : [
            { name: 'English', level: '' },
            { name: 'Russian', level: '' }
        ],
        pcSkills: cv.pc_skills?.length > 0 ? cv.pc_skills : [
            { name: 'MS Word', level: '' },
            { name: 'MS Excel', level: '' }
        ],
        otherSkills: cv.other_skills?.length > 0 ? cv.other_skills.map(s => s.skill) : ['']
    });

    // Load logos dan foto existing
    useEffect(() => {
        const loadImages = async () => {
            try {
                // Load company logos
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

                // Load existing photo
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

    // Notification function (sama seperti CVFormManual)
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
        `;
        
        const icon = isSuccess 
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>';
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="background: rgba(255, 255, 255, 0.2); padding: 10px; border-radius: 12px;">
                    <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${icon}
                    </svg>
                </div>
                <div>
                    <p style="font-weight: 600; font-size: 16px; margin: 0;">${title}</p>
                    <p style="font-size: 13px; margin: 4px 0 0 0; opacity: 0.95;">${message}</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
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

    const removeField = (arrayName, index) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index)
        }));
    };

    const saveChanges = () => {
    if (!formData.full_name.trim()) {
        showNotification('error', 'Validation Error', 'Please fill in your full name!');
        return;
    }

    setIsSaving(true);

    const dataToSubmit = {
        ...formData,
        photo: photoData,
        _method: 'PUT', // ✅ Add this back for Laravel method spoofing
    };

    router.post(`/dashboard/${cv.id}`, dataToSubmit, { // ✅ Use POST instead of PUT
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
            showNotification('success', 'CV Updated!', `${formData.full_name} - Changes saved successfully`);
            setIsSaving(false);
            setTimeout(() => {
                router.visit(`/dashboard/${cv.id}`);
            }, 1500);
        },
        onError: (errors) => {
            console.error('Failed to update:', errors);
            showNotification('error', 'Update Failed', 'Please check your data and try again');
            setIsSaving(false);
        }
    });
};
    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
        else router.visit(`/dashboard/${cv.id}`);
    };

    // Generate HTML function (sama seperti CVFormManual, copy paste saja)
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
    
    // ... (lanjutan dari Part 2A)

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
                
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slideOutRight {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100px); }
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

                .btn-remove {
                    padding: 8px;
                    background: #ef4444;
                    color: white;
                    border-radius: 8px;
                    transition: all 0.3s;
                }
                .btn-remove:hover {
                    background: #dc2626;
                    transform: scale(1.05);
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
                {/* Back Button & Step Indicator */}
                <div className="flex items-center justify-between mb-6 animate-slide-in-left">
                    <button
                        onClick={prevStep}
                        className="btn-back flex items-center gap-2 text-gray-700 font-bold"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {currentStep === 1 ? 'Back to Detail' : 'Previous'}
                    </button>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                    currentStep === step
                                        ? 'bg-gradient-to-r from-[#BF9952] to-[#D4AF6A] text-white scale-110 shadow-lg'
                                        : currentStep > step
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                }`}
                            >
                                {currentStep > step ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    step
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="card-elegant rounded-3xl shadow-2xl p-8 md:p-12 animate-scale-in">
                    {/* Step 1: Profile */}
                    {currentStep === 1 && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Edit CV - Profile Information</h1>
                            <p className="text-gray-600 mb-6">Update personal information for {cv.full_name}</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Full Name *</label>
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
                                            <option value="">Select Sex</option>
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
                                        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="form-input" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Nationality</label>
                                        <select name="nationality" value={formData.nationality} onChange={handleInputChange} className="form-input">
                                            <option value="">Select Nationality</option>
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
                                        <label className="block text-sm font-semibold mb-2">Passport Expiry Date</label>
                                        <input type="text" name="passport_expiry_date" value={formData.passport_expiry_date} onChange={handleInputChange} className="form-input" placeholder="YYYY-MM-DD" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Profile Picture</label>
                                    <button onClick={() => document.getElementById('photo').click()} className="w-full py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium">
                                        {photoData ? 'Change Photo' : 'Upload Photo'}
                                    </button>
                                    <input id="photo" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                    {photoData && (
                                        <div className="mt-4 flex items-center gap-4">
                                            <img src={photoData} alt="Preview" className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300" />
                                            <button onClick={() => setPhotoData(null)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm">
                                                Remove Photo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 2: Work Experience */}
                    {currentStep === 2 && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Edit Work Experience</h1>
                            <p className="text-gray-600 mb-6">Update work history and positions</p>
                            
                            <div className="space-y-6">
                                {formData.workExperiences.map((work, idx) => (
                                    <div key={idx} className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-lg text-gray-900">Experience #{idx + 1}</h3>
                                            {formData.workExperiences.length > 1 && (
                                                <button
                                                    onClick={() => removeField('workExperiences', idx)}
                                                    className="btn-remove"
                                                    title="Remove this experience"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold mb-2">Employer Name</label>
                                                <input type="text" value={work.employer} onChange={(e) => handleArrayChange('workExperiences', idx, 'employer', e.target.value)} className="form-input" placeholder="Company Name" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold mb-2">Position & Responsibilities</label>
                                                <input type="text" value={work.position} onChange={(e) => handleArrayChange('workExperiences', idx, 'position', e.target.value)} className="form-input" placeholder="Job Title" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Start Date</label>
                                                <input type="text" value={work.start_date} onChange={(e) => handleArrayChange('workExperiences', idx, 'start_date', e.target.value)} className="form-input" placeholder="YYYY-MM" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">End Date</label>
                                                <input type="text" value={work.leaving_date} onChange={(e) => handleArrayChange('workExperiences', idx, 'leaving_date', e.target.value)} className="form-input" placeholder="YYYY-MM or Present" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addField('workExperiences')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add More Experience
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step 3: Education */}
                    {currentStep === 3 && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Edit Education History</h1>
                            <p className="text-gray-600 mb-6">Update educational background</p>
                            
                            <div className="space-y-6">
                                {formData.educations.map((edu, idx) => (
                                    <div key={idx} className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-lg text-gray-900">Education #{idx + 1}</h3>
                                            {formData.educations.length > 1 && (
                                                <button
                                                    onClick={() => removeField('educations', idx)}
                                                    className="btn-remove"
                                                    title="Remove this education"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold mb-2">School Name</label>
                                                <input type="text" value={edu.school} onChange={(e) => handleArrayChange('educations', idx, 'school', e.target.value)} className="form-input" placeholder="University/School Name" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold mb-2">Field of Study</label>
                                                <input type="text" value={edu.study} onChange={(e) => handleArrayChange('educations', idx, 'study', e.target.value)} className="form-input" placeholder="Major/Degree" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Start Date</label>
                                                <input type="text" value={edu.start_date} onChange={(e) => handleArrayChange('educations', idx, 'start_date', e.target.value)} className="form-input" placeholder="YYYY" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2">Graduation Date</label>
                                                <input type="text" value={edu.graduation_date} onChange={(e) => handleArrayChange('educations', idx, 'graduation_date', e.target.value)} className="form-input" placeholder="YYYY" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addField('educations')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add More Education
                                </button>
                            </div>
                        </>
                    )}

                 
                    {currentStep === 4 && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Edit Skills & Qualifications</h1>
                            <p className="text-gray-600 mb-6">Update language, computer, and other skills</p>

                            {/* Languages */}
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                Language Skills
                            </h3>
                            <div className="space-y-4 mb-8">
                                {formData.languages.map((lang, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <input type="text" value={lang.name} onChange={(e) => handleArrayChange('languages', idx, 'name', e.target.value)} className="form-input flex-1" placeholder="Language" />
                                        <select value={lang.level} onChange={(e) => handleArrayChange('languages', idx, 'level', e.target.value)} className="form-input w-40">
                                            <option value="">Level</option>
                                            <option value="Beginner">Beginner</option>
                                            <option value="Good">Good</option>
                                            <option value="Fluent">Fluent</option>
                                        </select>
                                        {formData.languages.length > 1 && (
                                            <button onClick={() => removeField('languages', idx)} className="btn-remove">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={() => addField('languages')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Language
                                </button>
                            </div>

                            {/* PC Skills */}
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Computer Skills
                            </h3>
                            <div className="space-y-4 mb-8">
                                {formData.pcSkills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <input type="text" value={skill.name} onChange={(e) => handleArrayChange('pcSkills', idx, 'name', e.target.value)} className="form-input flex-1" placeholder="Software/Tool" />
                                        <select value={skill.level} onChange={(e) => handleArrayChange('pcSkills', idx, 'level', e.target.value)} className="form-input w-40">
                                            <option value="">Level</option>
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                            <option value="Expert">Expert</option>
                                        </select>
                                        {formData.pcSkills.length > 1 && (
                                            <button onClick={() => removeField('pcSkills', idx)} className="btn-remove">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button onClick={() => addField('pcSkills')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add PC Skill
                                </button>
                            </div>

                            {/* Other Skills */}
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.423.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
</svg>
Other Skills
</h3>
<div className="space-y-4 mb-8">
{formData.otherSkills.map((skill, idx) => (
<div key={idx} className="flex items-center gap-4">
<input
type="text"
value={skill}
onChange={(e) => {
const newSkills = [...formData.otherSkills];
newSkills[idx] = e.target.value;
setFormData(prev => ({ ...prev, otherSkills: newSkills }));
}}
className="form-input flex-1"
placeholder="Skill name"
/>
{formData.otherSkills.length > 1 && (
<button onClick={() => removeField('otherSkills', idx)} className="btn-remove">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
)}
</div>
))}
<button onClick={() => addField('otherSkills')} className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium">
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
</svg>
Add Other Skill
</button>
</div>
{/* Save Changes Button */}
                        <button
                            onClick={saveChanges}
                            disabled={isSaving}
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                                    <span>Saving Changes...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </>
                )}

                {/* Navigation */}
                {currentStep < 4 && (
                    <button onClick={nextStep} className="w-full mt-8 py-4 btn-primary text-white rounded-lg font-semibold flex items-center justify-center gap-2">
                        Next Step
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
}

export default CVEdit;