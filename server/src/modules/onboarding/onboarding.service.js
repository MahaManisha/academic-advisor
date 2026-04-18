import Onboarding from './onboarding.model.js';
import User from '../user/user.model.js';
import { generateOnboardingOptions } from './onboarding.rag.service.js';

// Hardcoded Syllabus Map
const SYLLABUS_MAP = {
    // Mapping for "Computer Science" or generic keys
    "Computer Science": {
        "First Year": ["C Programming", "Engineering Mathematics I", "Digital Logic", "Physics", "Communication Skills"],
        "Second Year": ["Data Structures", "Object Oriented Programming", "DBMS", "Computer Architecture", "Discrete Math"],
        "Third Year": ["Operating Systems", "Computer Networks", "Artificial Intelligence", "Theory of Computation", "Web Technology"],
        "Fourth Year": ["Machine Learning", "Cloud Computing", "Big Data Analytics", "Information Security", "Project Work"],
        // Fallback for number inputs if they exist in DB
        "1": ["C Programming", "Engineering Mathematics I", "Digital Logic"],
        "2": ["Data Structures", "Object Oriented Programming", "DBMS"],
        "3": ["Operating Systems", "Computer Networks", "Artificial Intelligence"],
        "4": ["Machine Learning", "Cloud Computing", "Big Data Analytics"]
    },
    // Add more courses as needed
    "default": {
        "default": ["General Apeptitude", "Basic Computing", "Communication"]
    }
};

const INTERESTS_LIST = [
    "Web Development", "App Development", "AI & Machine Learning",
    "Data Science", "Cyber Security", "Cloud Computing",
    "Game Development", "Blockchain", "UI/UX Design",
    "Competitive Programming", "Open Source", "Research"
];

const CAREER_GOALS = [
    "Software Engineer", "Data Scientist", "Product Manager",
    "Researcher", "Entrepreneur", "System Architect",
    "Security Analyst", "Full Stack Developer"
];

const LEARNING_STYLES = [
    { id: 'visual', label: 'Visual (Videos, Diagrams)' },
    { id: 'hands-on', label: 'Hands-on (Projects, Coding)' },
    { id: 'theoretical', label: 'Theoretical (Books, Papers)' },
    { id: 'mixed', label: 'Mixed Approach' }
];

const LEARNING_PATH_MAP = {
    "Web Development": ["HTML/CSS", "JavaScript", "React", "Node.js", "Database Design"],
    "Data Science": ["Python", "Statistics", "Data Visualization", "Machine Learning", "SQL"],
    "AI/ML": ["Python", "Mathematics", "Neural Networks", "Deep Learning", "NLP"],
    "Cyber Security": ["Network Security", "Cryptography", "Ethical Hacking", "Linux", "Risk Assessment"],
    "Cloud Computing": ["AWS/Azure", "Docker", "Kubernetes", "Microservices", "DevOps"],
    "default": ["General Programming", "Logic", "Communication"]
};

/**
 * Get syllabus subjects based on course and year
 */
const getSyllabus = (course, year) => {
    const courseMap = SYLLABUS_MAP[course] || SYLLABUS_MAP["Computer Science"]; // Default to CSE for now if not found
    const subjects = courseMap[year] || courseMap["1"] || SYLLABUS_MAP["default"]["default"]; // Try exact year, then fallback
    return subjects;
};

/**
 * Get onboarding configuration/questions for a user
 */
export const getOnboardingQuestions = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    let subjects = [];

    // Check Academic Status
    if (user.academicStatus === 'graduated') {
        const domain = user.learningDomain || user.course;
        subjects = LEARNING_PATH_MAP[domain] || LEARNING_PATH_MAP["default"];
    } else if (user.academicStatus === 'school') {
        const std = parseInt(user.standard) || 10;
        if (std >= 11) {
            subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English"];
        } else {
            subjects = ["Mathematics", "Science", "Social Studies", "English", "Second Language"];
        }
    } else {
        // College Student - Check for Syllabus URL first
        if (user.syllabusUrl) {
            try {
                // Dynamic Extraction
                const { scrapeSyllabus } = await import('../../utils/scrape.service.js');
                const { extractSubjectsFromContext } = await import('../../utils/ai.service.js');

                const context = await scrapeSyllabus(user.syllabusUrl);
                const extracted = await extractSubjectsFromContext(context);

                if (extracted && extracted.subjects && extracted.subjects.length > 0) {
                    subjects = extracted.subjects;
                } else {
                    subjects = getSyllabus(user.course, user.year);
                }
            } catch (err) {
                console.error("Failed to extract syllabus from URL, falling back to static:", err.message);
                subjects = getSyllabus(user.course, user.year);
            }
        } else {
            subjects = getSyllabus(user.course, user.year);
        }
    }

    // Generate specific interests and career goals using the newly added groq functionality
    let interestsList = INTERESTS_LIST;
    let careerGoalsList = CAREER_GOALS;
    const domain = user.course || user.learningDomain || "Computer Science";
    
    try {
        const dynamicOptions = await generateOnboardingOptions(domain);
        if (dynamicOptions) {
            if (dynamicOptions.interests && dynamicOptions.interests.length > 0) {
                interestsList = dynamicOptions.interests;
            }
            if (dynamicOptions.careerGoals && dynamicOptions.careerGoals.length > 0) {
                careerGoalsList = dynamicOptions.careerGoals;
            }
        }
    } catch (err) {
        console.error("Failed to generate dynamic onboarding options:", err.message);
    }

    return {
        user: {
            name: user.fullName,
            course: user.course,
            year: user.year
        },
        subjects,
        interests: interestsList,
        careerGoals: careerGoalsList,
        learningStyles: LEARNING_STYLES
    };
};

/**
 * Submit onboarding data
 */
export const submitOnboarding = async (userId, data) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Create or Update Onboarding record
    const onboarding = await Onboarding.findOneAndUpdate(
        { userId },
        {
            userId,
            domain: user.course || data.course || (user.academicStatus === 'school' ? 'School' : 'Unknown'),
            year: user.year || data.year || user.standard || 'Unknown',
            subjects: data.subjects,
            interests: data.interests,
            careerGoal: data.careerGoal,
            learningStyle: data.learningStyle,
            selfAssessment: data.selfAssessment,
            completed: true
        },
        { new: true, upsert: true }
    );

    // Update User record
    user.onboardingCompleted = true;
    user.profileCompleted = true; // Assume this also completes the profile

    // Update other user fields from onboarding if relevant (optional sync)
    if (data.learningStyle) user.learningMode = data.learningStyle;
    if (data.careerGoal) user.focus = data.careerGoal;
    // Map selfAssessment to user stats if needed? Keeping separate for now as per "separate intelligence" requirement.

    await user.save();

    return onboarding;
};
