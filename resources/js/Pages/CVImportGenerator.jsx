import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';

const CVImportGenerator = () => {
  const [excelData, setExcelData] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [photos, setPhotos] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyLogoData, setCompanyLogoData] = useState(null);
  const [patikaLogoData, setPatikaLogoData] = useState(null);
  const [macImageData, setMacImageData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState([]);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [showWelcome, setShowWelcome] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // NEW: State untuk save to database
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });

  const headerLogo1 = '/storage/logo/LoringMargi.png';
  const headerLogo2 = '/storage/logo/Patika.jpeg';

  // Welcome screen loading effect
  useEffect(() => {
    if (showWelcome) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setShowWelcome(false), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [showWelcome]);

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

        try {
          const response3 = await fetch('/storage/logo/Mac.png');
          const blob3 = await response3.blob();
          const reader3 = new FileReader();
          reader3.onloadend = () => setMacImageData(reader3.result);
          reader3.readAsDataURL(blob3);
        } catch (err) {
          console.log('Mac image not found');
        }
      } catch (error) {
        console.error('Failed to load images:', error);
      }
    };
    loadImages();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadProgress(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      setExcelData(jsonData);
      if (jsonData.length > 0) setSelectedPerson(jsonData[0]);
      setTimeout(() => setUploadProgress(false), 500);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCompanyLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setCompanyLogoData(evt.target.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (personIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setPhotos(prev => ({ ...prev, [personIndex]: evt.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (personIndex) => {
    setPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[personIndex];
      return newPhotos;
    });
  };

  const toggleBulkSelection = (idx) => {
    setSelectedForBulk(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      } else {
        return [...prev, idx];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedForBulk.length === excelData.length) {
      setSelectedForBulk([]);
    } else {
      setSelectedForBulk(excelData.map((_, idx) => idx));
    }
  };

  const parseEducation = (person) => {
    const education = [];
    for (let i = 1; i <= 2; i++) {
      const school = person[`edu_${i}_school`];
      if (school) {
        education.push({
          school: school,
          major: person[`edu_${i}_study`] || '',
          startDate: person[`edu_${i}_start_date`] || '',
          gradDate: person[`edu_${i}_graduation_date`] || ''
        });
      }
    }
    return education;
  };

  const parseWorkExperience = (person) => {
    const work = [];
    for (let i = 1; i <= 3; i++) {
      const company = person[`work_${i}_employer`];
      if (company) {
        work.push({
          company: company,
          position: person[`work_${i}_position`] || '',
          startDate: person[`work_${i}_start_date`] || '',
          leavingDate: person[`work_${i}_leaving_date`] || ''
        });
      }
    }
    return work;
  };

  const parseLanguages = (person) => {
    const languages = [];
    const langKeys = ['lang_english', 'lang_russian', 'lang_turkish', 'lang_other'];
    const langNames = ['English / İNGİLİZCE', 'Russian / RUSÇA', 'Turkish / TÜRKÇE', 'Other / DİĞER'];
    langKeys.forEach((key, idx) => {
      const level = person[key];
      if (level) {
        languages.push({ name: langNames[idx], level: level });
      }
    });
    return languages;
  };

  const parseSkills = (person) => {
    return {
      msWord: person.skill_ms_word || '',
      msExcel: person.skill_ms_excel || '',
      msOutlook: person.skill_ms_outlook || '',
      other: person.skill_other || '',
      otherSkills: person.other_skills || ''
    };
  };

  // NEW: Prepare data untuk database
  const prepareDataForDatabase = (person, photoData) => {
    const education = parseEducation(person);
    const workExperience = parseWorkExperience(person);
    const languages = parseLanguages(person);
    const skills = parseSkills(person);

    return {
      full_name: person.full_name || '',
      objective: person.objective || '',
      position_applied: person.position_applied || '',
      age: person.age || null,
      sex: person.sex || '',
      height: person.height || '',
      weight: person.weight || '',
      address: person.address || '',
      mobile_phone: person.mobile_phone || '',
      email_address: person.email_address || '',
      place_of_birth: person.place_of_birth || '',
      date_of_birth: person.date_of_birth || '',
      nationality: person.nationality || '',
      marital_status: person.marital_status || '',
      passport_number: person.passport_number || '',
      passport_expiry_date: person.passport_expiry_date || '',
      photo: photoData || null,
      workExperiences: workExperience.map(w => ({
        employer: w.company,
        position: w.position,
        start_date: w.startDate,
        leaving_date: w.leavingDate
      })),
      educations: education.map(e => ({
        school: e.school,
        study: e.major,
        start_date: e.startDate,
        graduation_date: e.gradDate
      })),
      languages: languages,
      pcSkills: [
        { name: 'MS Word', level: skills.msWord },
        { name: 'MS Excel', level: skills.msExcel },
        { name: 'MS Outlook', level: skills.msOutlook },
        { name: 'Other', level: skills.other }
      ].filter(s => s.level),
      otherSkills: skills.otherSkills ? [skills.otherSkills] : []
    };
  };

  // NEW: Save single CV to database
  const saveToDatabase = async () => {
    if (!selectedPerson) return;

    setIsSaving(true);
    try {
      const personIndex = excelData.indexOf(selectedPerson);
      const photoData = photos[personIndex];
      const cvData = prepareDataForDatabase(selectedPerson, photoData);

      const response = await fetch('/cv-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify(cvData)
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ CV saved successfully!\nName: ${result.data.full_name}\nID: ${result.data.id}`);
      } else {
        throw new Error(result.message || 'Failed to save CV');
      }
    } catch (error) {
      console.error('Error saving CV:', error);
      alert('❌ Error saving CV to database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // NEW: Bulk save to database
  const bulkSaveToDatabase = async () => {
    if (selectedForBulk.length === 0) {
      alert('Please select at least one person to save');
      return;
    }

    setIsBulkSaving(true);
    setSaveProgress({ current: 0, total: selectedForBulk.length });

    const cvs = selectedForBulk.map(idx => {
      const person = excelData[idx];
      const photoData = photos[idx];
      return prepareDataForDatabase(person, photoData);
    });

    try {
      const response = await fetch('/cv-import/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({ cvs })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Bulk save completed!\n\nTotal: ${result.summary.total}\nSuccess: ${result.summary.success}\nFailed: ${result.summary.failed}`);

        if (result.results.failed.length > 0) {
          console.log('Failed CVs:', result.results.failed);
        }
      } else {
        throw new Error(result.message || 'Failed to save CVs');
      }
    } catch (error) {
      console.error('Error in bulk save:', error);
      alert('❌ Error saving CVs to database. Please try again.');
    } finally {
      setIsBulkSaving(false);
      setSaveProgress({ current: 0, total: 0 });
    }
  };

  const generateCVHTML = (person, photoData, companyLogo, patikaLogo) => {
    const education = parseEducation(person);
    const workExperience = parseWorkExperience(person);
    const languages = parseLanguages(person);
    const skills = parseSkills(person);

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
<div class="section-title">WORK EXPERIENCES / İŞ TECRÜBELERİ</div><table class="data-table"><thead><tr><th style="width:35%;">NAME OF EMPLOYER / İŞVERENİN ADI</th><th style="width:35%;">POSITION & RESPONSIBILITIES / GÖREV VE SORUMLULUKLAR</th><th style="width:15%;">STARTING DATE / BAŞLANGIÇ TARİHİ</th><th style="width:15%;">LEAVING DATE / AYRILIŞ TARİHİ</th></tr></thead><tbody>${workExperience.map(work => `<tr><td>${work.company}</td><td>${work.position}</td><td class="center-text">${work.startDate}</td><td class="center-text">${work.leavingDate}</td></tr>`).join('')}${workExperience.length < 3 ? Array(3 - workExperience.length).fill('<tr><td></td><td></td><td></td><td></td></tr>').join('') : ''}</tbody></table>
<div class="section-title">EDUCATION HISTORY / EĞİTİM DURUMU</div><table class="data-table"><thead><tr><th style="width:40%;">SCHOOL NAME / OKULUN ADI</th><th style="width:30%;">STUDY / BÖLÜM</th><th style="width:15%;">STARTING DATE / BAŞLANGIÇ TARİHİ</th><th style="width:15%;">GRADUATION DATE / AYRILIŞ TARİHİ</th></tr></thead><tbody>${education.map(edu => `<tr><td>${edu.school}</td><td>${edu.major}</td><td class="center-text">${edu.startDate}</td><td class="center-text">${edu.gradDate}</td></tr>`).join('')}${education.length < 2 ? Array(2 - education.length).fill('<tr><td></td><td></td><td></td><td></td></tr>').join('') : ''}</tbody></table>
<div class="section-title">QUALIFICATION & SKILLS / YETKİNLİK VE YETENEKLER</div><table class="data-table"><thead><tr><th style="width:20%;">LANGUAGE SKILLS / YABANCI DİL</th>${languages.map(lang => `<th>${lang.name}</th>`).join('')}${languages.length < 4 ? '<th>OTHER / DİĞER</th>' : ''}</tr></thead><tbody><tr><td class="center-text">Fluent - Good - Beginner</td>${languages.map(lang => `<td class="center-text">${lang.level}</td>`).join('')}${languages.length < 4 ? '<td></td>' : ''}</tr></tbody></table>
<table class="data-table" style="margin-top:6px;"><thead><tr><th style="width:20%;">PC SKILLS / BİLGİSAYAR</th><th>MS WORD</th><th>MS EXCEL</th><th>MS OUTLOOK</th><th>OTHER / DİĞER</th></tr></thead><tbody><tr><td></td><td class="center-text">${skills.msWord}</td><td class="center-text">${skills.msExcel}</td><td class="center-text">${skills.msOutlook}</td><td class="center-text">${skills.other}</td></tr></tbody></table>
<table class="data-table" style="margin-top:6px;"><thead><tr><th>OTHER SKILLS / DİĞER</th></tr></thead><tbody><tr><td>${skills.otherSkills}</td></tr></tbody></table>
</div></body></html>`;
  };// Lanjutan dari Part 1...

  const downloadHTML = () => {
    if (!selectedPerson) return;
    const personIndex = excelData.indexOf(selectedPerson);
    const photoData = photos[personIndex];
    const html = generateCVHTML(selectedPerson, photoData, companyLogoData, patikaLogoData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${selectedPerson.full_name || 'unnamed'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!selectedPerson) return;

    setIsGenerating(true);

    try {
      // 1️⃣ PREPARE DATA untuk database
      const personIndex = excelData.indexOf(selectedPerson);
      const photoData = photos[personIndex];
      const dataToSubmit = prepareDataForDatabase(selectedPerson, photoData);

      // 2️⃣ SAVE KE DATABASE dulu
      const response = await fetch('/cv-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify(dataToSubmit)
      });

      const result = await response.json();

      if (result.success) {
        // ✅ Tampilkan notifikasi sukses yang elegan
        const notification = document.createElement('div');
        notification.style.cssText = `
                position: fixed;
                top: 24px;
                right: 24px;
                background: linear-gradient(135deg, #BF9952 0%, #D4AF6A 100%);
                color: white;
                padding: 20px 24px;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(191, 153, 82, 0.4);
                z-index: 9999;
                font-family: 'Poppins', sans-serif;
                animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            `;
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
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <p style="font-weight: 600; font-size: 16px; margin: 0; letter-spacing: 0.3px;">CV Saved Successfully!</p>
                        <p style="font-size: 13px; margin: 4px 0 0 0; opacity: 0.95;">${result.data.full_name} - ID: ${result.data.id}</p>
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
      } else {
        throw new Error(result.message || 'Failed to save CV');
      }

      // 3️⃣ GENERATE PDF (setelah save sukses)
      const html = generateCVHTML(selectedPerson, photoData, companyLogoData, patikaLogoData);
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
      console.error('Error:', error);

      // ❌ Tampilkan notifikasi error
      const notification = document.createElement('div');
      notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 20px 24px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(239, 68, 68, 0.4);
            z-index: 9999;
            font-family: 'Poppins', sans-serif;
            animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
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
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div>
                    <p style="font-weight: 600; font-size: 16px; margin: 0; letter-spacing: 0.3px;">Unable to Save CV</p>
                    <p style="font-size: 13px; margin: 4px 0 0 0; opacity: 0.95;">Please check your connection and try again</p>
                </div>
            </div>
        `;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 1, 1)';
        setTimeout(() => notification.remove(), 400);
      }, 4000);
    } finally {
      setIsGenerating(false);
    }
  };
  const bulkPrintPDF = async () => {
    if (selectedForBulk.length === 0) {
      alert('Please select at least one person to print');
      return;
    }

    setIsBulkGenerating(true);
    setBulkProgress({ current: 0, total: selectedForBulk.length });

    // 1️⃣ PREPARE semua data untuk bulk save
    const cvs = selectedForBulk.map(idx => {
      const person = excelData[idx];
      const photoData = photos[idx];
      return prepareDataForDatabase(person, photoData);
    });

    try {
      // 2️⃣ BULK SAVE KE DATABASE dulu
      const response = await fetch('/cv-import/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({ cvs })
      });

      const result = await response.json();

      if (result.success) {
        // ✅ Tampilkan notifikasi sukses
        const notification = document.createElement('div');
        notification.style.cssText = `
                position: fixed;
                top: 24px;
                right: 24px;
                background: linear-gradient(135deg, #BF9952 0%, #D4AF6A 100%);
                color: white;
                padding: 20px 24px;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(191, 153, 82, 0.4);
                z-index: 9999;
                font-family: 'Poppins', sans-serif;
                animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            `;
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
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <p style="font-weight: 600; font-size: 16px; margin: 0; letter-spacing: 0.3px;">Bulk Save Completed!</p>
                        <p style="font-size: 13px; margin: 4px 0 0 0; opacity: 0.95;">✅ ${result.summary.success} saved | ❌ ${result.summary.failed} failed</p>
                    </div>
                </div>
            `;

        if (!document.getElementById('notification-styles')) {
          const style = document.createElement('style');
          style.id = 'notification-styles';
          style.textContent = `
                    @keyframes slideInRight {
                        from { opacity: 0; transform: translateX(100px) scale(0.9); }
                        to { opacity: 1; transform: translateX(0) scale(1); }
                    }
                    @keyframes slideOutRight {
                        from { opacity: 1; transform: translateX(0) scale(1); }
                        to { opacity: 0; transform: translateX(100px) scale(0.9); }
                    }
                `;
          document.head.appendChild(style);
        }

        document.body.appendChild(notification);
        setTimeout(() => {
          notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 1, 1)';
          setTimeout(() => notification.remove(), 400);
        }, 3000);

        // 3️⃣ PRINT semua PDF (setelah save sukses)
        for (let i = 0; i < selectedForBulk.length; i++) {
          const idx = selectedForBulk[i];
          const person = excelData[idx];
          const photoData = photos[idx];

          setBulkProgress({ current: i + 1, total: selectedForBulk.length });

          const html = generateCVHTML(person, photoData, companyLogoData, patikaLogoData);
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
          await new Promise(resolve => setTimeout(resolve, 2000));
          document.body.removeChild(iframe);

          if (i < selectedForBulk.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        alert(`✅ Successfully saved and queued ${selectedForBulk.length} CVs for printing!`);
      } else {
        throw new Error(result.message || 'Failed to save CVs');
      }
    } catch (error) {
      console.error('Error in bulk save/print:', error);

      // ❌ Notifikasi error
      const notification = document.createElement('div');
      notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 20px 24px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(239, 68, 68, 0.4);
            z-index: 9999;
            font-family: 'Poppins', sans-serif;
            animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        `;
      notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="background: rgba(255, 255, 255, 0.2); padding: 10px; border-radius: 12px;">
                    <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div>
                    <p style="font-weight: 600; font-size: 16px; margin: 0;">Bulk Save Failed</p>
                    <p style="font-size: 13px; margin: 4px 0 0 0; opacity: 0.95;">Please try again</p>
                </div>
            </div>
        `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4, 0, 1, 1)';
        setTimeout(() => notification.remove(), 400);
      }, 4000);
    } finally {
      setIsBulkGenerating(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  const previewCV = () => {
    if (!selectedPerson) return;
    const personIndex = excelData.indexOf(selectedPerson);
    const photoData = photos[personIndex];
    const html = generateCVHTML(selectedPerson, photoData, companyLogoData, patikaLogoData);
    const newWindow = window.open();
    newWindow.document.write(html);
    newWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(191, 153, 82, 0.3); }
          50% { box-shadow: 0 0 40px rgba(191, 153, 82, 0.6); }
        }

        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-100%);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
        .animate-slide-in-right { animation: slideInRight 0.6s ease-out; }
        .animate-scale-in { animation: scaleIn 0.5s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-slide-down { animation: slideDown 0.8s ease-out; }
        .animate-fade-out { animation: fadeOut 0.5s ease-out forwards; }
        
        .btn-primary {
          background: linear-gradient(135deg, #BF9952 0%, #D4AF6A 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(191, 153, 82, 0.3);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(191, 153, 82, 0.4);
          background: linear-gradient(135deg, #D4AF6A 0%, #BF9952 100%);
        }
        
        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        
        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        }
        
        .card-elegant {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: white;
          backdrop-filter: blur(10px);
        }
        
        .card-elegant:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .upload-zone {
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        }
        
        .upload-zone:hover {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-color: #BF9952 !important;
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(191, 153, 82, 0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        .photo-card {
          transition: all 0.3s ease;
        }
        
        .photo-card:hover {
          transform: scale(1.05);
        }
        
        .selected-card {
          border-color: #BF9952 !important;
          background: linear-gradient(135deg, rgba(191, 153, 82, 0.05) 0%, rgba(191, 153, 82, 0.02) 100%);
          box-shadow: 0 8px 30px rgba(191, 153, 82, 0.2);
        }

        .welcome-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #BF9952, #D4AF6A, #BF9952);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
          transition: width 0.3s ease;
        }
      `}</style>

      {/* Welcome Screen */}
      {showWelcome && (
        <div className={`welcome-overlay ${loadingProgress === 100 ? 'animate-fade-out' : ''}`}>
          <div className="text-center space-y-8 px-4">
            <div className="animate-float animate-glow">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#BF9952] to-[#D4AF6A] rounded-3xl flex items-center justify-center shadow-2xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            <div className="space-y-3 animate-slide-down">
              <h1 className="text-5xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#BF9952] via-[#D4AF6A] to-[#BF9952]">
                CV Generator
              </h1>
              <p className="text-xl sm:text-2xl text-gray-400 font-light">
                PT. Loring Margi International
              </p>
            </div>

            <div className="w-80 max-w-full mx-auto space-y-3">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${loadingProgress}%` }}></div>
              </div>
              <p className="text-gray-400 text-sm font-medium">
                Loading... {loadingProgress}%
              </p>
            </div>

            <p className="text-gray-500 text-sm max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              Professional CV Management System
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-opacity duration-500 ${showWelcome ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

        {/* Header */}
        <div className="bg-white border-b shadow-sm animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
            <div className="w-32 sm:w-40 transform transition hover:scale-105">
              <img src={headerLogo1} alt="Loring Margi" className="w-full h-auto" onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"%3E%3Crect width="200" height="60" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23666" font-family="Arial" font-size="12"%3ELogo 1%3C/text%3E%3C/svg%3E' }} />
            </div>
            <div className="w-32 sm:w-40 transform transition hover:scale-105">
              <img src={headerLogo2} alt="Patika" className="w-full h-auto" onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"%3E%3Crect width="200" height="60" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23666" font-family="Arial" font-size="12"%3ELogo 2%3C/text%3E%3C/svg%3E' }} />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Title Section */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-3 sm:mb-4">CV Generator</h1>
            <p className="text-sm sm:text-lg text-gray-600 font-light max-w-3xl mx-auto">Upload Logo, Excel & Photo or Complete the Form - Generate CV PDF Format PT. Loring Margi International</p>
          </div>

          {/* Logo Section */}
          <div className="card-elegant rounded-2xl shadow-lg p-6 sm:p-10 mb-6 sm:mb-8 animate-scale-in">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-gradient-to-b from-[#BF9952] to-[#D4AF6A] rounded-full"></span>
              Company Logo
            </h2>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-56 h-56 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-2xl transform transition hover:scale-105">
                {companyLogoData ? (
                  <img src={companyLogoData} alt="Logo" className="max-w-full max-h-full object-contain p-6" />
                ) : (
                  <div className="text-white text-sm font-light shimmer">Loading...</div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                {companyLogoData ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-xl border border-green-200">
                      <p className="text-sm text-green-800 font-medium">Logo loaded successfully</p>
                      <p className="text-xs text-green-600 mt-1">Path: /storage/logo/LoringMargi.png</p>
                    </div>
                    <p className="text-xs text-gray-500 italic">Note: Patika logo is hardcoded and cannot be changed</p>
                    <label className="inline-block cursor-pointer group">
                      <span className="btn-primary px-8 py-3 text-white rounded-xl font-medium inline-flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Change Logo
                      </span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleCompanyLogoUpload} />
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                      <p className="text-sm text-amber-800 font-medium">⚠ Logo not found in storage</p>
                    </div>
                    <label className="inline-block cursor-pointer">
                      <span className="btn-primary px-8 py-3 text-white rounded-xl font-medium inline-flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload Logo
                      </span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleCompanyLogoUpload} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Excel & Form Upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
            <div className="card-elegant rounded-2xl shadow-lg p-6 sm:p-8 animate-slide-in-right">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Upload Excel File
              </h2>
              <label className="upload-zone block border-2 border-dashed border-gray-300 rounded-2xl p-10 sm:p-14 text-center cursor-pointer">
                <div className="text-gray-600 space-y-3">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#BF9952] to-[#D4AF6A] rounded-full flex items-center justify-center transform transition hover:scale-110">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <p className="font-medium text-base">Click to Upload or Drag & Drop</p>
                  <p className="text-xs text-gray-500">Excel File (.xlsx, .xls)</p>
                </div>
                <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} />
              </label>
              {uploadProgress && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#BF9952] border-t-transparent"></div>
                    <span className="text-sm text-blue-700 font-medium">Processing...</span>
                  </div>
                </div>
              )}
              {excelData.length > 0 && !uploadProgress && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-scale-in">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm text-green-700 font-semibold">{excelData.length} data successfully imported</span>
                  </div>
                </div>
              )}
            </div>

            <div className="card-elegant rounded-2xl shadow-lg p-6 sm:p-8 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Complete the Form
              </h2>
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                {macImageData ? (
                  <div className="transform transition hover:scale-105">
                    <img src={macImageData} alt="Computer" className="w-full max-w-xs h-auto drop-shadow-2xl" />
                  </div>
                ) : (
                  <div className="w-full max-w-xs h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-sm shimmer">Mac Image</div>
                )}
                <Link href="/form" className="btn-primary px-10 py-4 text-white rounded-xl font-medium flex items-center gap-3 text-base">
                  Enter the Form
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {excelData.length > 0 && (
            <div className="card-elegant rounded-2xl shadow-lg p-6 mb-6 animate-scale-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleSelectAll}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl font-medium text-sm transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {selectedForBulk.length === excelData.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    {selectedForBulk.length} of {excelData.length} selected
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={bulkPrintPDF}
                    disabled={selectedForBulk.length === 0 || isBulkGenerating}
                    className="btn-primary px-8 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    {isBulkGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Printing {bulkProgress.current}/{bulkProgress.total}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Bulk Print PDF ({selectedForBulk.length})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {excelData.length > 0 && (
            <>
              <div className="card-elegant rounded-2xl shadow-lg p-6 sm:p-10 mb-8 animate-scale-in">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
                  <span className="w-2 h-8 bg-gradient-to-b from-[#BF9952] to-[#D4AF6A] rounded-full"></span>
                  Upload Photos & Select Data
                </h2>
                <div className="space-y-4">
                  {excelData.map((person, idx) => (
                    <div
                      key={idx}
                      className={`p-5 border-2 rounded-2xl transition-all duration-300 ${selectedPerson === person
                        ? 'selected-card'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                        <div className="flex items-center gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedForBulk.includes(idx)}
                            onChange={() => toggleBulkSelection(idx)}
                            className="w-5 h-5 text-[#BF9952] border-gray-300 rounded focus:ring-[#BF9952] cursor-pointer"
                          />
                          <div
                            className="flex-1 text-center sm:text-left cursor-pointer"
                            onClick={() => setSelectedPerson(person)}
                          >
                            <h3 className="font-semibold text-lg sm:text-xl text-gray-900 mb-2">{person.full_name || 'No Name'}</h3>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                              <span className="px-3 py-1 bg-gray-100 rounded-full">{person.date_of_birth || 'No DOB'}</span>
                              <span className="px-3 py-1 bg-gray-100 rounded-full">{person.nationality || 'No Nationality'}</span>
                              <span className="px-3 py-1 bg-gray-100 rounded-full">{person.position_applied || 'No Position'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {photos[idx] ? (
                            <div className="relative photo-card">
                              <img src={photos[idx]} alt="Preview" className="w-20 h-24 object-cover border-2 border-gray-300 rounded-xl shadow-lg" />
                              <button
                                onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition shadow-lg flex items-center justify-center font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
                              <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl text-sm hover:from-gray-100 hover:to-gray-50 hover:border-[#BF9952] transition font-medium text-gray-700">
                                Upload Photo
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(idx, e)} />
                            </label>
                          )}
                          {selectedPerson === person && (
                            <div className="px-4 py-2 bg-gradient-to-r from-[#BF9952] to-[#D4AF6A] text-white rounded-xl text-sm font-semibold shadow-lg animate-scale-in">
                              Selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Action Buttons */}
              {selectedPerson && (
                <div className="card-elegant rounded-2xl shadow-lg p-6 sm:p-10 animate-scale-in">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-[#BF9952] to-[#D4AF6A] rounded-full"></span>
                    Individual Actions: <span className="text-[#BF9952]">{selectedPerson.full_name}</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <button
                      onClick={previewCV}
                      className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-100 hover:border-gray-400 transition-all font-semibold shadow-md hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Preview CV
                    </button>



                    <button
                      onClick={downloadPDF}
                      disabled={isGenerating}
                      className="btn-primary px-8 py-4 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                          Print to PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
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
    </div>
  );
};

export default CVImportGenerator;