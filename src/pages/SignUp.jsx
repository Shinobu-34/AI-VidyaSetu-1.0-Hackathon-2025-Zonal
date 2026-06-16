import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'individual',
        orgName: '',
        orgAddress: '',
        acceptTerms: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        if (!formData.acceptTerms) {
            return setError('Please accept the terms and conditions');
        }

        if (formData.userType === 'donation_center' && !formData.orgName) {
            return setError('Please enter your organization name');
        }

        setLoading(true);

        try {
            const orgDetails = formData.userType === 'donation_center'
                ? { organizationName: formData.orgName, organizationAddress: formData.orgAddress }
                : {};

            await signup(formData.email, formData.password, formData.name, formData.userType, orgDetails);
            navigate('/');
        } catch (err) {
            console.error('Signup error:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else {
                setError('Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '500px' }}>
                <div className="page-header">
                    <h1>Create Your <span className="gradient-text">Account</span></h1>
                    <p>Join the sustainable fashion movement today</p>
                </div>

                <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* User Type Selection */}
                        <div className="form-group">
                            <label className="form-label">Account Type</label>
                            <div className="multi-select">
                                <button
                                    type="button"
                                    className={`multi-select-option ${formData.userType === 'individual' ? 'selected' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, userType: 'individual' }))}
                                >
                                    👤 Individual
                                </button>
                                <button
                                    type="button"
                                    className={`multi-select-option ${formData.userType === 'donation_center' ? 'selected' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, userType: 'donation_center' }))}
                                >
                                    🏢 Donation Center
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {/* Donation Center Fields */}
                        {formData.userType === 'donation_center' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Organization Name</label>
                                    <input
                                        type="text"
                                        name="orgName"
                                        value={formData.orgName}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter organization name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Organization Address</label>
                                    <textarea
                                        name="orgAddress"
                                        value={formData.orgAddress}
                                        onChange={handleChange}
                                        className="form-textarea"
                                        placeholder="Enter organization address"
                                        rows={2}
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Create a password (min 6 characters)"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-checkbox">
                                <input
                                    type="checkbox"
                                    name="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                />
                                <span>I agree to the Terms of Service and Privacy Policy</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={loading}
                            style={{ marginTop: 'var(--space-4)' }}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p style={{
                        textAlign: 'center',
                        marginTop: 'var(--space-6)',
                        color: 'var(--text-secondary)'
                    }}>
                        Already have an account?{' '}
                        <Link to="/login">Log in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
