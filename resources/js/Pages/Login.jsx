import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';

export default function Login({ errors }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        router.post('/login', {
            email: email,
            password: password
        }, {
            onFinish: () => setLoading(false)
        });
    };

    return (
        <div className="login-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                
                .login-page {
                    min-height: 100vh;
                    font-family: 'Poppins', sans-serif;
                    background: #111;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }
                
                /* Ambient Background Effects */
                .ambient-light-1 {
                    position: absolute;
                    top: -20%;
                    left: -10%;
                    width: 60%;
                    height: 80%;
                    background: radial-gradient(circle, rgba(191,153,82,0.15) 0%, rgba(17,17,17,0) 70%);
                    border-radius: 50%;
                    pointer-events: none;
                    animation: pulseLight 8s infinite alternate ease-in-out;
                }
                
                .ambient-light-2 {
                    position: absolute;
                    bottom: -20%;
                    right: -10%;
                    width: 50%;
                    height: 70%;
                    background: radial-gradient(circle, rgba(212,175,106,0.1) 0%, rgba(17,17,17,0) 70%);
                    border-radius: 50%;
                    pointer-events: none;
                    animation: pulseLight 10s infinite alternate-reverse ease-in-out;
                }

                @keyframes pulseLight {
                    0% { transform: scale(1) translate(0, 0); opacity: 0.8; }
                    100% { transform: scale(1.1) translate(30px, -20px); opacity: 1; }
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .login-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border-radius: 24px;
                    width: 100%;
                    max-width: 440px;
                    padding: 48px 40px;
                    position: relative;
                    z-index: 10;
                    animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
                }

                .logo-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 32px;
                }

                .auth-input-group {
                    position: relative;
                    margin-bottom: 24px;
                }

                .auth-input {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 16px 20px 16px 48px;
                    border-radius: 14px;
                    font-size: 14px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    outline: none;
                }

                .auth-input:focus {
                    border-color: #BF9952;
                    background: rgba(0, 0, 0, 0.4);
                    box-shadow: 0 0 0 4px rgba(191,153,82,0.1);
                }

                .auth-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .input-icon {
                    position: absolute;
                    left: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.4);
                    transition: all 0.3s ease;
                }

                .auth-input:focus + .input-icon,
                .auth-input:not(:placeholder-shown) + .input-icon {
                    color: #BF9952;
                }

                .auth-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 8px;
                    letter-spacing: 0.02em;
                }

                .btn-submit {
                    width: 100%;
                    padding: 16px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #BF9952 0%, #D4AF6A 100%);
                    color: white;
                    font-weight: 600;
                    font-size: 15px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    letter-spacing: 0.02em;
                    box-shadow: 0 8px 20px rgba(191,153,82,0.25);
                }

                .btn-submit:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(191,153,82,0.35);
                }

                .btn-submit:active:not(:disabled) {
                    transform: translateY(1px);
                }

                .btn-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .error-box {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 12px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                    animation: fadeUp 0.4s ease both;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div className="ambient-light-1"></div>
            <div className="ambient-light-2"></div>

            <div className="login-card">
                <div className="logo-container">
                    <img src="/storage/logo/LoringMargi.png" alt="Loring Margi" style={{ height: 64, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }} />
                </div>
                
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'white', marginBottom: 8, letterSpacing: '-0.02em' }}>
                        Portal Access
                    </h1>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                        Enter your credentials to manage the admin dashboard.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {errors && errors.email && (
                        <div className="error-box">
                            <svg style={{ width: 18, height: 18, color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p style={{ color: '#fca5a5', fontSize: 13, fontWeight: 500, margin: 0 }}>{errors.email}</p>
                        </div>
                    )}

                    <div className="auth-input-group">
                        <label className="auth-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="auth-input"
                                placeholder="name@loringmargi.com"
                                required
                            />
                            <svg className="input-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        </div>
                    </div>

                    <div className="auth-input-group" style={{ marginBottom: 32 }}>
                        <label className="auth-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="auth-input"
                                placeholder="••••••••"
                                required
                            />
                            <svg className="input-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <svg className="spinner" width="18" height="18" fill="none" viewBox="0 0 24 24">
                                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: 32, textAlign: 'center' }}>
                    <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#BF9952'} onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}>
                        &larr; Back to Generator
                    </Link>
                </div>
            </div>
        </div>
    );
}