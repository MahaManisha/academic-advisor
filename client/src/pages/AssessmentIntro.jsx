import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAssessment } from '../api/assessment.api';
import { extractSubjects } from '../api/nlp.api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { FaLink, FaPen, FaFileAlt, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import './Dashboard.css';

const AssessmentIntro = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [mode, setMode] = useState('text'); // 'text' or 'url'
    const [context, setContext] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [extractedData, setExtractedData] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Auto-fill from user profile
    useState(() => {
        if (user?.syllabusUrl) {
            setMode('url');
            setUrl(user.syllabusUrl);
        }
    }, [user]);

    const validateInput = () => {
        if (mode === 'text') {
            if (!context.trim()) return "Please enter some syllabus content or a topic.";
            if (context.length < 50) return "Please provide more detail for better questions.";
        } else {
            if (!url.trim()) return "Please enter a valid URL.";
            try {
                new URL(url);
            } catch (_) {
                return "Invalid URL format. Include http:// or https://";
            }
        }
        return null;
    };

    const handleAnalyze = async () => {
        setError(null);
        setExtractedData(null);

        const validationError = validateInput();
        if (validationError) {
            setError(validationError);
            return;
        }

        setAnalyzing(true);
        try {
            const payload = mode === 'text' ? { context } : { url };
            const response = await extractSubjects(payload);

            if (response && response.success && response.subjects) {
                setExtractedData(response.subjects);
            } else {
                setError("Could not extract subjects. Try adding more context.");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to analyze syllabus.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleGenerate = async () => {
        setError(null);


        const validationError = validateInput();
        if (validationError) {
            setError(validationError);
            return;
        }

        const payload = mode === 'text' ? { context } : { url };

        setLoading(true);

        try {
            const response = await generateAssessment(payload);
            if (response && response.success) {
                navigate('/assessment-test', { state: { assessment: response.assessment } });
            } else {
                setError("Failed to generate assessment. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
            />

            <Header
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                onLogout={handleLogout}
                title="AI Assessment Generator"
                subtitle="Create personalized diagnostic tests"
                notificationCount={0}
            />

            <main className="dashboard-main">
                <div className="main-content">
                    <div className="flex items-center justify-center p-6 h-full">
                        <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="mb-6 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                                    <FaFileAlt className="text-2xl" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Your Assessment</h1>
                                <p className="text-gray-600 max-w-lg mx-auto">
                                    Our AI can create a diagnostic test from your syllabus text or directly from a college website URL.
                                </p>
                            </div>

                            {/* Mode Switcher */}
                            <div className="flex justify-center mb-8">
                                <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                                    <button
                                        onClick={() => setMode('text')}
                                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${mode === 'text'
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <FaPen className="inline mr-2 mb-0.5" /> Manual Text
                                    </button>
                                    <button
                                        onClick={() => setMode('url')}
                                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${mode === 'url'
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <FaLink className="inline mr-2 mb-0.5" /> Website URL
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
                                    <p className="text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                    {mode === 'text' ? 'Syllabus / Topic Content' : 'Syllabus / Course Page URL'}
                                </label>

                                {mode === 'text' ? (
                                    <div className="relative">
                                        <textarea
                                            rows="8"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-gray-700 leading-relaxed"
                                            placeholder="Paste your syllabus text here..."
                                            value={context}
                                            onChange={(e) => setContext(e.target.value)}
                                            disabled={loading}
                                        ></textarea>
                                        <p className="mt-2 text-xs text-gray-500 text-right">
                                            Min 50 characters required.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLink className="text-gray-400" />
                                        </div>
                                        <input
                                            type="url"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                            placeholder="https://college.edu/syllabus.pdf"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            disabled={loading}
                                        />
                                        <p className="mt-2 text-xs text-gray-500 text-right">
                                            Supports HTML pages and PDF links.
                                        </p>
                                    </div>
                                )}
                            </div>



                            {extractedData && (
                                <div className="mb-8 bg-indigo-50 rounded-lg p-6 border border-indigo-100 animate-fade-in">
                                    <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center">
                                        <FaCheckCircle className="mr-2" />
                                        Identified Subjects ({extractedData.department} - Year {extractedData.year})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {extractedData.subjects.map((sub, idx) => (
                                            <span key={idx} className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm border border-indigo-100">
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="mt-4 text-sm text-indigo-600">
                                        We will generate a balanced assessment covering these core topics.
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4">
                                {!extractedData && (
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={loading || analyzing}
                                        className={`flex-1 py-4 rounded-xl text-indigo-700 font-bold text-lg border-2 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all
                                            ${(loading || analyzing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {analyzing ? 'Analyzing...' : 'Analyze Syllabus First'}
                                    </button>
                                )}

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || analyzing}
                                    className={`flex-1 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform duration-200
                                        ${(loading || analyzing)
                                            ? 'bg-indigo-300 cursor-not-allowed scale-[0.99]'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-1'
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            {extractedData ? 'Confirm & Generate' : 'Generate Directly'} <FaArrowRight />
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
};

export default AssessmentIntro;
