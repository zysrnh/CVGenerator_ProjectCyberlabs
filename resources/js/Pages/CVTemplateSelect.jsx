import { Link } from "@inertiajs/react";

export default function CVTemplateSelect() {
    const templates = [
        {
            id: "turki",
            label: "Turkey",
            subtitle: "Loring Margi Turki",
            desc: "CV format with Turkish bilingual labels. Ideal for Turkey job applications.",
            href: "/import",
            flagImg: "/images/Turkey.jpg",
            available: true,
        },
        {
            id: "slokavia",
            label: "EUROPASS",
            subtitle: "Loring Margi EUROPASS",
            desc: "Europass CV format with CEFR language levels. Suitable for European countries.",
            href: "/import/slokavia",
            flagImg: "/images/European.jpg",
            available: true,
        },
        {
            id: "korea",
            label: "Korea",
            subtitle: "Loring Margi Korea",
            desc: "CV format 이력서 untuk Korea Selatan. Sesuai standar manpower Korea.",
            href: "/import/korea",
            flagImg: "/images/KoranF.png",
            available: true,
        },
    ];

    return (
        <div style={{ minHeight: '100vh', fontFamily: "'Poppins', sans-serif", background: '#fafafa', color: '#111' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
                @keyframes scaleUp { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
                .hero-title { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
                .hero-sub { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
                .template-card {
                    animation: scaleUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 20px;
                    overflow: hidden;
                    transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
                    cursor: pointer;
                    text-decoration: none;
                    color: inherit;
                    display: block;
                }
                .template-card:nth-child(1) { animation-delay: 0.15s; }
                .template-card:nth-child(2) { animation-delay: 0.25s; }
                .template-card:nth-child(3) { animation-delay: 0.35s; }
                .template-card:hover {
                    border-color: #BF9952;
                    transform: translateY(-6px);
                    box-shadow: 0 20px 48px rgba(0,0,0,0.08);
                }
                .template-card:hover .card-flag {
                    transform: scale(1.05);
                }
                .template-card:hover .card-arrow {
                    transform: translateX(4px);
                    opacity: 1;
                }
                .card-flag {
                    transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
                }
                .card-arrow {
                    transition: all 0.3s ease;
                    opacity: 0.3;
                }
            `}</style>

            {/* Navbar */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(250,250,250,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid #eee',
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <img src="/storage/logo/LoringMargi.png" alt="Loring Margi" style={{ height: 36, objectFit: 'contain' }} />
                    <Link href="/login" style={{ fontSize: 13, fontWeight: 600, color: '#888', textDecoration: 'none', padding: '6px 16px', borderRadius: 8, transition: 'all 0.2s' }}>Login</Link>
                </div>
            </nav>

            {/* Hero */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 32px 60px', textAlign: 'center' }}>
                <p className="hero-sub" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#BF9952', marginBottom: 16 }}>
                    CV Generator
                </p>
                <h1 className="hero-title" style={{ fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#111', marginBottom: 16 }}>
                    Select Your Template
                </h1>
                <p className="hero-sub" style={{ fontSize: 15, color: '#999', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
                    Choose the CV template that matches your destination country
                </p>
            </div>

            {/* Cards */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {templates.map((t) => (
                    t.available ? (
                        <Link key={t.id} href={t.href} className="template-card">
                            <div style={{ height: 180, overflow: 'hidden', position: 'relative', background: '#f0f0f0' }}>
                                <img src={t.flagImg} alt={t.label} className="card-flag" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
                                <span style={{ position: 'absolute', bottom: 16, left: 20, fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>{t.label}</span>
                            </div>
                            <div style={{ padding: '20px 24px 24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <p style={{ fontSize: 12, color: '#BF9952', fontWeight: 600 }}>{t.subtitle}</p>
                                    <svg className="card-arrow" width="18" height="18" fill="none" stroke="#111" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                                <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{t.desc}</p>
                            </div>
                        </Link>
                    ) : (
                        <div key={t.id} className="template-card" style={{ opacity: 0.4, pointerEvents: 'none' }}>
                            <div style={{ height: 180, overflow: 'hidden', background: '#f0f0f0' }}>
                                <img src={t.flagImg} alt={t.label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                            </div>
                            <div style={{ padding: '20px 24px 24px' }}>
                                <p style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</p>
                                <p style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>Coming Soon</p>
                            </div>
                        </div>
                    )
                ))}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #eee', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, color: '#bbb' }}>&copy; 2025 Loring Margi International &middot; Powered by <span style={{ fontWeight: 600, color: '#999' }}>CyberLabs</span></p>
            </div>
        </div>
    );
}