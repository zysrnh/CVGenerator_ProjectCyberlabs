import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';

const Dashboard = ({ cvSubmissions, stats, filters, positions, nationalities }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedPosition, setSelectedPosition] = useState(filters.position || '');
    const [selectedNationality, setSelectedNationality] = useState(filters.nationality || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });

    const headerLogo1 = '/storage/logo/LoringMargi.png';
    const headerLogo2 = '/storage/logo/Patika.jpeg';

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
        }, {
            preserveState: true,
            preserveScroll: true,
        });
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
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (id) => {
        router.delete(`/cv-submissions/${id}`, {
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
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 16px;">
                <div style="background: rgba(255, 255, 255, 0.2); padding: 10px; border-radius: 12px;">
                    <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${isSuccess 
                            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                        }
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

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedPosition('');
        setSelectedNationality('');
        router.get('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideOutRight {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100px); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
                    <Link href="/" className="w-32 sm:w-40 transform transition hover:scale-105">
                        <img src={headerLogo1} alt="Loring Margi" className="w-full h-auto" />
                    </Link>
                    <div className="w-32 sm:w-40 transform transition hover:scale-105">
                        <img src={headerLogo2} alt="Patika" className="w-full h-auto" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Title & Navigation */}
                <div className="flex items-center justify-between mb-8">
    <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">CV Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage and view all CV submissions</p>
    </div>
    <div className="flex items-center gap-3">
        <Link href="/" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
            Home
        </Link>
        <button 
            onClick={() => router.post('/logout')}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
        </button>
    </div>
</div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total CVs', value: stats.total, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-blue-500 to-blue-600' },
                        { label: 'This Month', value: stats.this_month, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'from-green-500 to-green-600' },
                        { label: 'This Week', value: stats.this_week, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-purple-500 to-purple-600' },
                        { label: 'Today', value: stats.today, icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'from-orange-500 to-orange-600' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Search by name, email, position..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#BF9952] focus:ring-2 focus:ring-[#BF9952]/20 outline-none transition"
                        />
                        <select
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#BF9952] focus:ring-2 focus:ring-[#BF9952]/20 outline-none transition"
                        >
                            <option value="">All Positions</option>
                            {positions.map((pos, idx) => (
                                <option key={idx} value={pos}>{pos}</option>
                            ))}
                        </select>
                        <select
                            value={selectedNationality}
                            onChange={(e) => setSelectedNationality(e.target.value)}
                            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#BF9952] focus:ring-2 focus:ring-[#BF9952]/20 outline-none transition"
                        >
                            <option value="">All Nationalities</option>
                            {nationalities.map((nat, idx) => (
                                <option key={idx} value={nat}>{nat}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-[#BF9952] to-[#D4AF6A] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                                Search
                            </button>
                            <button type="button" onClick={resetFilters} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* CV List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    {[
                                        { key: 'full_name', label: 'Name' },
                                        { key: 'position_applied', label: 'Position' },
                                        { key: 'nationality', label: 'Nationality' },
                                        { key: 'email_address', label: 'Email' },
                                        { key: 'created_at', label: 'Submitted' },
                                    ].map((col) => (
                                        <th
                                            key={col.key}
                                            onClick={() => handleSort(col.key)}
                                            className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition"
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.label}
                                                {sortBy === col.key && (
                                                    <svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {cvSubmissions.data.map((cv) => (
                                    <tr key={cv.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {cv.photo_path ? (
                                                    <img src={`/storage/${cv.photo_path}`} alt={cv.full_name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BF9952] to-[#D4AF6A] flex items-center justify-center text-white font-bold">
                                                        {cv.full_name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-900">{cv.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{cv.position_applied || '-'}</td>
                                        <td className="px-6 py-4 text-gray-700">{cv.nationality || '-'}</td>
                                        <td className="px-6 py-4 text-gray-700">{cv.email_address || '-'}</td>
                                        <td className="px-6 py-4 text-gray-700">{new Date(cv.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/${cv.id}`}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteModal({ show: true, id: cv.id, name: cv.full_name })}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {cvSubmissions.last_page > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {cvSubmissions.from} to {cvSubmissions.to} of {cvSubmissions.total} results
                            </div>
                            <div className="flex gap-2">
                                {cvSubmissions.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${
                                            link.active
                                                ? 'bg-gradient-to-r from-[#BF9952] to-[#D4AF6A] text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete CV?</h3>
                            <p className="text-gray-600">Are you sure you want to delete <strong>{deleteModal.name}</strong>'s CV? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteModal.id)}
                                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

export default Dashboard;