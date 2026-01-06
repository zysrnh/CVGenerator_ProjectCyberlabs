import React from 'react';
import { Link } from '@inertiajs/react';

const CVDetail = ({ cv }) => {
    const headerLogo1 = '/storage/logo/LoringMargi.png';
    const headerLogo2 = '/storage/logo/Patika.jpeg';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            `}</style>

            {/* Header */}
            <div className="bg-white border-b shadow-sm">
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
                {/* Back Button */}
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-[#BF9952] hover:shadow-lg transition-all mb-6 font-semibold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </Link>

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0">
                            {cv.photo_path ? (
                                <img src={`/storage/${cv.photo_path}`} alt={cv.full_name} className="w-48 h-48 rounded-2xl object-cover border-4 border-gray-200 shadow-lg" />
                            ) : (
                                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-[#BF9952] to-[#D4AF6A] flex items-center justify-center text-white text-6xl font-bold shadow-lg">
                                    {cv.full_name?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">{cv.full_name}</h1>
                            <p className="text-xl text-gray-600 mb-4">{cv.position_applied || 'Position not specified'}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <svg className="w-5 h-5 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>{cv.email_address || 'No email'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <svg className="w-5 h-5 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{cv.mobile_phone || 'No phone'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <svg className="w-5 h-5 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{cv.nationality || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <svg className="w-5 h-5 text-[#BF9952]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{cv.date_of_birth || 'No DOB'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Details */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-[#BF9952] to-[#D4AF6A] rounded-full"></div>
                        Personal Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: 'Objective', value: cv.objective },
                            { label: 'Age', value: cv.age },
                            { label: 'Sex', value: cv.sex },
                            { label: 'Height', value: cv.height },
                            { label: 'Weight', value: cv.weight },
                            { label: 'Place of Birth', value: cv.place_of_birth },
                            { label: 'Marital Status', value: cv.marital_status },
                            { label: 'Passport Number', value: cv.passport_number },
                            { label: 'Passport Expiry', value: cv.passport_expiry_date },
                        ].map((item, idx) => (
                            <div key={idx} className="border-l-4 border-[#BF9952] pl-4">
                                <p className="text-sm text-gray-600 font-medium mb-1">{item.label}</p>
                                <p className="text-gray-900 font-semibold">{item.value || '-'}</p>
                            </div>
                        ))}
                        <div className="border-l-4 border-[#BF9952] pl-4 md:col-span-2">
                            <p className="text-sm text-gray-600 font-medium mb-1">Address</p>
                            <p className="text-gray-900 font-semibold">{cv.address || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Work Experience */}
                {cv.work_experiences?.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-[#BF9952] to-[#D4AF6A] rounded-full"></div>
                            Work Experience
                        </h2>
                        <div className="space-y-6">
                            {cv.work_experiences.map((work, idx) => (
                                <div key={idx} className="border-l-4 border-[#BF9952] pl-6 pb-6 border-b last:border-b-0">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{work.position}</h3>
                                    <p className="text-lg text-gray-700 mb-2">{work.employer}</p>
                                    <p className="text-sm text-gray-600">{work.start_date} - {work.leaving_date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {cv.educations?.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-[#BF9952] to-[#D4AF6A] rounded-full"></div>
                            Education
                        </h2>
                        <div className="space-y-6">
                            {cv.educations.map((edu, idx) => (
                                <div key={idx} className="border-l-4 border-[#BF9952] pl-6 pb-6 border-b last:border-b-0">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{edu.school}</h3>
                                    <p className="text-lg text-gray-700 mb-2">{edu.study}</p>
                                    <p className="text-sm text-gray-600">{edu.start_date} - {edu.graduation_date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Languages */}
                    {cv.languages?.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-2 h-8 bg-gradient-to-b from-[#BF9952] to-[#D4AF6A] rounded-full"></div>
                                Languages
                            </h2>
                            <div className="space-y-4">
                                {cv.languages.map((lang, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <span className="font-semibold text-gray-900">{lang.name}</span>
                                        <span className="px-4 py-2 bg-gradient-to-r from-[#BF9952] to-[#D4AF6A] text-white rounded-lg text-sm font-medium">
                                            {lang.level}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PC Skills */}
                    {cv.pc_skills?.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="w-2 h-8 bg-gradient-to-b from-[#BF9952] to-[#D4AF6A] rounded-full"></div>
                                PC Skills
                            </h2>
                            <div className="space-y-4">
                                {cv.pc_skills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <span className="font-semibold text-gray-900">{skill.name}</span>
                                        <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium">
                                            {skill.level}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Other Skills */}
                {cv.other_skills?.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-[#BF9952] to-[#D4AF6A] rounded-full"></div>
                            Other Skills
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {cv.other_skills.map((skill, idx) => (
                                <span key={idx} className="px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl font-medium shadow-sm">
                                    {skill.skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-[#BF9952] via-[#D4AF6A] to-[#BF9952] text-white py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-2">
                    <p className="text-sm font-light">Copyright © 2025 Loring Margi International</p>
                    <p className="text-xs opacity-90">Powered by <span className="font-semibold">CyberLabs</span></p>
                </div>
            </div>
        </div>
    );
};

export default CVDetail;