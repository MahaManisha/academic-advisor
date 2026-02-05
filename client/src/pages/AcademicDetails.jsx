import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaSchool, FaBriefcase } from 'react-icons/fa';
import './Register.css';

const AcademicDetails = () => {
    const navigate = useNavigate();
    const [academicType, setAcademicType] = useState(null);
    const [formData, setFormData] = useState({
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (validate()) {
            // Save to localStorage
            const existingData = JSON.parse(localStorage.getItem('academicDetails')) || {};
            localStorage.setItem('academicDetails', JSON.stringify({ ...existingData, ...formData, academicType }));

            // Navigate to next step
            navigate('/assessment-intro');
        } else {
            setError('Please fill in all required fields.');
        }
    };

    // Options
    const boards = ["State Board", "CBSE", "ICSE", "Other"];
    const standards = ["6", "7", "8", "9", "10", "11", "12"];
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

                    <button
                        type="submit"
                        className="register-button"
                        disabled={!validate()}
                    >
                        Continue
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
