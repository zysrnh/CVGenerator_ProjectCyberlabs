import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const CVImportGenerator = () => {
  const [excelData, setExcelData] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [photos, setPhotos] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoData, setLogoData] = useState(null);

  React.useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch('/storage/logo/Loring.jpeg');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoData(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Failed to load logo:', error);
      }
    };
    loadLogo();
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
      if (jsonData.length > 0) {
        setSelectedPerson(jsonData[0]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setLogoData(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (personIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setPhotos(prev => ({
        ...prev,
        [personIndex]: evt.target.result
      }));
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
          major: person[`edu_${i}_major`] || '',
          period: `${person[`edu_${i}_start`] || ''}-${person[`edu_${i}_end`] || ''}`
        });
      }
    }
    return education;
  };

  const parseWorkExperience = (person) => {
    const work = [];
    for (let i = 1; i <= 4; i++) {
      const company = person[`work_${i}_company`];
      if (company) {
        work.push({
          company: company,
          position: person[`work_${i}_position`] || '',
          period: `${person[`work_${i}_start`] || ''} – ${person[`work_${i}_end`] || ''}`
        });
      }
    }
    return work;
  };

  const parseLanguages = (person) => {
    const languages = [];
    for (let i = 1; i <= 3; i++) {
      const lang = person[`lang_${i}`];
      if (lang) {
        languages.push({
          name: lang,
          level: person[`lang_${i}_level`] || ''
        });
      }
    }
    return languages;
  };

  const generateCVHTML = (person, photoData, companyLogo) => {
    const education = parseEducation(person);
    const workExperience = parseWorkExperience(person);
    const languages = parseLanguages(person);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CV - ${person.full_name || ''}</title>
    <style>
        @page { 
            size: A4; 
            margin: 0;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0;
            font-size: 9pt;
            background: #fff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 12mm 18mm 12mm 18mm;
            margin: 0 auto;
            background: white;
            page-break-after: always;
        }
        .page:last-child {
            page-break-after: auto;
        }
        .header {
            display: flex;
            align-items: center;
            border-bottom: 4px solid #000;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }
        .logo-section {
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-right: 12px;
            border: 3px solid #000;
            background: #000;
            padding: 4px;
        }
        .logo-section img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .company-info {
            flex: 1;
            text-align: center;
        }
        .company-name {
            font-size: 17pt;
            font-weight: bold;
            margin: 0 0 2px 0;
            letter-spacing: 0.5px;
            font-family: Arial, sans-serif;
        }
        .company-subtitle {
            font-size: 9.5pt;
            font-style: italic;
            margin: 0 0 3px 0;
            font-family: Arial, sans-serif;
        }
        .company-details {
            font-size: 8pt;
            line-height: 1.4;
            font-family: Arial, sans-serif;
        }
        h1 {
            text-align: center;
            font-size: 18pt;
            margin: 8px 0 10px 0;
            font-weight: normal;
            font-family: 'Times New Roman', Times, serif;
            letter-spacing: 0.5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
            font-family: Arial, sans-serif;
        }
        .info-table td {
            border: 1px solid #000;
            padding: 3px 8px;
            font-size: 9pt;
            vertical-align: middle;
            line-height: 1.3;
        }
        .info-table .label-col {
            width: 100px;
            background: #d9d9d9;
            font-weight: bold;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        .info-table .small-label {
            width: 72px;
            background: #d9d9d9;
            font-weight: bold;
            text-align: center;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        .photo-cell {
            width: 145px;
            padding: 0 !important;
            vertical-align: top !important;
            border: 1px solid #000 !important;
        }
        .photo-box {
            width: 145px;
            height: 185px;
            overflow: hidden;
            background: #4a7dc9;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 10pt;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
        }
        .section-header {
            background: #d9d9d9;
            border: 1px solid #000;
            padding: 4px;
            font-weight: bold;
            text-align: center;
            margin-top: 0;
            margin-bottom: 0;
            font-size: 9.5pt;
            font-family: Arial, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        .data-table {
            margin-top: 0;
        }
        .data-table th {
            background: #d9d9d9;
            border: 1px solid #000;
            padding: 4px 8px;
            font-weight: bold;
            font-size: 9pt;
            text-align: center;
            font-family: Arial, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        .data-table td {
            border: 1px solid #000;
            padding: 3px 8px;
            font-size: 9pt;
            vertical-align: middle;
            font-family: Arial, sans-serif;
        }
        .checkbox-row {
            display: flex;
            gap: 25px;
            padding: 3px 0;
            align-items: center;
        }
        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .checkbox {
            width: 16px;
            height: 16px;
            border: 2px solid #000;
            display: inline-block;
            position: relative;
            background: white;
            flex-shrink: 0;
        }
        .checkbox.checked::after {
            content: "✓";
            position: absolute;
            top: -4px;
            left: 2px;
            font-size: 13pt;
            font-weight: bold;
        }
        .spouse-row td {
            padding: 4px 8px;
        }
        .center-text {
            text-align: center;
        }
    </style>
</head>
<body>
<div class="page">
    <div class="header">
        <div class="logo-section">
            ${companyLogo ? `<img src="${companyLogo}" alt="Logo" />` : '<div style="width:100%;height:100%;background:#ddd;"></div>'}
        </div>
        <div class="company-info">
            <div class="company-name">PT. LORING MARGI INTERNASIONAL</div>
            <div class="company-subtitle">INDONESIAN LABOUR SUPPLIER AGENCY</div>
            <div class="company-details">
                Jln.Talun-Rancaekek Rt 04 Rw 03 Desa Jelegong Kec.Rancaekek Kab.Bandung<br>
                Tlp:(+62 22) 87834476 / 081222772174 / 087727141479<br>
                Email : loringmargiinternasional@gmail.com
            </div>
        </div>
    </div>

    <h1>Curriculum Vitae</h1>

    <table class="info-table">
        <tr>
            <td class="label-col">Full Name</td>
            <td colspan="3"><strong>${person.full_name || ''}</strong></td>
            <td class="photo-cell" rowspan="7">
                <div class="photo-box">
                    ${photoData ? `<img src="${photoData}" alt="Photo" />` : 'PHOTO<br>3x4'}
                </div>
            </td>
        </tr>
        <tr>
            <td class="label-col">Date of Birth</td>
            <td style="width: 110px;">${person.dob || ''}</td>
            <td class="small-label">Age</td>
            <td style="text-align: center;"><strong>${person.age || ''}</strong> years old</td>
        </tr>
        <tr>
            <td class="label-col">Address</td>
            <td colspan="3">${person.address || ''}</td>
        </tr>
        <tr>
            <td class="label-col">Height</td>
            <td><strong>${person.height_cm || ''}</strong> CM</td>
            <td class="small-label">Weight</td>
            <td style="text-align: center;"><strong>${person.weight_kg || ''}</strong> KG</td>
        </tr>
        <tr>
            <td class="label-col"></td>
            <td></td>
            <td class="small-label">Nationality</td>
            <td style="text-align: center;"><strong>${person.nationality || ''}</strong></td>
        </tr>
        <tr>
            <td class="label-col">Passport No.</td>
            <td colspan="3"><strong>${person.passport_no || ''}</strong></td>
        </tr>
        <tr>
            <td class="label-col"></td>
            <td></td>
            <td class="small-label">Religion</td>
            <td style="text-align: center;"><strong>${person.religion || ''}</strong></td>
        </tr>
    </table>

    <div class="section-header">Education Background</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>School Name</th>
                <th style="width: 100px;">Major</th>
                <th style="width: 100px;">Period of School</th>
            </tr>
        </thead>
        <tbody>
            ${education.map(edu => `
                <tr>
                    <td>${edu.school}</td>
                    <td>${edu.major}</td>
                    <td>${edu.period}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="section-header">Family</div>
    <table class="info-table">
        <tr>
            <td class="label-col">Marital status</td>
            <td colspan="3">
                <div class="checkbox-row">
                    <div class="checkbox-item">
                        <div class="checkbox ${person.marital_status === 'Unmarried' ? 'checked' : ''}"></div>
                        <span>Unmarried</span>
                    </div>
                    <div class="checkbox-item">
                        <div class="checkbox ${person.marital_status === 'Married' ? 'checked' : ''}"></div>
                        <span>Married</span>
                    </div>
                    <div class="checkbox-item">
                        <div class="checkbox ${person.marital_status === 'Divorce' ? 'checked' : ''}"></div>
                        <span>Divorce</span>
                    </div>
                </div>
            </td>
        </tr>
        <tr class="spouse-row">
            <td class="label-col">Spouse's Name</td>
            <td colspan="2"><strong>${person.spouse_name || ''}</strong></td>
            <td style="width: 80px; text-align: center;">Age <strong>${person.spouse_age || ''}</strong></td>
        </tr>
        <tr>
            <td colspan="4" class="center-text gray-bg" style="font-weight: bold;">
                Spouse's or Parents Contact Number
            </td>
        </tr>
        <tr>
            <td colspan="4" class="center-text"><strong>${person.contact_number || ''}</strong></td>
        </tr>
    </table>

    <div class="section-header">Skill</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 30%;">Language</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            ${languages.map(lang => `
                <tr>
                    <td>${lang.name}</td>
                    <td>${lang.level}</td>
                </tr>
            `).join('')}
            <tr>
                <td>Other</td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <div class="section-header">Working Experience</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 35%;">Company Name</th>
                <th style="width: 30%;">Position</th>
                <th style="width: 35%;">Working Period</th>
            </tr>
        </thead>
        <tbody>
            ${workExperience.map(work => `
                <tr>
                    <td>${work.company}</td>
                    <td>${work.position}</td>
                    <td>${work.period}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</div>
</body>
</html>`;
  };

  const downloadHTML = () => {
    if (!selectedPerson) return;
    
    const personIndex = excelData.indexOf(selectedPerson);
    const photoData = photos[personIndex];
    const html = generateCVHTML(selectedPerson, photoData, logoData);
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
      const html = generateCVHTML(selectedPerson, photoData, logoData);
      
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
      
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try downloading HTML instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  const bulkPrintPDF = async () => {
    if (excelData.length === 0) return;
    
    setIsGenerating(true);
    
    try {
      const sampleCV = generateCVHTML(excelData[0], photos[0], logoData);
      const styleMatch = sampleCV.match(/<style>(.*?)<\/style>/s);
      
      let combinedHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bulk CV Print - ${excelData.length} CVs</title>`;
      
      if (styleMatch) {
        combinedHTML += `<style>${styleMatch[1]}</style>`;
      }
      
      combinedHTML += `</head><body>`;
      
      for (let i = 0; i < excelData.length; i++) {
        const person = excelData[i];
        const photoData = photos[i];
        const singleCV = generateCVHTML(person, photoData, logoData);
        
        const pageMatch = singleCV.match(/<div class="page">(.*?)<\/div>\s*<\/body>/s);
        if (pageMatch) {
          combinedHTML += `<div class="page">${pageMatch[1]}</div>`;
        }
      }
      
      combinedHTML += '</body></html>';
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      document.body.appendChild(iframe);
      
      iframe.contentDocument.open();
      iframe.contentDocument.write(combinedHTML);
      iframe.contentDocument.close();
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      iframe.contentWindow.print();
      
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating bulk PDF:', error);
      alert('Error generating bulk PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const bulkDownloadHTML = () => {
    if (excelData.length === 0) return;
    
    const sampleCV = generateCVHTML(excelData[0], photos[0], logoData);
    const styleMatch = sampleCV.match(/<style>(.*?)<\/style>/s);
    
    let combinedHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>All CVs - ${excelData.length} Persons</title>`;
    
    if (styleMatch) {
      combinedHTML += `<style>${styleMatch[1]}</style>`;
    }
    
    combinedHTML += '</head><body>';
    
    for (let i = 0; i < excelData.length; i++) {
      const person = excelData[i];
      const photoData = photos[i];
      const singleCV = generateCVHTML(person, photoData, logoData);
      
      const pageMatch = singleCV.match(/<div class="page">(.*?)<\/div>\s*<\/body>/s);
      if (pageMatch) {
        combinedHTML += `<div class="page">${pageMatch[1]}</div>`;
      }
    }
    
    combinedHTML += '</body></html>';
    
    const blob = new Blob([combinedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `All_CVs_${excelData.length}_persons.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewCV = () => {
    if (!selectedPerson) return;
    const personIndex = excelData.indexOf(selectedPerson);
    const photoData = photos[personIndex];
    const html = generateCVHTML(selectedPerson, photoData, logoData);
    const newWindow = window.open();
    newWindow.document.write(html);
    newWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-black p-3 sm:p-6" style={{fontFamily: 'Montserrat, sans-serif'}}>
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-8 mb-4 sm:mb-8 transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px]">
          <div className="mb-2 sm:mb-3">
            <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight uppercase">CV GENERATOR</h1>
          </div>
          <p className="text-gray-800 font-semibold uppercase text-xs sm:text-sm tracking-wide">UPLOAD LOGO, EXCEL & FOTO → GENERATE CV PDF FORMAT PT. LORING MARGI INTERNASIONAL</p>
        </div>

        <div className="bg-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-8 mb-4 sm:mb-8 transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px]">
          <h2 className="text-xl sm:text-2xl font-black text-black mb-4 sm:mb-6 uppercase tracking-wide">LOGO PERUSAHAAN</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex flex-col items-center justify-center w-40 h-40 sm:w-48 sm:h-48 border-2 sm:border-4 border-black bg-gray-50">
              {logoData ? (
                <img src={logoData} alt="Company Logo" className="w-28 h-28 sm:w-32 sm:h-32 object-contain" />
              ) : (
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-700 font-bold uppercase">LOADING LOGO...</p>
                </div>
              )}
            </div>
            <div className="flex-1 w-full">
              {logoData ? (
                <div className="space-y-2 sm:space-y-3 text-center sm:text-left">
                  <p className="text-black font-black text-base sm:text-lg uppercase">LOGO LOADED FROM STORAGE</p>
                  <p className="text-xs text-gray-700 font-semibold uppercase tracking-wider break-all">PATH: /STORAGE/LOGO/LORING.JPEG</p>
                  <label className="inline-block">
                    <span className="text-xs sm:text-sm text-black font-bold uppercase cursor-pointer hover:bg-black hover:text-white px-2 sm:px-3 py-1 sm:py-2 transition-all duration-200 border-2 border-black inline-block">
                      UPLOAD LOGO BERBEDA
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 text-center sm:text-left">
                  <p className="text-black font-black text-base sm:text-lg uppercase">⚠ LOGO TIDAK DITEMUKAN DI STORAGE</p>
                  <p className="text-xs sm:text-sm text-gray-700 font-bold uppercase mb-2 sm:mb-3">UPLOAD LOGO MANUAL:</p>
                  <label className="inline-block bg-black text-white px-4 sm:px-6 py-2 sm:py-3 cursor-pointer transition-all duration-200 hover:bg-white hover:text-black border-2 sm:border-4 border-black font-black uppercase">
                    <span className="text-xs sm:text-sm">UPLOAD LOGO</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-8 mb-4 sm:mb-8 transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px]">
          <h2 className="text-xl sm:text-2xl font-black text-black mb-4 sm:mb-6 uppercase tracking-wide">UPLOAD FILE EXCEL</h2>
          <label className="flex flex-col items-center justify-center w-full h-36 sm:h-48 border-2 sm:border-4 border-dashed border-black cursor-pointer hover:bg-gray-100 transition-all duration-300">
            <div className="flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-6 px-3">
              <p className="mb-2 text-xs sm:text-sm text-black font-black uppercase tracking-wider text-center">
                CLICK TO UPLOAD ATAU DRAG AND DROP
              </p>
              <p className="text-xs text-gray-700 font-bold uppercase tracking-wide">EXCEL FILE (.XLSX, .XLS)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </label>
          
          {excelData.length > 0 && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white border-2 sm:border-4 border-black">
              <p className="text-black font-black text-base sm:text-lg uppercase">
                {excelData.length} DATA BERHASIL DIIMPORT
              </p>
            </div>
          )}
        </div>

        {excelData.length > 0 && (
          <div className="bg-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 mb-4 sm:mb-8 transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px]">
            <h2 className="text-xl sm:text-2xl font-black text-black mb-4 sm:mb-6 uppercase tracking-wide">BULK ACTIONS - ALL CVs ({excelData.length} PERSONS)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <button
                onClick={bulkPrintPDF}
                disabled={isGenerating}
                className="bg-black text-white font-black py-3 sm:py-4 px-4 sm:px-6 border-2 sm:border-4 border-black transition-all duration-200 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide text-xs sm:text-sm"
              >
                {isGenerating ? 'GENERATING...' : 'PRINT ALL TO PDF'}
              </button>
              <button
                onClick={bulkDownloadHTML}
                className="bg-white text-black font-black py-3 sm:py-4 px-4 sm:px-6 border-2 sm:border-4 border-black transition-all duration-200 hover:bg-black hover:text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide text-xs sm:text-sm"
              >
                DOWNLOAD ALL AS HTML
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 mt-3 sm:mt-4 font-bold uppercase tracking-wide text-center sm:text-left">
              BULK ACTIONS AKAN MEMPROSES SEMUA {excelData.length} CV SEKALIGUS DALAM SATU FILE
            </p>
          </div>
        )}

        {excelData.length > 0 && (
          <div className="bg-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 mb-4 sm:mb-8 transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px]">
            <h2 className="text-xl sm:text-2xl font-black text-black mb-4 sm:mb-6 uppercase tracking-wide">UPLOAD FOTO & PILIH DATA</h2>
            <div className="space-y-3 sm:space-y-4">
              {excelData.map((person, idx) => (
                <div 
                  key={idx}
                  className={`p-3 sm:p-5 border-2 sm:border-4 border-black transition-all duration-300 ${
                    selectedPerson === person 
                      ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] sm:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)]' 
                      : 'bg-white hover:bg-gray-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div 
                      className="flex-1 cursor-pointer w-full"
                      onClick={() => setSelectedPerson(person)}
                    >
                      <h3 className={`font-black text-base sm:text-lg mb-1 uppercase tracking-wide ${selectedPerson === person ? 'text-white' : 'text-black'}`}>
                        {person.full_name || 'NO NAME'}
                      </h3>
                      <p className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${selectedPerson === person ? 'text-gray-300' : 'text-gray-700'}`}>
                        {person.dob || 'NO DOB'} • {person.nationality || 'NO NATIONALITY'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      {photos[idx] ? (
                        <div className="relative">
                          <img 
                            src={photos[idx]} 
                            alt="Preview" 
                            className="w-14 h-16 sm:w-16 sm:h-20 object-cover border-2 sm:border-4 border-black"
                          />
                          <button
                            onClick={() => removePhoto(idx)}
                            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-black text-white border-2 border-white px-1.5 py-0.5 sm:px-2 sm:py-1 hover:bg-white hover:text-black hover:border-black transition-all duration-200 font-black text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className={`cursor-pointer border-2 sm:border-4 border-dashed p-2 sm:p-3 flex flex-col items-center justify-center transition-all duration-300 ${
                          selectedPerson === person ? 'border-white bg-white text-black' : 'border-black bg-gray-100 hover:bg-gray-200'
                        }`}>
                          <span className="text-xs font-black uppercase tracking-wide">UPLOAD FOTO</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(idx, e)}
                          />
                        </label>
                      )}
                      
                      {selectedPerson === person && (
                        <div className="bg-white text-black px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-black border-2 border-white uppercase tracking-wide whitespace-nowrap">
                          SELECTED
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedPerson && (
          <div className="bg-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px]">
            <h2 className="text-xl sm:text-2xl font-black text-black mb-4 sm:mb-6 uppercase tracking-wide text-center sm:text-left">
              SINGLE CV UNTUK: <span className="underline block sm:inline mt-1 sm:mt-0">{selectedPerson.full_name}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
              <button
                onClick={previewCV}
                className="bg-white text-black font-black py-3 sm:py-4 px-4 sm:px-6 border-2 sm:border-4 border-black transition-all duration-200 hover:bg-black hover:text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide text-xs sm:text-sm"
              >
                PREVIEW CV
              </button>
              <button
                onClick={downloadPDF}
                disabled={isGenerating}
                className="bg-black text-white font-black py-3 sm:py-4 px-4 sm:px-6 border-2 sm:border-4 border-black transition-all duration-200 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide text-xs sm:text-sm"
              >
                {isGenerating ? 'GENERATING...' : 'PRINT TO PDF'}
              </button>
              <button
                onClick={downloadHTML}
                className="bg-white text-black font-black py-3 sm:py-4 px-4 sm:px-6 border-2 sm:border-4 border-black transition-all duration-200 hover:bg-black hover:text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide text-xs sm:text-sm"
              >
                DOWNLOAD HTML
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 text-center mt-4 sm:mt-6 font-bold uppercase tracking-wide px-2">
              KLIK "PRINT TO PDF" AKAN MEMBUKA DIALOG PRINT BROWSER. PILIH "SAVE AS PDF" SEBAGAI PRINTER.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVImportGenerator;