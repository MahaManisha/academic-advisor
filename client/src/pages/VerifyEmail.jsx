import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail, resendOtp } from '../api/auth.api';

const VerifyEmail = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const email = state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await verifyEmail({ email, otp });
            // On success, store token if returned and redirect to Onboarding/Intake
            if (result.token) {
                localStorage.setItem('token', result.token);
            }
            // Redirect to Academic Intake (Onboarding)
            window.location.href = '/onboarding';

        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        try {
            await resendOtp(email);
            setMessage('New OTP sent to your email.');
            setResendCooldown(30);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Verify Your Email</h2>
                <p style={styles.subtitle}>
                    Please enter the 6-digit code sent to <br />
                    <strong>{email}</strong>
                </p>

                {error && <div style={styles.error}>{error}</div>}
                {message && <div style={styles.success}>{message}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Enter OTP Code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        style={styles.input}
                        required
                        maxLength={6}
                    />
                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p>
                        Didn't receive code?{' '}
                        <button
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            style={{
                                ...styles.linkBtn,
                                color: resendCooldown > 0 ? '#9ca3af' : '#4f46e5',
                                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6',
        padding: '20px',
    },
    card: {
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    title: {
        margin: '0 0 10px 0',
        color: '#111827',
        fontSize: '24px',
        fontWeight: 'bold'
    },
    subtitle: {
        margin: '0 0 30px 0',
        color: '#6b7280',
        lineHeight: '1.5',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    input: {
        padding: '14px',
        borderRadius: '8px',
        border: '2px solid #e5e7eb',
        fontSize: '24px',
        textAlign: 'center',
        letterSpacing: '8px',
        outline: 'none',
        fontWeight: 'bold',
        color: '#374151'
    },
    button: {
        padding: '14px',
        borderRadius: '8px',
        border: 'none',
        background: '#4f46e5',
        color: 'white',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    error: {
        background: '#fee2e2',
        color: '#dc2626',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
        fontWeight: '500'
    },
    success: {
        background: '#dcfce7',
        color: '#16a34a',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
        fontWeight: '500'
    },
    footer: {
        marginTop: '24px',
        fontSize: '14px',
        color: '#6b7280',
    },
    linkBtn: {
        background: 'none',
        border: 'none',
        fontWeight: '600',
        padding: 0,
        textDecoration: 'underline'
    }
};

export default VerifyEmail;
