export const FACULTIES = {
  "Faculty of Civil and Mechanical Engineering": [
    "Civil Engineering",
    "Mechanics and Mechanical Engineering",
    "Engineering Technology",
    "Aviation Transport",
    "Medical Engineering and Medical Physics"
  ],
  "Faculty of Natural Sciences and Technology": [
    "Environmental Engineering",
    "Materials Engineering"
  ],
  "Faculty of Computer Science, Information Technology and Energy": [
    "Computer Systems",
    "Telecommunication technologies and data transmission engineering",
    "Finance management information systems",
    "Smart Electronic Systems"
  ],
  "Faculty of Engineering Economics and Management": [
    "Entrepreneurship and Management"
  ]
};

export type FacultyName = keyof typeof FACULTIES;
