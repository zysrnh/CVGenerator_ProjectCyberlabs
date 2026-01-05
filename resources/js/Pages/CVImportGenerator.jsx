import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const CVImportGenerator = () => {
  const [excelData, setExcelData] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [photos, setPhotos] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoData, setLogoData] = useState(null);
  const [logo2Data, setLogo2Data] = useState(null);
  const [macImageData, setMacImageData] = useState(null);

  React.useEffect(() => {
    const loadImages = async () => {
      try {
        try {
          const response1 = await fetch('/storage/logo/LoringMargi.png');
          const blob1 = await response1.blob();
          const reader1 = new FileReader();
          reader1.onloadend = () => setLogoData(reader1.result);
          reader1.readAsDataURL(blob1);
        } catch (err) {
          console.log('Logo 1 not found');
        }

        try {
          const response2 = await fetch('/storage/logo/Patika.jpeg');
          const blob2 = await response2.blob();
          const reader2 = new FileReader();
          reader2.onloadend = () => setLogo2Data(reader2.result);
          reader2.readAsDataURL(blob2);
        } catch (err) {
          console.log('Logo 2 not found');
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
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      setExcelData(jsonData);
      if (jsonData.length > 0) setSelectedPerson(jsonData[0]);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setLogoData(evt.target.result);
    reader.readAsDataURL(file);
  };

  const handleLogo2Upload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setLogo2Data(evt.target.result);
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

  const generateCVHTML = (person, photoData, companyLogo, companyLogo2) => {
    const education = parseEducation(person);
    const workExperience = parseWorkExperience(person);
    const languages = parseLanguages(person);
    const skills = parseSkills(person);
    
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>CV - ${person.full_name || ''}</title>
<style>
@page{size:A4;margin:0}*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;margin:0;padding:0;font-size:9pt;background:#fff;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.page{width:210mm;min-height:297mm;padding:10mm 15mm;margin:0 auto;background:white;page-break-after:always}.page:last-child{page-break-after:auto}.header{display:flex;align-items:stretch;border:2px solid #000;margin-bottom:8px;height:120px}.header-left{display:flex;align-items:stretch;flex:1}.photo-container{width:100px;border-right:2px solid #000;overflow:hidden;background:#f0f0f0;display:flex;align-items:center;justify-content:center;flex-shrink:0}.photo-container img{width:100%;height:100%;object-fit:cover}.header-text{flex:1;display:flex;flex-direction:column}.header-text table{width:100%;border-collapse:collapse;height:100%}.header-text td{border:1px solid #000;padding:5px 10px;font-size:9pt;vertical-align:middle}.header-text .label-col{width:200px;background:#e0e0e0;font-weight:bold;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.header-right{width:140px;display:flex;flex-direction:column;border-left:2px solid #000;flex-shrink:0}.logo-box{height:50%;display:flex;align-items:center;justify-content:center;padding:10px;background:#000;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.logo-box:first-child{border-bottom:2px solid #000}.logo-box img{max-width:100%;max-height:100%;object-fit:contain}.company-text{text-align:center;font-weight:bold;font-size:10pt;line-height:1.3;padding:5px}.section-title{background:#e0e0e0;border:2px solid #000;padding:4px;font-weight:bold;text-align:center;margin-top:6px;margin-bottom:0;font-size:9.5pt;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}table.data-table{width:100%;border-collapse:collapse;margin-bottom:0}.data-table td,.data-table th{border:1px solid #000;padding:3px 6px;font-size:9pt;vertical-align:middle}.data-table th{background:#e0e0e0;font-weight:bold;text-align:center;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.data-table .label-col{width:180px;background:#e0e0e0;font-weight:bold;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.center-text{text-align:center}
</style>
</head>
<body>
<div class="page">
<div class="header"><div class="header-left"><div class="photo-container">${photoData ? `<img src="${photoData}" alt="Photo"/>` : '<div style="font-size:10pt;font-weight:bold;color:#666;">PHOTO</div>'}</div><div class="header-text"><table><tr><td class="label-col">FULL NAME / ADI SOYADI</td><td><strong>${person.full_name || ''}</strong></td></tr><tr><td class="label-col">OBJECTIVE / HEDEF</td><td>${person.objective || ''}</td></tr><tr><td class="label-col">POSITION APPLIED FOR / BAŞVURULAN POZİSYON</td><td>${person.position_applied || ''}</td></tr></table></div></div><div class="header-right"><div class="logo-box">${companyLogo ? `<img src="${companyLogo}" alt="Logo 1"/>` : ''}</div><div class="logo-box" style="background:#fff;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;border-bottom:2px solid #000;"><div class="company-text">PT. LORING MARGI<br/>INTERNASIONAL</div></div><div class="logo-box" style="background:#fff;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;">${companyLogo2 ? `<img src="${companyLogo2}" alt="Logo 2"/>` : ''}</div></div></div>
<div class="section-title">PERSONAL DETAILS / KİŞİSEL BİLGİLER</div><table class="data-table"><tr><td class="label-col">AGE / YAŞ</td><td>${person.age || ''}</td></tr><tr><td class="label-col">SEX / CİNSİYET</td><td>${person.sex || ''}</td></tr><tr><td class="label-col">HEIGHT / BOY</td><td>${person.height || ''}</td></tr><tr><td class="label-col">WEIGHT / KİLO</td><td>${person.weight || ''}</td></tr><tr><td class="label-col">ADDRESS / ADRES</td><td>${person.address || ''}</td></tr><tr><td class="label-col">MOBILE PHONE / CEP TELEFONU</td><td>${person.mobile_phone || ''}</td></tr><tr><td class="label-col">EMAIL ADDRESS / EMAİL ADRESİ</td><td>${person.email_address || ''}</td></tr><tr><td class="label-col">PLACE OF BIRTH / DOĞUM YERİ</td><td>${person.place_of_birth || ''}</td></tr><tr><td class="label-col">DATE OF BIRTH / DOĞUM TARİHİ</td><td>${person.date_of_birth || ''}</td></tr><tr><td class="label-col">NATIONALITY / MİLLİYETİ</td><td>${person.nationality || ''}</td></tr><tr><td class="label-col">MARITAL STATUS / MEDENİ DURUMU</td><td>${person.marital_status || ''}</td></tr><tr><td class="label-col">PASSPORT NUMBER / PASAPORT NUMARASI</td><td>${person.passport_number || ''}</td></tr><tr><td class="label-col">PASSPORT EXPIRY DATE / PASAPORT GEÇERLİLİK TARİHİ</td><td>${person.passport_expiry_date || ''}</td></tr></table>
<div class="section-title">WORK EXPERIENCES / İŞ TECRÜBELERİ</div><table class="data-table"><thead><tr><th style="width:35%;">NAME OF EMPLOYER / İŞVERENİN ADI</th><th style="width:35%;">POSITION & RESPONSIBILITIES / GÖREV VE SORUMLULUKLAR</th><th style="width:15%;">STARTING DATE / BAŞLANGIÇ TARİHİ</th><th style="width:15%;">LEAVING DATE / AYRILIŞ TARİHİ</th></tr></thead><tbody>${workExperience.map(work => `<tr><td>${work.company}</td><td>${work.position}</td><td class="center-text">${work.startDate}</td><td class="center-text">${work.leavingDate}</td></tr>`).join('')}${workExperience.length < 3 ? Array(3 - workExperience.length).fill('<tr><td></td><td></td><td></td><td></td></tr>').join('') : ''}</tbody></table>
<div class="section-title">EDUCATION HISTORY / EĞİTİM DURUMU</div><table class="data-table"><thead><tr><th style="width:40%;">SCHOOL NAME / OKULUN ADI</th><th style="width:30%;">STUDY / BÖLÜM</th><th style="width:15%;">STARTING DATE / BAŞLANGIÇ TARİHİ</th><th style="width:15%;">GRADUATION DATE / AYRILIŞ TARİHİ</th></tr></thead><tbody>${education.map(edu => `<tr><td>${edu.school}</td><td>${edu.major}</td><td class="center-text">${edu.startDate}</td><td class="center-text">${edu.gradDate}</td></tr>`).join('')}${education.length < 2 ? Array(2 - education.length).fill('<tr><td></td><td></td><td></td><td></td></tr>').join('') : ''}</tbody></table>
<div class="section-title">QUALIFICATION & SKILLS / YETKİNLİK VE YETENEKLER</div><table class="data-table"><thead><tr><th style="width:20%;">LANGUAGE SKILLS / YABANCI DİL</th>${languages.map(lang => `<th>${lang.name}</th>`).join('')}${languages.length < 4 ? '<th>OTHER / DİĞER</th>' : ''}</tr></thead><tbody><tr><td class="center-text">Fluent - Good - Beginner</td>${languages.map(lang => `<td class="center-text">${lang.level}</td>`).join('')}${languages.length < 4 ? '<td></td>' : ''}</tr></tbody></table>
<table class="data-table" style="margin-top:6px;"><thead><tr><th style="width:20%;">PC SKILLS / BİLGİSAYAR</th><th>MS WORD</th><th>MS EXCEL</th><th>MS OUTLOOK</th><th>OTHER / DİĞER</th></tr></thead><tbody><tr><td></td><td class="center-text">${skills.msWord}</td><td class="center-text">${skills.msExcel}</td><td class="center-text">${skills.msOutlook}</td><td class="center-text">${skills.other}</td></tr></tbody></table>
<table class="data-table" style="margin-top:6px;"><thead><tr><th>OTHER SKILLS / DİĞER</th></tr></thead><tbody><tr><td>${skills.otherSkills}</td></tr></tbody></table>
</div></body></html>`;
  };

  const downloadHTML = () => {
    if (!selectedPerson) return;
    const personIndex = excelData.indexOf(selectedPerson);
    const photoData = photos[personIndex];
    const html = generateCVHTML(selectedPerson, photoData, logoData, logo2Data);
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
      const personIndex = excelData.indexOf(selectedPerson);
      const photoData = photos[personIndex];
      const html = generateCVHTML(selectedPerson, photoData, logoData, logo2Data);
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
      alert('Error generating PDF. Please try downloading HTML instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  const previewCV = () => {
    if (!selectedPerson) return;
    const personIndex = excelData.indexOf(selectedPerson);
    const photoData = photos[personIndex];
    const html = generateCVHTML(selectedPerson, photoData, logoData, logo2Data);
    const newWindow = window.open();
    newWindow.document.write(html);
    newWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
          <div className="w-32 sm:w-40">
            {logoData ? (
              <img src={logoData} alt="Loring Margi" className="w-full h-auto" />
            ) : (
              <div className="bg-gray-200 h-12 flex items-center justify-center text-xs">Logo 1</div>
            )}
          </div>
          <div className="w-32 sm:w-40">
            {logo2Data ? (
              <img src={logo2Data} alt="Patika" className="w-full h-auto" />
            ) : (
              <div className="bg-gray-200 h-12 flex items-center justify-center text-xs">Logo 2</div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">CV Generator</h1>
          <p className="text-sm sm:text-base text-gray-600">Upload Logo, Excel & Foto or Complete the Form - Generate CV PDF Format PT. Loring Margi International</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Company Logo</h2>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-48 h-48 flex items-center justify-center bg-black rounded">
                {logoData ? (
                  <img src={logoData} alt="Logo" className="max-w-full max-h-full object-contain p-4" />
                ) : (
                  <div className="text-white text-sm">Loading...</div>
                )}
              </div>
              <div className="flex-1">
                {logoData ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Logo loaded from storage</p>
                    <p className="text-sm text-gray-600">Path: /storage/logo/LoringMargi.png</p>
                    <label className="inline-block">
                      <span className="px-6 py-2 bg-gray-600 text-white rounded cursor-pointer hover:bg-gray-700 transition text-sm">Choose File</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Logo not found</p>
                    <label className="inline-block">
                      <span className="px-6 py-2 bg-gray-600 text-white rounded cursor-pointer hover:bg-gray-700 transition text-sm">Upload Logo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Upload File Excel</h2>
            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center cursor-pointer hover:border-gray-400 transition">
              <div className="text-gray-600">
                <p className="mb-2 text-sm">Click to Upload or Drag and Drop</p>
                <p className="text-xs text-gray-500">Excel File (.xlsx, .xls)</p>
              </div>
              <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} />
            </label>
            {excelData.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded text-sm text-green-700 font-medium">
                ✓ {excelData.length} data successfully imported
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Complete the Form</h2>
            <div className="flex flex-col items-center justify-center h-full">
              {macImageData ? (
                <img src={macImageData} alt="Computer" className="w-full max-w-xs h-auto mb-4" />
              ) : (
                <div className="w-full max-w-xs h-32 bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-500 text-sm">Mac Image</div>
              )}
              <button className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium flex items-center gap-2">
                Enter the form
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {excelData.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Upload Photos & Select Data</h2>
              <div className="space-y-4">
                {excelData.map((person, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 border-2 rounded-lg transition cursor-pointer ${
                      selectedPerson === person 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPerson(person)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{person.full_name || 'No Name'}</h3>
                        <p className="text-sm text-gray-600">{person.date_of_birth || 'No DOB'} • {person.nationality || 'No Nationality'} • {person.position_applied || 'No Position'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {photos[idx] ? (
                          <div className="relative">
                            <img src={photos[idx]} alt="Preview" className="w-16 h-20 object-cover border-2 border-gray-300 rounded" />
                            <button onClick={(e) => {e.stopPropagation(); removePhoto(idx);}} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600">✕</button>
                          </div>
                        ) : (
                          <label className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
                            <div className="px-4 py-2 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-sm hover:bg-gray-200 transition">Upload Photo</div>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(idx, e)} />
                          </label>
                        )}
                        {selectedPerson === person && (
                          <div className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium">Selected</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPerson && (
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Actions for: {selectedPerson.full_name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button onClick={previewCV} className="px-6 py-3 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">Preview CV</button>
                  <button onClick={downloadPDF} disabled={isGenerating} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50">{isGenerating ? 'Generating...' : 'Print to PDF'}</button>
                  <button onClick={downloadHTML} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">Download HTML</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm">Copyright © 2025 Loring Margi International | Powered by CyberLabs</p>
        </div>
      </div>
    </div>
  );
};

export default CVImportGenerator;