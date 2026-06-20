export const config = {
  apiUrl: process.env.REACT_APP_API_URL || "http://localhost:5000",
  personal: {
    name: "Yash Patel",
    title: "MERN Stack Developer",
    location: "Ahmedabad, Gujarat",
    email: "yashp4710@gmail.com",
    phone: "+91 8849898974",
    linkedin: "https://linkedin.com/in/yash-patel-854b581b8",
    github: "https://github.com/yashp6483",
    website: "https://github.com/yashp6483",
    careerSummary: "MERN Stack Developer with hands-on internship experience in full-stack web development, seeking a full-time Software Developer / MERN Stack Developer / Backend Engineer role. Proven ability to design and build secure, scalable web applications using React.js, Node.js, Express.js, and MongoDB, with a focus on robust REST API architecture, clean UI design, and Agile development practices."
  },
  
  education: {
    degree: "B.E. Computer Engineering (CGPA: 7.0 / 10.0)",
    college: "Government Engineering College, Modasa | GTU",
    duration: "2022 – 2026",
    coursework: ["Data Structures & Algorithms", "DBMS", "Operating Systems", "Computer Networks", "Web Technologies"]
  },

  skills: [
    {
      category: "Languages",
      items: ["JavaScript (ES6)", "TypeScript", "C", "C++", "SQL"]
    },
    {
      category: "Frontend",
      items: ["React.js", "HTML5", "CSS3", "Bootstrap", "Tailwind CSS", "Vite"]
    },
    {
      category: "Backend & Databases",
      items: ["Node.js", "Express.js", "NestJS", "MongoDB", "Mongoose", "Redis"]
    },
    {
      category: "DevOps & Concepts",
      items: ["Git & GitHub", "Postman", "CI/CD", "AWS (basics)", "REST APIs", "Data Structures", "Algorithms", "OOP", "JWT & RBAC"]
    }
  ],

  experience: [
    {
      role: "Node.js Developer Intern",
      company: "Think Tanker",
      location: "Ahmedabad, Gujarat",
      duration: "Jan 2026 – May 2026",
      points: [
        "Implemented JWT Authentication and Role-Based Access Control (RBAC), securing endpoints for 3+ user roles across the application.",
        "Integrated frontend React.js components with backend services, cutting front-to-back integration time by 20%.",
        "Improved backend validation logic and error handling, making the application production-ready and reducing bug reports by 40%.",
        "Tested 50+ API endpoints using Postman and maintained clean, reusable, well-documented backend architecture following Agile/Scrum practices."
      ]
    },
    {
      role: "Web Development and Design Intern",
      company: "Oasis Infobyte",
      location: "Remote",
      duration: "Jun 2024 – Aug 2024",
      points: [
        "Developed and optimised responsive user interfaces using HTML5, CSS3, and JavaScript (ES6), ensuring cross-browser compatibility across Chrome, Firefox, and Safari for 100% of delivered projects.",
        "Engineered 4+ functional web applications using React.js, implementing state management, DOM manipulation, and responsive design frameworks, reducing page load time by 15%."
      ]
    }
  ],

  projects: [
    {
      title: "Digital Notice Board System",
      type: "College Project",
      technologies: ["React JS", "Node JS", "Express JS", "MongoDB", "Bootstrap"],
      description: "Built a full-stack Digital Notice Board using React JS, Node JS, Express JS, MongoDB, and Bootstrap with role-based access control (RBAC), automated notice scheduling, and real-time content delivery serving users.",
      points: [
        "Architected RESTful APIs using Node.js and Express.",
        "Integrated secure JWT-based authentication.",
        "Deployed a dynamic React.js frontend — reducing manual notice updates by 80%."
      ],
      links: {
        github: "https://github.com/yashp6483/digital_Notice_Board.git",
        live: "https://digital-notice-board-virid.vercel.app/"
      }
    },
    {
      title: "Enquiry Form Application",
      type: "Personal Project",
      technologies: ["React (Vite)", "Tailwind CSS", "MongoDB", "Node JS", "Express JS"],
      description: "Developed a full-stack enquiry management system with complete CRUD functionality, secure Mongoose-backed database connections, and real-time asynchronous SweetAlert2 notifications.",
      points: [
        "Designed and built custom, fully-responsive Enquiry submission forms with validation.",
        "Connected to backend APIs to capture leads, store inquiries, and send instant notifications.",
        "Improved user feedback response rate by 40%."
      ],
      links: {
        github: "https://github.com/yashp6483/enquiryForm.git",
        live: "https://github.com/yashp6483/enquiryForm.git"
      }
    }
  ],
  
  socials: {
    github: "https://github.com/yashp6483",
    linkedin: "https://linkedin.com/in/yash-patel-854b581b8",
    email: "mailto:yashp4710@gmail.com",
    phone: "tel:+918849898974"
  }
};
