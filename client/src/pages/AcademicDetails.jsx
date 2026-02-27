import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaSchool, FaBriefcase, FaLock } from 'react-icons/fa';

import './Register.css';

const AcademicDetails = () => {
    const navigate = useNavigate();
    const { completeSignup } = useAuth(); // Use auth context
    const [academicType, setAcademicType] = useState(null);
    const [loading, setLoading] = useState(false); // Add loading state

    // Add password fields to form data
    const [formData, setFormData] = useState({
        // Auth
        password: '',
        confirmPassword: '',

        // School
        schoolName: '',
        board: '',
        standard: '',
        // College
        collegeName: '',
        degree: '',
        department: '',
        year: '',
        cgpa: '',
        // Graduate
        qualification: '',
        domainKnowledge: [],
        interestToLearn: '',
        careerGoal: ''
    });

    const [error, setError] = useState('');

    useEffect(() => {
        const type = localStorage.getItem('academicType');
        if (!type) {
            navigate('/academic-status');
        } else {
            setAcademicType(type);
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelect = (field, value) => {
        setFormData(prev => {
            const current = prev[field] || [];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const validate = () => {
        // Common validation
        if (!formData.password || !formData.confirmPassword) return false;
        if (formData.password.length < 6) return false;
        if (formData.password !== formData.confirmPassword) return false;

        if (academicType === 'school') {
            return formData.schoolName && formData.board && formData.standard;
        }
        if (academicType === 'college') {
            return formData.collegeName && formData.degree && formData.department && formData.year;
        }
        if (academicType === 'graduate') {
            return formData.qualification && formData.domainKnowledge.length > 0 && formData.interestToLearn;
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        const registrationToken = sessionStorage.getItem('registrationToken');
        if (!registrationToken) {
            setError("Session expired. Please verify email again.");
            setTimeout(() => navigate('/register'), 2000);
            return;
        }

        if (validate()) {
            setLoading(true);
            try {
                // Prepare payload based on academic status to match user schema
                let payload = {
                    password: formData.password,
                    academicStatus: academicType,
                    registrationToken
                };

                if (academicType === 'school') {
                    payload = {
                        ...payload,
                        schoolName: formData.schoolName,
                        educationBoard: formData.board,
                        standard: formData.standard
                    };
                } else if (academicType === 'college') {
                    payload = {
                        ...payload,
                        college: formData.collegeName,
                        degreeType: formData.degree,
                        domain: formData.department, // mapped to domain in model
                        year: formData.year,
                        syllabusUrl: formData.syllabusUrl,
                        cgpa: formData.cgpa
                    };
                } else if (academicType === 'graduate') {
                    payload = {
                        ...payload,
                        qualification: formData.qualification,
                        skills: formData.domainKnowledge, // mapped to skills in model
                        fieldOfStudy: formData.interestToLearn, // mapped to fieldOfStudy
                        careerInterest: formData.careerGoal, // mapped to careerInterest
                    };
                }

                // Sanitize payload: remove empty strings that might trigger enum validation errors
                Object.keys(payload).forEach(key => {
                    if (payload[key] === '' || payload[key] === null) {
                        delete payload[key];
                    }
                });

                await completeSignup(payload);

                // Clear temp storage
                localStorage.removeItem('academicType');
                sessionStorage.removeItem('registrationToken');

                // Navigate to next step (Assessment Intro)
                // Since completeSignup logs us in, we can access protected routes
                navigate('/assessment-intro');

            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to create account. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            setError('Please fill in all required fields correctly.');
        }
    };

    // Options
    const boards = ["State Board", "CBSE", "ICSE", "Other"];
    const standards = ["6th", "7th", "8th", "9th", "10th", "11th", "12th"];
    const degrees = ["B.E", "B.Tech", "B.Sc", "B.Com", "B.A", "Diploma", "M.E", "M.Tech", "MBA", "MCA"];
    const years = ["1", "2", "3", "4", "5"];
    const domains = ["Software Development", "Data Science", "AI/ML", "Cyber Security", "Finance", "Marketing", "Core Engineering", "Design"];

    if (!academicType) return null;

    return (
        <div className="register-container">
            <div className="register-card" style={{ maxWidth: '600px' }}>
                <h2 className="register-title">Academic Details</h2>
                <p className="register-subtitle">
                    {academicType === 'school' && "Tell us about your school education."}
                    {academicType === 'college' && "Tell us about your college journey."}
                    {academicType === 'graduate' && "Share your qualifications and goals."}
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="register-form">

                    {/* --- School Form --- */}
                    {academicType === 'school' && (
                        <div className="form-section animate-fade-in">
                            <div className="input-group">
                                <label>School Name *</label>
                                <input name="schoolName" value={formData.schoolName} onChange={handleChange} placeholder="e.g. Greenwood High" required />
                            </div>
                            <div className="input-group">
                                <label>Board *</label>
                                <select name="board" value={formData.board} onChange={handleChange} required>
                                    <option value="">Select Board</option>
                                    {boards.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Standard/Class *</label>
                                <select name="standard" value={formData.standard} onChange={handleChange} required>
                                    <option value="">Select Class</option>
                                    {standards.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* --- College Form --- */}
                    {academicType === 'college' && (
                        <div className="form-section animate-fade-in">
                            <div className="input-group">
                                <label>College Name *</label>
                                <input name="collegeName" value={formData.collegeName} onChange={handleChange} placeholder="e.g. National College of Engineering" required />
                            </div>
                            <div className="row-group" style={{ display: 'flex', gap: '15px' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label>Degree *</label>
                                    <select name="degree" value={formData.degree} onChange={handleChange} required>
                                        <option value="">Select Degree</option>
                                        {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label>Year *</label>
                                    <select name="year" value={formData.year} onChange={handleChange} required>
                                        <option value="">Select Year</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Department / Domain *</label>
                                <input name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science" required />
                            </div>
                            <div className="input-group">
                                <label>Syllabus / Course Page URL</label>
                                <input name="syllabusUrl" value={formData.syllabusUrl || ''} onChange={handleChange} placeholder="https://college.edu/syllabus.pdf" type="url" />
                                <span style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>We'll use this to auto-generate your first assessment.</span>
                            </div>
                            <div className="input-group">
                                <label>Current CGPA (Optional)</label>
                                <input name="cgpa" value={formData.cgpa} onChange={handleChange} placeholder="e.g. 8.5" type="number" step="0.01" />
                            </div>
                        </div>
                    )}

                    {/* --- Graduate Form --- */}
                    {academicType === 'graduate' && (
                        <div className="form-section animate-fade-in">
                            <div className="input-group">
                                <label>Highest Qualification *</label>
                                <input name="qualification" value={formData.qualification} onChange={handleChange} placeholder="e.g. M.Sc / B.Tech" required />
                            </div>

                            <div className="input-group">
                                <label>Domain of Knowledge * (Select multiple)</label>
                                <div className="chip-container">
                                    {domains.map(d => (
                                        <span
                                            key={d}
                                            onClick={() => handleMultiSelect('domainKnowledge', d)}
                                            className={`chip ${formData.domainKnowledge?.includes(d) ? 'active' : ''}`}
                                        >
                                            {d}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Area of Interest to Learn *</label>
                                <input name="interestToLearn" value={formData.interestToLearn} onChange={handleChange} placeholder="e.g. Advanced AI" required />
                            </div>

                            <div className="input-group">
                                <label>Career Goal (Optional)</label>
                                <textarea name="careerGoal" value={formData.careerGoal} onChange={handleChange} placeholder="What do you aspire to become?" rows="3" />
                            </div>
                        </div>
                    )}

                    {/* --- Password Creation (Common) --- */}
                    <div className="form-section animate-fade-in" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                        <h3 style={{ fontSize: '16px', color: '#444', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaLock style={{ color: '#4f46e5' }} /> Set Password
                        </h3>
                        <div className="input-group">
                            <label>Create Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Min 6 characters"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="input-group">
                            <label>Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading} // Validation handled in handleSubmit/validate but disable if loading
                        style={{ marginTop: '20px' }}
                    >
                        {loading ? 'Creating Account...' : 'Complete Registration'}
                    </button>

                </form>
            </div>
            <style>{`
                .chip-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px; margin-bottom: 15px; }
                .chip { 
                    padding: 6px 12px; 
                    background: #f3f4f6; 
                    border-radius: 20px; 
                    font-size: 13px; 
                    cursor: pointer; 
                    border: 1px solid transparent;
                    transition: all 0.2s;
                }
                .chip.active {
                    background: #eef2ff;
                    border-color: #4f46e5;
                    color: #4f46e5;
                    font-weight: 600;
                }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AcademicDetails;
