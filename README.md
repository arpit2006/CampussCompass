# 🧭 CampusCompass

CampusCompass is an open-source web application designed to help college students navigate their academic and professional journey. By inputting details about their college, branch, current skills, and interests, students get a structured, semester-by-semester roadmap to guide their career focus—completely without AI dependencies.

This project is built to be simple, clean, and beginner-friendly, making it an ideal repository for students and first-time contributors participating in programs like **GSSoC (GirlScript Summer of Code)** and **Hacktoberfest**.

---

## 🚀 Phase 1 Features

1. **Modern Landing Page**: High-quality layout with Hero section, key features, an interactive "How it works" timeline, dummy student testimonials, FAQs, and a responsive navbar.
2. **User Authentication**: Secure user registration, login, and logout using a local JSON file database for user storage and hashed passwords via `bcryptjs`.
3. **Student Profile**: Onboarding form to capture Student Name, College, Branch, Year, CGPA, target Career Goal, current Skills, Interests, and Daily Study Hours.
4. **Dynamic Dashboard**: Personalized welcome card, student profile info, and progress tracker.
5. **Static Roadmap Generator**: Computes learning progress by comparing the student's listed skills against structured semesters in six key career paths:
   - Software Engineer
   - Web Developer
   - AI Engineer
   - Cyber Security
   - Cloud Engineer
   - Data Scientist
6. **Profile Management**: View, edit, and update student profiles to dynamically update learning roadmaps.
7. **Fully Responsive Design**: Styled cleanly using Vanilla CSS for mobile, tablet, and desktop viewports.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla CSS), JavaScript (ES6)
- **Backend**: Node.js, Express.js
- **Database**: Local JSON File Database (completely free and zero-configuration)
- **Template Engine**: EJS (Embedded JavaScript)
- **Authentication**: Cookie-based sessions with `express-session` & `bcryptjs`

---

## 📂 Project Structure

```text
CampusCompass/
│── config/           # Database configuration
│── controllers/      # Route controllers (MVC pattern)
│── data/             # Static career roadmaps in JSON
│── docs/             # Technical documentation
│── models/           # Mongoose schemas (MVC pattern)
│── public/           # Static assets
│   ├── css/          # CSS Stylesheets
│   ├── js/           # Client-side JavaScript
│   └── images/       # Static website images
│── routes/           # Express router endpoints
│── views/            # EJS template engine pages
│   └── partials/     # EJS header, footer, and navbar components
│── .env              # Environment variable configurations (git-ignored)
│── app.js            # Node/Express application entry point
│── package.json      # Dependencies and scripts list
└── README.md         # Documentation
```

---

## 💻 Getting Started

### Prerequisites

- Ensure you have [Node.js](https://nodejs.org/) (v16+) installed.
- No database installation or cloud accounts are needed; data persists automatically in your project folder.

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/CampusCompass.git
   cd CampusCompass
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and copy the contents from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Modify the `.env` variables if needed:
   - `SESSION_SECRET`: A random string for encrypting user cookies.

4. **Run the Server**:
   - For production:
     ```bash
     npm start
     ```
   - For development (with automatic reload using nodemon):
     ```bash
     npm run dev
     ```

5. **Access the Web App**:
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## 🤝 Contributing

We love contributions! Whether you want to fix a bug, improve CSS styling, or add a new roadmap, please read [CONTRIBUTING.md](CONTRIBUTING.md) to understand our workflow.

Please make sure to read and abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
