export const YEAR_SUBJECTS: Record<number, string[]> = {
  1: [
    'Communicative English',
    'Engineering Chemistry',
    'Linear Algebra & Calculus',
    'Basic Civil & Mechanical Engineering',
    'Introduction to Programming',
    'Communicative English Lab',
    'Engineering Chemistry Lab',
    'Engineering Workshop',
    'Computer Programming Lab',
  ],
  2: [
    'Discrete Mathematics & Graph Theory',
    'Universal Human Values',
    'Digital Logic & Computer Organization',
    'Advanced Data Structures & Algorithm Analysis',
    'Object Oriented Programming Through Java',
    'Advanced Data Structures Lab',
    'OOP Through Java Lab',
    'Python Programming',
  ],
  3: [
    'Data Warehousing and Data Mining',
    'Computer Networks',
    'Formal Languages and Automata Theory',
    'Professional Elective',
    'Open Elective',
    'Data Mining Lab',
    'Computer Networks Lab',
    'Full Stack Lab',
    'NPTEL',
  ],
  4: [
    'Software Engineering',
    'Web Technologies',
    'Cloud Computing',
    'Machine Learning',
    'Big Data Analytics',
    'Project Lab',
  ],
};

export const getSubjectsForYear = (year: number): string[] => {
  return YEAR_SUBJECTS[year] || [];
};
