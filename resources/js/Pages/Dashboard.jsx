import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';

const Dashboard = ({ cvSubmissions, stats, filters, positions, nationalities, activeTab }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedPosition, setSelectedPosition] = useState(filters.position || '');
    const [selectedNationality, setSelectedNationality] = useState(filters.nationality || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });

    const headerLogo1 = '/storage/logo/LoringMargi.png';

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        router.get('/dashboard', {
            search: searchTerm,
            position: selectedPosition,
            nationality: selectedNationality,
            sort_by: sortBy,
            sort_order: sortOrder,
            tab: activeTab,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleSort = (field) => {
        const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortOrder(newOrder);
        router.get('/dashboard', {
            search: searchTerm,
            position: selectedPosition,
            nationality: selectedNationality,
            sort_by: field,
            sort_order: newOrder,
            tab: activeTab,
        }, { preserveState: true, preserveScroll: true });
    };

    const switchTab = (tab) => {
        router.get('/dashboard', { tab }, { preserveState: false });
    };

    const handleDelete = (id) => {
        const route = activeTab === 'slokavia'
            ? `/cv-submissions-slokavia/${id}`
            : activeTab === 'korea'
                ? `/cv-submissions-korea/${id}`
                : `/cv-submissions/${id}`;

        router.delete(route, {
            onSuccess: () => {
                setDeleteModal({ show: false, id: null, name: '' });
                showNotification('success', 'CV Deleted', 'CV has been deleted successfully');
            },
            onError: () => {
                showNotification('error', 'Delete Failed', 'Failed to delete CV');
            }
        });
    };

    const showNotification = (type, title, message) => {
        if (!document.getElementById('notif-style')) {
            const s = document.createElement('style');
            s.id = 'notif-style';
            s.textContent = `@keyframes slideInRight{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:translateX(0)}}@keyframes slideOutRight{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(100px)}}`;
            document.head.appendChild(s);
        }
        const isSuccess = type === 'success';
        const n = document.createElement('div');
        n.style.cssText = `position:fixed;top:24px;right:24px;background:${isSuccess ? 'linear-gradient(135deg,#BF9952,#D4AF6A)' : 'linear-gradient(135deg,#ef4444,#dc2626)'};color:white;padding:20px 24px;border-radius:16px;box-shadow:0 20px 60px ${isSuccess ? 'rgba(191,153,82,0.4)' : 'rgba(239,68,68,0.4)'};z-index:9999;font-family:'Poppins',sans-serif;animation:slideInRight 0.5s cubic-bezier(0.4,0,0.2,1);backdrop-filter:blur(12px);`;
        n.innerHTML = `<div style="display:flex;align-items:center;gap:16px;"><div style="background:rgba(255,255,255,0.2);padding:10px;border-radius:12px;"><svg style="width:24px;height:24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">${isSuccess ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'}</svg></div><div><p style="font-weight:600;font-size:16px;margin:0;">${title}</p><p style="font-size:13px;margin:4px 0 0 0;opacity:0.95;">${message}</p></div></div>`;
        document.body.appendChild(n);
        setTimeout(() => {
            n.style.animation = 'slideOutRight 0.4s cubic-bezier(0.4,0,1,1)';
            setTimeout(() => n.remove(), 400);
        }, 3000);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedPosition('');
        setSelectedNationality('');
        router.get('/dashboard', { tab: activeTab });
    };

    const isTurki = activeTab === 'turki';
    const isKorea = activeTab === 'korea';

    const turikiColumns = [
        { key: 'full_name', label: 'Name' },
        { key: 'position_applied', label: 'Position' },
        { key: 'nationality', label: 'Nationality' },
        { key: 'email_address', label: 'Email' },
        { key: 'created_at', label: 'Submitted' },
    ];

    const slokviaColumns = [
        { key: 'full_name', label: 'Name' },
        { key: 'nationality', label: 'Nationality' },
        { key: 'email_address', label: 'Email' },
        { key: 'created_at', label: 'Submitted' },
    ];

    const koreaColumns = [
        { key: 'full_name', label: 'Name' },
        { key: 'gender', label: 'Gender' },
        { key: 'nationality', label: 'Nationality' },
        { key: 'id_number', label: 'ID Number' },
        { key: 'created_at', label: 'Submitted' },
    ];

    const columns = isTurki ? turikiColumns : (isKorea ? koreaColumns : slokviaColumns);

    return (
        <div className="min-h-screen bg-[#f8f9fb]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
                @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                @keyframes countUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                @keyframes slideDown { from { opacity:0; max-height:0; } to { opacity:1; max-height:500px; } }
                .fade-row { animation: fadeIn 0.4s ease-out both; }
                .stat-card { animation: fadeIn 0.5s ease-out both; }
                .stat-card:nth-child(1) { animation-delay: 0.05s; }
                .stat-card:nth-child(2) { animation-delay: 0.1s; }
                .stat-card:nth-child(3) { animation-delay: 0.15s; }
                .stat-card:nth-child(4) { animation-delay: 0.2s; }
                .table-row { animation: fadeIn 0.35s ease-out both; }
                .table-row:hover { background: linear-gradient(90deg, rgba(191,153,82,0.04), transparent) !important; }
                .table-row:hover td:first-child { border-left: 3px solid #BF9952; padding-left: 21px; }
                .table-row td:first-child { border-left: 3px solid transparent; transition: all 0.2s ease; }
                .tab-btn { position: relative; overflow: hidden; }
                .tab-btn::after { content: ''; position: absolute; bottom: 0; left: 50%; width: 0; height: 2px; background: #BF9952; transition: all 0.3s ease; transform: translateX(-50%); }
                .tab-btn:hover::after { width: 60%; }
                .tab-btn.active::after { width: 80%; background: white; }
                .search-input:focus { box-shadow: 0 0 0 3px rgba(191,153,82,0.15); }
                .action-btn { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
                .action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                .modal-overlay { animation: fadeIn 0.2s ease-out; }
                .modal-content { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .gold-glow { box-shadow: 0 8px 32px rgba(191,153,82,0.2); }
            `}</style>

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <img src={headerLogo1} alt="Loring Margi" style={{ height: 42, width: 'auto', objectFit: 'contain' }} className="transition-transform group-hover:scale-105" />
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/" className="px-4 py-2 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-all text-sm">
                            Home
                        </Link>
                        <button
                            onClick={() => router.post('/logout')}
                            className="action-btn px-4 py-2 bg-gray-900 text-white rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-gray-800"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

                {/* Title */}
                <div className="flex items-end justify-between mb-8" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">CV Dashboard</h1>
                        <p className="text-gray-500 mt-1.5 text-sm">Manage and view all CV submissions</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1.5 mb-7 bg-gray-100/80 rounded-2xl p-1.5 w-fit" style={{ animation: 'fadeIn 0.45s ease-out' }}>
                    {[
                        { key: 'turki', label: 'Turki', img: '/images/Turkey.jpg' },
                        { key: 'slokavia', label: 'Slokavia', img: '/images/Vlag van Slowakije.jpg' },
                        { key: 'korea', label: 'Korea', img: '/images/KoranF.png' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => switchTab(tab.key)}
                            className={`tab-btn px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2.5 text-sm ${
                                activeTab === tab.key
                                    ? 'active bg-gradient-to-r from-[#BF9952] to-[#D4AF6A] text-white shadow-lg shadow-[#BF9952]/25'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                            }`}
                        >
                            <img src={tab.img} alt={tab.label} style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 2, flexShrink: 0, border: '1px solid rgba(0,0,0,0.15)' }} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-7">
                    {[
                        { label: 'Total CVs', value: stats.total, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
                        { label: 'This Month', value: stats.this_month, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                        { label: 'This Week', value: stats.this_week, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
                        { label: 'Today', value: stats.today, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                    ].map((stat, idx) => (
                        <div key={idx} className="stat-card bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">{stat.label}</p>
                                    <p className="text-3xl sm:text-4xl font-extrabold text-gray-900" style={{ animation: 'countUp 0.6s ease-out both', animationDelay: `${0.2 + idx * 0.08}s` }}>{stat.value}</p>
                                </div>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ background: stat.bg }}>
                                    <svg className="w-5 h-5" fill="none" stroke={stat.color} strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#BF9952] outline-none transition-all text-sm"
                            />
                        </div>
                        {isTurki && (
                            <select
                                value={selectedPosition}
                                onChange={(e) => setSelectedPosition(e.target.value)}
                                className="search-input px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#BF9952] outline-none transition-all text-sm text-gray-700"
                            >
                                <option value="">All Positions</option>
                                {positions.map((pos, idx) => (
                                    <option key={idx} value={pos}>{pos}</option>
                                ))}
                            </select>
                        )}
                        <select
                            value={selectedNationality}
                            onChange={(e) => setSelectedNationality(e.target.value)}
                            className="search-input px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#BF9952] outline-none transition-all text-sm text-gray-700"
                        >
                            <option value="">All Nationalities</option>
                            {nationalities.map((nat, idx) => (
                                <option key={idx} value={nat}>{nat}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button type="submit" className="action-btn flex-1 px-5 py-2.5 bg-gradient-to-r from-[#BF9952] to-[#D4AF6A] text-white rounded-xl font-semibold text-sm gold-glow">
                                Search
                            </button>
                            <button type="button" onClick={resetFilters} className="action-btn px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 text-sm">
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ animation: 'fadeIn 0.55s ease-out' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {columns.map((col) => (
                                        <th
                                            key={col.key}
                                            onClick={() => handleSort(col.key)}
                                            className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors select-none"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                {col.label}
                                                {sortBy === col.key && (
                                                    <svg className={`w-3.5 h-3.5 text-[#BF9952] transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cvSubmissions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <p className="font-semibold text-gray-400 text-sm">No CV submissions yet</p>
                                                <p className="text-gray-400 text-xs mt-1">They'll appear here once submitted</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    cvSubmissions.data.map((cv, idx) => (
                                        <tr key={cv.id} className="table-row border-b border-gray-50 last:border-0 transition-all duration-200" style={{ animationDelay: `${idx * 0.03}s` }}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {cv.photo_path ? (
                                                        <img src={`/storage/${cv.photo_path}`} alt={cv.full_name} className="w-9 h-9 rounded-xl object-cover border border-gray-200 shadow-sm" />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#BF9952] to-[#D4AF6A] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                                            {cv.full_name?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <span className="font-semibold text-gray-900 text-sm">{cv.full_name}</span>
                                                </div>
                                            </td>
                                            {isTurki ? (
                                                <td className="px-6 py-4 text-sm text-gray-600">{cv.position_applied || <span className="text-gray-300">—</span>}</td>
                                            ) : isKorea ? (
                                                <td className="px-6 py-4 text-sm text-gray-600">{cv.gender || <span className="text-gray-300">—</span>}</td>
                                            ) : null}
                                            <td className="px-6 py-4 text-sm text-gray-600">{cv.nationality || <span className="text-gray-300">—</span>}</td>
                                            {isKorea ? (
                                                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{cv.id_number || <span className="text-gray-300">—</span>}</td>
                                            ) : (
                                                <td className="px-6 py-4 text-sm text-gray-600">{cv.email_address || <span className="text-gray-300">—</span>}</td>
                                            )}
                                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(cv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={isTurki ? `/dashboard/${cv.id}` : (isKorea ? `/dashboard/korea/${cv.id}` : `/dashboard/slokavia/${cv.id}`)}
                                                        className="action-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        View
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteModal({ show: true, id: cv.id, name: cv.full_name })}
                                                        className="action-btn inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-medium"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {cvSubmissions.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                Showing <span className="font-semibold text-gray-700">{cvSubmissions.from}</span> to <span className="font-semibold text-gray-700">{cvSubmissions.to}</span> of <span className="font-semibold text-gray-700">{cvSubmissions.total}</span>
                            </div>
                            <div className="flex gap-1.5">
                                {cvSubmissions.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url ? `${link.url}&tab=${activeTab}` : '#'}
                                        className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                                            link.active
                                                ? 'bg-gradient-to-r from-[#BF9952] to-[#D4AF6A] text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteModal({ show: false, id: null, name: '' })}>
                    <div className="modal-content bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete CV?</h3>
                            <p className="text-gray-500 text-sm">Are you sure you want to delete <strong className="text-gray-700">{deleteModal.name}</strong>'s CV? This cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                                className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteModal.id)}
                                className="flex-1 px-5 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-16 border-t border-gray-200/60">
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-400">© 2025 Loring Margi International</p>
                    <p className="text-xs text-gray-400">Powered by <span className="font-semibold text-gray-500">CyberLabs</span></p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;