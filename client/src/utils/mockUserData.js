// client/src/utils/mockUserData.js
// Mock user data for development
export const mockUser = {
  id: 'user_123',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@university.edu',
  avatar: null, // Will use initials
  role: 'Student',
  course: 'Computer Science',
  year: 'Third Year',
  studentId: 'CS2022-1234',
  gpa: 3.85,
  totalCredits: 96,
  completedAssessments: 24,
  pendingAssessments: 3,
  studyStreak: 12,
  joinDate: '2022-09-01',
  bio: 'Passionate about AI and machine learning. Always eager to learn and collaborate with peers.',
  phone: '+1 (555) 123-4567',
  address: {
    street: '123 University Ave',
    city: 'Boston',
    state: 'MA',
    zip: '02215',
  },
  academicStats: {
    completedCourses: 32,
    currentCourses: 5,
    averageGrade: 'A-',
    honors: ['Dean\'s List Fall 2023', 'Dean\'s List Spring 2024'],
  },
  recentActivity: [
    {
      id: 1,
      type: 'assessment',
      title: 'Data Structures Quiz',
      date: '2026-01-20',
      score: 95,
    },
    {
      id: 2,
      type: 'study',
      title: 'Algorithm Design Session',
      date: '2026-01-19',
      duration: 120,
    },
    {
      id: 3,
      type: 'chat',
      title: 'Advisor Consultation',
      date: '2026-01-18',
      topic: 'Course Selection',
    },
  ],
  upcomingTasks: [
    {
      id: 1,
      title: 'Machine Learning Assignment',
      dueDate: '2026-01-25',
      course: 'CS 4510',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Database Project Milestone',
      dueDate: '2026-01-28',
      course: 'CS 3200',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Operating Systems Reading',
      dueDate: '2026-01-24',
      course: 'CS 3650',
      priority: 'low',
    },
  ],
};

// Mock dashboard statistics
export const mockDashboardStats = {
  assessmentsCompleted: 24,
  assessmentsPending: 3,
  studyHoursWeek: 28,
  studyStreak: 12,
  upcomingDeadlines: 3,
  peerConnections: 15,
};

// Mock recent assessments
export const mockRecentAssessments = [
  {
    id: 1,
    course: 'Data Structures',
    title: 'Midterm Exam',
    score: 95,
    date: '2026-01-20',
    status: 'completed',
  },
  {
    id: 2,
    course: 'Algorithms',
    title: 'Weekly Quiz',
    score: 88,
    date: '2026-01-18',
    status: 'completed',
  },
  {
    id: 3,
    course: 'Database Systems',
    title: 'Assignment 3',
    score: null,
    date: '2026-01-25',
    status: 'pending',
  },
];